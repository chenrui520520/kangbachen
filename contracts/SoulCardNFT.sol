// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice 卡牌等级：0=T,1=U,2=R,3=SR,4=SSR
contract SoulCardNFT is ERC1155, Ownable {
    mapping(uint256 => uint8) public levelByTokenId;
    mapping(uint8 => uint256) public tokenIdByLevel;

    mapping(address => uint256) public luckyPoints;
    mapping(address => uint256) public blessingCooldownUntil;
    mapping(address => uint256) public fragments;

    mapping(address => bool) public furnaceOperators;

    constructor(address initialOwner, string memory baseURI) ERC1155(baseURI) Ownable(initialOwner) {
        for (uint8 i = 0; i <= 4; i++) {
            uint256 tokenId = uint256(i) + 1;
            tokenIdByLevel[i] = tokenId;
            levelByTokenId[tokenId] = i;
        }
    }

    modifier onlyFurnaceOrOwner() {
        require(furnaceOperators[msg.sender] || owner() == msg.sender, "not authorized");
        _;
    }

    function setFurnaceOperator(address operator, bool enabled) external onlyOwner {
        furnaceOperators[operator] = enabled;
    }

    function mintCard(address to, uint8 level, uint256 amount) external onlyFurnaceOrOwner returns (uint256 tokenId) {
        require(level <= 4, "invalid level");
        tokenId = tokenIdByLevel[level];
        _mint(to, tokenId, amount, "");
    }

    function burnCard(address from, uint8 level, uint256 amount) external onlyFurnaceOrOwner {
        require(level <= 4, "invalid level");
        uint256 tokenId = tokenIdByLevel[level];
        _burn(from, tokenId, amount);
    }

    function addLuckyPoints(address user, uint256 delta) external onlyFurnaceOrOwner {
        luckyPoints[user] += delta;
    }

    function resetLuckyPoints(address user) external onlyFurnaceOrOwner {
        luckyPoints[user] = 0;
    }

    function setBlessingCooldown(address user, uint256 until) external onlyFurnaceOrOwner {
        blessingCooldownUntil[user] = until;
    }

    function addFragment(address user, uint256 amount) external onlyFurnaceOrOwner {
        fragments[user] += amount;
    }
}
