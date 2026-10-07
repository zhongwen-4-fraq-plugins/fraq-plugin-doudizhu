# 提交签名的 GPG 配置

SUMMARY: 全局 `~/.gitconfig` 已配好签名（密钥 `B251ED52…02FD`），且必须把 `gpg.program` 指向 `D:/GnuPG/bin/gpg.exe`，否则 git 会用自带的无密钥 gpg 并报 `No secret key`。
READ WHEN: before committing or tagging when the commit must show as Verified on GitHub

---

- 全局配置 `C:\Users\admin\.gitconfig` 现在包含：`user.name=zhongwen-4`、`user.email=2401128923@qq.com`、`user.signingkey=B251ED526A16EEC550FAF0401B479A6CB32702FD`、`commit.gpgsign=true`、`tag.gpgsign=true`、`gpg.program=D:/GnuPG/bin/gpg.exe`。
- 最容易误判的坑：Git for Windows 自带 `D:\Git\usr\bin\gpg.exe`，git 默认调用它而不是 `D:\GnuPG\bin\gpg.exe`，它的密钥环里没有这些密钥，于是报 `gpg: skipped "<key>": No secret key`；同一时刻手工在 PowerShell 里跑 `gpg` 却完全正常。
- 定位方法：`GIT_TRACE=1 git commit` 会打印 git 真正执行的那条 `gpg --status-fd=2 -bsau <key>`，再对比 `Get-Command gpg` 的来源，就能看出二进制不一致。
- 可用的签名密钥：`B251ED526A16EEC550FAF0401B479A6CB32702FD`（uid「commit签名」，不需要口令，GitHub 侧 `verified=true`）；另有 `8037A95CA65738AAB2FA7971C16C9F3C73D4D8F2`（uid「zhongwen-4」）和创建当天就被吊销的 `7BD29CDF02582BBECE50F567A12DBCFE39D3D783`（uid「github验证」），不要用后者。
- 检查方式：`git log --format="%h %G? %s"`，`G` = 本地验证通过、`E` = 有签名但本地缺公钥、`N` = 没签名。
- 已推送的未签名提交无法补签，除非重写历史；本项目 `v0.1.0`、`v0.1.1` 标签都指向这些提交，重写会牵动 npm 发布与 GitHub Release。
- 从 2026-09-18 起新提交与新标签都会自动签名；`tag.gpgsign=true` 只影响新建标签。