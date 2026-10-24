const WIDE = /[\u{1100}-\u{115F}\u{231A}-\u{231B}\u{2329}-\u{232A}\u{23E9}-\u{23EC}\u{23F0}\u{23F3}\u{25FD}-\u{25FE}\u{2614}-\u{2615}\u{2630}-\u{2637}\u{2648}-\u{2653}\u{267F}\u{268A}-\u{268F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2705}\u{270A}-\u{270B}\u{2728}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2795}-\u{2797}\u{27B0}\u{27BF}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{2E80}-\u{3029}\u{302E}-\u{303E}\u{3041}-\u{3096}\u{309B}-\u{3247}\u{3250}-\u{A4C6}\u{A960}-\u{A97C}\u{AC00}-\u{D7A3}\u{F900}-\u{FAFF}\u{FE10}-\u{FE19}\u{FE30}-\u{FE6B}\u{FF01}-\u{FF60}\u{FFE0}-\u{FFE6}\u{16FE0}-\u{16FE3}\u{16FF0}-\u{1B2FB}\u{1D300}-\u{1D376}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1AE}\u{1F200}-\u{1F320}\u{1F32D}-\u{1F335}\u{1F337}-\u{1F37C}\u{1F37E}-\u{1F393}\u{1F3A0}-\u{1F3CA}\u{1F3CF}-\u{1F3D3}\u{1F3E0}-\u{1F3F0}\u{1F3F4}\u{1F3F8}-\u{1F43E}\u{1F440}\u{1F442}-\u{1F4FC}\u{1F4FF}-\u{1F53D}\u{1F54B}-\u{1F54E}\u{1F550}-\u{1F567}\u{1F57A}\u{1F595}-\u{1F596}\u{1F5A4}\u{1F5FB}-\u{1F64F}\u{1F680}-\u{1F6C5}\u{1F6CC}\u{1F6D0}-\u{1F6D2}\u{1F6D5}-\u{1F6DF}\u{1F6EB}-\u{1F6EC}\u{1F6F4}-\u{1F6FC}\u{1F7DA}\u{1F7E0}-\u{1F7F0}\u{1F90C}-\u{1F93A}\u{1F93C}-\u{1F945}\u{1F947}-\u{1F9FF}\u{1FA70}-\u{1FAFA}\u{20000}-\u{3FFFD}]/u
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

const lostText = (art, svgs, add) => {
  const lines = art.art.split('\n').map(l => [...l]), width = Math.max(...lines.map(l => l.length))
  const columns = Array.from({ length: width }, (_, c) => lines.map(l => l[c] ?? ' ').join(''))
  const readable = `${art.art.replace(/\n/g, ' ')} ${columns.join(' ')}`
  const lost = svgs.map(svg => [...svg.matchAll(/<(?:text|tspan)\b([^>]*)>([^<]+)</g)].map(([, attrs, raw]) => [attrs, raw.replace(/&(?:amp|lt|gt|quot|#39);/g, e => ENTITIES[e]).trim()])
    .filter(([attrs, text]) => text && !/rotate|writing-mode/.test(attrs) && (text.length > 1 || /\w/.test(text)) && !text.split(' ').every(word => readable.includes(word))))
  for (const [, text] of lost.reduce((a, b) => (b.length < a.length ? b : a), lost[0] ?? [])) add('lost-text', 0, JSON.stringify(text))
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

export const defects = (art, svgs, palette) => {
  const found = {}
  const add = (kind, row, detail) => (found[kind] ??= []).push(`r${row}: ${detail}`)
  if (art.type === 'sequence') boxDefects(art, add)
  lostText(art, svgs, add)
  cellDefects(art, add)
  colorDefects(art, palette.canvas, add)
  return found
}
