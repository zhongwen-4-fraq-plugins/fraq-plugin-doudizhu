# GitHub 工作流迁移 checklist

SUMMARY: 从其他 Fraq 插件复制 `.github` 时保留基础结构，但必须核对源项目专属链接、包名和目标项目是否提供工作流调用的脚本。
READ WHEN: before copying or adapting `.github` workflows and issue templates from another Fraq plugin

---

- Issue 模板已改为使用 `fraq-plugin-doudizhu` 的 npm badge、项目名称和当前仓库 Issue 链接。
- `pr-review.yml` 会在源代码、测试、牌图或构建配置变更时依次执行 `pnpm test`、`pnpm build` 和 `pnpm check`。
- `publish.yml` 同样先构建再执行类型检查，因为本项目的 TypeScript 默认输入会读取构建生成的 `dist/index.d.mts`。
- 发布脚本的 GitHub API User-Agent 已改为 `fraq-plugin-doudizhu-release`。
- 发布前应确认 `package.json` 版本与 tag 一致；本次 `0.1.0` 使用 `v0.1.0`，已推送到远程。
- 目标 `my-fraq-app` 当前使用 `@fraqjs/cli 0.7.0`，本插件 peer dependency 要求 `@fraqjs/fraq ^1.1.0`；本地链接安装可以完成，但真实启动前仍需升级或验证 CLI/Fraq 兼容性。
