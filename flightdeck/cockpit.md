# Cockpit — fraq-plugin-doudizhu

Focus: 实现基于 Fraq 的群聊斗地主人机 MVP，并保持牌局状态、图片牌面和房间生命周期可恢复。

## In flight

- `work/fraq-foundation/`：官方 Fraq CLI 与插件知识已完成，后续实现本插件时复用。
- `work/doudizhu-mvp/`：斗地主人机对局 MVP 和项目 README 已完成，等待真实 Fraq 工作区验证。

## Next

先取得 Actions 运行 `34321214614` 的失败步骤日志；本地质量检查已通过，且 npm 已存在 `0.1.0`，若为发布冲突则递增版本并创建新标签。全局和 `my-fraq-app` 项目级 Fraq CLI 均已升级到 `1.0.1`，核心版本为 `1.1.0`；插件已成功加载，下一步处理现有 Hono 端口 `4649` 冲突后验证群聊指令和图片发送。

## Open questions

- 真人 PK 的入座、观战和房间匹配指令尚未定义。
