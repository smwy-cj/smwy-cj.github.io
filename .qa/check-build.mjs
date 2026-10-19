import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
const root = path.resolve('docs/.vitepress/dist')
const html = []
async function walk(dir) { for (const e of await readdir(dir, { withFileTypes: true })) { const p = path.join(dir,e.name); if(e.isDirectory()) await walk(p); else if(p.endsWith('.html')) html.push(p) } }
await walk(root)
const broken = []
let links = 0
for(const file of html) {
  const source = await readFile(file, 'utf8')
  for(const [,attribute,href] of source.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if(/^(https?:|data:|mailto:|tel:|#|javascript:)/.test(href)) continue
    const url = new URL(href, `https://example.test/${path.relative(root,file).replaceAll('\\','/')}`)
    let target = path.join(root,decodeURIComponent(url.pathname))
    if(url.pathname.endsWith('/')) target = path.join(target,'index.html')
    links++
    try { await stat(target) } catch { broken.push(`${path.relative(root,file)}: ${attribute}=${href}`) }
  }
  if(!source.includes('<h1')) broken.push(`${file}: missing h1`)
}
if(broken.length) { console.error(broken.join('\n')); process.exitCode=1 }
else console.log(`Validated ${html.length} HTML pages and ${links} local links/resources; no missing targets.`)
const font = await stat(path.join(root,'fonts/study-serif.woff2'))
console.log(`Local font: ${font.size} bytes. Sitemap: ${(await stat(path.join(root,'sitemap.xml'))).size} bytes.`)
