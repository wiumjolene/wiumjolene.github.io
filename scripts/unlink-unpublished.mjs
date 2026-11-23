// After `quartz build`: turn links to pages that are not on the site
// (e.g. notes without `publish: true`) into plain text, so visitors don't hit 404s.
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(process.argv[2] ?? "public")
const exists = (p) => fs.existsSync(p) && fs.statSync(p).isFile()

function targetExists(fromFile, href) {
  const clean = decodeURIComponent(href.split("#")[0].split("?")[0])
  if (clean === "") return true // same-page anchor
  const base = path.resolve(path.dirname(fromFile), clean)
  return [base, base + ".html", path.join(base, "index.html")].some(exists)
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (p.endsWith(".html")) out.push(p)
  }
  return out
}

let changed = 0
const anchor = /<a\b([^>]*\bclass="[^"]*\binternal\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/g
for (const file of walk(root)) {
  const html = fs.readFileSync(file, "utf8")
  const out = html.replace(anchor, (full, attrs, inner) => {
    const m = attrs.match(/\bhref="([^"]*)"/)
    if (!m || /^[a-z]+:|^\/\//i.test(m[1])) return full
    // Links to folder pages work but Quartz marks them "broken": unmark them.
    if (targetExists(file, m[1])) return full.replace(/(class="[^"]*?)\s*\bbroken\b/, "$1")
    changed++
    return `<span class="unpublished-link">${inner}</span>`
  })
  if (out !== html) fs.writeFileSync(file, out)
}
console.log(`unlink-unpublished: replaced ${changed} link(s) to pages not on the site`)

// Drop links to unpublished pages from the content index (used by graph & search).
const indexFile = path.join(root, "static", "contentIndex.json")
if (exists(indexFile)) {
  const index = JSON.parse(fs.readFileSync(indexFile, "utf8"))
  const slugs = new Set(Object.keys(index))
  let dropped = 0
  for (const entry of Object.values(index)) {
    if (!Array.isArray(entry.links)) continue
    const kept = entry.links.filter((l) => slugs.has(l))
    dropped += entry.links.length - kept.length
    entry.links = kept
  }
  fs.writeFileSync(indexFile, JSON.stringify(index))
  console.log(`unlink-unpublished: removed ${dropped} index link(s) to pages not on the site`)
}
