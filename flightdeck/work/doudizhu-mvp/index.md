# 斗地主人机对局 MVP

状态：核心人机对局、群房间、中文指令和图片牌面已实现，等待接入真实 Fraq 运行环境验证。

## Progress

- 已实现 54 张牌模型、洗牌发牌、基础牌型判断、机器人出牌和牌局状态机。
- 每个群独立维护房间池，默认最多 2 个房间；每个房间固定 1 名真人和 2 名人机。
- 已注册 `开始斗地主`、`明牌`、`叫地主`、`抢地主`、`不叫`、`加倍`、`超级加倍`、`不加倍`、`出牌`、`要不起`。
- 手牌和出牌事件通过 `/image` 目录牌图横向叠放，输出 `base64://` 图片并缓存。
- 操作超时会结束牌局、释放房间并向群发送通知；连续三轮无人叫地主后随机选地主。

## Next

- 用 Fraq 工作区插件连接真实协议端，验证中文路由、图片发送和群聊权限。
- 根据实际牌局反馈完善飞机带翅膀、机器人策略和真人 PK 扩展接口。

## Open questions

- 真人 PK 的入座、观战和房间匹配指令尚未定义。

## Read now

- `flightdeck/knowledge/fraq/plugin.md`
- `flightdeck/knowledge/doudizhu/image-layout.md`

## Read if

- 修改 Fraq 插件生命周期、路由或发布配置时，读取 `flightdeck/knowledge/fraq/plugin.md`。
- 修改牌面拼接尺寸、发送格式或图片缓存时，读取 `flightdeck/knowledge/doudizhu/image-layout.md`。
