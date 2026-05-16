好的，我将把整个 KangBa 官网产品文档整理成 **Cursor 可直接理解的完整 Markdown 结构版本**，包含 **前后端、数据库、接口、页面布局、功能逻辑**，并保留层级、代码块和表格，方便 Cursor 直接解析和生成代码。

下面是完整版本：

---

# KangBa 游戏官网产品文档（Cursor Markdown 全结构版本）

````markdown
# KangBa 官网产品文档

## 1. 项目概述
- **项目名称**：KangBa
- **设计概念**：通过“暗黑美学”与“区块链经济”的深度结合，构建高度沉浸感与经济可持续性的 Web3 游戏生态。
- **官网类型**：一栈式（Full-Stack）官网
- **目标用户**：Web3 玩家、区块链游戏爱好者
- **核心目标**：
  - 展示游戏故事和经济生态
  - 提供虚拟签到奖励、任务奖励、推荐系统
  - 支持排行榜、限时活动和积分兑换商城
  - 前端展示 + 后台导出功能

## 2. 技术栈
| 层级 | 技术/工具 | 说明 |
|------|------------|------|
| 前端 | React / Next.js | 单页应用 + SEO |
| 后端 | Node.js + Express / Fastify | API 服务、签到/任务逻辑 |
| 数据库 | PostgreSQL / MongoDB | 用户、签到、任务、奖励、商城数据 |
| 区块链 | Ethers.js / Web3.js | 钱包连接、签名验证 |
| 钱包 | MetaMask / OKX + 热门钱包 | Coinbase Wallet, Rainbow, Trust Wallet 等 |
| 视频/动画 | HTML5 Video + Lottie / Three.js | 动态背景视频、交互动画 |
| 认证 | JWT | 邮箱登录、钱包签名验证 |
| 第三方 OAuth | Twitter（X） | 登录方式 |

## 3. 核心功能模块

### 3.1 用户登录与认证
- 邮箱登录（验证码 + JWT）
- X / Twitter OAuth 登录
- 钱包登录：MetaMask、OKX、热门钱包
- 钱包签名验证 → 创建/绑定账户

### 3.2 签到奖励系统
- 奖励类型：虚拟积分 + 虚拟 NFT（前端展示）
- 逻辑：
  - 30 天为一轮，每日奖励递增
  - 断签奖励重置
- 后台管理：
  - 数据导出（CSV/Excel）用于空投
- 数据库示例：
```sql
User {
  id: string,
  email: string,
  wallet_address: string[],
  username: string,
  created_at: datetime
}

SignInRecord {
  id: string,
  user_id: string,
  sign_in_date: date,
  reward_day: int,
  reward_points: int,
  reward_nft_id: string
}
````

### 3.3 任务系统

* 任务类型：

  * 日常任务：每日签到、浏览首页、观看视频
  * 社交任务：分享游戏链接至 X / Discord
  * 挑战任务：连续签到、累计积分等
* 奖励：虚拟积分 + 虚拟 NFT
* 数据库示例：

```sql
Task {
  id: string,
  name: string,
  description: string,
  type: string,
  reward_points: int,
  reward_nft_id: string,
  repeatable: boolean,
  created_at: datetime
}

UserTask {
  id: string,
  user_id: string,
  task_id: string,
  completed: boolean,
  completed_at: datetime
}
```

### 3.4 推荐系统

* 根据用户签到、任务完成、活跃度推荐任务/奖励/活动
* 数据库示例：

```sql
Recommendation {
  id: string,
  user_id: string,
  recommended_item: string,
  type: string,
  created_at: datetime
}
```

### 3.5 排行榜系统

* 排行榜类型：

  * 积分排行榜（签到 + 任务积分）
  * NFT 收集排行榜
* 数据库示例：

```sql
Leaderboard {
  id: string,
  user_id: string,
  type: string,
  value: int,
  rank: int,
  updated_at: datetime
}
```

### 3.6 限时活动

* 可配置任务、奖励倍率
* 活动周期示例：7 天活动
* 后台管理：开启/关闭活动、设置奖励规则

### 3.7 积分兑换商城

* 用户积分兑换虚拟 NFT 或特殊奖励
* 数据库示例：

```sql
ShopItem {
  id: string,
  name: string,
  type: string,
  cost_points: int,
  reward_nft_id: string,
  stock: int,
  available_from: datetime,
  available_to: datetime
}

