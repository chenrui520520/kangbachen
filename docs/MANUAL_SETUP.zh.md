# KENBA 上线与第三方配置清单

本文档列出：**已在代码中完成**的事项，以及 **必须由你手动完成** 的事项（含逐步操作）。

---

## 一、我已在项目中完成的内容（无需你再写代码）

| 类别 | 说明 |
|------|------|
| 登录 | 钱包签名登录；邮箱 → Google OAuth 一键跳转；X → Twitter OAuth 2.0 一键跳转 |
| 开发模拟 | `OAUTH_DEV_MOCK=true` 时，未配置 Google/X 也可在本地测试登录流程 |
| 后台 | 中文管理端：CMS、素材库、签到、任务、商城、NFT、用户积分等 |
| 安全 | 生产环境弱密钥检测；管理员种子账号生产环境不覆盖密码 |
| 脚本 | `pnpm setup:env` / `pnpm oauth:check` / `pnpm qa:launch` / `pnpm test:api` / `scripts/backup-db.ps1` |
| CI | `.github/workflows/ci.yml`（lint + API 测试） |

---

## 二、本地开发：请你执行一次（约 5 分钟）

在项目根目录 `d:\KENBA` 打开终端：

```powershell
# 1. 启动数据库（需已安装 Docker Desktop）
pnpm db:up

# 2. 数据库迁移 + 种子数据
pnpm db:migrate
pnpm db:seed

# 3. 检查环境（可选）
pnpm oauth:check

# 4. 启动前台 + API
pnpm dev

# 5. 另开终端启动后台（可选）
pnpm dev:admin
```

访问：

- 前台：http://localhost:3000  
- 后台：http://localhost:3001/admin（默认 `admin@kangba.local` / `kangba-admin-change-me`）  
- API 健康：http://127.0.0.1:4000/health  

本地 OAuth：已在 `.env` 开启 `OAUTH_DEV_MOCK=true`，未填 Google/X 密钥也可点「邮箱一键登录」「X 一键登录」走模拟账号。

---

## 三、必须手动完成：Google 邮箱一键登录

> 用于「邮箱一键登录」按钮（跳转 Google 授权，无需验证码）。

### 3.1 创建项目

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)  
2. 新建项目（或选择已有项目）  
3. **API 和服务** → **OAuth 同意屏幕** → 选择「外部」→ 填写应用名称、支持邮箱 → 保存  
4. **凭据** → **创建凭据** → **OAuth 客户端 ID** → 类型选 **Web 应用**

### 3.2 配置重定向 URI

| 环境 | 授权重定向 URI |
|------|----------------|
| 本地 | `http://127.0.0.1:4000/api/login/google/callback` |
| 生产 | `https://你的API域名/api/login/google/callback` |

> 若前台与 API 同域（经 Nginx 反代），生产也可只用站点域名，但回调必须打到 **API** 的 `/api/login/google/callback`。

### 3.3 写入 `.env`

```env
GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的客户端密钥
API_PUBLIC_URL=http://127.0.0.1:4000
WEB_PUBLIC_URL=http://localhost:3000
OAUTH_DEV_MOCK=false
```

生产复制 `.env.production.example` 为服务器上的 `.env`，并改为 HTTPS 域名。

### 3.4 验证

```powershell
pnpm oauth:check
```

应显示 `[OK] Google OAuth`，且浏览器点击登录能跳 Google 并回到站点。

---

## 四、必须手动完成：X (Twitter) 一键登录

### 4.1 创建应用

