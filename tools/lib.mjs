import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { availableParallelism, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Worker } from 'node:worker_threads'
import { PALETTES } from '../src/palettes.ts'
import { render } from '../src/pele.ts'

const TODAY = Date.UTC(2026, 9, 19, 12), RealDate = Date
globalThis.Date = class extends RealDate {
  constructor(...args) { super(...(args.length ? args : [TODAY])) }
  static now() { return TODAY }
}

export { PALETTES }
export const THEMES = ['catppuccin-mocha', 'github-light', 'mono']
export const WIDTHS = [30, 40, 50, 60, 70, 80, 100, 120, 160]

export const parseArgs = (argv, options) => {
  const args = [...argv], values = {}
  for (const [name, fallback] of Object.entries(options)) {
    const i = args.indexOf(`--${name}`)
    values[name] = i < 0 ? fallback : args.splice(i, 2)[1]
  }
  const unknown = args.find(a => a.startsWith('--'))
  if (unknown) throw new Error(`unknown option ${unknown}`)
  return { ...values, rest: args }
}

export const enginePath = spec => {
  if (existsSync(spec)) return resolve(spec)
  const path = join(tmpdir(), `pelext-${spec.replace(/[^\w.-]/g, '_')}.ts`)
  writeFileSync(path, execFileSync('git', ['show', `${spec}:src/pelext.ts`], { encoding: 'utf8' }))
  return path
}

export const loadEngine = async path => (await import(pathToFileURL(path).href)).drawPele

export const sourceDirs = dirs => (dirs.length ? dirs : ['samples', ...(existsSync('corpus') ? readdirSync('corpus').sort().map(d => `corpus/${d}`) : [])])

export const readSources = dirs => dirs.flatMap(dir => readdirSync(dir).filter(f => f.endsWith('.mmd')).sort().map(f => ({ file: join(dir, f), source: readFileSync(join(dir, f), 'utf8') })))

export const drawWithSvgs = (drawPele, source, palette, columns) => {
  const svgs = []
  const tracked = (text, options) => {
    const result = render(text, options)
    svgs.push(result.svg)
    return result
  }
  const art = drawPele(tracked, source, palette, columns)
  return { art, svgs }
}

export const fanOut = (url, data) => {
  const count = Math.max(1, availableParallelism() - 1)
  return Promise.all(Array.from({ length: count }, (_, index) => new Promise((done, fail) => {
    const worker = new Worker(new URL(url), { workerData: { ...data, index, count } })
    worker.once('message', done)
    worker.once('error', fail)
  })))
}
