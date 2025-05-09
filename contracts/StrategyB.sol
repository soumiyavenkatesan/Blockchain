// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVault {
    function receiveYield(uint256 amount) external;
}

contract StrategyB {
    uint256 public yieldRate = 8;
    address public vault;

    constructor(address _vault) {
        vault = _vault;
    }

    function simulateYield(uint256 amount) external {
        uint256 yield = (amount * yieldRate) / 100;
        IVault(vault).receiveYield(yield);
    }

    function getYieldRate() external view returns (uint256) {
        return yieldRate;
    }
}