UserShopPurchase {
  id: string,
  user_id: string,
  shop_item_id: string,
  purchased_at: datetime
}
```

### 3.8 游戏背景与介绍

* 动态视频 + 滚动文本、图片、动画
* 暗黑美学风格（深色调、哥特光影）
* 展示游戏故事与 Web3 经济生态

### 3.9 区块链功能

* 钱包绑定与签名验证
* 虚拟奖励前端展示
* 后台导出数据用于空投计算

## 4. 页面布局（单页式）

1. **首页 / Hero 区**

   * 游戏 Logo + 登录入口
   * 背景动态视频
   * 推荐模块（任务/奖励/活动推荐）

2. **游戏背景 / 故事**

   * 视频、滚动文本、图片组合
   * 动态光影、交互动画

3. **奖励系统 / 签到**

   * 当日签到按钮
   * 连续签到天数、奖励等级显示

4. **任务系统**

   * 可完成任务列表
   * 奖励及进度显示
   * 完成任务触发动画

5. **排行榜**

   * 积分排行榜、NFT 收集排行榜
   * 可切换榜单类型

6. **限时活动**

   * 活动倒计时
   * 活动任务与奖励列表
   * 动态展示活动完成进度

7. **积分兑换商城**

   * 商品列表（虚拟 NFT / 特殊奖励）
   * 积分兑换按钮 + 剩余库存
   * 动态更新兑换记录

8. **生态与经济**

   * 游戏代币、虚拟 NFT 展示
   * 空投规划和经济模型说明

9. **社区 / 社交**

   * X / Twitter、Discord、Telegram
   * 社区活动推荐

10. **页脚**

    * 隐私政策、免责声明

## 5. 数据与安全

* 用户信息、钱包信息加密存储
* JWT 认证
* 奖励、任务、商城数据可导出
* 虚拟奖励仅前端展示

## 6. UI / UX 与美术

* 暗黑美学 + 动态视频背景
* 卡片式任务/奖励展示
* 排行榜、商城和活动动态更新
* 鼠标悬停与奖励动画

## 7. 后端接口设计

| 接口                     | 方法   | 功能         | 请求参数                       | 返回           |
| ---------------------- | ---- | ---------- | -------------------------- | ------------ |
| `/api/login/email`     | POST | 邮箱登录       | email                      | JWT          |
| `/api/login/twitter`   | POST | X OAuth 登录 | token                      | JWT          |
| `/api/login/wallet`    | POST | 钱包登录       | wallet_address + signature | JWT          |
| `/api/signin`          | POST | 用户签到       | JWT                        | 当日奖励详情       |
| `/api/rewards`         | GET  | 查询奖励历史     | JWT                        | 奖励记录列表       |
| `/api/rewards/export`  | GET  | 导出奖励数据     | JWT                        | CSV / Excel  |
| `/api/tasks`           | GET  | 获取任务列表     | JWT                        | 任务列表         |
| `/api/tasks/complete`  | POST | 完成任务       | JWT + task_id              | 奖励信息         |
| `/api/recommendations` | GET  | 获取推荐内容     | JWT                        | 推荐任务/奖励/活动列表 |
| `/api/leaderboard`     | GET  | 获取排行榜      | JWT + type                 | 排行榜数据        |
| `/api/events`          | GET  | 获取限时活动     | JWT                        | 活动信息列表       |
| `/api/shop`            | GET  | 获取积分商城列表   | JWT                        | 商城商品列表       |
| `/api/shop/purchase`   | POST | 兑换积分商品     | JWT + shop_item_id         | 成功/失败 + 奖励   |

## 8 国际化要求
- 自动识别浏览器语言
- 用户可手动切换
- URL 多语言路由
- 本地缓存语言设置
- 阿拉伯语支持 RTL

示例：
/en
/zh
/ko
/ja
/ar

---

# 9. 多端适配

## 9.1 支持设备
| Device | Support |
|---|---|
| Desktop | ✅ |
| Laptop | ✅ |
| Tablet | ✅ |
| Mobile | ✅ |

## 9.2 适配要求
- Mobile First
- 响应式布局
- 自适应视频背景
- 移动端动画性能优化