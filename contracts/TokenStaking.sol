// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakingToken is ERC20 {
    constructor() ERC20("StakingToken", "STK") {
        _mint(msg.sender, 10_000_000 * 10 ** decimals());
    }

    //function mint(uint256 _amount) public {
    //_mint(msg.sender, _amount);
  //}
}