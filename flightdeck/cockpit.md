# Cockpit — fraq-plugin-doudizhu

Focus: 把斗地主插件接到真实协议端验证群聊行为，重点是手牌只走私聊、明牌只在群里公开。

## In flight

- `work/fraq-foundation/`：官方 Fraq CLI 与插件知识已完成，后续实现本插件时复用。
- `work/doudizhu-mvp/`：MVP、手牌私聊/明牌公开、GamePick 经典牌型解析、注册持久化、「结束游戏」命令和开局叫地主引导已完成；`0.1.4` 已安装并通过 Fraq/Milky 启动冒烟。

## Next

- Release `0.1.4` is complete: signed tag pushed, GitHub workflow succeeded, npm `latest` is `0.1.4` with provenance, and `my-fraq-app/app` resolves the package at `0.1.4`.
- Release `0.1.4` is published with `结束游戏` and the post-deal @-player bidding guide; `my-fraq-app/app` resolves `0.1.4`, and Fraq loaded the plugin while connected to Milky. The temporary smoke instance has been stopped.
- 下一步在真实群聊开始一局，验证 `/结束游戏` 与按序显示的发牌/叫地主提示，然后检查出牌图片、私聊发牌和好友限制兜底。
- 按真实牌局反馈完善飞机带翅膀、机器人策略和真人 PK 扩展。

## Open questions

- 真人 PK 的入座、观战和房间匹配指令尚未定义。
