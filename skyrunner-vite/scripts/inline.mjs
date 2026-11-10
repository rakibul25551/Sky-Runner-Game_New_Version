// Builds ONE self-contained file (JS + CSS inlined) that opens by double-click, no server needed.
import fs from 'node:fs'
import path from 'node:path'
const dist = 'dist', assets = path.join(dist, 'assets')
const js = fs.readdirSync(assets).find((f) => f.endsWith('.js'))
const css = fs.readdirSync(assets).find((f) => f.endsWith('.css'))
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
let jsCode = fs.readFileSync(path.join(assets, js), 'utf8').replace(/<\/script/gi, '<\\/script')
// audio files (the game music) become data URIs too, so the single file still works offline
for (const f of fs.readdirSync(assets).filter((n) => /\.(mp3|ogg|wav)$/.test(n))) {
  const mime = f.endsWith('.mp3') ? 'audio/mpeg' : f.endsWith('.ogg') ? 'audio/ogg' : 'audio/wav'
  const uri = `data:${mime};base64,` + fs.readFileSync(path.join(assets, f)).toString('base64')
  jsCode = jsCode.split(`"/assets/${f}"`).join(JSON.stringify(uri))
}
const cssCode = fs.readFileSync(path.join(assets, css), 'utf8')
html = html
  .replace(/<script type="module"[^>]*src="[^"]*"[^>]*><\/script>/, '')
  .replace(/<link rel="stylesheet"[^>]*>/, '')
  .replace('</head>', () => `<style>${cssCode}</style></head>`)
  .replace('</body>', () => `<script type="module">${jsCode}</script></body>`)
fs.mkdirSync('play', { recursive: true })
fs.writeFileSync('play/index.html', html)
console.log('play/index.html written (' + Math.round(html.length / 1024) + ' KB)')
