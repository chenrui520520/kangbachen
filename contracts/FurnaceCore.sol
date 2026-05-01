// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SoulCardNFT.sol";

interface IRandomSource {
    function requestRandomWords() external returns (uint256 requestId);
}

contract FurnaceCore {
    SoulCardNFT public immutable cards;
    address public owner;
    IRandomSource public randomSource;

    struct Rate {
        uint16 bps;
    }

    struct PendingSynthesis {
        address user;
        uint8 level;
        bool exists;
    }

    mapping(uint8 => Rate) public rateByLevel;
    mapping(uint256 => PendingSynthesis) public pendingByRequestId;

    uint256 public constant LUCKY_BOOST_THRESHOLD = 10;
    uint16 public constant LUCKY_BOOST_BPS = 6000;
    uint256 public constant BLESSING_THRESHOLD = 20;
    uint256 public constant BLESSING_COOLDOWN = 24 hours;

    event SynthesisRequested(address indexed user, uint8 indexed fromLevel, uint256 indexed requestId);
    event SynthesisResolved(
        address indexed user,
        uint8 indexed fromLevel,
        bool success,
        bool blessed,
        uint256 randomBps,
        uint16 effectiveRate
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyRandomSource() {
        require(msg.sender == address(randomSource), "not random source");
        _;
    }

    constructor(address cardAddress, address randomSourceAddress) {
        owner = msg.sender;
        cards = SoulCardNFT(cardAddress);
        randomSource = IRandomSource(randomSourceAddress);

        rateByLevel[0] = Rate(5000);
        rateByLevel[1] = Rate(3000);
        rateByLevel[2] = Rate(1500);
        rateByLevel[3] = Rate(1000);
    }

    function setRandomSource(address randomSourceAddress) external onlyOwner {
        randomSource = IRandomSource(randomSourceAddress);
    }

    function requestSynthesis(uint8 level) external returns (uint256 requestId) {
        require(level <= 3, "cannot upgrade");

        // 锁定成本：先销毁一张，失败时不返还
        cards.burnCard(msg.sender, level, 1);

        requestId = randomSource.requestRandomWords();
        pendingByRequestId[requestId] = PendingSynthesis({user: msg.sender, level: level, exists: true});

        emit SynthesisRequested(msg.sender, level, requestId);
    }

    /// @notice VRF回调入口（本地可由mock调用）
    function fulfillRandomness(uint256 requestId, uint256 randomness) external onlyRandomSource {
        PendingSynthesis memory pending = pendingByRequestId[requestId];
        require(pending.exists, "request not found");
        delete pendingByRequestId[requestId];

        uint8 level = pending.level;
        address user = pending.user;

        uint16 baseRate = rateByLevel[level].bps;
        uint256 lucky = cards.luckyPoints(user);
        uint16 effectiveRate = baseRate;
        if (lucky >= LUCKY_BOOST_THRESHOLD && LUCKY_BOOST_BPS > effectiveRate) {
            effectiveRate = LUCKY_BOOST_BPS;
        }

        bool blessingActive = lucky >= BLESSING_THRESHOLD && block.timestamp >= cards.blessingCooldownUntil(user);

        uint256 randomBps = randomness % 10000;
        bool success = randomBps < effectiveRate;

        if (success) {
            cards.burnCard(user, level, 1);
            cards.mintCard(user, level + 1, 1);
            cards.resetLuckyPoints(user);
        } else {
            cards.addLuckyPoints(user, 1);
            cards.addFragment(user, 1);

            if (blessingActive) {
                cards.mintCard(user, level, 1);
                cards.setBlessingCooldown(user, block.timestamp + BLESSING_COOLDOWN);
            }
        }

        emit SynthesisResolved(user, level, success, blessingActive, randomBps, effectiveRate);
    }
}
