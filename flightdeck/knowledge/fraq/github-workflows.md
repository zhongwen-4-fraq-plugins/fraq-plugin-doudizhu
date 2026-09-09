# GitHub 工作流迁移 checklist

SUMMARY: 从其他 Fraq 插件复制 `.github` 时保留基础结构，但必须核对源项目专属链接、包名和目标项目是否提供工作流调用的脚本。
READ WHEN: before copying or adapting `.github` workflows and issue templates from another Fraq plugin

---

- 词库项目的 Issue 模板包含 `fraq-plugin-lexicon` 的 npm badge 和词库仓库 Issue 链接，复制到其他插件后需要按目标仓库调整。
- `pr-review.yml` 在源文件改动时会执行 `pnpm test:mock`；目标项目没有这个脚本时，相关 PR 会失败，应先补脚本或修改工作流条件。
- 本次按用户要求保留 `.github` 的原样副本，未擅自改写这些项目专属内容。
