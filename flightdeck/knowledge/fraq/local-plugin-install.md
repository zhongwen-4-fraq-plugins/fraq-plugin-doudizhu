# ⚠️ Fraq 本地插件安装兼容性

SUMMARY: `pnpm add` 只会安装依赖，不会自动启用配置；使用发布包时指定 npm 版本，启用前还要在 `fraq.yml` 注册短名并在旧版 CLI 中补齐 `versions.yml`。
READ WHEN: when a locally linked plugin installs but Fraq cannot load it or its commands do not respond

---

- `pnpm add <插件目录>` 会创建本地链接；如果不希望绑定源码，应改用 `pnpm add fraq-plugin-doudizhu@<version>`，并确认解析路径位于 `node_modules/.pnpm/`。
- 依赖安装不等于运行时启用；必须在 `fraq.yml` 的 `plugins` 下加入 `doudizhu`。旧版 CLI 还要求在 `versions.yml` 写入对应版本。
- 目标工作区同时存在 `package-lock.json` 和 `pnpm-lock.yaml` 时，升级项目 CLI 后要同步刷新两份锁文件，避免后续切换包管理器时仍解析旧版本。
- 本项目插件要求 `@fraqjs/fraq ^1.1.0`；旧版工作区即使能建立链接，也可能在启动时因 peer 版本或 CLI 生成入口不兼容而失败。
- 验证顺序：检查 `node_modules/fraq-plugin-doudizhu` 的链接目标和 `dist/index.mjs`，再配置插件短名，最后用匹配版本的 Fraq CLI 启动验证。
