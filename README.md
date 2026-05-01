# kangba

KangBa Web3 game monorepo (in-progress).

## Current status

- Product spec: `docs/kangba_项目方案_v1.0.md`
- Smart contract prototype skeletons:
  - `contracts/KangBaToken.sol`
  - `contracts/SoulCardNFT.sol`
  - `contracts/FurnaceCore.sol`
  - `contracts/BloodCovenant.sol`

## Next milestones

1. Add Foundry/Hardhat project config and CI.
2. Replace synthesis pseudo-random with Chainlink VRF.
3. Implement full card burn/mint flow and stamina accounting.
4. Add staking snapshot settlement for `BloodCovenant`.
5. Build React frontend pages for Furnace/Inventory/PVP/PVE.


## Local dev quickstart

1. Install dependencies:
   - `npm install`
2. Compile contracts:
   - `npm run build`
3. Run tests:
   - `npm test`

> Note: current contracts are prototype-level and still need VRF integration, full synthesis burn/mint flow, and audit hardening before production deployment.
