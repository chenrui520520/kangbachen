// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./FurnaceCore.sol";

contract RandomSourceMock is IRandomSource {
    uint256 public nextRequestId = 1;
    mapping(uint256 => bool) public active;

    function requestRandomWords() external override returns (uint256 requestId) {
        requestId = nextRequestId++;
        active[requestId] = true;
    }

    function fulfill(address furnace, uint256 requestId, uint256 randomness) external {
        require(active[requestId], "invalid request");
        active[requestId] = false;
        FurnaceCore(furnace).fulfillRandomness(requestId, randomness);
    }
}
