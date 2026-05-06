## 在此基础上开发新功能

Shadmin 的模块化设计让新功能开发变得快速而清晰。无论是新增一个管理页面、新的 API 模块，还是新的数据库表，都有标准流程可循。

---

### 添加前端页面

以在系统管理下新增一个"部门管理"页面为例：

**1. 创建路由**

```tsx
// app/frontend/src/routes/_authenticated/system/dept.tsx
import {createFileRoute} from '@tanstack/react-router'
import {DepartmentManagement} from '@/features/system/dept'

export const Route = createFileRoute('/_authenticated/system/dept')({
    component: DepartmentManagement,
})
```

TanStack Router 会自动生成路由配置。运行 `pnpm dev` 时自动更新 `routeTree.gen.ts`。

**2. 创建功能模块**

```
app/frontend/src/features/system/dept/
├── index.tsx              # 入口组件
├── components/
│   ├── dept-table.tsx       # 列表表格
│   ├── dept-dialogs.tsx     # 弹窗组件
│   └── dept-form.tsx        # 表单
└── hooks/
    ├── use-depts.ts         # 数据获取 hook
    └── use-dept-mutations.ts # 增删改 hook
```

**3. 添加菜单项**

后端 `DefaultDataInitializer.kt` 会初始化默认菜单，也可通过"菜单管理"页面动态添加。

**4. 添加权限码**

在后端 `DefaultDataInitializer.kt` 中添加新的权限码（如 `system:dept:list`），绑定到 admin 角色。

前端在 `@/constants/permissions.ts` 中定义对应的常量。

---

### 添加后端模块

以新增 `modules/audit` 日志审计模块为例：

**1. 创建模块目录**

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

**2. 编写 build.gradle.kts**

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

**3. 实现模块插件**

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
    override val priority = 50  // 加载顺序

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

**4. 注册模块**

在 `settings.gradle.kts` 中添加：

```kotlin
include("modules:audit")
```

在 `app/backend/build.gradle.kts` 中添加依赖：

```kotlin
dependencies {
    implementation(project(":modules:audit"))
}
```

完成！无需修改 `Application.kt`，启动时自动发现并加载。

---

### 添加数据库表

以新增 `audit_logs` 表为例：

**1. 在 core/database/Tables.kt 中定义**

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

**2. 在 DatabaseFactory 中注册**

```kotlin
SchemaUtils.createMissingTablesAndColumns(
    Users, Roles, ..., AuditLogs
)
```

**3. 创建 Repository**

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

### 前端开发规范

- **目录结构**: 按功能分组放在 `features/` 下
- **API 封装**: 所有 API 调用放在 `services/` 下，使用 `apiClient`
- **状态管理**: 全局状态用 Zustand，组件内部状态用 useState
- **数据获取**: 使用 TanStack Query，缓存时间 5 分钟
- **表单**: 使用 react-hook-form + zod 校验
- **组件**: 优先使用 shadcn/ui，自定义组件放在 `components/`