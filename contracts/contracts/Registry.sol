// Inspired by  https://fravoll.github.io/solidity-patterns/eternal_storage.html
pragma solidity ^0.5.8;

import "../node_modules/@openzeppelin/contracts/ownership/Ownable.sol";
import "./MemberStruct.sol";

contract Registry is Ownable, MemberStruct {
    // ------
    // STATE
    // ------

    // Maps member address to Member data
    // Note, this address is used to map to the owner and delegates in the ERC-1056 registry
    mapping(address => Member) public members;
    bytes32 public charter;

    // ------------
    // CONSTRUCTOR:
    // ------------

    /**
    @dev Contructor     Sets the addresses for token, voting, and parameterizer
    @param _owner       Everest is the owner of the Registry
    */
    constructor (
        address _owner,
        bytes32 _charter
    ) public {
        _owner = _owner;
        charter = _charter;
    }

    // --------------------
    // GETTER FUNCTIONS
    // --------------------

    function getChallengeID(address _member) external view returns (uint256) {
        Member memory member = members[_member];
        return member.challengeID;
    }

    function getMembershipStartTime(address _member) external view returns (uint256) {
        Member memory member = members[_member];
        return member.membershipStartTime;
    }

    // --------------------
    // SETTER FUNCTIONS
    // --------------------

    function updateCharter(bytes32 _newCharter) external onlyOwner {
        charter = _newCharter;
    }

    function setMember(
        address _member,
        uint256 _membershipStartTime
    ) external onlyOwner {
        // Create the member struct
        Member memory member = Member({
            challengeID: 0,
            membershipStartTime: _membershipStartTime
        });
        // Store the member
        members[_member] = member;
    }

    function editChallengeID(address _member, uint256 _newChallengeID) external onlyOwner {
        Member storage member = members[_member];
        member.challengeID = _newChallengeID;
    }

    function deleteMember(address _member) external onlyOwner {
        delete members[_member];
    }
}