/*
 Everest is a DAO that is designed to curate a Registry of members. Specifically
 it is a list of crypto projects.

 This storage of the list is in Registry.sol and in the EthereumDIDRegistry (created by uport).

 The DAO is inspired by the Moloch DAO smart contracts https://github.com/MolochVentures/moloch
 The DAO allows anoyone to apply to the list.
 It also has reputation based voting for challenges based on how long a project has been a member.
*/
pragma solidity ^0.5.8;

import "./ReserveBank.sol";
import "./Registry.sol";
import "./lib/EthereumDIDRegistry.sol";
import "./lib/dai.sol";
import "./lib/Ownable.sol";
import "./abdk-libraries-solidity/ABDKMath64x64.sol";

contract Everest is Registry, Ownable {
    using SafeMath for uint256;
    using ABDKMath64x64 for uint256;
    using ABDKMath64x64 for int128;

    /***************
    GLOBAL CONSTANTS
    ***************/
    // Voting period length for a challenge (in unix seconds)
    uint256 public votingPeriodDuration;
    // Deposit that must be made in order to submit a challenge. Returned if challenge is won
    uint256 public challengeDeposit;
    // Application fee to become a member
    uint256 public applicationFee;
    // IPFS hash for charter, which dicates how token data should be posted
    bytes32 public charter;


    // Approved token contract reference (this version = DAI)
    Dai public approvedToken;
    // Reserve bank contract reference
    ReserveBank public reserveBank;
    // ERC-1056 contract reference
    EthereumDIDRegistry public erc1056Registry;

    // We pass in the bytes representation of the string 'everest'
    // bytes("everest") = 0x65766572657374. Then add 50 zeros to the end. The bytes32 value
    // is passed to the ERC-1056 registry, and hashed within the delegate functions
    bytes32 delegateType = 0x6576657265737400000000000000000000000000000000000000000000000000;

    /******
    EVENTS
    ******/
    // Event data on delegates, owner, and offChainData are emitted from the ERC-1056 registry
    // We rely on NewMember and MemberExited to distingushing between identities on
    // ERC-1056 that are part of everest and aren't
    event NewMember(address indexed member, uint256 startTime, uint256 fee);
    event MemberExited(address indexed member);
    event CharterUpdated(bytes32 indexed data);
    event Withdrawal(address indexed receiver, uint256 amount);

    event EverestDeployed(
        address indexed reserveBank,
        address owner,
        address approvedToken,
        uint256 votingPeriodDuration,
        uint256 challengeDeposit,
        uint256 applicationFee,
        bytes32 charter
    );

    event MemberChallenged(
        address indexed member,
        uint256 indexed challengeID,
        address indexed challenger,
        uint256 challengeEndTime,
        bytes32 details
    );

    event SubmitVote(
        uint256 indexed challengeID,
        address indexed submitter, // msg.sender
        address indexed memberOwner,
        VoteChoice voteChoice,
        uint256 voteWeight
    );

    event ChallengeFailed(
        address indexed member,
        uint256 indexed challengeID,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 voteCount
    );
    event ChallengeSucceeded(
        address indexed member,
        uint256 indexed challengeID,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 voteCount
    );

    /****
    STATE
    *****/

    enum VoteChoice {
        Null, // Same as not voting at all (i.e. 0 value)
        Yes,
        No
    }

    // Note that challenge deposit and token held constant in global variable
    struct Challenge {
        address challenger;         // The member who submitted the challenge
        address challengee;         // The member being challenged
        uint256 yesVotes;           // The total number of YES votes for this challenge
        uint256 noVotes;            // The total number of NO votes for this challenge
        uint256 voterCount;         // Total count of voters participating in the challenge
        uint256 endTime;            // Ending time of the challenge
        bytes32 details;            // Challenge details - an IPFS hash, without Qm, to make bytes32
        mapping (address => VoteChoice) voteChoiceByMember;     // The choice by each member
        mapping (address => uint256) voteWeightByMember;        // The vote weight of each member
    }

    mapping (uint256 => Challenge) public challenges;
    // Challenge counter for challenge IDs. Starts at 1 to prevent confusion with zeroed values
    uint256 public challengeCounter = 1;

    /********
    MODIFIERS
    ********/

    /**
    @dev                Modifer that allows a function to be called by a real member.
                        Either the member or a delegate can call
    @param _member      Member interacting with everest
    */
    modifier onlyMemberOwnerOrDelegate(address _member) {
        require(
            isMember(_member),
            "onlyMemberOwnerOrDelegate - Address is not a Member"
        );
        address owner = erc1056Registry.identityOwner(_member);
        bool validDelegate = erc1056Registry.validDelegate(_member, delegateType, msg.sender);
        require(
            validDelegate || owner == msg.sender,
            "onlyMemberOwnerOrDelegate - Caller must be delegate or owner"
        );
        _;
    }

    /**
    @dev                Modifer that allows a function to be called by a member.
                        Only the member can call (no delegate permissions)
    @param _member      Member interacting with everest
    */
    modifier onlyMemberOwner(address _member) {
        require(
            isMember(_member),
            "onlyMemberOwner - Address is not a member"
        );
        address owner = erc1056Registry.identityOwner(_member);
        require(
            owner == msg.sender,
            "onlyMemberOwner - Caller must be the delegate or owner"
        );
        _;
    }

    /********
    FUNCTIONS
    ********/
    constructor(
        address _approvedToken,
        uint256 _votingPeriodDuration,
        uint256 _challengeDeposit,
        uint256 _applicationFee,
        bytes32 _charter,
        address _DIDregistry
    ) public {
        require(_approvedToken != address(0), "constructor - _approvedToken cannot be 0");
        require(
            _votingPeriodDuration > 0,
            "constructor - _votingPeriodDuration cant be 0"
        );

        approvedToken = Dai(_approvedToken);
        reserveBank = new ReserveBank(_approvedToken);
        erc1056Registry = EthereumDIDRegistry(_DIDregistry);
        charter = _charter;
        votingPeriodDuration = _votingPeriodDuration;
        challengeDeposit = _challengeDeposit;
        applicationFee = _applicationFee;

        emit EverestDeployed(
            address(reserveBank),
            msg.sender, // owner
            _approvedToken,
            _votingPeriodDuration,
            _challengeDeposit,
            _applicationFee,
            _charter
        );
    }

    /*******************
    ADD MEMBER FUNCTIONS
    *******************/

    /**
    @dev                            Allows a user to apply to add a member to the Registry and
                                    add off chain data to the DID registry. The sig for
                                    changeOwner() and setAttribute are from _newMember (the browser
                                    created private key) and for permit() it is the _owner
    @param _newMember               The address of the new member
    @param _sigV                    V of sigs
    @param _sigR                    R of sigs
    @param _sigS                    S of sigs
    @param _owner                   Owner of the member application
    @param _offChainDataName        Attribute name. Should be a string less than 32 bytes, converted
                                    to bytes32. example: 'ProjectData' = 0x50726f6a65637444617461,
                                    with zeros appended to make it 32 bytes
    @param _offChainDataValue       Attribute data stored offchain (IPFS)
    @param _offChainDataValidity    Length of time attribute data is valid
    */
    function applySignedWithAttributeAndPermitInternal(
        address _newMember,
        uint8[3] memory _sigV,
        bytes32[3] memory _sigR,
        bytes32[3] memory _sigS,
        address _owner,
        bytes32 _offChainDataName,
        bytes memory _offChainDataValue,
        uint256 _offChainDataValidity
    ) internal {
        require(
            registry.getMemberStartTime(_newMember) == 0,
            "applySignedInternal - This member already exists"
        );
        uint256 startTime = registry.setMember(_newMember);

        // This event must be emitted before changeOwnerSigned() is called. This creates an identity
        // in Everest, and from that point on, ethereumDIDRegistry events are relevant to this
        // identity
        emit NewMember(
            _newMember,
            /* solium-disable-next-line security/no-block-members*/
            startTime,
            applicationFee
        );

        erc1056Registry.setAttributeSigned(
            _newMember,
            _sigV[0],
            _sigR[0],
            _sigS[0],
            _offChainDataName,
            _offChainDataValue,
            _offChainDataValidity
        );

        erc1056Registry.changeOwnerSigned(_newMember, _sigV[1], _sigR[1], _sigS[1], _owner);

        // Approve the Everest to transfer on the owners behalf
        // Expiry = 0 is infinite. true is unlimited allowance
        uint256 nonce = approvedToken.nonces(_owner);
        approvedToken.permit(_owner, address(this), nonce, 0, true, _sigV[2], _sigR[2], _sigS[2]);

        // Transfers tokens from owner to the reserve bank
        require(
            approvedToken.transferFrom(_owner, address(reserveBank), applicationFee),
            "applySignedInternal - Token transfer failed"
        );
    }

    /**
    @dev                            Allows a user to apply to add a member to the Registry and
                                    add off chain data to the DID registry. The sig for
                                    changeOwner() and setAttribute are from _newMember (the browser
                                    created private key) and for permit() it is the _owner
    @param _newMember               The address of the new member
    @param _sigV                    V of sigs
    @param _sigR                    R of sigs
    @param _sigS                    S of sigs
    @param _owner                   Owner of the member application
    @param _offChainDataName        Attribute name. Should be a string less than 32 bytes, converted
                                    to bytes32. example: 'ProjectData' = 0x50726f6a65637444617461,
                                    with zeros appended to make it 32 bytes
    @param _offChainDataValue       Attribute data stored offchain (IPFS)
    @param _offChainDataValidity    Length of time attribute data is valid
    */
    function applySignedWithAttributeAndPermit(
        address _newMember,
        uint8[3] calldata _sigV,
        bytes32[3] calldata _sigR,
        bytes32[3] calldata _sigS,
        address _owner,
        bytes32 _offChainDataName,
        bytes calldata _offChainDataValue,
        uint256 _offChainDataValidity
    ) external {
        applySignedWithAttributeAndPermitInternal(
            _newMember,
            _sigV,
            _sigR,
            _sigS,
            _owner,
            _offChainDataName,
            _offChainDataValue,
            _offChainDataValidity
        );
    }

    /**
    @dev                            Allows a user to apply to add a member to the Registry and
                                    add off chain data to the DID registry. The sig for
                                    changeOwner() and setAttribute are from _newMember (the browser
                                    created private key). This is called when the _owner has already
                                    called permit()
    @param _newMember               The address of the new member
    @param _sigV                    V of sigs
    @param _sigR                    R of sigs
    @param _sigS                    S of sigs
    @param _owner                   Owner of the member application
    @param _offChainDataName        Attribute name. Should be a string less than 32 bytes, converted
                                    to bytes32. example: 'ProjectData' = 0x50726f6a65637444617461,
                                    with zeros appended to make it 32 bytes
    @param _offChainDataValue       Attribute data stored offchain (IPFS)
    @param _offChainDataValidity    Length of time attribute data is valid
    */
    function applySignedWithAttribute(
        address _newMember,
        uint8[2] calldata _sigV,
        bytes32[2] calldata _sigR,
        bytes32[2] calldata _sigS,
        address _owner,
        bytes32 _offChainDataName,
        bytes calldata _offChainDataValue,
        uint256 _offChainDataValidity
    ) external {
        require(
            registry.getMemberStartTime(_newMember) == 0,
            "applySignedInternal - This member already exists"
        );
        uint256 startTime = registry.setMember(_newMember);

        // This event must be emitted before changeOwnerSigned() is called. This creates an identity
        // in Everest, and from that point on, ethereumDIDRegistry events are relevant to this
        // identity
        emit NewMember(
            _newMember,
            /* solium-disable-next-line security/no-block-members*/
            startTime,
            applicationFee
        );

        erc1056Registry.setAttributeSigned(
            _newMember,
            _sigV[0],
            _sigR[0],
            _sigS[0],
            _offChainDataName,
            _offChainDataValue,
            _offChainDataValidity
        );

        erc1056Registry.changeOwnerSigned(_newMember, _sigV[1], _sigR[1], _sigS[1], _owner);

        // Transfers tokens from owner to the reserve bank
        require(
            approvedToken.transferFrom(_owner, address(reserveBank), applicationFee),
            "applySignedInternal - Token transfer failed"
        );
    }




    /**
    @dev                Allow a member to voluntarily leave. Note that this does not
                        reset ownership or delegates in the ERC-1056 registry. This must be done by
                        calling the respective functions in the registry that handle those resets.
    @param _member      Member exiting the list
    */
    function memberExit(
        address _member
    ) external onlyMemberOwner(_member) {
        require(
            !memberChallengeExists(_member),
            "memberExit - Can't exit during ongoing challenge"
        );
        deleteMember(_member);
        emit MemberExited(_member);
    }

    /******************
    EDIT MEMBER FUNCTIONS
    ******************/

    // To edit members, call EthereumDIDRegistry.sol directly

    /******************
    CHALLENGE FUNCTIONS
    ******************/

    /**
    @dev                        Starts a challenge on a member. Challenger deposits a fee.
    @param _challengingMember   The memberName of the member who is challenging another member
    @param _challengedMember    The memberName of the member being challenged
    @param _details             Extra details relevant to the challenge. (IPFS hash without Qm)
    */
    function challenge(
        address _challengingMember,
        address _challengedMember,
        bytes32 _details
    ) external onlyMemberOwner(_challengingMember) returns (uint256 challengeID) {
        uint256 challengeeStartTime = registry.getMemberStartTime(_challengedMember);
        require (challengeeStartTime > 0, "challenge - Challengee must exist");
        uint256 currentChallengeID = registry.getChallengeID(_challengedMember);
        if(currentChallengeID > 0){
            // Doing this allows us to never get stuck in a state with unresolved challenges
            // Also, the challenge rewards the deposit fee to winner or loser, so they are
            // financially motivated too
            resolveChallenge(currentChallengeID);
        }

        require(
            _challengingMember != _challengedMember,
            "challenge - Can't challenge self"
        );

        uint256 newChallengeID = challengeCounter;
        Challenge memory newChallenge = Challenge({
            challenger: _challengingMember,
            challengee: _challengedMember,
            // starts at 0 since the submitVote() will add this
            yesVotes: 0,
            noVotes: 0,
            // starts at 0 since submitVote() will add this
            voterCount: 0,
            /* solium-disable-next-line security/no-block-members*/
            endTime: now + votingPeriodDuration,
            details: _details
        });
        challengeCounter++;

        challenges[newChallengeID] = newChallenge;

        // Updates member to store most recent challenge
        editChallengeID(_challengedMember, newChallengeID);

        // Takes tokens from challenger
        require(
            approvedToken.transferFrom(msg.sender, address(reserveBank), challengeDeposit),
            "challenge - Token transfer failed"
        );

        emit MemberChallenged(
            _challengedMember,
            newChallengeID,
            _challengingMember,
            /* solium-disable-next-line security/no-block-members*/
            now + votingPeriodDuration,
            newChallenge.details
        );

        // Insert challengers vote into the challenge
        submitVote(newChallengeID, VoteChoice.Yes, _challengingMember);
        return newChallengeID;
    }

    /**
    @dev                    Submit a vote. Owner or delegate can submit
    @param _challengeID     The challenge ID
    @param _voteChoice      The vote choice (yes or no)
    @param _voter           The member who is voting
    */
    function submitVote(
        uint256 _challengeID,
        VoteChoice _voteChoice,
        address _voter
    ) public onlyMemberOwnerOrDelegate(_voter) {
        require(
            _voteChoice == VoteChoice.Yes || _voteChoice == VoteChoice.No,
            "submitVote - Vote must be either Yes or No"
        );

        Challenge storage storedChallenge = challenges[_challengeID];
        require(
            storedChallenge.endTime > 0,
            "submitVote - Challenge does not exist"
        );
        require(
            !hasVotingPeriodExpired(storedChallenge.endTime),
            "submitVote - Challenge voting period has expired"
        );
        require(
            storedChallenge.voteChoiceByMember[_voter] == VoteChoice.Null,
            "submitVote - Member has already voted on this challenge"
        );

        require(
            storedChallenge.challengee != _voter,
            "submitVote - Member can't vote on their own challenge"
        );

        uint256 startTime = registry.getMemberStartTime(_voter);
        // The lower the member start time (i.e. the older the member) the more vote weight
        uint256 voteWeightSquared = storedChallenge.endTime.sub(startTime);

        // Here we use ABDKMath64x64 to do the square root of the vote weight
        // We have to covert it to a 64.64 fixed point number, do sqrt(), then convert it
        // back to uint256. uint256 wraps the result of toUInt(), since it returns uint64
        int128 sixtyFourBitFPInt = voteWeightSquared.fromUInt();
        int128 voteWeightInt128 = sixtyFourBitFPInt.sqrt();
        uint256 voteWeight = uint256(voteWeightInt128.toUInt());

        // Store vote (can't be msg.sender because delegate can be voting)
        storedChallenge.voteChoiceByMember[_voter] = _voteChoice;
        storedChallenge.voteWeightByMember[_voter] = voteWeight;
        storedChallenge.voterCount += 1;

        // Count vote
        if (_voteChoice == VoteChoice.Yes) {
            storedChallenge.yesVotes = storedChallenge.yesVotes.add(voteWeight);
        } else if (_voteChoice == VoteChoice.No) {
            storedChallenge.noVotes = storedChallenge.noVotes.add(voteWeight);
        }

        emit SubmitVote(_challengeID, msg.sender, _voter, _voteChoice, voteWeight);
    }

    /**
    @dev                    Submit many votes from owner or delegate with multiple members they own
                            or are delegates of
    @param _challengeID     The challenge ID
    @param _voteChoices     The vote choices (yes or no)
    @param _voters          The members who are voting
    */
    function submitVotes(
        uint256 _challengeID,
        VoteChoice[] memory _voteChoices,
        address[] memory _voters
    ) public {
        require(
            _voteChoices.length == _voters.length,
            "submitVotes - Arrays must be equal"
        );
        for (uint256 i; i < _voteChoices.length; i++){
            submitVote(_challengeID, _voteChoices[i], _voters[i]);
        }
    }
    /**
    @dev                    Resolve a challenge. Anyone can call this function. A successful
                            challenge means the member is removed.
    @param _challengeID     The challenge ID
    */
    function resolveChallenge(uint256 _challengeID) public {
        challengeCanBeResolved(_challengeID);
        Challenge storage storedChallenge = challenges[_challengeID];

        bool didPass = storedChallenge.yesVotes > storedChallenge.noVotes;
        bool moreThanOneVote = storedChallenge.voterCount > 1;
        if (didPass && moreThanOneVote) {
            address challengerOwner = erc1056Registry.identityOwner(storedChallenge.challenger);

            // Transfer challenge deposit and losers application fee
            // to challenger for winning challenge
            uint256 amount = challengeDeposit + applicationFee;
            require(
                reserveBank.withdraw(challengerOwner, amount),
                "resolveChallenge - Rewarding challenger failed"
            );
            emit Withdrawal(challengerOwner, amount);

            deleteMember(storedChallenge.challengee);
            emit ChallengeSucceeded(
                storedChallenge.challengee,
                _challengeID,
                storedChallenge.yesVotes,
                storedChallenge.noVotes,
                storedChallenge.voterCount
            );
        } else {
            address challengeeOwner = erc1056Registry.identityOwner(storedChallenge.challengee);
            // Transfer challenge deposit to challengee
            require(
                reserveBank.withdraw(challengeeOwner, challengeDeposit),
                "resolveChallenge - Rewarding challenger failed"
            );
            emit Withdrawal(challengeeOwner, challengeDeposit);

            // Remove challenge ID from registry
            editChallengeID(storedChallenge.challengee, 0);
            emit ChallengeFailed(
                storedChallenge.challengee,
                _challengeID,
                storedChallenge.yesVotes,
                storedChallenge.noVotes,
                storedChallenge.voterCount
            );
        }

        // Delete challenge from Everest in either case
        delete challenges[_challengeID];
    }

    /***************
    EVEREST OWNER FUNCTIONS
    ***************/

    /**
    @dev                Allows the owner of everest to withdraw funds from the reserve bank
                        in the case of an emergency, or an upgrade from V1. With plans
                        to decentralize this functionality in the future.
    @param _receiver    The address receiving funds
    @param _amount      The amount of funds being withdrawn
    */
    function withdraw(address _receiver, uint256 _amount) public onlyOwner returns (bool) {
        emit Withdrawal(_receiver, _amount);
        return reserveBank.withdraw(_receiver, _amount);
    }

    /**
    @dev                Updates the charter for the Everest
    @param _newCharter  The data that point to the new charter
    */
    function updateCharter(bytes32 _newCharter) public onlyOwner {
        charter = _newCharter;
        emit CharterUpdated(charter);
    }

    /***************
    GETTER FUNCTIONS
    ***************/

    /**
    @dev                    Returns true if a challenge vote period has finished
    @param _endTime  The starting period of the challenge
    */
    function hasVotingPeriodExpired(uint256 _endTime) public view returns (bool) {
        /* solium-disable-next-line security/no-block-members*/
        return now >= _endTime;
    }

    /**
    @dev            Returns true if the address is a member
    @param _member  The member name of the member whose status is to be examined
    */
    function isMember(address _member) public view returns (bool){
        uint256 startTime = registry.getMemberStartTime(_member);
        if (startTime > 0){
            return true;
        }
        return false;
    }

    /**
    @dev            Returns true if the member has an unresolved challenge. False if the challenge
                    does not exist.
    @param _member  The member that is being checked for a challenge.
    */
    function memberChallengeExists(address _member) public view returns (bool) {
        uint256 challengeID = getChallengeID(_member);
        return (challengeID > 0);
    }

    /**
    @dev                Determines whether voting has concluded in a challenge for a given
                        member. Throws if challenge can't be resolved
    @param _challengeID The challenge ID
    */
    function challengeCanBeResolved(uint256 _challengeID) public view returns (bool) {
        Challenge storage storedChallenge = challenges[_challengeID];
        require(
            challenges[_challengeID].endTime > 0,
            "challengeCanBeResolved - Challenge does not exist or was completed"
        );
        require(
            hasVotingPeriodExpired(storedChallenge.endTime),
            "challengeCanBeResolved - Current challenge is not ready to be resolved"
        );
        return true;
    }
}
