## 接口参考

Shadmin 后端 API 采用 RESTful 设计，所有响应均使用统一的 `ApiResponse` 格式：

```json
{
  "code": 0,
  "msg": "OK",
  "data": {
    ...
  }
}
```

- `code = 0` 表示成功
- `code != 0` 表示业务错误
- HTTP 500 表示服务器内部错误

### 认证相关

| 方法   | 路径                     | 说明       |
|------|------------------------|----------|
| POST | `/api/v1/auth/login`   | 用户登录     |
| POST | `/api/v1/auth/refresh` | 刷新 Token |
| POST | `/api/v1/auth/logout`  | 用户登出     |

**登录请求体：**

```json
{
  "username": "admin",
  "password": "shadmin"
}
```

**登录响应：**

```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 用户管理

| 方法     | 路径                               | 说明   | 权限要求                 |
|--------|----------------------------------|------|----------------------|
| GET    | `/api/v1/system/user`            | 用户列表 | `system:user:list`   |
| POST   | `/api/v1/system/user`            | 创建用户 | `system:user:create` |
| GET    | `/api/v1/system/user/{id}`       | 用户详情 | -                    |
| PUT    | `/api/v1/system/user/{id}`       | 更新用户 | `system:user:update` |
| DELETE | `/api/v1/system/user/{id}`       | 删除用户 | `system:user:delete` |
| GET    | `/api/v1/system/user/{id}/roles` | 用户角色 | -                    |

### 角色管理

| 方法     | 路径                                     | 说明   | 权限要求                 |
|--------|----------------------------------------|------|----------------------|
| GET    | `/api/v1/system/role`                  | 角色列表 | -                    |
| POST   | `/api/v1/system/role`                  | 创建角色 | `system:role:create` |
| GET    | `/api/v1/system/role/{id}`             | 角色详情 | -                    |
| PUT    | `/api/v1/system/role/{id}`             | 更新角色 | `system:role:update` |
| DELETE | `/api/v1/system/role/{id}`             | 删除角色 | `system:role:delete` |
| GET    | `/api/v1/system/role/{id}/menus`       | 角色菜单 | -                    |
| GET    | `/api/v1/system/role/{id}/permissions` | 角色权限 | -                    |

### 菜单管理

| 方法     | 路径                         | 说明   | 权限要求                 |
|--------|----------------------------|------|----------------------|
| GET    | `/api/v1/system/menu`      | 菜单列表 | -                    |
| GET    | `/api/v1/system/menu/tree` | 菜单树  | -                    |
| POST   | `/api/v1/system/menu`      | 创建菜单 | `system:menu:create` |
| PUT    | `/api/v1/system/menu/{id}` | 更新菜单 | `system:menu:update` |
| DELETE | `/api/v1/system/menu/{id}` | 删除菜单 | `system:menu:delete` |

### 部门管理

| 方法     | 路径                         | 说明   | 权限要求                 |
|--------|----------------------------|------|----------------------|
| GET    | `/api/v1/system/dept`      | 部门列表 | -                    |
| GET    | `/api/v1/system/dept/tree` | 部门树  | -                    |
| POST   | `/api/v1/system/dept`      | 创建部门 | `system:dept:create` |
| PUT    | `/api/v1/system/dept/{id}` | 更新部门 | `system:dept:update` |
| DELETE | `/api/v1/system/dept/{id}` | 删除部门 | `system:dept:delete` |

### 字典管理

| 方法   | 路径                                            | 说明     | 权限要求                 |
|------|-----------------------------------------------|--------|----------------------|
| GET  | `/api/v1/system/dict/types`                   | 字典类型列表 | -                    |
| POST | `/api/v1/system/dict/types`                   | 创建字典类型 | `system:dict:create` |
| GET  | `/api/v1/system/dict/types/code/{code}/items` | 字典项    | -                    |

### 资源/权限

| 方法  | 路径                           | 说明              |
|-----|------------------------------|-----------------|
| GET | `/api/v1/resources`          | 获取当前用户的菜单、权限、角色 |
| GET | `/api/v1/system/permissions` | 所有权限列表          |

### 登录日志

| 方法     | 路径                          | 说明   | 权限要求                      |
|--------|-----------------------------|------|---------------------------|
| GET    | `/api/v1/system/login-logs` | 日志列表 | -                         |
| DELETE | `/api/v1/system/login-logs` | 清空日志 | `system:login-log:delete` |