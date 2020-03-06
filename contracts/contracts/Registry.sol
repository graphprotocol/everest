pragma solidity ^0.5.8;

import "./abdk-libraries-solidity/ABDKMath64x64.sol";

contract Registry {
    using ABDKMath64x64 for uint256;
    using ABDKMath64x64 for int128;

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

    function setMember(address _member) internal returns (uint256) {
        // Here we use ABDKMath64x64 to do the square root of the membership time, which is equal
        // to now. We have to covert it to a 64.64 fixed point number, do sqrt(), then convert it
        // back to uint256. uint256 wraps the result of toUInt(), since it returns uint64
        int128 sixtyFourBitFPInt = now.fromUInt();
        int128 squareRootOfMemberTime = sixtyFourBitFPInt.sqrt();
        uint256 squareRootUInt256 = uint256(squareRootOfMemberTime.toUInt());

        // Create the member struct
        Member memory member = Member({
            challengeID: 0,
            membershipStartTime: squareRootUInt256
        });
        // Store the member
        members[_member] = member;
        return squareRootUInt256;
    }

    function editChallengeID(address _member, uint256 _newChallengeID) internal {
        Member storage member = members[_member];
        member.challengeID = _newChallengeID;
    }

    function editMembershipStartTime(address _member, uint256 _newTime) internal {
        Member storage member = members[_member];
        member.membershipStartTime = _newTime;
    }

    function deleteMember(address _member) internal {
        delete members[_member];
    }
}