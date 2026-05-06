# Shadmin

> A modular, full-stack admin dashboard scaffold built with **React 19 + Ktor 3**.
> Designed for rapid feature development via SPI-based backend modules and a modern React frontend.

[简体中文](README.zh.md) | **English**

---

## Background

This project is a **full-stack reimplementation** inspired by **[ahaodev/shadmin](https://github.com/ahaodev/shadmin.git)**, an excellent admin dashboard built with a **Go backend** and React frontend.

- **Frontend**: Reuses the original UI design, layout patterns, and user interactions (React 19 + shadcn/ui + Tailwind CSS v4), with added i18n support and refinements.
- **Backend**: Completely rewritten from scratch using **Ktor 3 + Kotlin 2.1**, replacing the original Go backend with a modular, SPI-based architecture.

If you are looking for the original implementation, see [ahaodev/shadmin](https://github.com/ahaodev/shadmin.git).

---

## Vision

Shadmin is a **production-ready admin scaffold** that prioritizes:

- **Modular Backend**: Functional modules self-register via Google AutoService SPI. Add a new feature without touching the launcher.
- **Unified Frontend**: A React 19 SPA with TanStack Router, TanStack Query, Tailwind CSS v4, and shadcn/ui components.
- **RBAC + ABAC**: Fine-grained role-based and attribute-based access control out of the box.
- **Monolithic or Split**: Run as a single JAR or develop frontend/backend separately.

---

## Architecture Overview

```
shadmin/
├── app/                          # Monolithic aggregator
│   ├── frontend/                 # React 19 + Vite + pnpm
│   └── backend/                  # Ktor launcher (SPI discovery)
│
├── core/                         # SPI contracts + shared infra
│   ├── spi/                      # ModulePlugin, RouteRegistrar
│   ├── container/                # DefaultServiceContainer, ModuleLoader
│   ├── domain/                   # Models + request DTOs
│   ├── database/                 # Exposed tables + DatabaseFactory
│   ├── security/                 # JwtService, PasswordHasher
│   └── utils/                    # Extensions
│
├── modules/                      # SPI-discovered functional modules
│   ├── auth/                     # JWT login / refresh / logout
│   ├── system/                   # User / Role / Menu / Dict / Dept / LoginLog
│   ├── profile/                  # User profile & password
│   └── resource/                 # Sidebar navigation data
│
├── gradle/libs.versions.toml     # Centralized dependency management
└── settings.gradle.kts           # 9 submodules
```

### Module Loading Order (by priority)

1. `system` (priority=20) — registers repositories
2. `auth` (priority=10) — resolves repositories for auth
3. `profile` (priority=30)
4. `resource` (priority=40)

---

## Quick Start

### Option 1: Monolithic (one command)

```bash
./gradlew :app:run
# Frontend is built automatically and served as static files by the backend
# Open http://localhost:3000
```

### Option 2: Separate development (hot reload)

```bash
# Terminal 1: Backend
./gradlew :app:backend:run

# Terminal 2: Frontend dev server
cd app/frontend && pnpm install && pnpm dev
# Open http://localhost:5173  (Vite proxies /api to localhost:3000)
```

### Option 3: Fat JAR release

```bash
./gradlew :app:release
# or directly:
./gradlew :app:backend:fatJar
java -jar app/backend/build/libs/*-all.jar
```

---

## Gradle Tasks

| Task | Description |
|------|-------------|
| `./gradlew :app:run` | Start monolithic application |
| `./gradlew :app:release` | Build release fat JAR |
| `./gradlew :app:backend:run` | Start backend only |
| `./gradlew :app:backend:fatJar` | Build backend fat JAR |
| `./gradlew :app:frontend:build` | Build frontend (pnpm) |
| `./gradlew :app:frontend:dev` | Start frontend dev server |
| `./gradlew build` | Build all modules |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, TanStack Router/Query/Table |
| Backend | Ktor 3.0, Kotlin 2.1 |
| ORM | Exposed 0.58.0 |
| Database | H2 (dev) / PostgreSQL / MySQL |
| Componentization | Google AutoService + Java ServiceLoader |
| DI | Lightweight SPI-based service container |
| Build | Gradle 8.11 (TOML catalogs) + pnpm |

---

## Default Login

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `shadmin` |

---

## Configuration

Edit `app/backend/src/main/resources/application.conf` or use environment variables:

| Config | Env Variable | Default |
|--------|-------------|---------|
| `app.database.type` | `DB_TYPE` | `h2` |
| `app.database.url` | `DB_URL` | `jdbc:h2:file:./data/shadmin` |
| `app.jwt.access-secret` | `ACCESS_TOKEN_SECRET` | `shadmin-access-secret-key-2024` |
| `app.admin.username` | `ADMIN_USERNAME` | `admin` |
| `app.admin.password` | `ADMIN_PASSWORD` | `shadmin` |

---

## Documentation

See the [`docs/`](docs/) directory for detailed documentation:

- [Architecture](docs/architecture.md) — System design and module internals
- [Development Guide](docs/development-guide.md) — How to add features
- [Deployment](docs/deployment.md) — Production deployment options
- [API Reference](docs/api-reference.md) — Backend API overview
- [Contributing](docs/contributing.md) — Contribution guidelines

---

## License

MIT
