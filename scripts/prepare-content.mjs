// Before `quartz build`, on the CI copy of the vault only (the vault itself is never changed).
// For every note with `publish: true`, set `created` (the date shown on the site) to:
// `published` (blog posts, if it is a full date), else `finished` (books),
// else the date the note was first committed.
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"

const root = path.resolve(process.argv[2] ?? "content")
const skipDirs = new Set([".git", ".obsidian", ".github", "Templates", "Projects"])
const fullDate = /^["']?(\d{4}-\d{2}-\d{2})/

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!skipDirs.has(e.name)) walk(path.join(dir, e.name), out)
    } else if (e.name.endsWith(".md")) out.push(path.join(dir, e.name))
  }
  return out
}

function firstCommitDate(file) {
  try {
    const out = execFileSync("git", ["log", "--diff-filter=A", "--follow", "--format=%as", "--", path.relative(root, file)], { cwd: root, encoding: "utf8" })
    return out.trim().split("\n").pop() || null
  } catch { return null }
}

let count = 0
for (const file of walk(root)) {
  const text = fs.readFileSync(file, "utf8").replace(/^﻿/, "")
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/)
  if (!m || !/^publish:\s*["']?true["']?\s*$/im.test(m[1])) continue
  const fm = m[1]
  const get = (k) => (fm.match(new RegExp(`^${k}:\\s*(.*)$`, "im")) || [])[1]?.trim()
  const add = []

  if (!get("created")) {
    const date = (get("published") || "").match(fullDate)?.[1] || (get("finished") || "").match(fullDate)?.[1] || firstCommitDate(file)
    if (date) add.push(`created: ${date}`)
  }
  if (add.length) {
    fs.writeFileSync(file, text.replace(m[0], `---\n${fm}\n${add.join("\n")}\n---${m[2]}`))
    count++
  }
}
console.log(`prepare-content: updated ${count} published note(s)`)
