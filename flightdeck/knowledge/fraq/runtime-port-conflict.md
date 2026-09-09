# ⚠️ Fraq 启动端口冲突

SUMMARY: Fraq 已加载插件但启动时报 `EADDRINUSE` 时，优先检查配置中的 Hono 监听地址和端口是否已有服务占用，不要误判为插件依赖或路由加载失败。
READ WHEN: when Fraq loads plugins successfully but exits with EADDRINUSE during startup

---

- `fraq start --no-install` 可以先观察插件 `Applying plugin doudizhu` 日志，确认插件已被安装并加载。
- `EADDRINUSE 127.0.0.1:4649` 表示 `fraqjs/hono` 配置端口被其他进程占用；应检查现有 Fraq 实例或调整 `fraq.yml` 的 `host`/`port`。
- 排查时不要随意终止不属于本轮启动的服务；确认端口归属后再决定复用或改端口。
