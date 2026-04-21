# GreenPlanEP2

小型毕设项目：`apps/web`（Vue 3 + Vite）+ `apps/api`（Spring Boot）+ `infra`（MySQL / Docker Compose）。

## 环境要求

- Node.js 20+（本仓库目前在 Node 22 上验证过）
- JDK 21
- Maven（或使用 IDE 自带 Maven）
- Docker（可选：用于启动 MySQL）

## 快速启动

### 1) 启动数据库（可选，推荐）

```bash
cd infra
docker compose up -d
```

默认 MySQL 连接信息（见 `infra/docker-compose.yml`）：

- Host: `localhost`
- Port: `3306`
- DB: `greenplanep2`
- User: `root`

### 2) 启动后端 API

```bash
cd apps/api
mvn spring-boot:run
```

- 默认端口：`8081`（见 `apps/api/src/main/resources/application.yml`）

### 3) 启动前端 Web

```bash
cd apps/web
npm ci
npm run dev
```

- 默认端口：`5175`（见 `apps/web/vite.config.js`）

## 仓库说明（重要）

本仓库已补齐 `.gitignore`，不再提交 `node_modules/`、`dist/`、`target/`、各类缓存与构建产物。
如果你以前是“把依赖/产物也提交进 Git”的方式，拉取后请按上面的命令重新安装依赖/重新构建。
