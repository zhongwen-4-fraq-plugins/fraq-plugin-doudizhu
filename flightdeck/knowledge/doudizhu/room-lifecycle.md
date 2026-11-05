# 斗地主结束游戏命令
SUMMARY: `结束游戏` 用 `RoomManager.remove()` 释放房间与游戏计时器，同时删除对应的 `roomSessions` 引用。
READ WHEN: before changing the command or flow that manually ends a 斗地主 room

---

- `RoomManager.remove(roomId)` 会调用 `game.dispose()`，停止该局的操作超时计时器并从房间池移除房间。
- 插件还需删除 `roomSessions` 中同一房间 ID 的会话引用，避免保留已结束牌局的 Session。
- 退出后可用同一玩家重新创建房间；集成测试应验证该行为并在测试结束前释放最后一局。
- 命令只响应群聊中的当前房间玩家；Fraq 配置若设置 `/` prefix，消息必须写作 `/结束游戏`。
