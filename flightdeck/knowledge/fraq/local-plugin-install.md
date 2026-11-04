# ⚠️ Fraq 本地插件安装兼容性

SUMMARY: 外层 `pnpm add` 本地链接不保证 Fraq 生成应用更新；检查 `app/package.json` 和 `app/node_modules` 的实际版本，并同步 `versions.yml` 后重新生成、安装和重启。
READ WHEN: when a locally linked plugin installs but Fraq cannot load it or its commands do not respond

---

- `pnpm add <插件目录>` 会创建本地链接；如果不希望绑定源码，应改用 `pnpm add fraq-plugin-doudizhu@<version>`，并确认解析路径位于 `node_modules/.pnpm/`。
- 依赖安装不等于运行时启用；必须在 `fraq.yml` 的 `plugins` 下加入 `doudizhu`。旧版 CLI 还要求在 `versions.yml` 写入对应版本。
- 目标工作区同时存在 `package-lock.json` 和 `pnpm-lock.yaml` 时，升级项目 CLI 后要同步刷新两份锁文件，避免后续切换包管理器时仍解析旧版本。
- 本项目插件要求 `@fraqjs/fraq ^1.1.0`；旧版工作区即使能建立链接，也可能在启动时因 peer 版本或 CLI 生成入口不兼容而失败。
- 验证顺序：检查 `node_modules/fraq-plugin-doudizhu` 的链接目标和 `dist/index.mjs`，再配置插件短名，最后用匹配版本的 Fraq CLI 启动验证。
- 目标工作区使用 pnpm 本地安装后，`package.json` 会使用 `link:` 依赖并由 `pnpm-lock.yaml` 记录；此时 `npm install --package-lock-only` 会因不支持 `link:` 协议失败，不要把 npm lockfile 当成 pnpm 本地链接的安装依据。
- Fraq CLI 生成的运行项目位于 `app/`；外层 `node_modules/fraq-plugin-doudizhu` 的本地链接与 `app/node_modules/fraq-plugin-doudizhu` 是两份解析结果。`versions.yml` 的精确版本可能让 `app/package.json` 继续锁在旧版本。
- 排查“新增命令没反应”时，从 `app/` 用 `createRequire` 检查解析版本和入口是否含命令。同步 `versions.yml` 后运行 `fraq start` 让 CLI 更新生成应用，再重启正在运行的 Fraq 进程；已导入的 Node.js 插件不会热加载。
