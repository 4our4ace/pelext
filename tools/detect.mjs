const WIDE = /[\u{1100}-\u{115F}\u{231A}-\u{231B}\u{2329}-\u{232A}\u{23E9}-\u{23EC}\u{23F0}\u{23F3}\u{25FD}-\u{25FE}\u{2614}-\u{2615}\u{2630}-\u{2637}\u{2648}-\u{2653}\u{267F}\u{268A}-\u{268F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2705}\u{270A}-\u{270B}\u{2728}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2795}-\u{2797}\u{27B0}\u{27BF}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{2E80}-\u{3029}\u{302E}-\u{303E}\u{3041}-\u{3096}\u{309B}-\u{3247}\u{3250}-\u{A4C6}\u{A960}-\u{A97C}\u{AC00}-\u{D7A3}\u{F900}-\u{FAFF}\u{FE10}-\u{FE19}\u{FE30}-\u{FE6B}\u{FF01}-\u{FF60}\u{FFE0}-\u{FFE6}\u{16FE0}-\u{16FE3}\u{16FF0}-\u{1B2FB}\u{1D300}-\u{1D376}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1AE}\u{1F200}-\u{1F320}\u{1F32D}-\u{1F335}\u{1F337}-\u{1F37C}\u{1F37E}-\u{1F393}\u{1F3A0}-\u{1F3CA}\u{1F3CF}-\u{1F3D3}\u{1F3E0}-\u{1F3F0}\u{1F3F4}\u{1F3F8}-\u{1F43E}\u{1F440}\u{1F442}-\u{1F4FC}\u{1F4FF}-\u{1F53D}\u{1F54B}-\u{1F54E}\u{1F550}-\u{1F567}\u{1F57A}\u{1F595}-\u{1F596}\u{1F5A4}\u{1F5FB}-\u{1F64F}\u{1F680}-\u{1F6C5}\u{1F6CC}\u{1F6D0}-\u{1F6D2}\u{1F6D5}-\u{1F6DF}\u{1F6EB}-\u{1F6EC}\u{1F6F4}-\u{1F6FC}\u{1F7DA}\u{1F7E0}-\u{1F7F0}\u{1F90C}-\u{1F93A}\u{1F93C}-\u{1F945}\u{1F947}-\u{1F9FF}\u{1FA70}-\u{1FAFA}\u{20000}-\u{3FFFD}]/u
const ZERO = /[\u{0}-\u{1F}\u{7F}-\u{9F}\u{300}-\u{36F}\u{483}-\u{489}\u{591}-\u{5BD}\u{5BF}\u{5C1}-\u{5C2}\u{5C4}-\u{5C5}\u{5C7}-\u{5C9}\u{600}-\u{605}\u{610}-\u{61A}\u{61C}\u{64B}-\u{65F}\u{670}\u{6D6}-\u{6DD}\u{6DF}-\u{6E4}\u{6E7}-\u{6E8}\u{6EA}-\u{6ED}\u{70F}\u{711}\u{730}-\u{74A}\u{7A6}-\u{7B0}\u{7EB}-\u{7F3}\u{7FD}\u{816}-\u{819}\u{81B}-\u{823}\u{825}-\u{827}\u{829}-\u{82D}\u{859}-\u{85B}\u{890}-\u{891}\u{897}-\u{89F}\u{8CA}-\u{902}\u{93A}\u{93C}\u{941}-\u{948}\u{94D}\u{951}-\u{957}\u{962}-\u{963}\u{981}\u{9BC}\u{9C1}-\u{9C4}\u{9CD}\u{9E2}-\u{9E3}\u{9FE}-\u{A02}\u{A3C}\u{A41}-\u{A51}\u{A70}-\u{A71}\u{A75}\u{A81}-\u{A82}\u{ABC}\u{AC1}-\u{AC8}\u{ACD}\u{AE2}-\u{AE3}\u{AFA}-\u{B01}\u{B3C}\u{B3F}\u{B41}-\u{B44}\u{B4D}-\u{B56}\u{B62}-\u{B63}\u{B82}\u{BC0}\u{BCD}\u{C00}\u{C04}\u{C3C}\u{C3E}-\u{C40}\u{C46}-\u{C56}\u{C62}-\u{C63}\u{C81}\u{CBC}\u{CBF}\u{CC6}\u{CCC}-\u{CCD}\u{CE2}-\u{CE3}\u{D00}-\u{D01}\u{D3B}-\u{D3C}\u{D41}-\u{D44}\u{D4D}\u{D62}-\u{D63}\u{D81}\u{DCA}\u{DD2}-\u{DD6}\u{E31}\u{E34}-\u{E3A}\u{E47}-\u{E4E}\u{EB1}\u{EB4}-\u{EBC}\u{EC8}-\u{ECE}\u{F18}-\u{F19}\u{F35}\u{F37}\u{F39}\u{F71}-\u{F7E}\u{F80}-\u{F84}\u{F86}-\u{F87}\u{F8D}-\u{FBC}\u{FC6}\u{102D}-\u{1030}\u{1032}-\u{1037}\u{1039}-\u{103A}\u{103D}-\u{103E}\u{1058}-\u{1059}\u{105E}-\u{1060}\u{1071}-\u{1074}\u{1082}\u{1085}-\u{1086}\u{108D}\u{109D}\u{1160}-\u{11FF}\u{135D}-\u{135F}\u{1712}-\u{1714}\u{1732}-\u{1733}\u{1752}-\u{1753}\u{1772}-\u{1773}\u{17B4}-\u{17B5}\u{17B7}-\u{17BD}\u{17C6}\u{17C9}-\u{17D3}\u{17DD}\u{180B}-\u{180F}\u{1885}-\u{1886}\u{18A9}\u{1920}-\u{1922}\u{1927}-\u{1928}\u{1932}\u{1939}-\u{193B}\u{1A17}-\u{1A18}\u{1A1B}\u{1A56}\u{1A58}-\u{1A60}\u{1A62}\u{1A65}-\u{1A6C}\u{1A73}-\u{1A7F}\u{1AB0}-\u{1B03}\u{1B34}\u{1B36}-\u{1B3A}\u{1B3C}\u{1B42}\u{1B6B}-\u{1B73}\u{1B80}-\u{1B81}\u{1BA2}-\u{1BA5}\u{1BA8}-\u{1BA9}\u{1BAB}-\u{1BAD}\u{1BE6}\u{1BE8}-\u{1BE9}\u{1BED}\u{1BEF}-\u{1BF1}\u{1C2C}-\u{1C33}\u{1C36}-\u{1C37}\u{1CD0}-\u{1CD2}\u{1CD4}-\u{1CE0}\u{1CE2}-\u{1CE8}\u{1CED}\u{1CF4}\u{1CF8}-\u{1CF9}\u{1DC0}-\u{1DFF}\u{200B}-\u{200F}\u{202A}-\u{202E}\u{2060}-\u{206F}\u{20D0}-\u{20F0}\u{2CEF}-\u{2CF1}\u{2D7F}\u{2DE0}-\u{2DFF}\u{302A}-\u{302D}\u{3099}-\u{309A}\u{A66F}-\u{A672}\u{A674}-\u{A67D}\u{A69E}-\u{A69F}\u{A6F0}-\u{A6F1}\u{A802}\u{A806}\u{A80B}\u{A825}-\u{A826}\u{A82C}\u{A8C4}-\u{A8C5}\u{A8E0}-\u{A8F1}\u{A8FF}\u{A926}-\u{A92D}\u{A947}-\u{A951}\u{A980}-\u{A982}\u{A9B3}\u{A9B6}-\u{A9B9}\u{A9BC}-\u{A9BD}\u{A9E5}\u{AA29}-\u{AA2E}\u{AA31}-\u{AA32}\u{AA35}-\u{AA36}\u{AA43}\u{AA4C}\u{AA7C}\u{AAB0}\u{AAB2}-\u{AAB4}\u{AAB7}-\u{AAB8}\u{AABE}-\u{AABF}\u{AAC1}\u{AAEC}-\u{AAED}\u{AAF6}\u{ABE5}\u{ABE8}\u{ABED}\u{D7B0}-\u{D7FF}\u{FB1E}\u{FE00}-\u{FE0F}\u{FE20}-\u{FE2F}\u{FEFF}\u{FFF9}-\u{FFFB}\u{101FD}\u{102E0}\u{10376}-\u{1037A}\u{10A01}-\u{10A0F}\u{10A38}-\u{10A3F}\u{10AE5}-\u{10AE6}\u{10D24}-\u{10D27}\u{10D69}-\u{10D6D}\u{10EAB}-\u{10EAC}\u{10ECB}-\u{10ECF}\u{10EF0}-\u{10EFF}\u{10F46}-\u{10F50}\u{10F82}-\u{10F85}\u{11001}\u{11038}-\u{11046}\u{11070}\u{11073}-\u{11074}\u{1107F}-\u{11081}\u{110B3}-\u{110B6}\u{110B9}-\u{110BA}\u{110BD}\u{110C2}\u{110CD}\u{11100}-\u{11102}\u{11127}-\u{1112B}\u{1112D}-\u{11134}\u{11173}\u{11180}-\u{11181}\u{111B6}-\u{111BE}\u{111C9}-\u{111CC}\u{111CF}\u{1122F}-\u{11231}\u{11234}\u{11236}-\u{11237}\u{1123E}\u{11241}\u{112DF}\u{112E3}-\u{112EA}\u{11300}-\u{11301}\u{1133B}-\u{1133C}\u{11340}\u{11366}-\u{11374}\u{113BB}-\u{113C0}\u{113CE}\u{113D0}\u{113D2}\u{113E1}-\u{113E2}\u{11438}-\u{1143F}\u{11442}-\u{11444}\u{11446}\u{1145E}\u{114B3}-\u{114B8}\u{114BA}\u{114BF}-\u{114C0}\u{114C2}-\u{114C3}\u{115B2}-\u{115B5}\u{115BC}-\u{115BD}\u{115BF}-\u{115C0}\u{115DC}-\u{115DD}\u{11633}-\u{1163A}\u{1163D}\u{1163F}-\u{11640}\u{116AB}\u{116AD}\u{116B0}-\u{116B5}\u{116B7}\u{1171D}\u{1171F}\u{11722}-\u{11725}\u{11727}-\u{1172B}\u{1182F}-\u{11837}\u{11839}-\u{1183A}\u{1193B}-\u{1193C}\u{1193E}\u{11943}\u{119D4}-\u{119DB}\u{119E0}\u{11A01}-\u{11A0A}\u{11A33}-\u{11A38}\u{11A3B}-\u{11A3E}\u{11A47}\u{11A51}-\u{11A56}\u{11A59}-\u{11A5B}\u{11A8A}-\u{11A96}\u{11A98}-\u{11A99}\u{11B60}\u{11B62}-\u{11B64}\u{11B66}\u{11C30}-\u{11C3D}\u{11C3F}\u{11C92}-\u{11CA7}\u{11CAA}-\u{11CB0}\u{11CB2}-\u{11CB3}\u{11CB5}-\u{11CB6}\u{11D31}-\u{11D45}\u{11D47}\u{11D90}-\u{11D91}\u{11D95}\u{11D97}\u{11DF0}\u{11EF3}-\u{11EF4}\u{11F00}-\u{11F01}\u{11F36}-\u{11F3A}\u{11F40}\u{11F42}\u{11F5A}\u{13430}-\u{13440}\u{13447}-\u{13455}\u{1611E}-\u{16129}\u{1612D}-\u{1612F}\u{16AF0}-\u{16AF4}\u{16B30}-\u{16B36}\u{16F4F}\u{16F8F}-\u{16F92}\u{16FE4}\u{1BC9D}-\u{1BC9E}\u{1BCA0}-\u{1BCA3}\u{1CF00}-\u{1CF46}\u{1D127}-\u{1D128}\u{1D167}-\u{1D169}\u{1D173}-\u{1D182}\u{1D185}-\u{1D18B}\u{1D1AA}-\u{1D1AD}\u{1D242}-\u{1D244}\u{1D25B}-\u{1D25C}\u{1DA00}-\u{1DA36}\u{1DA3B}-\u{1DA6C}\u{1DA75}\u{1DA84}\u{1DA9B}-\u{1DAAF}\u{1E000}-\u{1E02A}\u{1E08F}\u{1E130}-\u{1E136}\u{1E2AE}\u{1E2EC}-\u{1E2EF}\u{1E4EC}-\u{1E4EF}\u{1E5EE}-\u{1E5EF}\u{1E6E3}\u{1E6E6}\u{1E6EE}-\u{1E6EF}\u{1E6F5}\u{1E8D0}-\u{1E8D6}\u{1E944}-\u{1E94A}\u{E0001}-\u{E01EF}]/u
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
  return ZERO.test(ch) ? [] : WIDE.test(ch) ? [cell, { ...cell, ch: '' }] : [cell]
})))

