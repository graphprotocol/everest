pragma solidity ^0.5.8;

import "../node_modules/@openzeppelin/contracts/ownership/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

// TODO - Need to make sure there is a way to withdraw this in V1, but no need to
//        have ways to spend the reserves uniquely by voting or

contract ReserveBank is Ownable {
    using SafeMath for uint256;

    IERC20 public approvedToken; // approved token contract reference

    event Withdrawal(address indexed receiver, uint256 amount);

    constructor(address approvedTokenAddress) public {
        approvedToken = IERC20(approvedTokenAddress);
    }

    function withdraw(address receiver, uint256 amount)
        public
        onlyOwner
        returns (bool)
    {
        emit Withdrawal(receiver, amount);
        return approvedToken.transfer(receiver, amount);
    }
}
