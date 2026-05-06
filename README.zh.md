# Shadmin

> 基于 **React 19 + Ktor 3** 的模块化全栈中后台管理脚手架。
> 专为通过 SPI 模块化的后端和现代 React 前端实现快速功能开发而设计。

**简体中文** | [English](README.md)

---

## 项目背景

本项目是对优秀全栈中后台系统 **[ahaodev/shadmin](https://github.com/ahaodev/shadmin.git)**（Go 后端 + React 前端）的**重新实现**。

- **前端**：复用了原项目的 UI 设计、布局模式与交互逻辑（React 19 + shadcn/ui + Tailwind CSS v4），并补充了国际化（i18n）支持与细节优化。
- **后端**：完全使用 **Ktor 3 + Kotlin 2.1** 从零重写，以模块化 SPI 架构替代了原项目的 Go 后端实现。

如果你需要原始实现，请访问 [ahaodev/shadmin](https://github.com/ahaodev/shadmin.git)。

---

## 项目愿景

Shadmin 是一个**可用于生产环境的中后台脚手架**，核心设计理念包括：

- **模块化后端**：功能模块通过 Google AutoService SPI 自动注册。新增功能无需修改启动器代码。
- **统一前端**：基于 React 19 的单页应用，使用 TanStack Router、TanStack Query、Tailwind CSS v4 和 shadcn/ui 组件库。
- **RBAC + ABAC**：开箱即用的基于角色和基于属性的细粒度访问控制。
- **单体或分离**：可作为单个 JAR 运行，也可前后端分离开发。

---

## 架构概览

```
shadmin/
├── app/                          # 单体聚合模块
│   ├── frontend/                 # React 19 + Vite + pnpm
│   └── backend/                  # Ktor 启动器 (SPI 自动发现)
│
├── core/                         # SPI 契约与共享基础设施
│   ├── spi/                      # ModulePlugin, RouteRegistrar
│   ├── container/                # DefaultServiceContainer, ModuleLoader
│   ├── domain/                   # 领域模型 + 请求 DTO
│   ├── database/                 # Exposed 数据表 + DatabaseFactory
│   ├── security/                 # JwtService, PasswordHasher
│   └── utils/                    # 扩展函数
│
├── modules/                      # SPI 自动发现的功能模块
│   ├── auth/                     # JWT 登录 / 刷新 / 登出
│   ├── system/                   # 用户 / 角色 / 菜单 / 字典 / 部门 / 登录日志
│   ├── profile/                  # 用户资料与密码
│   └── resource/                 # 侧边栏导航数据
│
├── gradle/libs.versions.toml     # 集中式依赖版本管理
└── settings.gradle.kts           # 9 个子模块
```

### 模块加载顺序（按优先级）

1. `system` (priority=20) — 注册仓库到容器
2. `auth` (priority=10) — 从容器解析仓库用于认证
3. `profile` (priority=30)
4. `resource` (priority=40)

---

## 快速开始

### 方式一：单体运行（一条命令）

```bash
./gradlew :app:run
# 前端自动构建，由后端作为静态文件托管
# 打开 http://localhost:3000
```

### 方式二：分离开发（热重载）

```bash
# 终端 1：启动后端
./gradlew :app:backend:run

# 终端 2：启动前端开发服务器
cd app/frontend && pnpm install && pnpm dev
# 打开 http://localhost:5173（Vite 将 /api 代理到 localhost:3000）
```

### 方式三：Fat JAR 发布

```bash
./gradlew :app:release
# 或直接：
./gradlew :app:backend:fatJar
java -jar app/backend/build/libs/*-all.jar
```

---

## Gradle 任务

| 任务 | 说明 |
|------|------|
| `./gradlew :app:run` | 启动单体应用 |
| `./gradlew :app:release` | 构建发布版 fat JAR |
| `./gradlew :app:backend:run` | 仅启动后端 |
| `./gradlew :app:backend:fatJar` | 构建后端 fat JAR |
| `./gradlew :app:frontend:build` | 构建前端 (pnpm) |
| `./gradlew :app:frontend:dev` | 启动前端开发服务器 |
| `./gradlew build` | 构建所有模块 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, TanStack Router/Query/Table |
| 后端 | Ktor 3.0, Kotlin 2.1 |
| ORM | Exposed 0.58.0 |
| 数据库 | H2 (开发) / PostgreSQL / MySQL |
| 模块化 | Google AutoService + Java ServiceLoader |
| 依赖注入 | 轻量级 SPI 服务容器 |
| 构建工具 | Gradle 8.11 (TOML catalogs) + pnpm |

---

## 默认登录

| 字段 | 值 |
|------|------|
| 用户名 | `admin` |
| 密码 | `shadmin` |

---

## 配置

编辑 `app/backend/src/main/resources/application.conf` 或使用环境变量：

| 配置项 | 环境变量 | 默认值 |
|--------|----------|--------|
| `app.database.type` | `DB_TYPE` | `h2` |
| `app.database.url` | `DB_URL` | `jdbc:h2:file:./data/shadmin` |
| `app.jwt.access-secret` | `ACCESS_TOKEN_SECRET` | `shadmin-access-secret-key-2024` |
| `app.admin.username` | `ADMIN_USERNAME` | `admin` |
| `app.admin.password` | `ADMIN_PASSWORD` | `shadmin` |

---

## 文档

详见 [`docs/`](docs/) 目录：

- [架构](docs/architecture.md) — 系统设计与模块内部结构
- [开发指南](docs/development-guide.md) — 如何新增功能
- [部署](docs/deployment.md) — 生产部署选项
- [API 参考](docs/api-reference.md) — 后端接口概览
- [贡献指南](docs/contributing.md) — 参与贡献

---

## 许可证

MIT
