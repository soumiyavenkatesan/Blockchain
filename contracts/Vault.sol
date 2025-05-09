// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IStrategy {
    function getYieldRate() external view returns (uint256);
    function simulateYield(uint256 amount) external;
}

contract Vault {
    IERC20 public token;
    address public owner;
    mapping(address => uint256) public balances;
    uint256 public totalDeposits;

    address[] public strategies;
    address public currentStrategy;

    constructor(address _token) {
        token = IERC20(_token);
        owner = msg.sender;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "No zero deposits");
        token.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        totalDeposits += amount;
        _allocateFunds();
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient");
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        token.transfer(msg.sender, amount);
    }

    function addStrategy(address strategy) external {
        require(msg.sender == owner, "Not owner");
        strategies.push(strategy);
    }

    function _allocateFunds() internal {
        uint256 bestYield = 0;
        address bestStrategy = address(0);

        for (uint i = 0; i < strategies.length; i++) {
            uint256 rate = IStrategy(strategies[i]).getYieldRate();
            if (rate > bestYield) {
                bestYield = rate;
                bestStrategy = strategies[i];
            }
        }

        currentStrategy = bestStrategy;
        IStrategy(currentStrategy).simulateYield(totalDeposits);
    }

    function receiveYield(uint256 amount) external {
        token.transfer(address(this), amount);
        totalDeposits += amount;
    }

    function getUserBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}
