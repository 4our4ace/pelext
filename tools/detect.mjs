const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]|\p{Extended_Pictographic}/u
const GLYPH = /[\s─-▟⠀-⣿►◄▲▼▶◀▸◂▷◁△▽○●◉◇◆■□╳·]/u
const FILLS = /[█▓▒░▌▐▀▄▁▂▃▅▆▇]/u
const BARS = /[│┃▏▕║]/
const VBAR = /[│┃┆┇╎╏┊║]/
const LIFELINE_ABOVE = /[│┃┆╎┊┼├┤┬]/
const LIFELINE_BELOW = /[│┃┆╎┊┼├┤┴]/
const LINE_ABOVE = /[│┃║┆╎┊┼├┤┬╭╮]/
const LINE_BELOW = /[│┃║┆╎┊┼├┤┴╰╯]/
const STUBS = { '╴': [0, -1], '╶': [0, 1], '╵': [-1, 0], '╷': [1, 0] }
const HEADS = { '►': [0, 1], '▶': [0, 1], '▸': [0, 1], '◄': [0, -1], '◀': [0, -1], '◂': [0, -1], '▼': [1, 0], '▲': [-1, 0] }
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }

const channel = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const luminance = hex => {
  const [r, g, b] = [1, 3, 5].map(i => channel(parseInt(hex.slice(i, i + 2), 16) / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const x = luminance(a), y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const toCells = art => art.rows.map(row => row.flatMap(s => [...s.text].flatMap(ch => {
  const cell = { ch, bg: s.bg, inverse: s.inverse }
  return WIDE.test(ch) ? [cell, { ...cell, ch: '' }] : [cell]
})))

const isText = (row, c) => {
  const cell = row[c], before = row[c - 1]?.ch ?? ' ', after = row[c + 1]?.ch ?? ' '
  if (!cell || GLYPH.test(cell.ch)) return false
  if ('<>'.includes(cell.ch) && /[─┄━╌┈═○┼╫]/.test(before + after)) return false
  if ('ΛV'.includes(cell.ch) && !/\w/.test(before + after)) return false
  return true
}

const lostText = (art, svg, add) => {
  const lines = art.art.split('\n').map(l => [...l]), width = Math.max(...lines.map(l => l.length))
  const columns = Array.from({ length: width }, (_, c) => lines.map(l => l[c] ?? ' ').join(''))
  const readable = `${art.art.replace(/\n/g, ' ')} ${columns.join(' ')}`
  for (const [, attrs, raw] of svg.matchAll(/<(?:text|tspan)\b([^>]*)>([^<]+)</g)) {
    const text = raw.replace(/&(?:amp|lt|gt|quot|#39);/g, e => ENTITIES[e]).trim()
    if (!text || /rotate|writing-mode/.test(attrs) || (text.length === 1 && !/\w/.test(text))) continue
    if (!text.split(' ').every(word => readable.includes(word))) add('lost-text', 0, JSON.stringify(text))
  }
}

const cellDefects = (art, add) => {
  const cells = toCells(art), sequence = art.type === 'sequence'
  const show = (row, c) => JSON.stringify(row.slice(Math.max(0, c - 10), c + 12).map(x => x.ch).join(''))
  cells.forEach((row, r) => row.forEach((cell, c) => {
    const above = cells[r - 1]?.[c]?.ch ?? '', below = cells[r + 1]?.[c]?.ch ?? ''
    if (BARS.test(cell.ch) && ((isText(row, c - 1) && cell.ch !== '▕') || (isText(row, c + 1) && cell.ch !== '▏'))) add('touching', r, show(row, c))
    const stub = STUBS[cell.ch]
    if (stub) {
      const [dr, dc] = stub, next = cells[r - dr]?.[c - dc], beyond = cells[r - 2 * dr]?.[c - 2 * dc]
      if (next?.ch === ' ' && !next.bg && beyond && beyond.ch !== ' ' && !(dr && /[\p{L}\p{N}]/u.test(beyond.ch))) add('nearmiss', r, dr ? JSON.stringify(beyond.ch + next.ch + cell.ch) : show(row, c))
    }
    if (sequence && cell.ch === ' ' && !cell.bg && !cell.inverse && LIFELINE_ABOVE.test(above) && LIFELINE_BELOW.test(below)) add('gap', r, show(row, c))
    const head = HEADS[cell.ch]
    if (head && art.type !== 'gantt' && (head[0] ? /[│┃┆┇╎╏┊]/ : /[─━┄┅╌╍┈═]/).test(cells[r + head[0]]?.[c + head[1]]?.ch ?? '')) add('overshoot', r, show(row, c))
    if (!isText(row, c) || cell.bg || cell.inverse) return
    for (const side of [row[c - 1], row[c + 1]]) if (side && FILLS.test(side.ch) && !side.bg) add('touch-fill', r, show(row, c))
    if (sequence && LINE_ABOVE.test(above) && LINE_BELOW.test(below)) add('on-line', r, show(row, c))
  }))
}

const colorDefects = (art, canvas, add) => art.rows.forEach((row, r) => row.forEach(s => {
  const words = /[A-Za-z0-9]/.test(s.text)
  if (s.fg && s.bg && s.fg === s.bg && s.text.trim()) add('invisible', r, JSON.stringify(s.text))
  if (s.fg && s.bg && words && contrast(s.fg, s.bg) < 3) add('low-contrast', r, `${JSON.stringify(s.text)} ${s.fg} on ${s.bg}`)
  if (s.fg && !s.bg && words && canvas && contrast(s.fg, canvas) < 2) add('low-contrast-canvas', r, `${JSON.stringify(s.text)} ${s.fg} on ${canvas}`)
}))

const boxDefects = (art, add) => {
  const rows = art.art.split('\n').map(l => [...l])
  rows.forEach((row, r) => {
    const line = row.join('')
    for (let c = 1; c < row.length - 1; c++) {
      const ch = row[c], before = row.slice(0, c), joined = /─/.test(row[c - 1] + row[c + 1])
      if ('┬┤├'.includes(ch) && before.lastIndexOf('╭') > before.lastIndexOf('╮') && row.indexOf('╮', c) > -1 && joined && !VBAR.test(rows[r - 1]?.[c] ?? ' ')) add('merged-box', r, line)
      if (ch === '┴' && before.lastIndexOf('╰') > before.lastIndexOf('╯') && row.indexOf('╯', c) > -1 && joined && !VBAR.test(rows[r + 1]?.[c] ?? ' ')) add('merged-box', r, line)
      if (VBAR.test(ch) && VBAR.test(row[c + 1])) add('double-bar', r, line)
    }
  })
}

export const defects = (art, svg, palette) => {
  const found = {}
  const add = (kind, row, detail) => (found[kind] ??= []).push(`r${row}: ${detail}`)
  if (art.type === 'sequence') boxDefects(art, add)
  lostText(art, svg, add)
  cellDefects(art, add)
  colorDefects(art, palette.canvas, add)
  return found
}
