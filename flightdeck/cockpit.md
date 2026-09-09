# Cockpit — fraq-plugin-doudizhu

Focus: 实现基于 Fraq 的群聊斗地主人机 MVP，并保持牌局状态、图片牌面和房间生命周期可恢复。

## In flight

- `work/fraq-foundation/`：官方 Fraq CLI 与插件知识已完成，后续实现本插件时复用。
- `work/doudizhu-mvp/`：斗地主人机对局 MVP 已实现，等待真实 Fraq 工作区验证。

## Next

先处理 `my-fraq-app` 的旧版 Fraq CLI/Fraq 核心兼容性并在 `fraq.yml` 启用 `doudizhu`，再验证群聊指令和图片发送；随后在真实 GitHub 仓库验证已项目化的 `.github` 工作流，并根据真实对局反馈扩展牌型、AI 和真人 PK。

## Open questions

- 真人 PK 的入座、观战和房间匹配指令尚未定义。
