// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FPLLeague is Ownable {
    IERC20 public xdaiToken;
    uint256 public entryFee;
    uint256 public seasonEndTime;
    bool public seasonEnded;
    
    struct Team {
        uint256 teamId;
        address manager;
        uint256 score;
        bool hasPaid;
    }
    
    mapping(address => Team) public teams;
    address[] public teamAddresses;

    event TeamRegistered(address manager, uint256 teamId);
    event EntryFeePaid(address manager);
    event ScoresUpdated(address[] managers, uint256[] scores);
    event WinningsDistributed(address[] winners, uint256[] amounts);

    constructor(address _xdaiTokenAddress, uint256 _entryFee, uint256 _seasonDuration) Ownable(msg.sender) {
        xdaiToken = IERC20(_xdaiTokenAddress);
        entryFee = _entryFee;
        seasonEndTime = block.timestamp + _seasonDuration;
    }

    function registerTeam(uint256 _teamId) external {
        require(block.timestamp < seasonEndTime, "Season has ended");
        require(teams[msg.sender].manager == address(0), "Team already registered");
        
        teams[msg.sender] = Team(_teamId, msg.sender, 0, false);
        teamAddresses.push(msg.sender);
        emit TeamRegistered(msg.sender, _teamId);
    }

    function payEntryFee() external {
        require(teams[msg.sender].manager != address(0), "Team not registered");
        require(!teams[msg.sender].hasPaid, "Entry fee already paid");
        require(xdaiToken.transferFrom(msg.sender, address(this), entryFee), "Transfer failed");
        
        teams[msg.sender].hasPaid = true;
        emit EntryFeePaid(msg.sender);
    }

    function updateScores(address[] calldata _managers, uint256[] calldata _scores) external onlyOwner {
        require(_managers.length == _scores.length, "Arrays length mismatch");
        for (uint i = 0; i < _managers.length; i++) {
            teams[_managers[i]].score = _scores[i];
        }
        emit ScoresUpdated(_managers, _scores);
    }

    function endSeason() external onlyOwner {
        require(block.timestamp >= seasonEndTime, "Season not yet ended");
        require(!seasonEnded, "Season already ended");
        seasonEnded = true;
        distributeWinnings();
    }

    function distributeWinnings() private {
        require(seasonEnded, "Season not ended");
        
        (address[] memory winners, uint256[] memory amounts) = calculateWinnings();
        
        for (uint i = 0; i < winners.length; i++) {
            require(xdaiToken.transfer(winners[i], amounts[i]), "Transfer failed");
        }
        
        emit WinningsDistributed(winners, amounts);
    }

    function calculateWinnings() private view returns (address[] memory, uint256[] memory) {
        // Sort teams by score
        address[] memory sortedTeams = teamAddresses;
        for (uint i = 0; i < sortedTeams.length; i++) {
            for (uint j = i + 1; j < sortedTeams.length; j++) {
                if (teams[sortedTeams[i]].score < teams[sortedTeams[j]].score) {
                    address temp = sortedTeams[i];
                    sortedTeams[i] = sortedTeams[j];
                    sortedTeams[j] = temp;
                }
            }
        }

        // Calculate total prize pool
        uint256 totalPrize = xdaiToken.balanceOf(address(this));

        // Distribute winnings (60% to 1st, 30% to 2nd, 10% to 3rd)
        address[] memory winners = new address[](3);
        uint256[] memory amounts = new uint256[](3);

        winners[0] = sortedTeams[0];
        winners[1] = sortedTeams[1];
        winners[2] = sortedTeams[2];

        amounts[0] = totalPrize * 60 / 100;
        amounts[1] = totalPrize * 30 / 100;
        amounts[2] = totalPrize * 10 / 100;

        return (winners, amounts);
    }

    function getLeaderboard() external view returns (address[] memory, uint256[] memory) {
        address[] memory managers = new address[](teamAddresses.length);
        uint256[] memory scores = new uint256[](teamAddresses.length);

        for (uint i = 0; i < teamAddresses.length; i++) {
            managers[i] = teamAddresses[i];
            scores[i] = teams[teamAddresses[i]].score;
        }

        return (managers, scores);
    }
}
