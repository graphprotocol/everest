pragma solidity ^0.5.8;

import "./lib/Ownable.sol";
import "./lib/SafeMath.sol";
import "./lib/dai.sol";

// Note, in Everest V1, the Reserve Bank is not upgradeable.
// What will be done is when Everest V2 is deployed, all the tokens
// stored in the Reserve Bank will be transferred to the new Reserve Bank.
// The new Reverse Bank is likely to be upgradeable, and have more functionality.
// However, the ownership of ReserveBank can still be transferred by the Everest owner

contract ReserveBank is Ownable {
    using SafeMath for uint256;

    Dai public token; // approved token contract reference

    constructor(address _daiAddress) public {
        token = Dai(_daiAddress);
    }

    function withdraw(address receiver, uint256 amount)
        public
        onlyOwner
        returns (bool)
    {
        return token.transfer(receiver, amount);
    }
}
