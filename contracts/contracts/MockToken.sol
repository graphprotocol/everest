pragma solidity ^0.5.8;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";

contract MockToken is ERC20Detailed, ERC20Burnable, ERC20Mintable {
    modifier onlyMinter() {
        require(isMinter(msg.sender), "Only minter can call.");
        _;
    }

    constructor(
        uint256 _initialSupply,
        string memory _name,
        uint8 _decimals,
        string memory _symbol,
        address _minter
    ) public
        ERC20Detailed(_name, _symbol, _decimals) {
        _mint(_minter, _initialSupply); // Deployment address holds all tokens
    }
}
