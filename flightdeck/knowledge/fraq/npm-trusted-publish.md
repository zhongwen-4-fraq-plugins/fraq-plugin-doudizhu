# npm 可信发布（OIDC）与 repository 字段一致性

SUMMARY: 用 GitHub Actions 的 OIDC 可信发布时，`package.json` 的 `repository.url` 必须指向真正运行发布工作流的仓库，否则 npm publish 会直接失败。
READ WHEN: before publishing a package from a tag workflow that authenticates with OIDC / trusted publishing

---

- 本项目发布工作流只用 OIDC：`permissions: id-token: write` 加 `actions/setup-node` 的 `registry-url`，没有 `NODE_AUTH_TOKEN`；npm 侧的 Trusted Publisher 配好后不需要任何 secret。
- npm 上 `fraq-plugin-doudizhu` 的 Trusted Publisher 已配好：`zhongwen-4-fraq-plugins/fraq-plugin-doudizhu` + workflow `publish.yml`，权限 `npm publish`、`npm stage publish`。
- 真正让 `v0.1.0` 和 `v0.1.1` 两次发布都停在第 10 步的原因，是 `package.json` 的 `repository.url` 还指向上游 `fraqjs/fraq-plugin-doudizhu`，与工作流所在仓库不一致；可信发布会自动生成 provenance，仓库不一致会让 `npm publish` 失败。
- 修正为 `git+https://github.com/zhongwen-4-fraq-plugins/fraq-plugin-doudizhu.git`（commit 67500b6）并把 `v0.1.1` 标签重指到该提交后，run 35299004203 的发布、检查历史、创建 Release 三个 job 全部成功。
- 复核方式：`npm view <包名>@<版本> repository dist.attestations --json`，应看到本仓库地址和 `slsa.dev/provenance/v1`。
- 从模板复制来的仓库容易残留上游的 `repository` / `homepage` 链接，改仓库时一并检查。