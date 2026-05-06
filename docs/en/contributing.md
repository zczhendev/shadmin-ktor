## Contributing Guidelines

Thank you for your interest in Shadmin! Here is the standard workflow for contributing.

---

### Code Style

**Kotlin Backend**

- Use 4-space indentation
- Use meaningful English names for classes/functions
- Repository method naming: `create`, `findById`, `findAll`, `update`, `delete`
- Use `transaction { }` blocks
- Avoid handling HTTP response logic in Repositories

**TypeScript Frontend**

- Use single quotes
- Use function declarations (not arrow functions) for components
- API wrappers in `services/`, naming: `getXxx`, `createXxx`, `updateXxx`, `deleteXxx`
- Hook naming: `useXxx`, `useXxxMutation`
- Type definitions in `types/`

### Commit Conventions

Use Conventional Commits:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Types:

| Type       | Description                             |
|------------|-----------------------------------------|
| `feat`     | New feature                             |
| `fix`      | Bug fix                                 |
| `docs`     | Documentation                           |
| `style`    | Formatting (no code logic change)       |
| `refactor` | Refactoring                             |
| `perf`     | Performance optimization                |
| `test`     | Tests                                   |
| `chore`    | Build process or auxiliary tool changes |

Examples:

```bash
git commit -m "feat(system): add department management page"
git commit -m "fix(auth): resolve token refresh race condition"
git commit -m "docs: update deployment guide with Docker instructions"
```

### PR Workflow

1. Fork the repository
2. Create a feature branch from `main`: `feature/your-feature-name`
3. Develop and commit code
4. Ensure `./gradlew build` and `cd app/frontend && pnpm build` pass
5. Submit PR to `main` branch
6. Describe the changes and how to test them

### Module Development Conventions

When adding a new backend module, follow these conventions:

- Module name in lowercase, e.g. `modules/audit`
- Module class name in PascalCase + `Module` suffix, e.g. `AuditModule`
- Repository stays inside the module, not exposed in core
- Route prefix unified as `/api/v1/{module}`