pragma solidity ^0.5.8;

import "./lib/Ownable.sol";

contract Registry is Ownable {
    // ------
    // STATE
    // ------

    // Maps member address to Member data
    // Note, this address is used to map to the owner and delegates in the ERC-1056 registry
    struct Member {
        uint256 challengeID;    // Is 0 if it is not challenged
        // Used for reputation: (now - membershipStartTime) = voteWeight
        // Used to determine membership as well: membershipStartTime > now
        uint256 membershipStartTime;
    }

    mapping(address => Member) public members;
    bytes32 public charter;

    // --------------------
    // GETTER FUNCTIONS
    // --------------------

    function getChallengeID(address _member) public view returns (uint256) {
        Member memory member = members[_member];
        return member.challengeID;
    }

    function getMembershipStartTime(address _member) public view returns (uint256) {
        Member memory member = members[_member];
        return member.membershipStartTime;
    }

    // --------------------
    // SETTER FUNCTIONS
    // --------------------

    function updateCharter(bytes32 _newCharter) public onlyOwner {
        charter = _newCharter;
    }

    function setMember(address _member, uint256 _membershipStartTime) public onlyOwner {
        // Create the member struct
        Member memory member = Member({
            challengeID: 0,
            membershipStartTime: _membershipStartTime
        });
        // Store the member
        members[_member] = member;
    }

    function editChallengeID(address _member, uint256 _newChallengeID) public onlyOwner {
        Member storage member = members[_member];
        member.challengeID = _newChallengeID;
    }

    function editMembershipStartTime(address _member, uint256 _newTime) internal onlyOwner {
        Member storage member = members[_member];
        member.membershipStartTime = _newTime;
    }

    function deleteMember(address _member) public onlyOwner {
        delete members[_member];
    }
}