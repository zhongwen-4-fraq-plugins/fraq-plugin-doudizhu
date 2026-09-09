# Fraq CLI 与插件基础

状态：已完成官方资料学习与知识沉淀。

## Progress

- 已核对 `fraq.dev` 的 CLI、激活、Fork、版本和插件开发文档。
- 已核对 `github.com/fraqjs/fraq` 主线提交 `6370efac57011f34f348446c6aadad145982dc9d` 的 CLI 配置、启动脚本、依赖检查、版本锁、工作区插件、Kernel 插件注册表和 Fraq Context 源码。
- 已区分官方当前 `1.1.0` 规范与本机旧版 CLI；旧版资料不写入当前规范。
- 已将可复用结论写入 `flightdeck/knowledge/fraq/cli.md` 与 `flightdeck/knowledge/fraq/plugin.md`。

## Next

将本主题作为实现本插件时的检查清单：先确定插件短名、配置对象、服务边界和测试策略，再用 `workspacePlugins` 接入宿主进行本地验证。

## Open questions

- 斗地主插件的具体玩法、指令、牌图资源和持久化需求尚未在本主题中定义，待功能需求明确后另建实现计划。

## Read now

- `flightdeck/knowledge/fraq/cli.md`
- `flightdeck/knowledge/fraq/plugin.md`

## Read if

- 需要改 `fraq.yml`、版本锁、Fork、激活规则或启动行为时，阅读 `flightdeck/knowledge/fraq/cli.md`。
- 需要新增插件代码、服务、测试、构建或发布配置时，阅读 `flightdeck/knowledge/fraq/plugin.md`。
