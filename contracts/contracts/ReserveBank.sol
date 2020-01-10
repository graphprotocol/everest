pragma solidity ^0.5.8;

import "../node_modules/@openzeppelin/contracts/ownership/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ReserveBank is Ownable {
    using SafeMath for uint256;

    IERC20 public approvedToken; // approved token contract reference

    constructor(address approvedTokenAddress) public {
        approvedToken = IERC20(approvedTokenAddress);
    }

    function withdraw(address receiver, uint256 amount)
        public
        onlyOwner
        returns (bool)
    {
        return approvedToken.transfer(receiver, amount);
    }
}
