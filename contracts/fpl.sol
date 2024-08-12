// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FantasyFootball {
    IERC20 public xdaiToken;
    address public owner;
    uint256 public entryFee;
    
    struct Team {
        address manager;
        uint256 points;
    }
    
    mapping(address => Team) public teams;
    address[] public teamAddresses;

    constructor(address _xdaiTokenAddress, uint256 _entryFee) {
        xdaiToken = IERC20(_xdaiTokenAddress);
        owner = msg.sender;
        entryFee = _entryFee;
    }

    function registerTeam() external {
        require(xdaiToken.transferFrom(msg.sender, address(this), entryFee), "Transfer failed");
        require(teams[msg.sender].manager == address(0), "Team already registered");
        
        teams[msg.sender] = Team(msg.sender, 0);
        teamAddresses.push(msg.sender);
    }

    // Add more functions for managing teams, updating scores, etc.
}