const cellsOf = line => [...line].reduce((cells, ch) => {
  if (!ZERO.test(ch)) cells.push(...(WIDE.test(ch) ? [ch, ''] : [ch]))
  else if (cells.length) cells[cells.length - 1] += ch
  return cells
}, [])

const isText = (row, c) => {
  const cell = row[c], before = row[c - 1]?.ch ?? ' ', after = row[c + 1]?.ch ?? ' '
  if (!cell || GLYPH.test(cell.ch)) return false
  if ('<>'.includes(cell.ch) && /[─┄━╌┈═○┼╫]/.test(before + after)) return false
  if ('ΛV'.includes(cell.ch) && !/\w/.test(before + after)) return false
  return true
}

const lostText = (art, svgs, add) => {
  const lines = art.art.split('\n').map(cellsOf), width = Math.max(...lines.map(l => l.length))
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
  const rows = art.art.split('\n').map(cellsOf)
  rows.forEach((row, r) => {
    const line = row.join('')
    for (let c = 1; c < row.length - 1; c++) {
      const ch = row[c], before = row.slice(0, c), joined = /─/.test(row[c - 1] + row[c + 1])
      if (ch && '┬┤├'.includes(ch) && before.lastIndexOf('╭') > before.lastIndexOf('╮') && row.indexOf('╮', c) > -1 && joined && !VBAR.test(rows[r - 1]?.[c] ?? ' ')) add('merged-box', r, line)
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
