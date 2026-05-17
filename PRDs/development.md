# KENBA 技术架构文档（Technical Architecture Document）

````markdown
# KENBA Technical Architecture Document

---

# 1. 项目技术目标

## 1.1 核心目标

KENBA 官网需要实现：

- AAA 游戏官网视觉
- Web3 钱包登录
- 多语言国际化
- 响应式适配
- 签到与任务系统
- 排行榜系统
- 活动系统
- NFT 虚拟奖励展示
- 本地化部署
- 高扩展性
- 高性能

---

# 2. 核心技术原则

## 2.1 必须遵循

### 不手搓基础功能
尽可能使用成熟框架与开源组件。

禁止：
- 手写 UI 基础组件
- 手写复杂钱包适配器
- 手写动画引擎
- 手写表单验证
- 手写国际化系统

---

## 2.2 所有服务本地化

禁止依赖：
- Firebase
- Supabase
- Auth0
- Clerk
- Vercel Functions
- 云数据库

必须：
- 本地 Node.js 服务
- 本地 PostgreSQL
- 本地 Redis
- 本地文件存储

---

# 3. 总体技术架构

```text
Browser
   │
   ▼
Next.js Frontend
   │
   ▼
Fastify API Server
   │
   ├── PostgreSQL
   ├── Redis
   ├── Local File Storage
   └── Web3 RPC
````

---

# 4. 前端技术栈（最终方案）

## 4.1 核心框架

```bash
Next.js 15
React 19
TypeScript
```

原因：

* SEO 强
* App Router
* SSR
* Web3 生态成熟
* 社区大

---

# 5. UI 技术栈

## 5.1 UI 组件库（必须）

### 主 UI

```bash
shadcn/ui
```

原因：

* 基于 Radix UI
* 可扩展
* Tailwind 原生支持
* Web3 项目广泛使用

---

## 5.2 底层组件

```bash
Radix UI
```

使用：

* Dialog
* Dropdown
* Tabs
* Tooltip
* Toast
* Popover

---

## 5.3 CSS 系统

```bash
TailwindCSS
tailwind-merge
clsx
```

禁止：

* CSS Modules
* 大量 SCSS

---

# 6. 动画系统

## 6.1 主动画框架

```bash
Framer Motion
```

用于：

* 页面动画
* 卡片动画
* Hover 动画
* Scroll Reveal

---

## 6.2 高级动画

```bash
GSAP
```

用于：

* 视频转场
* 大型滚动动画
* Parallax

---

## 6.3 粒子系统

```bash
tsParticles
```

用于：

* Hero 粒子背景
* 发光粒子
* 科技感粒子

---

## 6.4 3D 系统

```bash
Three.js
@react-three/fiber
@react-three/drei
```

用于：

* NFT 展示
* 背景动态
* 3D 特效

---

# 7. Web3 技术栈

## 7.1 钱包连接（必须）

```bash
wagmi
viem
RainbowKit
```

原因：

* 行业标准
* 多钱包支持成熟
* React 生态最佳实践

---

## 7.2 钱包支持

必须支持：

* MetaMask
* OKX Wallet
* Coinbase Wallet
* Rainbow Wallet
* Trust Wallet
* WalletConnect

---

## 7.3 区块链交互

```bash
ethers.js
```

用于：

* 钱包签名
* 地址验证
* 链上读取

---

# 8. 国际化（i18n）

## 8.1 国际化框架

```bash
next-intl
```

原因：

* Next.js App Router 最佳适配
* SSR 支持优秀
* 社区成熟

---

## 8.2 支持语言

* English
* 中文
* 한국어
* 日本語
* العربية

---

## 8.3 RTL 支持

阿拉伯语必须：

* RTL
* 自动布局翻转

---

# 9. 状态管理

## 9.1 全局状态

```bash
Zustand
```

管理：

* 用户状态
* 钱包状态
* UI 状态
* 活动状态

---

## 9.2 服务端状态

```bash
TanStack Query
```

用于：

* API 缓存
* 自动刷新
* 请求管理

---

# 10. 表单系统

## 10.1 表单

```bash
React Hook Form
```

## 10.2 验证

```bash
Zod
```

---

# 11. 视频系统

## 11.1 视频播放

```bash
react-player
```

## 11.2 视频要求

支持：

* MP4
* WebM
* 自动播放
* 静音循环
* 懒加载

---

# 12. 图标系统

```bash
lucide-react
```

禁止：

* FontAwesome

---

# 13. 后端架构

# 13.1 后端框架

```bash
Fastify
```

原因：

* 高性能
* TypeScript 支持优秀
* 插件生态成熟

---

# 13.2 ORM

```bash
Prisma
```

原因：

* 类型安全
* 社区成熟
* PostgreSQL 支持强

---

# 13.3 API 风格

采用：

* RESTful API

禁止：

* GraphQL

---

# 14. 数据库

## 14.1 主数据库

```bash
PostgreSQL
```

用于：

* 用户数据
* 签到数据
* 任务数据
* 排行榜
* 商城

---

## 14.2 缓存数据库

```bash
Redis
```

用于：

* 排行榜缓存
* Session
* 活动缓存

---

# 15. 本地文件系统

## 15.1 文件存储

必须：

* 本地文件存储

目录：

```bash
/storage
  /videos
  /images
  /nft
  /exports
