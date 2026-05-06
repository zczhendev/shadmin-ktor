## 贡献指南

感谢你对 Shadmin 的兴趣！以下是参与贡献的规范流程。

---

### 代码规范

**Kotlin 后端**

- 使用 4 空格缩进
- 类/函数使用有意义的英文命名
- Repository 方法命名：`create`, `findById`, `findAll`, `update`, `delete`
- 事务块使用 `transaction { }`
- 避免在 Repository 中处理 HTTP 响应逻辑

**TypeScript 前端**

- 使用单引号
- 组件使用函数声明（非箭头函数）
- API 封装在 `services/` 下，命名规范：`getXxx`, `createXxx`, `updateXxx`, `deleteXxx`
- Hooks 命名：`useXxx`, `useXxxMutation`
- 类型定义在 `types/` 下

### 提交规范

使用约定式提交 (Conventional Commits)：

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

类型：

| 类型         | 说明             |
|------------|----------------|
| `feat`     | 新功能            |
| `fix`      | 修复             |
| `docs`     | 文档             |
| `style`    | 格式（不影响代码运行的变动） |
| `refactor` | 重构             |
| `perf`     | 性能优化           |
| `test`     | 测试             |
| `chore`    | 构建过程或辅助工具的变动   |

示例：

```bash
git commit -m "feat(system): add department management page"
git commit -m "fix(auth): resolve token refresh race condition"
git commit -m "docs: update deployment guide with Docker instructions"
```

### PR 流程

1. Fork 仓库
2. 从 `main` 分支创建功能分支：`feature/your-feature-name`
3. 开发并提交代码
4. 确保 `./gradlew build` 和 `cd app/frontend && pnpm build` 通过
5. 提交 PR 到 `main` 分支
6. 描述 PR 的改动内容和测试方式

### 模块开发约定

新增后端模块时，请遵循以下约定：

- 模块名使用小写，如 `modules/audit`
- Module 类名使用大驼峰 + `Module` 后缀，如 `AuditModule`
- Repository 放在模块内，不暴露在 core 中
- 路由前缀统一为 `/api/v1/{module}`