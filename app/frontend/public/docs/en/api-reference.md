## API Reference

Shadmin backend APIs follow RESTful design. All responses use a unified `ApiResponse` format:

```json
{
  "code": 0,
  "msg": "OK",
  "data": { ... }
}
```

- `code = 0` means success
- `code != 0` means business error
- HTTP 500 means internal server error

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | User logout |

**Login Request Body:**

```json
{
  "username": "admin",
  "password": "shadmin"
}
```

**Login Response:**

```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### User Management

| Method | Path | Description | Permission Required |
|--------|------|-------------|---------------------|
| GET | `/api/v1/system/user` | User list | `system:user:list` |
| POST | `/api/v1/system/user` | Create user | `system:user:create` |
| GET | `/api/v1/system/user/{id}` | User detail | - |
| PUT | `/api/v1/system/user/{id}` | Update user | `system:user:update` |
| DELETE | `/api/v1/system/user/{id}` | Delete user | `system:user:delete` |
| GET | `/api/v1/system/user/{id}/roles` | User roles | - |

### Role Management

| Method | Path | Description | Permission Required |
|--------|------|-------------|---------------------|
| GET | `/api/v1/system/role` | Role list | - |
| POST | `/api/v1/system/role` | Create role | `system:role:create` |
| GET | `/api/v1/system/role/{id}` | Role detail | - |
| PUT | `/api/v1/system/role/{id}` | Update role | `system:role:update` |
| DELETE | `/api/v1/system/role/{id}` | Delete role | `system:role:delete` |
| GET | `/api/v1/system/role/{id}/menus` | Role menus | - |
| GET | `/api/v1/system/role/{id}/permissions` | Role permissions | - |

### Menu Management

| Method | Path | Description | Permission Required |
|--------|------|-------------|---------------------|
| GET | `/api/v1/system/menu` | Menu list | - |
| GET | `/api/v1/system/menu/tree` | Menu tree | - |
| POST | `/api/v1/system/menu` | Create menu | `system:menu:create` |
| PUT | `/api/v1/system/menu/{id}` | Update menu | `system:menu:update` |
| DELETE | `/api/v1/system/menu/{id}` | Delete menu | `system:menu:delete` |

### Department Management

| Method | Path | Description | Permission Required |
|--------|------|-------------|---------------------|
| GET | `/api/v1/system/dept` | Department list | - |
| GET | `/api/v1/system/dept/tree` | Department tree | - |
| POST | `/api/v1/system/dept` | Create department | `system:dept:create` |
| PUT | `/api/v1/system/dept/{id}` | Update department | `system:dept:update` |
| DELETE | `/api/v1/system/dept/{id}` | Delete department | `system:dept:delete` |

### Dictionary Management

| Method | Path | Description | Permission Required |
|--------|------|-------------|---------------------|
| GET | `/api/v1/system/dict/types` | Dict type list | - |
| POST | `/api/v1/system/dict/types` | Create dict type | `system:dict:create` |
| GET | `/api/v1/system/dict/types/code/{code}/items` | Dict items | - |

### Resources / Permissions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/resources` | Get current user's menus, permissions, roles |
| GET | `/api/v1/system/permissions` | All permissions list |

### Login Logs

| Method | Path | Description | Permission Required |
|--------|------|-------------|---------------------|
| GET | `/api/v1/system/login-logs` | Log list | - |
| DELETE | `/api/v1/system/login-logs` | Clear logs | `system:login-log:delete` |