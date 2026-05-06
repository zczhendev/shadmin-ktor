## 部署指南

Shadmin 支持多种部署方式，从本地开发到生产环境均可适配。

---

### 开发环境

**单体运行（推荐用于快速验证）**

```bash
./gradlew :app:run
```

- 前端自动构建并嵌入为后端静态资源
- 访问 http://localhost:3000
- 热重载仅对后端 Kotlin 代码有效

**分离开发（推荐用于功能开发）**

```bash
# 终端 1：后端
./gradlew :app:backend:run

# 终端 2：前端
cd app/frontend && pnpm dev
# 访问 http://localhost:5173
```

- 前端 HMR（热模块替换）即时生效
- 后端修改后自动重新编译
- Vite 代理自动将 `/api` 转发到 localhost:3000

---

### 生产环境

**方式一：Fat JAR**

```bash
./gradlew :app:release
# 生成 app/backend/build/libs/*-all.jar

java -jar app/backend/build/libs/shadmin-2.1.0-all.jar
```

配置环境变量：

```bash
export DB_TYPE=postgresql
export DB_URL=jdbc:postgresql://localhost:5432/shadmin
export DB_USER=shadmin
export DB_PASSWORD=secret
export ACCESS_TOKEN_SECRET=your-production-secret
```

**方式二：Docker**

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY app/backend/build/libs/*-all.jar app.jar
EXPOSE 3000
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
docker build -t shadmin .
docker run -p 3000:3000 \
  -e DB_TYPE=postgresql \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/shadmin \
  shadmin
```

**方式三：前后端分离部署**

- 前端：构建为静态文件，部署到 Nginx / CDN
- 后端：运行 JAR 或 Docker 容器
- 前端 `config.ts` 中的 `getApiBaseURL()` 需要改为生产后端地址

---

### 数据库迁移

Shadmin 使用 Exposed 的 `createMissingTablesAndColumns` 自动创建表结构。生产环境建议使用以下策略：

1. **开发/测试**：自动创建（默认行为）
2. **生产**：使用 Flyway 或 Liquibase 管理迁移脚本

手动初始化数据库：

```bash
# 首次启动时会自动创建表并插入默认数据
# 如需重置，删除 H2 文件或清空 PostgreSQL 数据库后重启
```

---

### 配置优先级

配置来源按优先级从高到低：

1. 环境变量
2. `application.conf` 中的显式配置
3. 默认值

示例 `application.conf`：

```hocon
app {
  env = "production"
  database {
    type = ${?DB_TYPE}
    url = ${?DB_URL}
    user = ${?DB_USER}
    password = ${?DB_PASSWORD}
  }
  jwt {
    access-secret = ${?ACCESS_TOKEN_SECRET}
    refresh-secret = ${?REFRESH_TOKEN_SECRET}
    access-expiry = 900      # 15 minutes
    refresh-expiry = 604800  # 7 days
  }
  cors {
    allowed_hosts = ["https://your-domain.com"]
  }
}
```