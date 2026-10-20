import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import { defects } from './detect.mjs'
import { PALETTES, THEMES, drawWithSvg, enginePath, fanOut, loadEngine, parseArgs, readSources, sourceDirs } from './lib.mjs'

if (!isMainThread) {
  const { engine, dirs, themes, widths, index, count } = workerData
  const drawPele = await loadEngine(engine), found = []
  let total = 0, missed = 0
  for (const { file, source } of readSources(dirs).filter((_, i) => i % count === index)) {
    for (const theme of themes) for (const columns of widths) {
      total++
      const { art, svg } = drawWithSvg(drawPele, source, PALETTES[theme], columns)
      if (!art) { missed++; continue }
      for (const [kind, list] of Object.entries(defects(art, svg, PALETTES[theme]))) found.push({ kind, type: art.type, at: `${file} ${theme} ${columns}`, detail: list[0] })
    }
  }
  parentPort.postMessage({ total, missed, found })
} else {
  const options = parseArgs(process.argv.slice(2), { engine: 'src/pelext.ts', themes: THEMES.join(','), widths: '40,60,80,100,160', examples: '3' })
  const parts = await fanOut(import.meta.url, { engine: enginePath(options.engine), dirs: sourceDirs(options.rest), themes: options.themes.split(','), widths: options.widths.split(',').map(Number) })
  const total = parts.reduce((n, p) => n + p.total, 0), missed = parts.reduce((n, p) => n + p.missed, 0), found = parts.flatMap(p => p.found).sort((a, b) => a.at.localeCompare(b.at))
  console.log(`${total} drawings, ${missed} not drawn, ${new Set(found.map(f => f.at)).size} with defects`)
  for (const kind of [...new Set(found.map(f => f.kind))].sort()) {
    const hits = found.filter(f => f.kind === kind), types = {}
    for (const f of hits) types[f.type] = (types[f.type] ?? 0) + 1
    console.log(`\n${kind} ${hits.length}: ${Object.entries(types).map(([t, n]) => `${t} ${n}`).join(', ')}`)
    for (const f of hits.slice(0, Number(options.examples))) console.log(`  ${f.at} ${f.detail}`)
  }
}