```

禁止：

* AWS S3
* Cloudinary

---

# 16. 用户认证

## 16.1 JWT

```bash
jsonwebtoken
```

---

## 16.2 邮箱验证码

```bash
nodemailer
```

SMTP：

* 本地 SMTP
  或
* 自建邮箱服务

禁止：

* 第三方 Auth 服务

---

# 17. Admin 后台

## 17.1 后台框架

直接复用：

* Next.js
* shadcn/ui

---

## 17.2 后台功能

### 用户管理

* 用户列表
* 钱包地址
* 登录方式

### 奖励导出

* CSV
* Excel

### 活动管理

* 活动创建
* 奖励配置

### 商城管理

* NFT 商品
* 库存

---

# 18. SEO 系统

## 必须支持

* SSR
* Metadata API
* Sitemap
* Robots.txt
* OpenGraph
* Twitter Card

---

# 19. 项目目录结构（最终）

```bash
KENBA/
├── apps/
│   ├── web/
│   └── admin/
│
├── packages/
│   ├── ui/
│   ├── config/
│   ├── types/
│   └── utils/
│
├── server/
│   ├── api/
│   ├── prisma/
│   ├── services/
│   ├── routes/
│   ├── plugins/
│   └── middleware/
│
├── storage/
│   ├── videos/
│   ├── images/
│   ├── nft/
│   └── exports/
│
├── docker/
│
├── docker-compose.yml
│
└── README.md
```

---

# 20. Docker 本地部署

## 20.1 必须支持 Docker

使用：

```bash
Docker
Docker Compose
```

---

## 20.2 Docker 服务

```yaml
services:
  - nextjs
  - fastify
  - postgres
  - redis
```

---

# 21. 本地开发环境

## Node.js

```bash
Node.js 22+
```

## 包管理

```bash
pnpm
```

禁止：

* npm
* yarn

---

# 22. Cursor 开发要求

Cursor 必须：

## 22.1 优先使用成熟组件

禁止：

* 手写 Modal
* 手写 Dropdown
* 手写 Wallet Connect

必须：

* shadcn/ui
* Radix UI
* RainbowKit

---

## 22.2 代码规范

所有代码必须：

* TypeScript
* ESLint
* Prettier
* 类型安全
* 响应式
* 国际化

---

# 23. 性能优化

## 必须支持

* 图片懒加载
* 视频懒加载
* Route Splitting
* 动画性能优化
* 移动端 GPU 加速

---

# 24. 安全要求

## 必须支持

* JWT 校验
* Wallet Signature 校验
* API Rate Limit
* XSS 防护
* CSRF 防护
* Helmet 安全头

---

# 25. 推荐 Cursor 安装依赖

```bash
pnpm add next react react-dom typescript

pnpm add tailwindcss postcss autoprefixer

pnpm add shadcn-ui @radix-ui/react-dialog

pnpm add framer-motion gsap

pnpm add wagmi viem ethers @rainbow-me/rainbowkit

pnpm add zustand @tanstack/react-query

pnpm add react-hook-form zod

pnpm add next-intl

pnpm add react-player

pnpm add lucide-react

pnpm add fastify prisma @prisma/client

pnpm add ioredis

pnpm add jsonwebtoken bcrypt

pnpm add nodemailer

pnpm add helmet @fastify/rate-limit
```

```
```
