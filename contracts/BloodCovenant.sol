// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice SSR质押分红（最小框架）
contract BloodCovenant {
    IERC20 public immutable rewardToken;

    mapping(address => uint256) public stakedSSR;
    mapping(address => uint256) public claimable;

    event Stake(address indexed user, uint256 amount);
    event Unstake(address indexed user, uint256 amount);
    event Funded(uint256 amount);
    event Claimed(address indexed user, uint256 amount);

    constructor(address rewardTokenAddress) {
        rewardToken = IERC20(rewardTokenAddress);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "amount=0");
        stakedSSR[msg.sender] += amount;
        emit Stake(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(amount > 0 && stakedSSR[msg.sender] >= amount, "invalid amount");
        stakedSSR[msg.sender] -= amount;
        emit Unstake(msg.sender, amount);
    }

    function fund(uint256 amount) external {
        require(amount > 0, "amount=0");
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "transfer fail");
        emit Funded(amount);
    }

    function setClaimable(address user, uint256 amount) external {
        // TODO: replace with merkle/distributor or on-chain settlement
        claimable[user] = amount;
    }

    function claim() external {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "nothing");
        claimable[msg.sender] = 0;
        require(rewardToken.transfer(msg.sender, amount), "transfer fail");
        emit Claimed(msg.sender, amount);
    }
}
