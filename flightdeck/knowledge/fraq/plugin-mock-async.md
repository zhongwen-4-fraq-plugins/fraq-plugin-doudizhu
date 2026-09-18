# ⚠️ plugin-mock 不等待路由处理函数

SUMMARY: `ctx.mock.receiveGroup()` 只同步派发事件，不会等待异步路由处理完成；断言前必须轮询等待，否则会把已停止的上下文误判成 hook 丢失。
READ WHEN: when a plugin-mock test shows no API calls, or every API call fails by falling through to the stub client

---

- `MockService.emitEvent` 用 mitt 派发事件，`handleMessage` 里的 `await router.dispatch(...)` 是游离的 Promise；`receiveGroup` 返回时路由处理可能才刚开始。
- 事件后立刻断言会看到空结果。若紧接着 `ctx.stop()`，根上下文变成 `stopped`，之后每次 API 调用都会落到 stub client 并抛出 stub 错误，看起来像「hook 在 macrotask 后丢失」，实际是上下文已经停止。
- 正确做法：先轮询等待（例如 `while (!condition()) await new Promise((r) => setTimeout(r, 10))`），断言完成后再 `await ctx.stop()`。
- 同理，插件内部 `setTimeout`（牌局超时等）若在 `ctx.stop()` 之后触发，回调里的 `session.reply` 会抛出同样的 stub 错误；测试要让超时流程跑完再停止上下文，否则出现未处理的 Promise 拒绝。
- hook 返回 `undefined` 会终止该次调用的 hook 链（不会自动调用下一个 hook），临时排查用的 hook 必须返回响应对象，否则会顶掉 plugin-mock 的记录。
