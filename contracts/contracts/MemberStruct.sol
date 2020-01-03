pragma solidity ^0.5.8;

/*
 The delegate address can execute any permissions on behalf of the owner of the
 member project. If the owner doesn't want a delegate, they should just set
 the delegate address to their owner address as well.

 The delegate and owner are stored in ERC-1056s registry
*/

// Exists here so that both Everest and Registry can inherit, and stay seperate contracts
contract MemberStruct {
    struct Member {
        uint256 challengeID;    // Is 0 if it is not challenged
        // Used for reputation (now - appliedAt) = voteWeight. Used to determine full membership
        uint256 appliedAt;
    }
}