1. 打开 [X Developer Portal](https://developer.x.com/)  
2. 创建 Project 和 App  
3. 在 App 设置中启用 **OAuth 2.0**  
4. 类型：**Web App**，**Confidential Client**  
5. 开启 **PKCE**（默认 OAuth 2.0 即支持）

### 4.2 Callback URL

| 环境 | Callback URL |
|------|----------------|
| 本地 | `http://127.0.0.1:4000/api/login/twitter/callback` |
| 生产 | `https://你的API域名/api/login/twitter/callback` |

### 4.3 权限 Scope

应用需至少：`users.read`（读取用户资料登录用）。

### 4.4 写入 `.env`

```env
TWITTER_CLIENT_ID=你的Client ID
TWITTER_CLIENT_SECRET=你的Client Secret
```

### 4.5 验证

`pnpm oauth:check` 显示 `[OK] X (Twitter) OAuth`，前台点击「X 一键登录」可完成授权。

---

## 五、必须手动完成：WalletConnect（钱包登录）

1. 打开 [WalletConnect Cloud](https://cloud.walletconnect.com/)  
2. 创建项目，复制 **Project ID**  
3. 写入 `.env`：

```env
NEXT_PUBLIC_WC_PROJECT_ID=你的project_id
```

4. 重启 `pnpm dev`（Next 在构建时读取该变量）

---

## 六、必须手动完成：生产环境上线

### 6.1 服务器与域名

- [ ] 一台 VPS 或云主机（建议 2核4G+）  
- [ ] 域名 DNS 解析到服务器  
- [ ] 开放 80/443 端口  

### 6.2 生产 `.env`

```powershell
copy .env.production.example .env
# 编辑 .env，逐项填写（不要用开发默认密码）
```

**务必修改：**

- `JWT_SECRET` — 运行 `openssl rand -hex 32` 生成  
- `ADMIN_API_KEY` / `NEXT_PUBLIC_ADMIN_API_KEY` — 强随机字符串  
- `POSTGRES_PASSWORD` / `DATABASE_URL`  
- `GOOGLE_*` / `TWITTER_*`  
- `CORS_ORIGINS` / `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_API_URL` / `API_PUBLIC_URL` / `WEB_PUBLIC_URL`  
- `OAUTH_DEV_MOCK` — **生产必须删除或设为 `false`**  

### 6.3 Docker 部署

```powershell
docker compose -f docker-compose.prod.yml up -d --build
pnpm db:migrate
```

### 6.4 HTTPS

- [ ] 在 `docker/nginx.prod.conf` 配置 SSL 证书（Let’s Encrypt 或云厂商证书）  
- [ ] `SSL_REDIRECT=1`  

### 6.5 上线检查

```powershell
pnpm qa:launch
pnpm qa:power:prod
```

### 6.6 上线后安全

- [ ] 登录后台 → **账号设置** 修改所有默认管理员密码  
- [ ] 定期执行 `powershell scripts/backup-db.ps1`  
- [ ] 不要把 `.env` 提交到 Git  

---

## 七、可选但建议完成

| 项 | 说明 |
|----|------|
| GitHub 仓库 | 推送代码并启用 Actions CI |
| 监控告警 | 接入 Sentry / 云监控（代码未内置，需自行选购） |
| 邮件通知 | 若仍需运营邮件（非登录），配置 `SMTP_*` 并将 `MOCK_SMTP=false` |
| Outlook 邮箱 | 当前邮箱登录走 Google；若需微软账号登录，需另开 Microsoft OAuth（可后续加） |
| 内容运营 | 后台填写 Banner、活动、FAQ、战役任务等 |
| WalletConnect 域名白名单 | WC Cloud 中填写生产域名 |

---

## 八、常见问题

**Q: 点击邮箱登录提示未配置？**  
A: 填好 `GOOGLE_CLIENT_ID/SECRET` 并重启 API；或本地保持 `OAUTH_DEV_MOCK=true` 用模拟登录。

**Q: 授权后回到站点但未登录？**  
A: 检查 `WEB_PUBLIC_URL` 是否与浏览器地址一致；Redis 是否运行（OAuth ticket 存 Redis）。

**Q: API 启动报 JWT_SECRET？**  
A: 密钥至少 16 位，运行 `pnpm setup:env` 或参考 `.env.example`。

**Q: 生产 `pnpm qa:launch` 失败？**  
A: 按终端提示逐项修改 `.env` 中的弱密钥与 OAuth 配置。

---

## 九、快速命令索引

```powershell
pnpm setup:env      # 从 .env.example 合并生成 .env
pnpm db:up          # Docker 启动 Postgres + Redis
pnpm db:migrate     # 数据库迁移
pnpm db:seed        # 种子数据
pnpm dev            # 前台 + API
pnpm dev:admin      # 后台
pnpm oauth:check    # OAuth 配置检查
pnpm qa:launch      # 上线前检查
pnpm test:api       # API 单元测试
```

---

*最后更新：与仓库 OAuth 一键登录实现同步。*
