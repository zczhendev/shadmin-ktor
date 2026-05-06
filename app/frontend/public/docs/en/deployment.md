## Deployment Guide

Shadmin supports multiple deployment options, from local development to production.

---

### Development Environment

**Monolithic Run (recommended for quick validation)**

```bash
./gradlew :app:run
```

- Frontend is auto-built and embedded as backend static assets
- Access http://localhost:3000
- Hot reload works for backend Kotlin code only

**Separate Development (recommended for feature development)**

```bash
# Terminal 1: Backend
./gradlew :app:backend:run

# Terminal 2: Frontend
cd app/frontend && pnpm dev
# Access http://localhost:5173
```

- Frontend HMR takes effect instantly
- Backend recompiles automatically on changes
- Vite proxy forwards `/api` to localhost:3000

---

### Production Environment

**Option 1: Fat JAR**

```bash
./gradlew :app:release
# Generates app/backend/build/libs/*-all.jar

java -jar app/backend/build/libs/shadmin-2.1.0-all.jar
```

Configure environment variables:

```bash
export DB_TYPE=postgresql
export DB_URL=jdbc:postgresql://localhost:5432/shadmin
export DB_USER=shadmin
export DB_PASSWORD=secret
export ACCESS_TOKEN_SECRET=your-production-secret
```

**Option 2: Docker**

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

**Option 3: Split Deployment**

- Frontend: Build static files, deploy to Nginx / CDN
- Backend: Run JAR or Docker container
- Frontend `config.ts` `getApiBaseURL()` should point to production backend

---

### Database Migration

Shadmin uses Exposed's `createMissingTablesAndColumns` to auto-create tables. For production, consider:

1. **Dev/Test**: Auto-create (default behavior)
2. **Production**: Use Flyway or Liquibase for migration scripts

Manual database initialization:

```bash
# Tables are auto-created and default data inserted on first startup
# To reset, delete H2 files or truncate PostgreSQL database and restart
```

---

### Configuration Priority

Configuration sources, from highest to lowest priority:

1. Environment variables
2. Explicit values in `application.conf`
3. Default values

Example `application.conf`:

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