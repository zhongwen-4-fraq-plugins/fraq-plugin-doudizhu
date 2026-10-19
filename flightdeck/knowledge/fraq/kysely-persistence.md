# Fraq Kysely 持久化插件
SUMMARY: 使用 `@fraqjs/plugin-kysely` 注入 `KyselyService`，通过 `schemas.register` 注册 migration，数据库插件启动时会自动执行待处理 schema。
READ WHEN: before persisting Fraq plugin data, defining a SQLite schema, or testing persistence across context restarts

---

- `@fraqjs/plugin-kysely` 1.1.x 提供 `KyselyService`，默认 SQLite URL 是 `file:./fraq.db`。
- 业务插件声明 `inject: { kysely: KyselyService }`，在 `apply` 中调用 `ctx.kysely.schemas.register({ name, migrations })`。
- Kysely 插件的 `start` 会在插件 apply 完成后执行全部已注册 schema 的 migration，因此业务插件不应自行创建迁移表或重复执行 migration。
- 运行配置必须同时启用 `kysely` 和依赖它的业务插件；单独安装 npm 包不会自动启用配置。
- 本项目的 `doudizhu_registered_users` 以 `user_id` 为主键，注册写入使用 `onConflict(...).doNothing()`，查询按 QQ 号判断是否已注册。
