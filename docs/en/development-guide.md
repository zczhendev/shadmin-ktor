## Developing New Features

Shadmin's modular design makes adding new features fast and clear. Whether it's a new management page, a new API module,
or a new database table, there is a standard workflow to follow.

---

### Adding a Frontend Page

Example: Adding a "Department Management" page under System Management:

**1. Create the Route**

```tsx
// app/frontend/src/routes/_authenticated/system/dept.tsx
import {createFileRoute} from '@tanstack/react-router'
import {DepartmentManagement} from '@/features/system/dept'

export const Route = createFileRoute('/_authenticated/system/dept')({
    component: DepartmentManagement,
})
```

TanStack Router auto-generates route config. Run `pnpm dev` to auto-update `routeTree.gen.ts`.

**2. Create the Feature Module**

```
app/frontend/src/features/system/dept/
├── index.tsx              # Entry component
├── components/
│   ├── dept-table.tsx       # List table
│   ├── dept-dialogs.tsx     # Dialogs
│   └── dept-form.tsx        # Form
└── hooks/
    ├── use-depts.ts         # Data fetch hook
    └── use-dept-mutations.ts # CUD mutations hook
```

**3. Add Menu Item**

Backend `DefaultDataInitializer.kt` initializes default menus, or add dynamically via the "Menu Management" page.

**4. Add Permission Codes**

Add new permission codes in backend `DefaultDataInitializer.kt` (e.g. `system:dept:list`), bound to the admin role.

Define corresponding constants in frontend `@/constants/permissions.ts`.

---

### Adding a Backend Module

Example: Adding a `modules/audit` log audit module:

**1. Create Module Directory**

```
modules/audit/
├── build.gradle.kts
└── src/main/kotlin/com/shadmin/modules/audit/
    ├── AuditModule.kt
    ├── log/
    │   ├── AuditLog.kt
    │   ├── AuditLogRepository.kt
    │   └── AuditLogService.kt
    └── ...
```

**2. Write build.gradle.kts**

```kotlin
plugins {
    kotlin("jvm")
    kotlin("plugin.serialization")
    id("com.google.devtools.ksp") version "2.1.0-1.0.29"
}

dependencies {
    implementation(project(":core"))
    implementation(ktorLibs.bundles.server)
    implementation(libs.exposed.core)
    // ...
}
```

**3. Implement Module Plugin**

```kotlin
package com.shadmin.modules.audit

import com.google.auto.service.AutoService
import com.shadmin.core.container.ServiceContainer
import com.shadmin.core.spi.ModulePlugin
import com.shadmin.core.spi.RouteRegistrar
import io.ktor.server.routing.*

@AutoService(ModulePlugin::class)
class AuditModule : ModulePlugin, RouteRegistrar {
    override val name = "audit"
    override val priority = 50  // Load order

    override fun configure(container: ServiceContainer) {
        container.register(AuditLogRepository())
    }

    override fun registerRoutes(route: Route, container: ServiceContainer) {
        val repo = container.resolve(AuditLogRepository::class)
        route.route("/api/v1/audit") {
            get("/logs") {
                // ...
            }
        }
    }
}
```

**4. Register Module**

Add to `settings.gradle.kts`:

```kotlin
include("modules:audit")
```

Add dependency in `app/backend/build.gradle.kts`:

```kotlin
dependencies {
    implementation(project(":modules:audit"))
}
```

Done! No changes to `Application.kt` needed; discovered and loaded automatically at startup.

---

### Adding a Database Table

Example: Adding an `audit_logs` table:

**1. Define in core/database/Tables.kt**

```kotlin
object AuditLogs : UUIDTable("audit_logs") {
    val userId = reference("user_id", Users).nullable()
    val action = varchar("action", 100)
    val target = varchar("target", 200)
    val detail = text("detail").nullable()
    val ipAddress = varchar("ip_address", 50).nullable()
    val createdAt = datetime("created_at").defaultExpression(CurrentDateTime)
}
```

**2. Register in DatabaseFactory**

```kotlin
SchemaUtils.createMissingTablesAndColumns(
    Users, Roles, ..., AuditLogs
)
```

**3. Create Repository**

```kotlin
class AuditLogRepository {
    fun create(request: CreateAuditLogRequest): AuditLog = transaction {
        val id = UUID.randomUUID()
        AuditLogs.insert { row ->
            row[AuditLogs.id] = id
            row[action] = request.action
            row[target] = request.target
            // ...
        }
        findById(id.toString())!!
    }
    // ...
}
```

---

### Frontend Development Conventions

- **Directory Structure**: Group by feature under `features/`
- **API Wrappers**: All API calls in `services/`, use `apiClient`
- **State Management**: Global state with Zustand, component state with useState
- **Data Fetching**: Use TanStack Query, 5-minute stale time
- **Forms**: Use react-hook-form + zod validation
- **Components**: Prefer shadcn/ui; custom components in `components/`