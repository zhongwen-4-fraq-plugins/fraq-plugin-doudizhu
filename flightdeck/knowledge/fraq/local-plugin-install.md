# ⚠️ Fraq 本地插件安装兼容性

SUMMARY: 本地 `pnpm add <插件目录>` 只会安装或链接依赖，不会自动启用配置；启用前要在 `fraq.yml` 注册短名，并核对目标 Fraq 核心是否满足插件的 peer 版本。
READ WHEN: when a locally linked plugin installs but Fraq cannot load it or its commands do not respond

---

- `pnpm add` 对已存在的本地链接会显示 `Already up to date`，这表示依赖已安装，不代表插件已加入 `fraq.yml` 的 `plugins` 配置。
- 本项目插件要求 `@fraqjs/fraq ^1.1.0`；旧版工作区即使能建立链接，也可能在启动时因 peer 版本或 CLI 生成入口不兼容而失败。
- 验证顺序：检查 `node_modules/fraq-plugin-doudizhu` 的链接目标和 `dist/index.mjs`，再配置插件短名，最后用匹配版本的 Fraq CLI 启动验证。
