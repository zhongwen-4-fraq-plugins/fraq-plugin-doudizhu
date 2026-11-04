# Cockpit — fraq-plugin-doudizhu

Focus: 把斗地主插件接到真实协议端验证群聊行为，重点是手牌只走私聊、明牌只在群里公开。

## In flight

- `work/fraq-foundation/`：官方 Fraq CLI 与插件知识已完成，后续实现本插件时复用。
- `work/doudizhu-mvp/`：MVP、手牌私聊/明牌公开、GamePick 经典牌型解析、注册持久化和退出游戏命令已完成；剩下接真实协议端验证。

## Next

- Release `0.1.3` includes `退出游戏`; local tests, type check, and build pass. After push, verify the publish workflow and refresh the `my-fraq-app` pnpm link.
- 启动 milky（`127.0.0.1:8787`）后跑 `fraq start --no-install`，验证中文路由、群聊指令（包括 `退出游戏`）、出牌图片，以及手牌只走私聊、非好友时的群内兜底提示。
- 按真实牌局反馈完善飞机带翅膀、机器人策略和真人 PK 扩展。

## Open questions

- 真人 PK 的入座、观战和房间匹配指令尚未定义。
