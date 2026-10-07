# ⚠ 推送 github.com 被阻断时的绕行

SUMMARY: 本机到 `github.com:443` 的连接会被超时或重置，而 `api.github.com`、`ssh.github.com:443` 正常，所以 git push 失败不是仓库或凭据问题。
READ WHEN: when a git push to github.com times out or is reset while other GitHub endpoints still work

---

- 症状：`git push` 报 `Recv failure: Connection was reset`，或 `Failed to connect to github.com port 443 after 21xxx ms`；同一时刻 `curl https://api.github.com` 返回 200。
- `Test-NetConnection github.com -Port 443` 可能返回成功（TCP 握手放行），但 TLS/HTTP 层仍被重置，所以只测 TCP 会把阻断误判成网络正常。
- 已核实可用的通道：`api.github.com:443` 正常（匿名可读公开仓库）、`ssh.github.com:443` 与 `github.com:22` 的 SSH 握手正常、`github.com:443` 不可用。
- 可用绕行：把本机 SSH 公钥授权到 GitHub 账号后走 `ssh.github.com:443` 推送，或启动本机代理让 git 走 HTTPS。
- 本机 `~/.ssh/id_ed25519` 存在但未授权（`ssh -T git@github.com` 返回 `Permission denied (publickey)`），SSH 通道当前不能用来推送。
- 本机没有可用代理：IE 设置里登记过 `127.0.0.1:7890`，但 `ProxyEnable=0` 且该端口没有监听。
- 阻断是间歇性的：本轮同一台机器上 github.com:443 先全部超时，约半小时后自行恢复（curl https://github.com 返回 200），随后一次推送就成功；所以先重试，再考虑绕行。ssh.github.com:443 在阻断期间也一度被解析到 198.18.0.152 这类保留地址。