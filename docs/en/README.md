## Documentation Index

Welcome to the Shadmin documentation center. Documents default to **Chinese**; use the language toggle at the top of the
page to switch to English.

### Quick Links

| Document                                  | Description                                                 |
|-------------------------------------------|-------------------------------------------------------------|
| [Architecture](architecture.md)           | System architecture, module design, data flow               |
| [Development Guide](development-guide.md) | How to add frontend pages, backend modules, database tables |
| [Deployment](deployment.md)               | Monolithic run, separate development, Fat JAR release       |
| [API Reference](api-reference.md)         | Backend API endpoint overview                               |
| [Contributing](contributing.md)           | Code style, commit conventions, PR workflow                 |

### Tech Stack at a Glance

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + TanStack Router/Query
- **Backend**: Ktor 3.0 + Kotlin 2.1 + Exposed ORM
- **Database**: H2 (dev) / PostgreSQL / MySQL
- **Modularity**: Google AutoService SPI