## 系统架构

Shadmin 采用前后端分离的模块化架构，后端通过 SPI 机制实现插件化扩展。

### 整体结构

```
┌────────────────────────────────────────────────────────┐
│                    前端 (React 19 + Vite)                    │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐     │
│  │ TanStack │  │ shadcn/ui │  │  Zustand  │     │
│  │  Router   │  │  + Tailwind│  │   Store   │     │
│  └───────────┘  └───────────┘  └───────────┘     │
├────────────────────────────────────────────────────────┤
│                      HTTP /api/v1/*                            │
├────────────────────────────────────────────────────────┤
│                    后端 (Ktor 3 + Kotlin)                    │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐     │
│  │   Auth   │  │  System  │  │  Profile │     │
│  │  (SPI)   │  │  (SPI)   │  │  (SPI)   │     │
│  └───────────┘  └───────────┘  └───────────┘     │
│         ├────────────────────────────┬───────────┐     │
│         └────────────────────────────┘│ ServiceContainer ┐     │
│                                         └───────────┘     │
├────────────────────────────────────────────────────────┤
│                     数据库 (H2 / PostgreSQL / MySQL)              │
└────────────────────────────────────────────────────────┘
```

### 后端 SPI 机制

每个功能模块通过 `@AutoService(ModulePlugin::class)` 注解自动注册：

1. **启动时**：`ModuleLoader` 通过 `ServiceLoader` 发现所有实现了 `ModulePlugin` 的类
2. **注册时**：模块调用 `container.register()` 将仓库/服务注入容器
3. **路由挂载时**：模块通过 `registerRoutes()` 定义自己的 HTTP 路由
4. **数据初始化**：`DefaultDataInitializer` 在所有模块加载完成后运行

### 核心模块职责

| 模块                 | 职责                           |
|--------------------|------------------------------|
| `core`             | SPI 接口定义、数据库连接、JWT 工具、领域模型   |
| `modules/auth`     | JWT 登录/刷新/登出，Token 生成与验证     |
| `modules/system`   | 用户、角色(RBAC+继承)、菜单、部门、字典、登录日志 |
| `modules/profile`  | 用户个人资料、密码修改                  |
| `modules/resource` | 资源/菜单树构提供给前端导航               |

### 前端目录结构

```
app/frontend/src/
├── components/          # 通用 UI 组件 (shadcn/ui)
├── components/layout/   # 布局组件 (Sidebar, Header)
├── features/            # 按功能分组的页面和组件
│   ├── auth/            # 登录相关
│   ├── dashboard/       # 仪表盘
│   ├── system/          # 系统管理 (user, role, menu, dict)
│   └── errors/          # 错误页面
├── hooks/               # 通用 hooks (usePermission, useCrudMutation)
├── lib/                 # 工具函数
├── routes/              # TanStack Router 路由定义
├── services/            # API 调用封装
├── stores/              # Zustand 状态管理 (auth-store)
└── types/               # TypeScript 类型定义
```

### 认证流程

```
用户登录 → POST /api/v1/auth/login
         → 返回 accessToken + refreshToken
         → 前端存储 token
         → 后续请求携带 Authorization: Bearer 头
         → 后端 JWT verifier 验证 token
         → 从 token 中提取用户 ID 和权限
         → 组仲件级别权限检查 (requirePermission)
```

### RBAC + ABAC 设计

- **RBAC**: 角色绑定权限码 (permission codes)，角色支持继承（parent_id）
- **ABAC**: 数据范围 (data_scope) 控制用户可见数据：ALL / DEPT / DEPT_AND_CHILD / SELF
- **JWT Claims**: `permissions` (合并后的权限码列表) + `is_admin` (管理员绕过标志)