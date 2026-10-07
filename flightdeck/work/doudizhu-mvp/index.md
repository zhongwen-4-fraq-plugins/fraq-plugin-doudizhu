# 斗地主人机对局 MVP

状态：核心人机对局、群房间、中文指令和图片牌面已实现；手牌已改为私聊发送、明牌改为群内公开。`0.1.1` 已发布到 npm 并生成 Release，目标工作区已升级到 `0.1.1` 且能正常加载插件；剩下的是接上真实协议端验证群聊行为。

## Progress

- Outbound hand, revealed-card, and played-card images are now sorted from high to low in `CardImageRenderer`; game state remains ascending for rule evaluation. Added a regression test for the display sort.

- 已实现 54 张牌模型、洗牌发牌、基础牌型判断、机器人出牌和牌局状态机。
- 每个群独立维护房间池，默认最多 2 个房间；每个房间固定 1 名真人和 2 名人机。
- 已注册 `开始斗地主`、`明牌`、`叫地主`、`抢地主`、`不叫`、`加倍`、`超级加倍`、`不加倍`、`出牌`、`要不起`。
- 手牌和出牌事件通过 `/image` 目录牌图横向叠放，输出 `base64://` 图片并缓存。
- 操作超时会结束牌局、释放房间并向群发送通知；连续三轮无人叫地主后随机选地主。
- 已补充项目 README，记录安装方式、`fraq.yml` 配置、群聊指令、牌型边界、图片牌面、本地开发命令和当前限制。
- `.github` 的 Issue 模板、发布脚本和 GitHub Actions 工作流已完成斗地主项目化适配。
- 手牌（发牌和地主拿底牌后的手牌）改为通过 `ctx.client.send_private_message` 私聊发送，群内只保留出牌结果和提示文本；私聊失败时在群里提示先加好友并写 `ctx.logger.error`。
- `明牌` 改为在群内公开自己的手牌，消息带玩家名和手牌张数；开局提示同步改成「手牌已通过私聊发送」。
- 新增 `test/plugin.test.ts`：用 `@fraqjs/plugin-mock` 驱动 `注册` → `开始斗地主` → `明牌`，断言手牌只走私聊、群里不出现手牌图片、明牌图片只走群聊。
- 已确认发布失败点在第 10 步「发布到 npm」，后续两个 Release job 被跳过；`npm view` 长期只有 `0.1.0`。
- 根因是 `package.json` 的 `repository.url` 仍指向上游 `fraqjs/fraq-plugin-doudizhu`，与运行工作流的本仓库不一致，可信发布的 provenance 校验因此失败；npm 上的 Trusted Publisher 本身早就配好了。
- 已把 `repository.url` 改成本仓库（commit 67500b6），把 `v0.1.1` 标签重指到该提交并强推；run 35299004203 的发布、检查历史、创建 Release 三个 job 全部成功。
- npm 现在有 `0.1.0` 与 `0.1.1`，`latest` 指向 `0.1.1`，`0.1.1` 带正确的 `repository` 和 `slsa.dev/provenance/v1` 证明；GitHub Release `v0.1.1` 已生成，更新日志只取了改动 `src/` 的 commit。
- 目标工作区已升级：`package.json` 与 `versions.yml` 的斗地主插件改为 `0.1.1`，`pnpm install` 与 `npm install --package-lock-only --legacy-peer-deps` 均已刷新，`node_modules` 解析到 `0.1.1`。
- `fraq start --no-install` 冒烟测试通过：日志出现 `Applying plugin doudizhu`，Hono 正常监听 `127.0.0.1:4649`（端口冲突已消失），只有 milky 的 `127.0.0.1:8787` WebSocket 连不上（协议端没在跑）。
- 冒烟测试进程已全部关闭，4649 端口测试结束后恢复空闲。

## Next

- 启动真实协议端（milky `127.0.0.1:8787`）后验证：中文路由、群聊指令、出牌图片、以及手牌只走私聊。
- 在真实环境验证私聊：机器人需要和玩家是好友，非好友时确认群内兜底提示是否清楚。
- 根据实际牌局反馈完善飞机带翅膀、机器人策略和真人 PK 扩展接口。
- 下一个版本发布前，先核对 `package.json` 的 `repository` / `homepage` 是否仍指向本仓库。

## Open questions

- 真人 PK 的入座、观战和房间匹配指令尚未定义。

## Read now

- `flightdeck/knowledge/fraq/plugin.md`
- `flightdeck/knowledge/fraq/plugin-message-targets.md`
- `flightdeck/knowledge/doudizhu/image-layout.md`

## Read if

- npm 发布提示版本已存在或需要重跑 Release 工作流时，读取 `flightdeck/knowledge/fraq/npm-release-retry.md`。
- 从标签工作流用 OIDC 可信发布、或发布莫名失败时，读取 `flightdeck/knowledge/fraq/npm-trusted-publish.md`。
- git push 到 github.com 超时或被重置时，读取 `flightdeck/knowledge/fraq/github-push-blocked.md`。
- 需要无 gh 查看 Actions 失败步骤时，读取 `flightdeck/knowledge/fraq/actions-status-check.md`。
- 本地链接插件安装后无法加载或指令无响应时，读取 `flightdeck/knowledge/fraq/local-plugin-install.md`。
- Fraq 加载插件后因监听端口被占用而退出时，读取 `flightdeck/knowledge/fraq/runtime-port-conflict.md`。
- 编写 plugin-mock 测试遇到空结果、stub client 报错或上下文已停止时，读取 `flightdeck/knowledge/fraq/plugin-mock-async.md`。
- 复制或调整 `.github` 工作流和 Issue 模板时，读取 `flightdeck/knowledge/fraq/github-workflows.md`。
- 从 PowerShell 改本仓库之外的文件时，读取 `flightdeck/knowledge/tooling/powershell-file-edit.md`。
- 提交或打标签前要确认签名状态时，读取 `flightdeck/knowledge/tooling/git-signing-keys.md`。
