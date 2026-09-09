# Fraq CLI 使用与运行机制

SUMMARY: 以 Fraq 官方文档和仓库主线为准，CLI 负责读取配置、锁定依赖、生成启动应用并管理本地插件开发。
READ WHEN: before configuring, starting, updating, or debugging a Fraq application with the CLI

---

## 基准与来源

- 官方文档：[使用 Fraq CLI](https://fraq.dev/docs/deployment/cli)、[激活方式](https://fraq.dev/docs/deployment/cli/activation)、[Fork 与过滤器](https://fraq.dev/docs/deployment/cli/fork)、[版本锁定](https://fraq.dev/docs/deployment/cli/versions)。
- 官方仓库：[`fraqjs/fraq`](https://github.com/fraqjs/fraq)，`main` 当前核对提交 `6370efac57011f34f348446c6aadad145982dc9d`；该提交的 `@fraqjs/cli` 包版本为 `1.0.1`，`@fraqjs/fraq` 与 `@fraqjs/kernel` 为 `1.1.0`。官网文档展示的 Fraq 核心版本以页面当前内容为准。
- 本记录只描述上述线上资料。`fraq-webui/reference/fraq` 和 `my-fraq-app` 中的旧版 CLI 行为不作为当前规范。

## 安装和命令

- 当前 CLI 要求 Node.js `>=22`，可用 `npm i -g @fraqjs/cli` 安装，`fraq version` 查看 CLI 版本。
- `fraq wizard`（别名 `init`、`setup`）创建 `fraq.yml`；`fraq start`（别名 `run`）启动应用；`fraq install`（别名 `i`）只安装依赖。
- `fraq lock` 补全插件版本并写入 `versions.yml`；`fraq outdated` 检查更新；`fraq update` 交互式更新 Fraq 和插件版本。
- `fraq start` 默认先执行版本锁定，再生成并安装应用依赖。`--no-install` 跳过安装；`--frozen-lockfile` 跳过自动锁定；`--watch` 监听配置引用和工作区插件入口并自动重启。`--watch` 不能与前两个选项同时使用。
- 未显式设置 `packageManager` 时按 `pnpm -> yarn -> npm` 选择；显式值只能是 `npm`、`pnpm` 或 `yarn`。

## 配置文件

CLI 从当前目录寻找 `fraq.yml`、`fraq.yaml` 或 `fraq.json`，当前配置版本为 `configVersion: 1`。常用结构如下：

```yaml
configVersion: 1
fraqVersion: 1.1.0
milky:
  url: http://localhost:30001/
  accessToken: optional-token
  connectEvent: true
plugins:
  status:
    commandName: status
versions: {}
workspacePlugins: {}
logging:
  minLevel: debug
additionalDependencies: {}
```

- `milky.url` 是协议端地址；`accessToken` 按协议端配置填写；`connectEvent: false` 时不接收推送事件。
- `plugins` 的键是插件短名，值是传给插件 `apply` 的 JSON 配置。`forks` 可以递归地安装插件并附带过滤器。
- `logging.minLevel` 可选 `debug`、`info`、`warn`、`error`，默认 `debug`。
- `additionalDependencies` 会原样加入生成应用的依赖。配置值支持 `${{ env:NAME }}`、`${{ text:path }}` 和独占值的 `${{ tree:path }}` 引用；`$${{ ... }}` 可转义为字面量。

## 插件名、依赖与生成应用

CLI 会把配置短名规范化为 npm 包名：

| 配置名 | npm 包名 |
| --- | --- |
| `foo` | `fraq-plugin-foo` |
| `scope/foo` | `@scope/fraq-plugin-foo` |
| `fraqjs/foo` | `@fraqjs/plugin-foo` |

启动时 CLI 会读取插件包的 `peerDependencies`，检查必需的插件是否存在于当前 Context 或任一父 Context；可选 peer dependency 由 `peerDependenciesMeta` 的 `optional: true` 标记。并列 Fork 之间不共享插件，依赖插件必须安装在同一 Fork 或其父级。

CLI 生成私有的 `app/package.json`，包含 `@fraqjs/fraq`、`@fraqjs/color-log`、规范化后的插件包、工作区 `file:` 依赖和 `additionalDependencies`。同时生成 `app/index.js`：创建 `Context.fromUrl`，动态导入每个插件的 `.default`，用 JSON 配置调用 `ctx.install`，创建 Fork，注册信号处理后调用 `ctx.start()`。

因此插件必须有默认导出，安装参数必须能被 JSON 序列化；否则 CLI 生成的启动脚本无法可靠使用。

## 版本锁定

- `versions.yml` 记录插件的精确版本；`fraq.yml` 的 `versions` 可以显式声明版本，配置声明优先于锁文件。
- 普通插件缺少版本时，`fraq lock` 从 npm 查询最新版本并写入锁文件；`workspacePlugins` 插件不需要版本，也不会进入锁文件或 `outdated`、`update`。
- 使用 `--frozen-lockfile` 时不自动补锁；启动前必须保证所有普通插件都有版本且配置版本和锁文件一致。

## 工作区插件

开发本地插件时，把短名映射到相对 `fraq.yml` 的目录：

```yaml
plugins:
  status:
workspacePlugins:
  status: ../plugin-status
```

CLI 要求工作区包的 `package.json.name` 正好等于规范化包名，使用 `file:` 依赖安装，并从 `publishConfig.exports`、`exports`、`publishConfig.main`、`main` 或 `index.js` 解析入口。`--watch` 会追踪有效入口文件变化并重启应用。

## 激活、Fork 与过滤器

`activation` 控制指令触发条件：`direct`、`mention`、`{ type: prefix, prefix: '/' }` 和 `{ type: mention, prefix: '/' }`。可以写单值或数组，数组表示满足任一规则；也可以写 `default` 与按顺序匹配的 `overrides`，按 `plugin`、`context`、`tag`、`command` 覆盖特定路由。

`forks` 为事件建立隔离的子 Context。过滤器支持 `allPass`、`allFriends`、`allGroups`、`admin`、`friends`、`groups`、`senders` 以及 `or`、`and`、`not` 组合；子 Fork 可继续嵌套。父级服务和插件对下级可见，下级插件不会反向影响父级或兄弟 Fork。

## CLI 排障顺序

1. 先确认 Node.js、CLI 版本和 Milky URL。
2. 确认配置文件可被找到且 `configVersion`、`fraqVersion`、`milky` 合法。
3. 运行 `fraq lock` 或检查 `versions.yml`，再检查插件短名是否规范化正确。
4. 看到依赖错误时，检查插件的 `peerDependencies` 与当前 Context/父 Context；看到入口错误时，检查默认导出和工作区 `package.json`。
5. 本地开发优先使用 `workspacePlugins` 与 `fraq start --watch`，发布前再验证构建后的 `dist` 入口。
