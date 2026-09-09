# ⚠️ npm 发布版本不可覆盖

SUMMARY: npm 已发布的版本号不可重复发布；发布工作流失败后重跑同一标签前，必须先确认版本是否已存在，并为下一次发布递增版本号。
READ WHEN: when npm publish reports that a version is already published or a release workflow needs to be rerun

---

- `npm view fraq-plugin-doudizhu version` 可确认注册表中的最新版本；本项目的 `0.1.0` 已存在。
- `npm publish --dry-run` 仍会校验版本唯一性，发现已发布版本时会返回 `You cannot publish over the previously published versions`。
- 重试发布不能复用 `v0.1.0`；应将 `package.json` 版本递增到下一个有效的 `0.x` 版本，再创建对应的 `v<version>` 标签。
