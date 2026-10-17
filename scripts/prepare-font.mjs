// Optional maintenance helper. Normal builds use the committed local font.
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const docs = path.resolve('docs')
const chunks = []
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['public', 'cache', 'dist'].includes(entry.name)) continue
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) await visit(file)
    else if (/\.(vue|ts|md)$/.test(entry.name)) {
      const source = await readFile(file, 'utf8')
      chunks.push(entry.name.endsWith('.md') ? source.split('\n').filter(line => /^(title:|description:|category:|directory:|tags:|#{1,4} |>|\d+\. \*\*)/.test(line)).join('') : source)
    }
  }
}
await visit(docs)
const chinese = [...new Set(chunks.join('').match(/[\p{Script=Han}\u3000-\u303f\uff00-\uffef]/gu))].sort().join('')
const text = `${chinese}abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,;:!?/()·—“”‘’`
const response = await fetch(`https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400..700&display=swap&text=${encodeURIComponent(text)}`, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' }, signal: AbortSignal.timeout(45000) })
if (!response.ok) throw new Error(`Font CSS request failed: ${response.status}`)
const css = await response.text()
const url = css.match(/url\((https:[^)]+)\)\s*format\('woff2'\)/)?.[1]
if (!url) throw new Error(`Expected a WOFF2 font in the Google Fonts response: ${css.slice(0, 1400)}`)
const font = await fetch(url, { signal: AbortSignal.timeout(45000) })
const license = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/OFL.txt', { signal: AbortSignal.timeout(45000) })
if (!font.ok || !license.ok) throw new Error('Font or license download failed')
const directory = path.join(docs, 'public/fonts')
await mkdir(directory, { recursive: true })
const bytes = new Uint8Array(await font.arrayBuffer())
await writeFile(path.join(directory, 'study-serif.woff2'), bytes)
await writeFile(path.join(directory, 'OFL.txt'), await license.text())
console.log(`Local font saved: ${bytes.byteLength} bytes; ${chinese.length} Chinese characters, plus Latin characters. License saved.`)
