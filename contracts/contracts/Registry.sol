pragma solidity 0.5.8;

import "./lib/Ownable.sol";

contract Registry is Ownable {
    // ------
    // STATE
    // ------

    struct Member {
        uint256 challengeID;
        uint256 memberStartTime; // Used for voting: voteWeight = sqrt(now - memberStartTime)
    }

    // Note, this address is used to map to the owner and delegates in the ERC-1056 registry
    mapping(address => Member) public members;

    // -----------------
    // GETTER FUNCTIONS
    // -----------------

    /**
    @dev                Get the challenge ID of a Member. If no challenge exists it returns 0
    @param _member      The member being checked
    @return             The challengeID
    */
    function getChallengeID(address _member) external view returns (uint256) {
        require(_member != address(0), "Can't check 0 address");
        Member memory member = members[_member];
        return member.challengeID;
    }

    /**
    @dev                Get the start time of a Member. If no time exists it returns 0
    @param _member      The member being checked
    @return             The start time
    */
    function getMemberStartTime(address _member) external view returns (uint256) {
        require(_member != address(0), "Can't check 0 address");
        Member memory member = members[_member];
        return member.memberStartTime;
    }

    // -----------------
    // SETTER FUNCTIONS
    // -----------------

    /**
    @dev                Set a member in the Registry. Only Everest can call this function.
    @param _member      The member being added
    @return             The start time of the member
    */
    function setMember(address _member) external onlyOwner returns (uint256) {
        require(_member != address(0), "Can't check 0 address");
        Member memory member = Member({
            challengeID: 0,
            /* solium-disable-next-line security/no-block-members*/
            memberStartTime: now
        });
        members[_member] = member;

        /* solium-disable-next-line security/no-block-members*/
        return now;
    }

    /**
    @dev                        Edit the challengeID. Can be used to set a challenge or remove a
                                challenge for a member. Only Everest can call.
    @param _member              The member being checked
    @param _newChallengeID      The new challenge ID. Pass in 0 to remove a challenge.
    */
    function editChallengeID(address _member, uint256 _newChallengeID) external onlyOwner {
        require(_member != address(0), "Can't check 0 address");
        Member storage member = members[_member];
        member.challengeID = _newChallengeID;
    }

    /**
    @dev                Remove a member. Only Everest can call
    @param _member      The member being removed
    */
    function deleteMember(address _member) external onlyOwner {
        require(_member != address(0), "Can't check 0 address");
        delete members[_member];
    }
}