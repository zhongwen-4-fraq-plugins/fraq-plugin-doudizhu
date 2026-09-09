# 斗地主人机对局 MVP

状态：核心人机对局、群房间、中文指令和图片牌面已实现，等待接入真实 Fraq 运行环境验证。

## Progress

- 已实现 54 张牌模型、洗牌发牌、基础牌型判断、机器人出牌和牌局状态机。
- 每个群独立维护房间池，默认最多 2 个房间；每个房间固定 1 名真人和 2 名人机。
- 已注册 `开始斗地主`、`明牌`、`叫地主`、`抢地主`、`不叫`、`加倍`、`超级加倍`、`不加倍`、`出牌`、`要不起`。
- 手牌和出牌事件通过 `/image` 目录牌图横向叠放，输出 `base64://` 图片并缓存。
- 操作超时会结束牌局、释放房间并向群发送通知；连续三轮无人叫地主后随机选地主。
- `.github` 的 Issue 模板、发布脚本和 GitHub Actions 工作流已完成斗地主项目化适配，包含项目名称、仓库链接、npm 包名、检查命令和发布 User-Agent。
- 已创建并推送 `v0.1.0`，并将本地包链接安装到 `D:\bot\fraq-plugins\my-fraq-app`。
- 已在 `D:\bot\fraq-plugins\my-fraq-app` 复核 `pnpm add D:\bot\fraq-plugin-doudizhu`，依赖保持本地 junction，`dist/index.mjs` 入口存在。
- 目标 `fraq.yml` 尚未配置 `doudizhu` 插件；目标工作区当前使用 `@fraqjs/fraq 0.17.0`，低于本插件要求的 `^1.1.0`，真实启动前需先处理兼容性。
- 本地按发布工作流复现，`pnpm install --frozen-lockfile`、`pnpm test`、`pnpm build`、`pnpm check` 均通过；npm 注册表已存在 `fraq-plugin-doudizhu@0.1.0`，同版本发布会失败。

## Next

- 用 Fraq 工作区插件连接真实协议端，验证中文路由、图片发送和群聊权限。
- 在真实 GitHub 仓库中验证 PR 审核和 npm 发布工作流。
- 先取得 Actions 失败步骤的日志；若失败点是 npm 版本冲突，将版本递增并创建新标签后再发布；随后在 `my-fraq-app` 中升级或确认兼容的 Fraq CLI/Fraq 核心，配置 `doudizhu: {}` 后验证群聊指令和图片发送。
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
- 修改牌面拼接尺寸、发送格式或图片缓存时，读取 `flightdeck/knowledge/doudizhu/image-layout.md`。
- 复制或调整 `.github` 工作流和 Issue 模板时，读取 `flightdeck/knowledge/fraq/github-workflows.md`。
