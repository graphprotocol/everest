/*
    This is the old version of everest, which we upgraded from. The upgrade had a few small changes,
    but it didn't really change the functionality at all. We decided to go with this to test the
    updating process before everest goes live.

    This version of the file is kept so that we have the abis always handy
*/
pragma solidity ^0.5.8;

import "../ReserveBank.sol";
import "../Registry.sol";
import "../lib/EthereumDIDRegistry.sol";
import "../lib/dai.sol";
import "../lib/Ownable.sol";
import "../lib/AddressUtils.sol";
import "../abdk-libraries-solidity/ABDKMath64x64.sol";

contract Everest is Ownable {
    using SafeMath for uint256;
    using ABDKMath64x64 for uint256;
    using ABDKMath64x64 for int128;
    using AddressUtils for address;

    // -----------------
    // GLOBAL CONSTANTS
    // -----------------

    // Voting period length for a challenge (in unix seconds)
    uint256 public votingPeriodDuration;
    // Deposit that must be made in order to submit a challenge
    uint256 public challengeDeposit;
    // Application fee to become a member
    uint256 public applicationFee;
    // IPFS hash for off chain storage of the Everest Charter
    bytes32 public charter;
    // IPFS hash for off chain storage of the Everest Categories
    bytes32 public categories;

    // Approved token contract reference (i.e. DAI)
    Dai public approvedToken;
    // Reserve bank contract reference
    ReserveBank public reserveBank;
    // ERC-1056 contract reference
    EthereumDIDRegistry public erc1056Registry;
    // Registry contract reference
    Registry public registry;

    // We pass in the bytes representation of the string 'everest'
    // bytes("everest") = 0x65766572657374. Then add 50 zeros to the end. The bytes32 value
    // is passed to the ERC-1056 registry, and hashed within the delegate functions
    bytes32 delegateType = 0x6576657265737400000000000000000000000000000000000000000000000000;

    // -------
    // EVENTS
    // -------

    // Event data on delegates, owner, and offChainData are emitted from the ERC-1056 registry
    event NewMember(address indexed member, uint256 startTime, uint256 fee);
    event MemberExited(address indexed member);
    event CharterUpdated(bytes32 indexed data);
    event CategoriesUpdated(bytes32 indexed data);
    event Withdrawal(address indexed receiver, uint256 amount);

    event EverestDeployed(
        address owner,
        address approvedToken,
        uint256 votingPeriodDuration,
        uint256 challengeDeposit,
        uint256 applicationFee,
        bytes32 charter,
        bytes32 categories,
        address didRegistry,
        address reserveBank,
        address registry
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
        address indexed submitter,      // i.e. msg.sender
        address indexed votingMember,
        VoteChoice voteChoice,
        uint256 voteWeight
    );

    event ChallengeFailed(
        address indexed member,
        uint256 indexed challengeID,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 voterCount,
        uint256 resolverReward
    );

    event ChallengeSucceeded(
        address indexed member,
        uint256 indexed challengeID,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 voterCount,
        uint256 challengerReward,
        uint256 resolverReward
    );

    // ------
    // STATE
    // ------

    enum VoteChoice {
        Null, // Same as not voting at all (i.e. 0 value)
        Yes,
        No
    }

    struct Challenge {
        address challenger;         // The member who submitted the challenge
        address challengee;         // The member being challenged
        uint256 yesVotes;           // The total weight of YES votes for this challenge
        uint256 noVotes;            // The total weight of NO votes for this challenge
        uint256 voterCount;         // Total count of voters participating in the challenge
        uint256 endTime;            // Ending time of the challenge
        bytes32 details;            // Challenge details - an IPFS hash, without Qm, to make bytes32
        mapping (address => VoteChoice) voteChoiceByMember;     // The choice by each member
        mapping (address => uint256) voteWeightByMember;        // The vote weight of each member
    }

    mapping (uint256 => Challenge) public challenges;
    // Challenge counter for challenge IDs
    uint256 public challengeCounter = 1;

    // ----------
    // MODIFIERS
    // ----------

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
            "onlyMemberOwner - Caller must be the owner"
        );
        _;
    }

    // ----------
    // FUNCTIONS
    // ----------

    constructor(
        address _approvedToken,
        uint256 _votingPeriodDuration,
        uint256 _challengeDeposit,
        uint256 _applicationFee,
        bytes32 _charter,
        bytes32 _categories,
        address _DIDregistry,
        address _reserveBank,
        address _registry
    ) public {
        require(_approvedToken.isContract(), "The _approvedToken address should be a contract");
        require(_DIDregistry.isContract(), "The _DIDregistry address should be a contract");
        require(_reserveBank.isContract(), "The _reserveBank address should be a contract");
        require(_registry.isContract(), "The _registry address should be a contract");
        require(_votingPeriodDuration > 0, "constructor - _votingPeriodDuration cannot be 0");

        approvedToken = Dai(_approvedToken);
        votingPeriodDuration = _votingPeriodDuration;
        challengeDeposit = _challengeDeposit;
        applicationFee = _applicationFee;
        charter = _charter;
        categories = _categories;
        erc1056Registry = EthereumDIDRegistry(_DIDregistry);
        reserveBank = ReserveBank(_reserveBank);
        registry = Registry(_registry);

        emit EverestDeployed(
            msg.sender,             // i.e owner
            _approvedToken,
            _votingPeriodDuration,
            _challengeDeposit,
            _applicationFee,
            _charter,
            _categories,
            _DIDregistry,
            _reserveBank,
            _registry
        );
    }

    // ---------------------
    // ADD MEMBER FUNCTIONS
    // ---------------------

    /**
    @dev                            Allows a user to add a member to the Registry and
                                    add off chain data to the DID registry. The sig for
                                    changeOwner() and setAttribute() are from _newMember
                                    and for DAIS permit() it is the _owner.

                                    [0] = setAttributeSigned() signature
                                    [1] = changeOwnerSigned() signature
                                    [2] = permit() signature

    @param _newMember               The address of the new member
    @param _sigV                    V of sigs
    @param _sigR                    R of sigs
    @param _sigS                    S of sigs
    @param _owner                   Owner of the member (on the DID registry)
    @param _offChainDataName        Attribute name. Should be a string less than 32 bytes, converted
                                    to bytes32. example: 'ProjectData' = 0x50726f6a65637444617461,
                                    with zeros appended to make it 32 bytes
    @param _offChainDataValue       Attribute data stored offchain (IPFS)
    @param _offChainDataValidity    Length of time attribute data is valid (unix)
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

    /// @dev    Note that this internal function is created in order to avoid the
    ///         Solidity stack too deep error.
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
        // Approve Everest to transfer DAI on the owners behalf
        // Expiry = 0 is infinite. true is unlimited allowance
        uint256 nonce = approvedToken.nonces(_owner);
        approvedToken.permit(_owner, address(this), nonce, 0, true, _sigV[2], _sigR[2], _sigS[2]);

        applySignedWithAttribute(
            _newMember,
            [_sigV[0], _sigV[1]],
            [_sigR[0], _sigR[1]],
            [_sigS[0], _sigS[1]],
            _owner,
            _offChainDataName,
            _offChainDataValue,
            _offChainDataValidity
        );
    }

    /**
    @dev                            Functions the same as applySignedWithAttributeAndPermit(),
                                    except without permit(). This function should be called by
                                    any _owner that has already called permit() for Everest.

                                    [0] = setAttributeSigned() signature
                                    [1] = changeOwnerSigned() signature

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
        uint8[2] memory _sigV,
        bytes32[2] memory _sigR,
        bytes32[2] memory _sigS,
        address _owner,
        bytes32 _offChainDataName,
        bytes memory _offChainDataValue,
        uint256 _offChainDataValidity
    ) public {
        require(
            registry.getMemberStartTime(_newMember) == 0,
            "applySignedInternal - This member already exists"
        );
        uint256 startTime = registry.setMember(_newMember);

        // This event should be emitted before changeOwnerSigned() is called. This way all events
        // in the Ethereum DID registry can start to be considered within the bounds of the event
        // event NewMember() and the end of membership with event MemberExit() or event
        // ChallengeSucceeded()
        emit NewMember(
            _newMember,
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
                        calling the respective functions in the registry that handle those.
    @param _member      Member exiting the list
    */
    function memberExit(
        address _member
    ) external onlyMemberOwner(_member) {
        require(
            !memberChallengeExists(_member),
            "memberExit - Can't exit during ongoing challenge"
        );
        registry.deleteMember(_member);
        emit MemberExited(_member);
    }

    // --------------------
    // CHALLENGE FUNCTIONS
    // --------------------

    /**
    @dev                        Starts a challenge on a member. Challenger deposits a fee.
    @param _challenger          The memberName of the member who is challenging another member
    @param _challengee          The memberName of the member being challenged
    @param _details             Extra details relevant to the challenge. (IPFS hash without Qm)
    @return                     Challenge ID for the created challenge
    */
    function challenge(
        address _challenger,
        address _challengee,
        bytes32 _details
    ) external onlyMemberOwner(_challenger) returns (uint256 challengeID) {
        require(isMember(_challengee), "challenge - Challengee must exist");
        require(
            _challenger != _challengee,
            "challenge - Can't challenge self"
        );
        uint256 currentChallengeID = registry.getChallengeID(_challengee);
        require(currentChallengeID == 0, "challenge - Existing challenge must be resolved first");

        uint256 newChallengeID = challengeCounter;
        Challenge memory newChallenge = Challenge({
            challenger: _challenger,
            challengee: _challengee,
            // It is okay to start counts at 0 here. submitVote() is called at the end of the func
            yesVotes: 0,
            noVotes: 0,
            voterCount: 0,
            /* solium-disable-next-line security/no-block-members*/
            endTime: now + votingPeriodDuration,
            details: _details
        });
        challengeCounter++;

        challenges[newChallengeID] = newChallenge;

        // Updates member to store most recent challenge
        registry.editChallengeID(_challengee, newChallengeID);

        // Transfer tokens from challenger to reserve bank
        require(
            approvedToken.transferFrom(msg.sender, address(reserveBank), challengeDeposit),
            "challenge - Token transfer failed"
        );

        emit MemberChallenged(
            _challengee,
            newChallengeID,
            _challenger,
            /* solium-disable-next-line security/no-block-members*/
            now + votingPeriodDuration,
            newChallenge.details
        );

        // Add challengers vote into the challenge
        submitVote(newChallengeID, VoteChoice.Yes, _challenger);
        return newChallengeID;
    }

    /**
    @dev                    Submit a vote. Owner or delegate can submit
    @param _challengeID     The challenge ID
    @param _voteChoice      The vote choice (yes or no)
    @param _votingMember    The member who is voting
    */
    function submitVote(
        uint256 _challengeID,
        VoteChoice _voteChoice,
        address _votingMember
    ) public onlyMemberOwnerOrDelegate(_votingMember) {
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
            storedChallenge.voteChoiceByMember[_votingMember] == VoteChoice.Null,
            "submitVote - Member has already voted on this challenge"
        );

        require(
            storedChallenge.challengee != _votingMember,
            "submitVote - Member can't vote on their own challenge"
        );

        uint256 startTime = registry.getMemberStartTime(_votingMember);
        // The lower the member start time (i.e. the older the member) the more vote weight
        uint256 voteWeightSquared = storedChallenge.endTime.sub(startTime);

        // Here we use ABDKMath64x64 to do the square root of the vote weight
        // We have to covert it to a 64.64 fixed point number, do sqrt(), then convert it
        // back to uint256. uint256 wraps the result of toUInt(), since it returns uint64
        int128 sixtyFourBitFPInt = voteWeightSquared.fromUInt();
        int128 voteWeightInt128 = sixtyFourBitFPInt.sqrt();
        uint256 voteWeight = uint256(voteWeightInt128.toUInt());

        // Store vote with _votingMember, not msg.sender, since a delegate can vote
        storedChallenge.voteChoiceByMember[_votingMember] = _voteChoice;
        storedChallenge.voteWeightByMember[_votingMember] = voteWeight;
        storedChallenge.voterCount += 1;

        // Count vote
        if (_voteChoice == VoteChoice.Yes) {
            storedChallenge.yesVotes = storedChallenge.yesVotes.add(voteWeight);
        } else if (_voteChoice == VoteChoice.No) {
            storedChallenge.noVotes = storedChallenge.noVotes.add(voteWeight);
        }

        emit SubmitVote(_challengeID, msg.sender, _votingMember, _voteChoice, voteWeight);
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
    @dev                    Resolve a challenge A successful challenge means the member is removed.
                            Anyone can call this function. They will be rewarded with 1/10 of the
                            challenge deposit
    @param _challengeID     The challenge ID
    */
    function resolveChallenge(uint256 _challengeID) public {
        challengeCanBeResolved(_challengeID);
        Challenge storage storedChallenge = challenges[_challengeID];

        bool didPass = storedChallenge.yesVotes > storedChallenge.noVotes;
        bool moreThanOneVote = storedChallenge.voterCount > 1;
        // Challenge reward is 1/10th the challenge deposit. This allows incentivization to
        // always resolve the challenge for the user that calls this function
        uint256 resolverReward = challengeDeposit.div(10);

        if (didPass && moreThanOneVote) {
            address challengerOwner = erc1056Registry.identityOwner(storedChallenge.challenger);

            // The amount includes the applicationFee, which is the reward for challenging a project
            // and getting it successfully removed. Minus the resolver reward
            uint256 challengerReward = challengeDeposit + applicationFee - resolverReward;
            require(
                reserveBank.withdraw(challengerOwner, challengerReward),
                "resolveChallenge - Rewarding challenger failed"
            );
            // Transfer resolver reward
            require(
                reserveBank.withdraw(msg.sender, resolverReward),
                "resolveChallenge - Rewarding resolver failed"
            );

            registry.deleteMember(storedChallenge.challengee);
            emit ChallengeSucceeded(
                storedChallenge.challengee,
                _challengeID,
                storedChallenge.yesVotes,
                storedChallenge.noVotes,
                storedChallenge.voterCount,
                challengerReward,
                resolverReward
            );

        } else {
            // Transfer resolver reward
            require(
                reserveBank.withdraw(msg.sender, resolverReward),
                "resolveChallenge - Rewarding resolver failed"
            );

            // Remove challenge ID from the Member in the registry
            registry.editChallengeID(storedChallenge.challengee, 0);
            emit ChallengeFailed(
                storedChallenge.challengee,
                _challengeID,
                storedChallenge.yesVotes,
                storedChallenge.noVotes,
                storedChallenge.voterCount,
                resolverReward
            );
        }

        // Delete challenge from Everest in either case
        delete challenges[_challengeID];
    }

    // ------------------------
    // EVEREST OWNER FUNCTIONS
    // ------------------------

    /**
    @dev                Allows the owner of everest to withdraw funds from the reserve bank.
    @param _receiver    The address receiving funds
    @param _amount      The amount of funds being withdrawn
    @return             True if withdrawal is successful
    */
    function withdraw(address _receiver, uint256 _amount) public onlyOwner returns (bool) {
        require(_receiver != address(0), "Receiver must not be 0 address");
        emit Withdrawal(_receiver, _amount);
        return reserveBank.withdraw(_receiver, _amount);
    }

    /**
    @dev                Allows the owner of Everest to transfer the ownership of ReserveBank
    @param _newOwner    The new owner
    @return             True if ownership transfer is successful
    */
    function transferOwnershipReserveBank(address _newOwner) public onlyOwner returns (bool) {
        reserveBank.transferOwnership(_newOwner);
        return true;
    }

    /**
    @dev                Allows the owner of Everest to transfer the ownership of Registry
    @param _newOwner    The new owner
    @return             True if ownership transfer is successful
    */
    function transferOwnershipRegistry(address _newOwner) public onlyOwner returns (bool) {
        registry.transferOwnership(_newOwner);
        return true;
    }

    /**
    @dev                Updates the charter for the Everest
    @param _newCharter  The data that point to the new charter
    */
    function updateCharter(bytes32 _newCharter) external onlyOwner {
        charter = _newCharter;
        emit CharterUpdated(charter);
    }

    /**
    @dev                Updates the categories for the Everest
    @param _newCategories  The data that point to the new categories
    */
    function updateCategories(bytes32 _newCategories) external onlyOwner {
        categories = _newCategories;
        emit CategoriesUpdated(categories);
    }

    // -----------------
    // GETTER FUNCTIONS
    // -----------------


    /**
    @dev                Returns true if a challenge vote period has finished
    @param _endTime     The starting period of the challenge
    @return             True if voting period has expired
    */
    function hasVotingPeriodExpired(uint256 _endTime) private view returns (bool) {
        /* solium-disable-next-line security/no-block-members*/
        return now >= _endTime;
    }

    /**
    @dev            Returns true if the address is a member
    @param _member  The member name of the member whose status is to be examined
    @return         True is address is a member
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
    @return         True if a challenge exists on the member
    */
    function memberChallengeExists(address _member) public view returns (bool) {
        uint256 challengeID = registry.getChallengeID(_member);
        return (challengeID > 0);
    }

    /**
    @dev                Determines whether voting has concluded in a challenge for a given
                        member. Throws if challenge can't be resolved
    @param _challengeID The challenge ID
    @return             True if the challenge can be resolved
    */
    function challengeCanBeResolved(uint256 _challengeID) private view returns (bool) {
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
