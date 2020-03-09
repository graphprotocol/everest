pragma solidity ^0.5.8;

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

    // --------------------
    // GETTER FUNCTIONS
    // --------------------

    function getChallengeID(address _member) public view returns (uint256) {
        Member memory member = members[_member];
        return member.challengeID;
    }

    function getMemberStartTime(address _member) public view returns (uint256) {
        Member memory member = members[_member];
        return member.memberStartTime;
    }

    // --------------------
    // SETTER FUNCTIONS
    // --------------------

    function setMember(address _member) external returns (uint256) {
        // Create the member struct
        Member memory member = Member({
            challengeID: 0,
            memberStartTime: now
        });
        // Store the member
        members[_member] = member;
    }

    function editChallengeID(address _member, uint256 _newChallengeID) internal {
        Member storage member = members[_member];
        member.challengeID = _newChallengeID;
    }

    function deleteMember(address _member) external {
        delete members[_member];
    }
}