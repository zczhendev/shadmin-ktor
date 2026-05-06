## System Architecture

Shadmin uses a decoupled frontend-backend architecture with a plugin-based backend powered by SPI.

### Overall Structure

```
┌────────────────────────────────────────────────────────┐
│                    Frontend (React 19 + Vite)                   │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐     │
│  │ TanStack │  │ shadcn/ui │  │  Zustand  │     │
│  │  Router   │  │  + Tailwind│  │   Store   │     │
│  └───────────┘  └───────────┘  └───────────┘     │
├────────────────────────────────────────────────────────┤
│                      HTTP /api/v1/*                            │
├────────────────────────────────────────────────────────┤
│                   Backend (Ktor 3 + Kotlin)                    │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐     │
│  │   Auth   │  │  System  │  │  Profile │     │
│  │  (SPI)   │  │  (SPI)   │  │  (SPI)   │     │
│  └───────────┘  └───────────┘  └───────────┘     │
│         ├────────────────────────────┬───────────┐     │
│         └────────────────────────────┘│ ServiceContainer ┐     │
│                                         └───────────┘     │
├────────────────────────────────────────────────────────┤
│                   Database (H2 / PostgreSQL / MySQL)             │
└────────────────────────────────────────────────────────┘
```

### Backend SPI Mechanism

Each functional module self-registers via `@AutoService(ModulePlugin::class)`:

1. **At startup**: `ModuleLoader` discovers all `ModulePlugin` implementations via `ServiceLoader`
2. **Registration**: Modules call `container.register()` to inject repositories/services
3. **Route mounting**: Modules define HTTP routes via `registerRoutes()`
4. **Data initialization**: `DefaultDataInitializer` runs after all modules are loaded

### Core Module Responsibilities

| Module             | Responsibility                                                         |
|--------------------|------------------------------------------------------------------------|
| `core`             | SPI interfaces, database connection, JWT utilities, domain models      |
| `modules/auth`     | JWT login/refresh/logout, token generation and validation              |
| `modules/system`   | Users, roles (RBAC+inheritance), menus, departments, dicts, login logs |
| `modules/profile`  | User profile and password management                                   |
| `modules/resource` | Resource/menu tree for frontend navigation                             |

### Frontend Directory Structure

```
app/frontend/src/
├── components/          # Shared UI components (shadcn/ui)
├── components/layout/   # Layout components (Sidebar, Header)
├── features/            # Feature-grouped pages and components
│   ├── auth/            # Login-related
│   ├── dashboard/       # Dashboard
│   ├── system/          # System management (user, role, menu, dict)
│   └── errors/          # Error pages
├── hooks/               # Shared hooks (usePermission, useCrudMutation)
├── lib/                 # Utility functions
├── routes/              # TanStack Router route definitions
├── services/            # API client wrappers
├── stores/              # Zustand state (auth-store)
└── types/               # TypeScript type definitions
```

### Authentication Flow

```
User Login → POST /api/v1/auth/login
         → Returns accessToken + refreshToken
         → Frontend stores tokens
         → Subsequent requests carry Authorization: Bearer header
         → Backend JWT verifier validates token
         → Extracts user ID and permissions from token
         → Route-level permission check (requirePermission)
```

### RBAC + ABAC Design

- **RBAC**: Roles bind permission codes; roles support inheritance (parent_id)
- **ABAC**: Data scope (data_scope) controls user-visible data: ALL / DEPT / DEPT_AND_CHILD / SELF
- **JWT Claims**: `permissions` (merged permission code list) + `is_admin` (admin bypass flag)