# ⚠️ npm 发布版本不可覆盖

SUMMARY: npm 已发布的版本号不可重复发布；发布工作流失败后重跑同一标签前，必须先确认版本是否已存在，并为下一次发布递增版本号。
READ WHEN: when npm publish reports that a version is already published or a release workflow needs to be rerun

---

- `npm view fraq-plugin-doudizhu version` 可确认注册表中的最新版本；本项目的 `0.1.0` 已存在。
- `npm publish --dry-run` 仍会校验版本唯一性，发现已发布版本时会返回 `You cannot publish over the previously published versions`。
- 重试发布不能复用 `v0.1.0`；应将 `package.json` 版本递增到下一个有效的 `0.x` 版本，再创建对应的 `v<version>` 标签。
- 本仓库的发布工作流两次都停在第 10 步「发布到 npm」：`v0.1.0`（run 34321214614）和 `v0.1.1`（run 35292479529）的检出、安装、测试、构建、检查全部通过，只有 npm publish 失败，说明是发布凭据问题而不是代码问题。
- 本机 npm 没有登录凭据（没有 `~/.npmrc`，`npm whoami` 返回 `ENEEDAUTH`），不能直接本地补发。要发布必须先二选一：在 npm 配置 trusted publisher 或提供 `NPM_TOKEN`，或者先 `npm login` 再手工 `npm publish`。
- 递增版本号不等于发布成功：必须先在 npm 确认新版本已出现，再把目标工作区的锁定版本改成新版本。
