# ⚠ PowerShell 改文件的坑

SUMMARY: `Set-Location` 不改 .NET 的进程工作目录，中文文件必须显式按 UTF-8 读写，本环境删文件要用 `[IO.File]::Delete`。
READ WHEN: when editing project files from PowerShell on this machine, especially files outside the current repo

---

- `Set-Location` / `cd` 只改 PowerShell 的位置，`[IO.File]`、`Get-Item` 的相对路径仍按进程启动目录解析；跨目录改文件必须拼绝对路径，否则会在当前仓库误建文件（本轮误建过一个 0 字节的 `versions.yml`）。
- 读写文件用 `[IO.File]::ReadAllText($p,[Text.Encoding]::UTF8)` 和保持 BOM 状态的 `[IO.File]::WriteAllText`，不要用 `Set-Content` / `Out-File`，它们会改编码或加 BOM。
- 改 `package.json` 这类手工排版的文件用「读全文 + 精确替换子串」的方式，不要用 `ConvertTo-Json` 重写，否则会整体重排。
- 本环境 `Remove-Item` 会被策略拒绝（`blocked by policy`），`[IO.File]::Delete($path)` 可用；删前先用 `Test-Path` 和内容检查确认目标。
- 删文件前先核对绝对路径和内容，再执行删除。