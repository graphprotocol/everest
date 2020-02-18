pragma solidity ^0.5.8;

import "./lib/Ownable.sol";
import "./lib/SafeMath.sol";
import "./lib/Dai.sol";

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
