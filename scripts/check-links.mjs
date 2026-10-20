import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(process.argv[2] || 'docs/.vitepress/dist')
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat()
}
const files = await walk(root)
const html = new Map(await Promise.all(files.filter(file => file.endsWith('.html')).map(async file => [file, await readFile(file, 'utf8')])))
const errors = []
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
for (const [file, content] of html) {
  const origin = `https://local.invalid/${path.relative(root, file).split(path.sep).join('/')}`
  for (const match of content.matchAll(/<(a|img|source)\b[^>]*?\b(href|src)="([^"]*)"/g)) {
    const raw = decode(match[3])
    if (!raw || /^(?:https?:|mailto:|tel:|data:|blob:|\/\/)/i.test(raw)) continue
    try {
      if (/^(?:[a-z]:|file:|\\)/i.test(raw)) throw new Error('电脑本地路径不能用于网站')
      const url = new URL(raw, origin)
      let target = path.resolve(root, `.${decodeURIComponent(url.pathname)}`)
      if (!target.startsWith(root + path.sep) && target !== root) throw new Error('路径超出网站目录')
      if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html')
      await stat(target)
      if (url.hash && html.has(target)) {
        const anchor = decodeURIComponent(url.hash.slice(1))
        const ids = [...html.get(target).matchAll(/\b(?:id|name)="([^"]*)"/g)].map(item => decode(item[1]))
        if (anchor && !ids.includes(anchor)) throw new Error('目标章节不存在')
      }
    } catch (error) {
      errors.push(`${path.relative(root, file)} → ${raw} (${error.code === 'ENOENT' ? '目标文件不存在' : error.message})`)
    }
  }
}
if (errors.length) {
  console.error(`发现 ${errors.length} 处无效站内链接或图片：\n${errors.join('\n')}`)
  process.exitCode = 1
} else console.log(`已检查 ${html.size} 个页面：站内链接、图片和章节锚点均有效。`)
