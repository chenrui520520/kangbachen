const fs = require('fs');

/**
 * Dependency-free pseudo E2E simulation for gameplay invariants.
 * This does NOT execute EVM bytecode; it verifies documented invariants in code text.
 */

const furnace = fs.readFileSync('contracts/FurnaceCore.sol', 'utf8');

const invariants = [
  {
    name: 'request phase burns exactly one mother card',
    check: () => furnace.includes('cards.burnCard(msg.sender, level, 1);')
  },
  {
    name: 'success phase burns second mother card and mints next level',
    check: () => furnace.includes('cards.burnCard(user, level, 1);') && furnace.includes('cards.mintCard(user, level + 1, 1);')
  },
  {
    name: 'failure phase increments lucky points and fragments',
    check: () => furnace.includes('cards.addLuckyPoints(user, 1);') && furnace.includes('cards.addFragment(user, 1);')
  },
  {
    name: 'blessing path restores one mother card and sets cooldown',
    check: () => furnace.includes('cards.mintCard(user, level, 1);') && furnace.includes('cards.setBlessingCooldown(user, block.timestamp + BLESSING_COOLDOWN);')
  },
  {
    name: 'randomness source callback is restricted',
    check: () => furnace.includes('modifier onlyRandomSource') && furnace.includes('external onlyRandomSource')
  }
];

let failed = false;
for (const inv of invariants) {
  const ok = inv.check();
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${inv.name}`);
  if (!ok) failed = true;
}

if (failed) process.exit(1);
console.log('Pseudo E2E invariant simulation passed.');
