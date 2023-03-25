// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokentirrProperty is ERC20, Ownable {
    event StartingSupply(address indexed owner, uint256 amount);

    constructor() ERC20("TokentirrProperty", "PTIRR") {}

    function init(uint256 amount) public onlyOwner {
        emit StartingSupply(msg.sender, amount);
        _mint(msg.sender, amount);
    }

    // TODO ver si es fixed supply y si eso quitarlo
    function mint(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount);
    }

    // TODO sobra, hace lo mismo
    function transfer(
        address to,
        uint256 amount
    ) public override onlyOwner returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }
}
