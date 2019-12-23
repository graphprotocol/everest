pragma solidity ^0.5.8;

/*
 The delegate address can execute any permissions on behalf of the owner of the
 member project. If the owner doesn't want a delegate, they should just set
 the delegate address to their owner address as well.

 The delegate and owner are stored in ERC-1056s registry
*/
contract MemberStruct {
    // Exists here so that both Everest and Registry can inherit, and stay seperate contracts
    struct Member {
        uint256 challengeID;    // Is 0 if it is not challenged
        bool whitelisted;       // Indicates registry status (false if applicant)
        uint256 appliedAt;      // Used for reputation (now - appliedAt) = voteWeight
    }
}