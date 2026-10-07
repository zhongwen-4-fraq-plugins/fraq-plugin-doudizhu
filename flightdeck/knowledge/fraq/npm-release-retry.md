# ⚠ npm 发布版本不可覆盖

SUMMARY: npm 已发布的版本号不可重复发布；只有从未发布成功的版本才能重推标签，重推后必须用 `git ls-remote` 复核远程标签。
READ WHEN: when npm publish reports that a version is already published or a release workflow needs to be rerun

---

- `npm view fraq-plugin-doudizhu version` 可确认注册表中的最新版本。
- `npm publish --dry-run` 仍会校验版本唯一性，发现已发布版本时会返回 `You cannot publish over the previously published versions`。
- 复用已发布成功的标签会失败，应把 `package.json` 版本递增到下一个有效的 `0.x` 版本再创建标签；本项目 `0.1.9` 的下一版本是 `0.2.0`。
- 从未发布成功的版本可以重推：`v0.1.1` 两次都失败在第 10 步，所以覆盖该标签是安全的。
- 重打标签后要立刻强推并复核：`git push origin refs/tags/<tag> --force`，再用 `git ls-remote --tags origin` 确认远程标签已指向新提交。
- 本地重打的标签会被外部 `git fetch` 还原：本轮有一次 IDE 触发的 fetch（`.git/FETCH_HEAD` 与 `ORIG_HEAD` 同时更新），把本地 `v0.1.1` 退回成远程旧对象，推送时报 `Everything up-to-date`；是否真的更新过只看 `git ls-remote`。
- 递增版本号不等于发布成功：必须先在 npm 确认新版本已出现，再把目标工作区的锁定版本改成新版本。
- 发布凭据与仓库一致性问题见 `npm-trusted-publish.md`。