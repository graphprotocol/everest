/*
 Everest is a DAO that is designed to curate a Registry of members. Specifically
 for Everest, it is a list of crypto projects. But this code can be forked
 and used for any type of list.

 This storage of the list is in Registry.sol and in the EthereumDIDRegistry,
 on mainnet, created by uport.

 The DAO is inspired by the Moloch DAO smart contracts https://github.com/MolochVentures/moloch
 The DAO allows anoyone to apply to the list.
 It also has reputation based voting for challenges based on how long a project has been a member.
*/
pragma solidity ^0.5.8;

import "./ReserveBank.sol";
import "./Registry.sol";
import "./MemberStruct.sol";
import "./MockEthereumDIDRegistry.sol";

contract Everest is MemberStruct, Ownable {
    using SafeMath for uint256;

    /***************
    GLOBAL CONSTANTS
    ***************/
    // Voting period length for a challenge
    uint256 public votingPeriodDuration;
    // Period a project must wait before they are officially a member
    uint256 public whitelistPeriodDuration;
    // Deposit that must be made in order to submit a challenge. Returned if challenge is won
    uint256 public challengeDeposit;
    // Application fee to become a member
    uint256 public applicationFee;

    // Approved token contract reference (this version = DAI)
    IERC20 public approvedToken;
    // Guild bank contract reference
    ReserveBank public reserveBank;
    // Member Registry contract reference
    Registry public memberRegistry;
    // ERC-1056 contract reference
    MockEthereumDIDRegistry public  erc1056Registry;

    // Delegate type must be specified for ERC1056. Right now we only use ethereum
    // accounts to be delegates. We pass in the bytes representation of the string 'ethereum'
    // keccak256("ethereum") = 0x657468657265756d. Then add 48 zeros to the end
    // TODO - confirm this is the right key that everyone is using for the standard
    bytes32 delegateType = 0x657468657265756d000000000000000000000000000000000000000000000000;

    // Used to prevent user input from causing overflow (for delegate and off chain data validity)
    uint256 constant MAX_VALIDITY_LENGTH = 10**18;

    /******
    EVENTS
    ******/
    // Event data on delegates, owner, and offChainData are emitted from the ERC-1056 registry
    event ApplicationMade(address member, uint256 applicationTime);
    event ApplicationCancelled(address indexed member);
    event MemberWhitelisted(address indexed member);
    event MemberRemoved(address indexed member);
    event MemberExited(address indexed member);
    event MemberOwnerEdited(address indexed member);
    event DelegateAdded(address indexed member);
    event DelegateRevoked(address indexed member);
    event MemberOffChainDataEdited(address indexed member);
    event CharterUpdated(bytes32 indexed data);

    event MemberChallenged(
        address indexed member,
        uint256 indexed challengeID,
        address indexed challenger,
        uint256 startingPeriod,
        string details
    );

    event SubmitVote(
        uint256 indexed challengeID,
        address indexed submitter, // Same as memberAddress if member voted themselves
        address indexed memberOwner,
        VoteChoice voteChoice,
        uint256 voteWeight
    );

    event ChallengeFailed(
        address indexed member,
        uint256 indexed challengeID,
        uint256 yesVotes,
        uint256 noVotes
    );
    event ChallengeSucceeded(
        address indexed member,
        uint256 indexed challengeID,
        uint256 yesVotes,
        uint256 noVotes
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
        address challenger;         // the member who submitted the challenge
        address member;             // the member
        uint256 yesVotes;           // the total number of YES votes for this challenge
        uint256 noVotes;            // the total number of NO votes for this challenge
        uint256 voterCount;         // total count of voters participating in the challenge
        uint256 startingPeriod;
        bool resolved;              // true if the challenge has been resolved
        bool didPass;               // true only if the challenge passed
        string details;             // challenge details - could be IPFS hash, plaintext, or JSON
        mapping (address => VoteChoice) voteChoiceByMember;     // the choice by each member
        mapping (address => uint256) voteWeightByMember;        // the vote weight of each member
    }

    Challenge[] public challenges;

    /********
    MODIFIERS
    ********/

    modifier onlyMemberOwnerOrDelegate(address _member) {
        require(
            isWhitelisted(_member),
            "Everest::onlyMemberOwnerOrDelegate - The member must be whitelisted"
        );
        address owner = erc1056Registry.identityOwner(_member);
        bool validDelegate = erc1056Registry.validDelegate(_member, delegateType, msg.sender);
        require(
            validDelegate || owner == msg.sender,
            "Everest::onlyMemberOrDelegate - Caller must be the delegate or owner"
        );
        _;
    }

    modifier onlyMemberOwner(address _member) {
        require(
            isWhitelisted(_member),
            "Everest::onlyMemberOwnerOrDelegate - The member must be whitelisted"
        );
        address owner = erc1056Registry.identityOwner(_member);
        require(
            owner == msg.sender,
            "Everest::onlyMemberOrDelegate - Caller must be the delegate or owner"
        );
        _;
    }

    /********
    FUNCTIONS
    ********/
    constructor(
        address _owner,
        address _approvedToken,
        uint256 _votingPeriodDuration,
        uint256 _challengeDeposit,
        uint256 _whitelistPeriodDuration,
        uint256 _applicationFee,
        bytes32 _charter
    ) public {
        require(_owner != address(0), "Everest::constructor - owner cannot be 0");
        require(_approvedToken != address(0), "Everest::constructor - _approvedToken cannot be 0");
        require(
            _votingPeriodDuration > 0,
            "Everest::constructor - _votingPeriodDuration cant be 0"
        );

        approvedToken = IERC20(_approvedToken);
        // TODO - confirm this creates contracts, it is not clear on ganache (can do this when
        // testing, and should probably even emit constructor events)
        reserveBank = new ReserveBank(_approvedToken);
        memberRegistry = new Registry(address(this), _charter);

        votingPeriodDuration = _votingPeriodDuration;
        challengeDeposit = _challengeDeposit;
        whitelistPeriodDuration = _whitelistPeriodDuration;
        applicationFee = _applicationFee;

    }

    /*******************
    ADD MEMBER FUNCTIONS
    *******************/

    /**
    @dev                            Allows a user to apply to add a member to the Registry
    @param _member                  The address of the member
    @param _sigV                    V piece of the member signature
    @param _sigR                    R piece of the member signature
    @param _sigS                    S piece of the member signature
    @param _owner                   Owner of the member application
    @param _delegate                Delegate designated for the member
    @param _delegateValidity        Time delegate is valid
    @param _offChainDataName        Attribute name. Should be a string less than 32 bytes, converted
                                    to bytes32. example: 'ProjectData' = 0x50726f6a65637444617461
    @param _offChainDataValue       Attribute data stored offchain (such as IPFS)
    @param _offChainDataValidity    Length of time attribute data is valid
    */
    function applyMember(
        address _member,
        uint8 _sigV,
        bytes32 _sigR,
        bytes32 _sigS,
        address _owner,
        address _delegate,
        uint256 _delegateValidity,
        bytes32 _offChainDataName,
        bytes calldata _offChainDataValue,
        uint256 _offChainDataValidity
    ) external {
        require(
            !isWhitelisted(_member),
            "Everest::applyMember - The member is already whitelisted"
        );
        require(
            memberRegistry.getAppliedAt(_member) == 0,
            "Everest::applyMember - The member is currently waiting to be whitelisted"
        );
        require(
            _delegateValidity < MAX_VALIDITY_LENGTH,
            "Everest::applyMember - _delegateValidity is too large"
        );
        require(
            _offChainDataValidity < MAX_VALIDITY_LENGTH,
            "Everest::applyMember - _offChainDataValidity is too large"
        );
        require(_owner != address(0), "Everest::applyMember - Owner can't be the 0 address");
        require(_delegate != address(0), "Everest::applyMember - Delegate can't be the 0 address");
        /* solium-disable-next-line security/no-block-members*/
        memberRegistry.setMember(_member, now);

        // First time applicants might have all three of these values be the same
        // eth address, as the caller is the member, and they want to be the owner too
        erc1056Registry.changeOwnerSigned(_member, _sigV, _sigR, _sigS, _owner);

        erc1056Registry.addDelegateSigned(
            _member,
            _sigV,
            _sigR,
            _sigS,
            delegateType,
            _delegate,
            _delegateValidity
        );

        erc1056Registry.setAttributeSigned(
            _member,
            _sigV,
            _sigR,
            _sigS,
            _offChainDataName,
            _offChainDataValue,
            _offChainDataValidity
        );

        // Transfers tokens from user to the Reserve Bank
        require(
            approvedToken.transferFrom(msg.sender, address(reserveBank), applicationFee),
            "Everest::applyMember - Token transfer failed"
        );

        emit ApplicationMade(
            _member,
            /* solium-disable-next-line security/no-block-members*/
            now
        );
    }

    /**
    @dev                Whitelists a project if the application time has passed and
                        it has not been challenged. Anyone can call this function.
    @param _member      The member whose status is being updated
    */
    function whitelist(address _member) public {
        uint256 appliedAt = memberRegistry.getAppliedAt(_member);
        require(
            /* solium-disable-next-line security/no-block-members*/
            now >= appliedAt.add(whitelistPeriodDuration),
            "Everest::whitelist - The member has not passed the applied phase"
        );
        require(
            !challengeExists(_member),
            "Everest::whitelist - Member can't be whitelisted when it is being challenged"
        );
        memberRegistry.whitelistMember(_member);
        emit MemberWhitelisted(_member);
    }

    /**
    @dev                Allow a member to voluntarily leave the whitelist. Note that this does not
                        reset ownership or delegates in the ERC-1056 registry. This must be done by
                        calling the respective functions in the registry that handle those resets.
    @param _member      Member exiting the whitelist
    */
    function memberExit(
        address _member
    ) external onlyMemberOwner(_member) {
        bool whitelisted = memberRegistry.getWhitelisted(_member);
        require(whitelisted, "Everest::memberExit - Member must be whitelisted");
        require(
            !challengeExists(_member),
            "Everest::memberExit - Can't exit during ongoing challenge"
        );
        memberRegistry.deleteMember(_member);
        emit MemberExited(_member);
    }

    /******************
    EDIT MEMBER FUNCTIONS
    ******************/

    /**
    @dev                Allows a member owner to be edited. Only owner can call
    @param _newOwner    The new owner of the membership
    @param _member      The address of the member
    @param _sigV        V piece of the member signature
    @param _sigR        R piece of the member signature
    @param _sigS        S piece of the member signature
     */
    function editMemberOwner(
        address _newOwner,
        address _member,
        uint8 _sigV,
        bytes32 _sigR,
        bytes32 _sigS
    ) external onlyMemberOwner(_member) {
        require(_newOwner != address(0), "Everest::applyMember - Owner can't be the 0 address");
        require(
            !challengeExists(_member),
            "Everest::editMemberOwner - Can't edit during ongoing challenge"
        );
        erc1056Registry.changeOwnerSigned(_member, _sigV, _sigR, _sigS, _newOwner);
        emit MemberOwnerEdited(_member);
    }

    /**
    @dev                            Allows offChainData to be edited by the owner or delegate.
                                    To revoke an attribute, just pass a validity of 0. There is no
                                    need to wrap the revokeAttribute function in ERC-1056.
    @param _member                  The address of the member
    @param _sigV                    V piece of the member signature
    @param _sigR                    R piece of the member signature
    @param _sigS                    S piece of the member signature
    @param _offChainDataName        Attribute name. Should be a string less than 32 bytes, converted
                                    to bytes32. example: 'ProjectData' = 0x50726f6a65637444617461
    @param _offChainDataValue       Attribute data stored offchain (such as IPFS)
    @param _offChainDataValidity    Length of time attribute data is valid
     */
    function editOffChainData(
        address _member,
        uint8 _sigV,
        bytes32 _sigR,
        bytes32 _sigS,
        bytes32 _offChainDataName,
        bytes calldata _offChainDataValue,
        uint256 _offChainDataValidity
    ) external onlyMemberOwner(_member) {
        require(
            !challengeExists(_member),
            "Everest::editOffChainData - Can't edit during ongoing challenge"
        );
        require(
            _offChainDataValidity < MAX_VALIDITY_LENGTH,
            "Everest::editOffChainData - _offChainDataValidity is too large"
        );
        erc1056Registry.setAttributeSigned(
            _member,
            _sigV,
            _sigR,
            _sigS,
            _offChainDataName,
            _offChainDataValue,
            _offChainDataValidity
        );
        emit MemberOffChainDataEdited(_member);
    }

    /**
    @dev                        Allows a delegate to be added (there can be multiple)
    @param _member              The address of the member
    @param _sigV                V piece of the member signature
    @param _sigR                R piece of the member signature
    @param _sigS                S piece of the member signature
    @param _newDelegate         The new delegate
    @param _delegateValidity    The time the new delegate is valid
     */
    function addDelegate(
        address _member,
        uint8 _sigV,
        bytes32 _sigR,
        bytes32 _sigS,
        address _newDelegate,
        uint256 _delegateValidity
    ) external onlyMemberOwner(_member) {
        require(_newDelegate != address(0), "Everest::applyMember - Delegate can't be 0 address");
        require(
            !challengeExists(_member),
            "Everest::editDelegate - Can't edit during ongoing challenge"
        );
        require(
            _delegateValidity < MAX_VALIDITY_LENGTH,
            "Everest::editDelegate - _delegateValidity is too large"
        );

        erc1056Registry.addDelegateSigned(
            _member,
            _sigV,
            _sigR,
            _sigS,
            delegateType,
            _newDelegate,
            _delegateValidity
        );

        emit DelegateAdded(_member);
    }

    /**
    @dev                Allows a member delegate to be added
    @param _member      The address of the member
    @param _sigV        V piece of the member signature
    @param _sigR        R piece of the member signature
    @param _sigS        S piece of the member signature
    @param _delegate    The delegate being removed
     */
    function revokeDelegate(
        address _delegate,
        address _member,
        uint8 _sigV,
        bytes32 _sigR,
        bytes32 _sigS
    ) external onlyMemberOwner(_member) {
        require(_delegate != address(0), "Everest::applyMember - Delegate can't be 0 address");
        require(
            !challengeExists(_member),
            "Everest::editDelegate - Can't edit during ongoing challenge"
        );

        erc1056Registry.revokeDelegateSigned(
            _member,
            _sigV,
            _sigR,
            _sigS,
            delegateType,
            _delegate
        );

        emit DelegateRevoked(_member);
    }

    /******************
    CHALLENGE FUNCTIONS
    ******************/

    /**
    @dev                        Starts a challenge on a member. Challenger deposits a fee.
    @param _challengingMember   The memberName of the member who is challenging another member
    @param _challengedMember    The memberName of the member being challenged
    @param _details             Extra details relevant to the challenge
    */
    function challenge(
        address _challengingMember,
        address _challengedMember,
        string calldata _details
    ) external onlyMemberOwner(_challengingMember) returns (uint256 challengeID) {
        uint256 challengerAppliedAt = memberRegistry.getAppliedAt(_challengingMember);

        require(
            !challengeExists(_challengingMember),
            "Everest::challenge - Member can't be challenge multiple times at once"
        );

        uint256 newChallengeID = challenges.length.add(1);
        Challenge memory newChallenge = Challenge({
            challenger: _challengingMember,
            member: _challengingMember,
            /* solium-disable-next-line security/no-block-members*/
            yesVotes: now - challengerAppliedAt,
            noVotes: 0,
            voterCount: 1,
            /* solium-disable-next-line security/no-block-members*/
            startingPeriod: now,
            resolved: false,
            didPass: false,
            details: _details
        });

        challenges.push(newChallenge);

        // Updates member to store most recent challenge
        memberRegistry.editChallengeID(_challengedMember, newChallengeID);

        // Takes tokens from challenger
        require(
            approvedToken.transferFrom(msg.sender, address(reserveBank), challengeDeposit),
            "Everest::challenge - Token transfer failed"
        );

        emit MemberChallenged(
            _challengedMember,
            newChallengeID,
            _challengingMember,
            /* solium-disable-next-line security/no-block-members*/
            now,
            newChallenge.details
        );

        // Insert challengers vote into the challenge
        submitVote(challengeID, VoteChoice.Yes, _challengingMember);
        return challengeID;
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
            _challengeID <= challenges.length,
            "Everest::submitVote - Challenge does not exist"
        );
        Challenge storage storedChallenge = challenges[_challengeID];
        uint256 appliedAt = memberRegistry.getAppliedAt(_voter);

        require(uint8(_voteChoice) < 3, "Everest::submitVote - _voteChoice must be less than 3");
        uint256 voteWeight = storedChallenge.startingPeriod - appliedAt;

        require(
            !hasVotingPeriodExpired(storedChallenge.startingPeriod),
            "Everest::submitVote - Challenge voting period has expired"
        );
        require(
            storedChallenge.voteChoiceByMember[_voter] == VoteChoice.Null,
            "Everest::submitVote - Member has already voted on this challenge"
        );
        require(
            _voteChoice == VoteChoice.Yes || _voteChoice == VoteChoice.No,
            "Everest::submitVote - Vote must be either Yes or No"
        );

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
    @dev                    Resolve a challenge. Anyone can call this function.
    @param _challengeID     The challenge ID
    */
    function resolveChallenge(uint256 _challengeID) public {
        challengeCanBeResolved(_challengeID);
        Challenge storage storedChallenge = challenges[_challengeID];

        bool didPass = storedChallenge.yesVotes > storedChallenge.noVotes;
        bool moreThanOneVote = storedChallenge.voterCount > 1;
        if (didPass && moreThanOneVote) {
            storedChallenge.didPass = true;

            // Transfer challenge deposit and project application fee to challenger
            require(
                reserveBank.withdraw(storedChallenge.challenger, applicationFee),
                "Everest::resolveChallenge - Rewarding challenger failed"
            );
            memberRegistry.deleteMember(storedChallenge.member);

            emit ChallengeSucceeded(
                storedChallenge.member,
                _challengeID,
                storedChallenge.yesVotes,
                storedChallenge.noVotes
            );

        } else {
            // No token transfer necessary, the challenger has lost their deposit
            emit ChallengeFailed(
                storedChallenge.member,
                _challengeID,
                storedChallenge.yesVotes,
                storedChallenge.noVotes
            );
        }
        storedChallenge.resolved = true;
    }

    /***************
    EVEREST OWNER FUNCTIONS
    ***************/

    /**
    @dev                Allows the owner of Everest to update the charter in the memberRegistry
    @param _newCharter  The data that links to the new charter offchain
    */
    function updateCharter(bytes32 _newCharter) external onlyOwner returns (bool) {
        emit CharterUpdated(_newCharter);
        memberRegistry.updateCharter(_newCharter);
        return true;
    }

    /**
    @dev                Allows the owner of everest to withdraw funds from the reserve bank
                        in the case of an emergency, or an upgrade from V1. With plans
                        to decentralize this functionality in the future.
    @param _receiver    The address receiving funds
    @param _amount      The amount of funds being withdrawn
    */
    function withdraw(address _receiver, uint256 _amount) external onlyOwner returns (bool) {
        return reserveBank.withdraw(_receiver, _amount);
    }


    /***************
    GETTER FUNCTIONS
    ***************/

    /**
    @dev    Return the challenge count, which is just the length of the challenge array. Must be
            exposed through this view function.
    */
    function getChallengeCount() public view returns (uint256) {
        return challenges.length;
    }

    /**
    @dev                    Returns a boolean if a challenge vote period has finished
    @param _startingPeriod  The starting period of the challenge
    */
    function hasVotingPeriodExpired(uint256 _startingPeriod) public view returns (bool) {
        /* solium-disable-next-line security/no-block-members*/
        return now >= _startingPeriod.add(votingPeriodDuration);
    }

    /**
    @dev                    Returns the members vote choice and weight for a specific challenge
    @param _memberAddress   The member
    @param _challengeID     The challenge they voted on
    */
    function getMemberProposalVote(address _memberAddress, uint256 _challengeID)
        public
        view
        returns (VoteChoice, uint256)
    {
        require(
            _challengeID < challenges.length,
            "Everest::getMemberProposalVote - Challenge doesn't exist"
        );

        uint256 voteWeight = challenges[_challengeID].voteWeightByMember[_memberAddress];
        VoteChoice choice = challenges[_challengeID].voteChoiceByMember[_memberAddress];
        return (choice, voteWeight);
    }

    /**
    @dev            Returns true if the provided member is whitelisted
    @param _member  The member name of the member whose status is to be examined
    */
    function isWhitelisted(address _member) public view returns (bool){
        return memberRegistry.getWhitelisted(_member);
    }

    /**
    @dev            Returns true if the member has an unresolved challenge. False if the challenge
                    does not exist.
    @param _member  The member that is being checked for a challenge.
    */
    function challengeExists(address _member) public view returns (bool) {
        uint256 challengeID = memberRegistry.getChallengeID(_member);
        return (challengeID > 0 && !challenges[challengeID].resolved);
    }

    /**
    @dev                Determines whether voting has concluded in a challenge for a given
                        member. Throws if challenge can't be resolved
    @param _challengeID The challenge ID
    */
    function challengeCanBeResolved(uint256 _challengeID) public view returns (bool) {
        Challenge storage storedChallenge = challenges[_challengeID];
        require(
            _challengeID < challenges.length,
            "Everest::challengeCanBeResolved - Challenge does not exist"
        );
        require(
            hasVotingPeriodExpired(storedChallenge.startingPeriod),
            "Everest::challengeCanBeResolved - Challenge is not ready to be resolved"
        );
        require(
            storedChallenge.resolved == false,
            "Everest::challengeCanBeResolved - Challenge has already been resolved"
        );
        return true;
    }
}
