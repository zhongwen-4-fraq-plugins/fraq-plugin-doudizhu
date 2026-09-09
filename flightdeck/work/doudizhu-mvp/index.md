# 斗地主人机对局 MVP

状态：核心人机对局、群房间、中文指令和图片牌面已实现，等待接入真实 Fraq 运行环境验证。

## Progress

- 已实现 54 张牌模型、洗牌发牌、基础牌型判断、机器人出牌和牌局状态机。
- 每个群独立维护房间池，默认最多 2 个房间；每个房间固定 1 名真人和 2 名人机。
- 已注册 `开始斗地主`、`明牌`、`叫地主`、`抢地主`、`不叫`、`加倍`、`超级加倍`、`不加倍`、`出牌`、`要不起`。
- 手牌和出牌事件通过 `/image` 目录牌图横向叠放，输出 `base64://` 图片并缓存。
- 操作超时会结束牌局、释放房间并向群发送通知；连续三轮无人叫地主后随机选地主。
- 已补充项目 README，记录安装方式、`fraq.yml` 配置、群聊指令、牌型边界、图片牌面、本地开发命令和当前限制。
- `.github` 的 Issue 模板、发布脚本和 GitHub Actions 工作流已完成斗地主项目化适配，包含项目名称、仓库链接、npm 包名、检查命令和发布 User-Agent。
- 已创建并推送 `v0.1.0`；目标工作区最初使用过本地包链接，现已切换为 npm 发布包。
- 已在 `D:\bot\fraq-plugins\my-fraq-app` 复核 npm 包解析路径位于 `node_modules/.pnpm/`，没有绑定本地源码。
- 目标 `fraq.yml` 已配置 `doudizhu` 插件；目标工作区已将 `fraqVersion` 升级到 `1.1.0`，满足本插件的 peer 版本要求。
- 本地按发布工作流复现，`pnpm install --frozen-lockfile`、`pnpm test`、`pnpm build`、`pnpm check` 均通过；npm 注册表已存在 `fraq-plugin-doudizhu@0.1.0`，同版本发布会失败。
- 已将目标工作区改为使用 npm 包 `fraq-plugin-doudizhu@0.1.0`，并在 `fraq.yml` 启用 `doudizhu`、在 `versions.yml` 锁定 `0.1.0`；未配置 `workspacePlugins`。
- 已将当前机器的全局 `@fraqjs/cli` 从 `0.9.0` 升级到 `1.0.1`，并将 `my-fraq-app` 的项目级 CLI 同步到 `1.0.1`。
- 已将 `my-fraq-app` 的项目级 `@fraqjs/cli` 升级到 `1.0.1`，`fraq.yml` 的 `fraqVersion` 升级到 `1.1.0`；旧版 Windows 补丁脚本已改为兼容新 CLI。
- 已同步刷新目标目录的 `package-lock.json` 与 `pnpm-lock.yaml`，两份锁文件均记录项目级 CLI `1.0.1`。
- 用 `fraq start --no-install` 验证时已看到 `Applying plugin doudizhu`；随后因既有服务占用 `127.0.0.1:4649`（`EADDRINUSE`）退出，插件加载本身成功。

## Next

- 用 Fraq 工作区插件连接真实协议端，验证中文路由、图片发送和群聊权限。
- 在真实 GitHub 仓库中验证 PR 审核和 npm 发布工作流。
- 先取得 Actions 失败步骤的日志；若失败点是 npm 版本冲突，将版本递增并创建新标签后再发布；随后处理 `my-fraq-app` 的 Hono 端口冲突，再验证已启用的 `doudizhu` 群聊指令和图片发送。
- 根据实际牌局反馈完善飞机带翅膀、机器人策略和真人 PK 扩展接口。

## Open questions

- 真人 PK 的入座、观战和房间匹配指令尚未定义。
- Actions 运行 `34321214614` 的具体失败步骤尚未从 GitHub 日志确认。

## Read now

- `flightdeck/knowledge/fraq/plugin.md`
- `flightdeck/knowledge/doudizhu/image-layout.md`

## Read if

- 修改 Fraq 插件生命周期、路由或发布配置时，读取 `flightdeck/knowledge/fraq/plugin.md`。
- 本地链接插件安装后无法加载或指令无响应时，读取 `flightdeck/knowledge/fraq/local-plugin-install.md`。
- npm 发布提示版本已存在或需要重跑 Release 工作流时，读取 `flightdeck/knowledge/fraq/npm-release-retry.md`。
- Fraq 加载插件后因监听端口被占用而退出时，读取 `flightdeck/knowledge/fraq/runtime-port-conflict.md`。
- 修改牌面拼接尺寸、发送格式或图片缓存时，读取 `flightdeck/knowledge/doudizhu/image-layout.md`。
- 复制或调整 `.github` 工作流和 Issue 模板时，读取 `flightdeck/knowledge/fraq/github-workflows.md`。
