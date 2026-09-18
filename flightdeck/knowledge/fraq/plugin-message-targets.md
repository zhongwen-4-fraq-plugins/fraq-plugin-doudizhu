# Fraq 主动发消息与私聊限制

SUMMARY: `Session` 只有 reply / reaction，给指定会话发消息要用 `ctx.client.send_private_message` 或 `send_group_message`；私聊要求对方是好友，失败要有群内兜底提示。
READ WHEN: before sending a message to a peer other than the current session, for example a private message or a notice to another group

---

- `Session` 只提供 `reply`（回到当前会话）和 `reaction`，没有指定收件人的发送方法；需要跨会话时用 `ctx.client`。
- Milky API 只有 `send_private_message({ user_id, message })` 和 `send_group_message({ group_id, message })`，没有群临时会话发送接口，私聊受好友关系限制。
- 群内插件给群成员私聊时，用 `Number(...)` 把字符串 QQ 号转成数字；发送失败要在群里回一条提醒（推荐让用户先加机器人好友），并用 `ctx.logger.error` 记录原因，否则玩家看不到手牌也不知道为什么。
- 斗地主的手牌就是这样发的：`hand` 事件走私聊，出牌事件和 `明牌` 走群聊。
- `seg.image(uri, { summary })` 配合 `base64://` URI 可直接用于这两个接口，无需先上传。
