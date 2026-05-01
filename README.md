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
3. Run static validation tests:
   - `npm test`

> Note: current contracts are prototype-level and still need VRF integration, full synthesis burn/mint flow, and audit hardening before production deployment.


## CI note

Current environment may block scoped npm packages. The repo keeps a dependency-light test command (`node scripts/validate.js`) to allow baseline validation in restricted runners.


## 项目搭建（可运行基础版）

目录结构：
- `contracts/`：链上合约原型
- `apps/web/`：前端静态页面（暗黑风格Demo）
- `services/api/`：Node原生API服务（含健康检查）
- `scripts/`：验证与本地开发脚本

运行：
1. 启动服务：`npm run dev`
2. 打开页面：`http://localhost:8787`
3. 健康检查：`http://localhost:8787/api/health`


4. 自动打开页面：`npm run open`
