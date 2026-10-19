# Cockpit — fraq-plugin-doudizhu

Focus: 把斗地主插件接到真实协议端验证群聊行为，重点是手牌只走私聊、明牌只在群里公开。

## In flight

- `work/fraq-foundation/`：官方 Fraq CLI 与插件知识已完成，后续实现本插件时复用。
- `work/doudizhu-mvp/`：MVP、手牌私聊/明牌公开改动、发布与安装、GamePick 经典牌型解析都已完成；剩下接真实协议端验证。

## Next

- Card image delivery now presents every hand, revealed hand, and played set from high to low; `pnpm test` and `pnpm check` pass.
- Release target is `0.1.2` / `v0.1.2`; after tagging, refresh `my-fraq-app` with the plugin via `pnpm`.
- `v0.1.2` is pushed and `my-fraq-app` now resolves the local plugin link at `0.1.2`; the next product work remains real Milky endpoint verification.
- GamePick 经典规则已落实：顺子/连对边界、飞机带翅膀和四带二均有测试；机器人可生成组合牌并按合法牌型跟牌。

启动 milky（`127.0.0.1:8787`）后跑 `fraq start --no-install`，验证中文路由、群聊指令、出牌图片，以及手牌只走私聊、非好友时的群内兜底提示；随后按实际牌局反馈完善飞机带翅膀、机器人策略和真人 PK 扩展。

## Open questions

- 真人 PK 的入座、观战和房间匹配指令尚未定义。
