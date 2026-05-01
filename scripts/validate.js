const fs = require('fs');

function assertContains(path, patterns) {
  const c = fs.readFileSync(path, 'utf8');
  for (const p of patterns) {
    if (!c.includes(p)) {
      throw new Error(`${path} missing pattern: ${p}`);
    }
  }
}

try {
  assertContains('contracts/KangBaToken.sol', ['contract KangBaToken', 'function mint']);
  assertContains('contracts/SoulCardNFT.sol', ['function mintCard', 'function burnCard', 'luckyPoints']);
  assertContains('contracts/FurnaceCore.sol', ['function requestSynthesis', 'function fulfillRandomness']);
  assertContains('contracts/BloodCovenant.sol', ['function stake', 'function claim']);
  console.log('Static contract validation passed.');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
