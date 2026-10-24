import { readFileSync, writeFileSync } from 'node:fs'

const [eawPath, gcPath] = process.argv.slice(2)
if (!eawPath || !gcPath) throw new Error('usage: node tools/widths.mjs EastAsianWidth.txt DerivedGeneralCategory.txt')

const MAX = 0x110000
const parse = (path, apply) => {
  const text = readFileSync(path, 'utf8')
  const version = /^# \S+-(\d+\.\d+\.\d+)\.txt/m.exec(text)?.[1]
  for (const raw of text.split('\n')) {
    const line = raw.replace(/#.*/, '').trim()
    if (!line) continue
    const [range, value] = line.split(';').map(s => s.trim())
    const [a, b] = range.split('..').map(h => parseInt(h, 16))
    if (!Number.isInteger(a) || a < 0 || a >= MAX || (b !== undefined && (!Number.isInteger(b) || b < a || b >= MAX))) throw new Error(`bad line ${raw}`)
    apply(a, b ?? a, value)
  }
  return version
}

const eaw = new Array(MAX).fill('N')
for (const [a, b] of [[0x3400, 0x4dbf], [0x4e00, 0x9fff], [0xf900, 0xfaff], [0x20000, 0x2fffd], [0x30000, 0x3fffd]]) eaw.fill('W', a, b + 1)
const eawVersion = parse(eawPath, (a, b, v) => { if (!/^(A|F|H|N|Na|W)$/.test(v)) throw new Error(`bad eaw ${v}`); eaw.fill(v, a, b + 1) })

const gc = new Array(MAX).fill('Cn')
const gcVersion = parse(gcPath, (a, b, v) => { if (!/^[A-Z][a-z]$/.test(v)) throw new Error(`bad gc ${v}`); gc.fill(v, a, b + 1) })
if (!eawVersion || eawVersion !== gcVersion) throw new Error(`versions differ: ${eawVersion} ${gcVersion}`)

const JAMO_TRAILING = [[0x1160, 0x11ff], [0xd7b0, 0xd7ff]]
const widthOf = cp => {
  if (gc[cp] === 'Cc') return 0
  if (cp === 0xad) return 1
  if (gc[cp] === 'Mn' || gc[cp] === 'Me' || gc[cp] === 'Cf') return 0
  if (JAMO_TRAILING.some(([a, b]) => cp >= a && cp <= b)) return 0
  if (eaw[cp] === 'W' || eaw[cp] === 'F') return 2
  return 1
}

const widths = new Uint8Array(MAX)
for (let cp = 0; cp < MAX; cp++) widths[cp] = widthOf(cp)

const free = cp => gc[cp] === 'Cn' && eaw[cp] !== 'W' && eaw[cp] !== 'F'
for (let cp = 0; cp < MAX;) {
  if (!free(cp)) { cp++; continue }
  let end = cp
  while (end + 1 < MAX && free(end + 1)) end++
  const before = cp > 0 ? widths[cp - 1] : undefined, after = end + 1 < MAX ? widths[end + 1] : undefined
  if (before !== undefined && before === after && before !== 1) widths.fill(before, cp, end + 1)
  cp = end + 1
}

const points = []
for (let cp = 0; cp < MAX; cp++) if (cp === 0 || widths[cp] !== widths[cp - 1]) points.push([cp, widths[cp]])
if (points[0][1] !== 0) throw new Error('table must start with width 0 at U+0000')
for (let cp = 0; cp < 0x300; cp++) if (widths[cp] !== (cp < 0x20 || (cp >= 0x7f && cp < 0xa0) ? 0 : 1)) throw new Error(`fast path wrong at ${cp.toString(16)}`)

const SEP = '.,:'
let runs = ''
for (let i = 1; i < points.length; i++) runs += (points[i][0] - points[i - 1][0]).toString(36) + SEP[points[i][1]]
const decoded = [[0, 0]]
for (let at = 0, re = /([0-9a-z]+)([.,:])/g, m = re.exec(runs); m; m = re.exec(runs)) decoded.push([at += parseInt(m[1], 36), SEP.indexOf(m[2])])
if (JSON.stringify(decoded) !== JSON.stringify(points)) throw new Error('round trip failed')

const u = cp => `\\u{${cp.toString(16).toUpperCase()}}`
const wide = []
for (let i = 0; i < points.length; i++) if (points[i][1] === 2) wide.push([points[i][0], (points[i + 1]?.[0] ?? MAX) - 1])
const wideClass = `[${wide.map(([a, b]) => (a === b ? u(a) : `${u(a)}-${u(b)}`)).join('')}]`
const check = new RegExp(wideClass, 'u')
for (let cp = 0; cp < MAX; cp++) if (!(cp >= 0xd800 && cp <= 0xdfff) && check.test(String.fromCodePoint(cp)) !== (widths[cp] === 2)) throw new Error(`wide class wrong at ${cp.toString(16)}`)

const rewrite = (path, pattern, text) => {
  const source = readFileSync(path, 'utf8')
  if (source.match(new RegExp(pattern.source, 'gm'))?.length !== 1) throw new Error(`${path}: expected one ${pattern}`)
  const next = source.replace(pattern, () => text)
  writeFileSync(path, next)
  return next !== source
}
const engine = rewrite(new URL('../src/pelext.ts', import.meta.url), /WIDTH_RUNS = '[0-9a-z.,:]*'/m, `WIDTH_RUNS = '${runs}'`)
const detect = rewrite(new URL('detect.mjs', import.meta.url), /^const WIDE = .*$/m, `const WIDE = /${wideClass}/u`)

console.log(`Unicode ${eawVersion}: ${points.length} change points, ${wide.length} wide runs`)
console.log(`src/pelext.ts ${engine ? 'updated' : 'unchanged'}, tools/detect.mjs ${detect ? 'updated' : 'unchanged'}`)
