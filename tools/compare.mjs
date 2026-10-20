import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import { defects } from './detect.mjs'
import { PALETTES, THEMES, WIDTHS, drawWithSvg, enginePath, fanOut, loadEngine, parseArgs, readSources, sourceDirs } from './lib.mjs'

const kinds = (drawn, palette) => (drawn.art ? Object.keys(defects(drawn.art, drawn.svg, palette)).sort() : ['not drawn'])

if (!isMainThread) {
  const { base, engine, dirs, index, count } = workerData
  const before = await loadEngine(base), after = await loadEngine(engine), changes = []
  let total = 0
  for (const { file, source } of readSources(dirs).filter((_, i) => i % count === index)) {
    for (const theme of THEMES) for (const columns of WIDTHS) {
      total++
      const palette = PALETTES[theme], a = drawWithSvg(before, source, palette, columns), b = drawWithSvg(after, source, palette, columns)
      if (JSON.stringify(a.art) === JSON.stringify(b.art)) continue
      changes.push({ at: `${file} ${theme} ${columns}`, before: kinds(a, palette), after: kinds(b, palette), art: [a.art?.art ?? '(not drawn)', b.art?.art ?? '(not drawn)'] })
    }
  }
  parentPort.postMessage({ total, changes })
} else {
  const { base, engine, show, rest } = parseArgs(process.argv.slice(2), { base: 'HEAD', engine: 'src/pelext.ts', show: '0' })
  const parts = await fanOut(import.meta.url, { base: enginePath(base), engine: enginePath(engine), dirs: sourceDirs(rest) })
  const total = parts.reduce((n, p) => n + p.total, 0), changes = parts.flatMap(p => p.changes).sort((a, b) => a.at.localeCompare(b.at))
  if (!changes.length) {
    console.log(`${total} drawings compared: all identical`)
    process.exit(0)
  }
  const tally = (list, from, to) => {
    const counts = {}
    for (const c of list) for (const kind of c[to]) if (!c[from].includes(kind)) counts[kind] = (counts[kind] ?? 0) + 1
    return Object.entries(counts).map(([kind, n]) => `${kind} ${n}`).join(', ') || 'none'
  }
  const moved = changes.filter(c => c.before.join() !== c.after.join())
  console.log(`${changes.length} of ${total} drawings changed`)
  console.log(`defects added: ${tally(changes, 'before', 'after')}`)
  console.log(`defects removed: ${tally(changes, 'after', 'before')}`)
  for (const c of moved) console.log(`  ${c.at}: ${c.before.join(', ') || 'none'} → ${c.after.join(', ') || 'none'}`)
  for (const c of changes.slice(0, Number(show))) console.log(`\n── ${c.at}\n${c.art[0]}\n── becomes\n${c.art[1]}`)
  process.exit(1)
}
