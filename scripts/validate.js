const fs = require('fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function assertContains(path, patterns) {
  const c = read(path);
  for (const p of patterns) {
    if (!c.includes(p)) throw new Error(`${path} missing pattern: ${p}`);
  }
}

function assertNotContains(path, patterns) {
  const c = read(path);
  for (const p of patterns) {
    if (c.includes(p)) throw new Error(`${path} contains forbidden pattern: ${p}`);
  }
}

function assertCount(path, token, minCount) {
  const c = read(path);
  const count = c.split(token).length - 1;
  if (count < minCount) throw new Error(`${path} expected at least ${minCount} matches for: ${token}, got ${count}`);
}

try {
  assertContains('contracts/KangBaToken.sol', ['contract KangBaToken', 'function mint', 'onlyOwner']);
  assertContains('contracts/SoulCardNFT.sol', [
    'function mintCard',
    'function burnCard',
    'function setFurnaceOperator',
    'mapping(address => uint256) public luckyPoints',
    'mapping(address => uint256) public fragments'
  ]);
  assertContains('contracts/FurnaceCore.sol', [
    'function requestSynthesis',
    'function fulfillRandomness',
    'event SynthesisRequested',
    'event SynthesisResolved',
    'LUCKY_BOOST_THRESHOLD',
    'BLESSING_COOLDOWN'
  ]);
  assertContains('contracts/BloodCovenant.sol', ['function stake', 'function unstake', 'function fund', 'function claim']);

  assertContains('contracts/FurnaceCore.sol', ['modifier onlyRandomSource', 'modifier onlyOwner']);
  assertContains('contracts/SoulCardNFT.sol', ['modifier onlyFurnaceOrOwner']);

  assertNotContains('contracts/FurnaceCore.sol', ['attemptSynthesis(']);

  assertCount('contracts/FurnaceCore.sol', 'require(', 3);
  assertCount('contracts/SoulCardNFT.sol', 'require(', 3);

  console.log('Static contract validation passed (core + security + structure).');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
