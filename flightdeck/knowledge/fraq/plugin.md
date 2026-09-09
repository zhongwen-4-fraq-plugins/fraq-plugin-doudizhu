# Fraq 插件开发契约

SUMMARY: Fraq 插件是默认导出 definePlugin 结果的可配置模块，依靠 provides/inject 声明服务依赖，由 apply/start 生命周期运行。
READ WHEN: before creating, modifying, testing, publishing, or integrating a Fraq plugin

---

## 基准与来源

- 官方文档：[开发插件](https://fraq.dev/docs/development/plugin)、[第一个 Fraq 机器人](https://fraq.dev/docs/development/start)。
- 官方仓库主线提交：[`6370efac57011f34f348446c6aadad145982dc9d`](https://github.com/fraqjs/fraq/tree/6370efac57011f34f348446c6aadad145982dc9d)；重点源码为 [`packages/kernel/src/plugin.ts`](https://github.com/fraqjs/fraq/blob/6370efac57011f34f348446c6aadad145982dc9d/packages/kernel/src/plugin.ts)、[`packages/kernel/src/context/plugins.ts`](https://github.com/fraqjs/fraq/blob/6370efac57011f34f348446c6aadad145982dc9d/packages/kernel/src/context/plugins.ts) 和 [`packages/fraq/src/core/plugin.ts`](https://github.com/fraqjs/fraq/blob/6370efac57011f34f348446c6aadad145982dc9d/packages/fraq/src/core/plugin.ts)。

## 包和导出

- 普通插件包名应为 `fraq-plugin-<name>` 或 `@scope/fraq-plugin-<name>`；官方插件使用 `@fraqjs/plugin-<name>` 的特殊命名。
- 插件代码从 `@fraqjs/fraq` 导入 `definePlugin`，对象至少包含 `name` 和 `apply`。逻辑短名要和 CLI 配置键、npm 包规范化名称保持一致，例如 `echo` 对应 `fraq-plugin-echo`。
- 必须 `export default Plugin`。CLI 生成的启动脚本通过动态导入结果的 `.default` 安装插件；只做具名导出会在 CLI 下失效。
- 模板和当前 Fraq `1.1.0` 要求 Node.js `>=22`。包通常只发布 `dist`，用 `build` 构建、`prepack` 在发布前构建，并在 `peerDependencies` 声明兼容的 `@fraqjs/fraq`。
- `package.json.fraq.category` 用于插件市场分类，可选 `infrastructure`、`development`、`management`、`information`、`media`、`ai`、`social`、`entertainment`、`game-tools`、`utilities`。

## 插件生命周期和配置

```ts
import { definePlugin } from '@fraqjs/fraq';

const Plugin = definePlugin({
  name: 'example',
  apply(ctx, options: { prefix: string }) {
    // 注册路由、事件和服务
  },
  start(ctx) {
    // 所有插件 apply 完成后再执行
  },
});

export default Plugin;
```

- `apply(ctx, ...args)` 在插件应用阶段调用，配置参数来自 `fraq.yml`，推荐只接受一个 JSON 可序列化配置对象。
- `start(ctx)` 是可选的，在所有 Context 的插件 `apply` 完成后，按相同的依赖顺序调用；它只接收 `ctx`，不接收安装配置。只有确实需要等待全部插件就绪的逻辑才放进 `start`。
- `ctx` 包含 Fraq 的路由器、事件、API、日志、定时器和服务解析能力。插件上下文会带有插件名元信息，便于路由标签和日志定位。

## 服务提供和依赖注入

```ts
import { definePlugin, serviceToken } from '@fraqjs/fraq';

class ScoreService {
  static readonly token = serviceToken<ScoreService>('doudizhu/ScoreService');
  getScore() {
    return 0;
  }
}

export const Provider = definePlugin({
  name: 'score-provider',
  provides: [ScoreService],
  apply(ctx) {
    ctx.provide(ScoreService, new ScoreService());
  },
});

export const Consumer = definePlugin({
  name: 'score-consumer',
  inject: { score: ScoreService },
  apply(ctx) {
    ctx.logger.info(String(ctx.score.getScore()));
  },
});
```

- 服务类必须有唯一的静态 `token`；key 建议采用 `plugin-name/ServiceName`，不同包用相同 key 即可指向同一服务契约。
- `provides` 声明插件会提供哪些服务，`ctx.provide(Service, instance)` 提供单例，`ctx.provide(Service, factory)` 提供按消费者作用域缓存的实例。
- 工厂收到 `{ context, contextPath, plugin }`，同一个消费者插件作用域复用实例，不同插件可以得到不同实例。
- `inject` 用服务类声明必需依赖。Fraq 会按依赖拓扑先应用提供者；缺提供者、重复提供者或循环依赖会在启动时失败。
- 可选依赖使用 `optionalInject` 和 `serviceToken`，并在 `peerDependenciesMeta` 中标为 optional；未安装时对应属性为 `undefined`，不会阻止插件启动。可选依赖只应使用 `import type` 引入类型，避免运行时依赖。

## 清理和生命周期陷阱

- 需要停止时清理的服务实现 Fraq 的 `Disposable` 接口，并提供 `dispose()`；Context 停止时按逆创建顺序释放服务。
- 从 `@fraqjs/fraq` 显式导入 `Disposable`。TypeScript 的 `Symbol.dispose` 接口不是同一个契约；服务若只实现 ESNext 版本，Fraq 会拒绝它。
- `apply` 中注册路由、事件和服务；依赖其他服务时优先用 `inject`，不要依赖用户安装顺序或手动 `resolve` 来隐藏依赖。
- 同一 Context 中一个 service token 只能有一个提供者；作用域工厂内部再次解析自身会触发循环解析错误。

## 测试和发布

- 冒烟测试可在 `test` 目录用 `tsx` 启动真实 `Context`，安装被测插件并连接 Milky；不希望影响真实用户时使用 `Context` 的过滤能力。
- 单元测试命名为 `*.test.ts`，可使用官方 `@fraqjs/plugin-mock` 在没有真实协议端时驱动事件并拦截出站 API。
- 发布前确认 `build` 能生成 `dist`，`package.json` 的 `main`/`exports` 指向发布入口，`prepack` 会先构建；再用 `npm publish` 发布并填写正确分类。
- CLI 集成时，配置项必须能经过 JSON/YAML 传递；本地迭代使用 `workspacePlugins`，检查其 `package.json.name` 必须等于 CLI 规范化后的包名。
