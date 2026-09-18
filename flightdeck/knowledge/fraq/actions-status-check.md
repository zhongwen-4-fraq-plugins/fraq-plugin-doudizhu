# 无 gh 时查看 Actions 结果

SUMMARY: 本仓库是公开仓库，用匿名 REST API 可以读 runs、jobs 和 check-runs，但原始 job 日志需要鉴权（本机没有 gh 也没有 token，返回 403）。
READ WHEN: when a workflow fails and you need the failing step without gh or a GitHub token

---

- 失败步骤：`GET /repos/zhongwen-4-fraq-plugins/fraq-plugin-doudizhu/actions/runs/<run_id>/jobs` 匿名可读，返回每个 job 的 steps 及 conclusion，足够定位是哪一步失败。
- 失败原因文本：`GET /repos/.../check-runs/<check_run_id>/annotations` 通常只给出 `Process completed with exit code 1` 和日志行号，拿不到真正的错误输出。
- 原始日志：`GET /repos/.../actions/jobs/<job_id>/logs` 匿名返回 403，需要 `gh` 或带 `actions:read` 的 token 才能读。
- PowerShell 5.1 调用前先设置 `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`，并带上 `User-Agent` 头，否则请求会失败。
