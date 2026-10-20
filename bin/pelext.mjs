#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { render } from '../dist/pele.js'
import { drawPele, toAnsi } from '../dist/pelext.js'
import { PALETTES } from '../dist/palettes.js'

const USAGE = `Usage: pelext [file.mmd ...] [--theme <name>] [--cols <n>] [--plain]

Draws Mermaid diagrams in the terminal. With no files it reads one diagram from stdin.

  --theme <name>  colors, default catppuccin-mocha: ${Object.keys(PALETTES).join(', ')}
  --cols <n>      the width to fit, default the terminal's
  --plain         characters only, no color`

const fail = message => {
  console.error(`pelext: ${message}\n\n${USAGE}`)
  process.exit(2)
}

const args = process.argv.slice(2)
const flag = name => args.includes(name) && args.splice(args.indexOf(name), 1).length > 0
const option = name => {
  const i = args.indexOf(name)
  if (i < 0) return undefined
  if (i + 1 >= args.length) fail(`${name} needs a value`)
  return args.splice(i, 2)[1]
}

if (flag('--help') || flag('-h')) {
  console.log(USAGE)
  process.exit(0)
}
const plain = flag('--plain')
const theme = option('--theme') ?? 'catppuccin-mocha'
const columns = Number(option('--cols') ?? (process.stdout.columns || process.env.COLUMNS || 80))
const unknown = args.find(a => a.startsWith('-') && a !== '-')
if (unknown) fail(`unknown option ${unknown}`)
if (!PALETTES[theme]) fail(`unknown theme ${theme}`)
if (!Number.isInteger(columns) || columns < 20) fail('--cols takes a whole number of at least 20')
if (!args.length && process.stdin.isTTY) fail('give a file or pipe a diagram in')

const files = args.length ? args : ['-']
let missed = 0
for (const [i, file] of files.entries()) {
  const name = file === '-' ? 'stdin' : basename(file)
  let source
  try {
    source = readFileSync(file === '-' ? 0 : file, 'utf8')
  } catch (error) {
    console.error(`pelext: cannot read ${file}: ${error.code ?? error.message}`)
    missed++
    continue
  }
  const art = drawPele(render, source, PALETTES[theme], columns)
  if (!art) {
    console.error(`pelext: ${name} is not a diagram pelext can draw in ${columns} columns`)
    missed++
    continue
  }
  if (files.length > 1) console.log(`${i ? '\n' : ''}${plain ? name : `\x1b[2m${name}\x1b[0m`}`)
  console.log(plain ? art.art : toAnsi(art).join('\n'))
}
process.exit(missed ? 1 : 0)
