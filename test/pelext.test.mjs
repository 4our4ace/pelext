import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { drawPele, toAnsi } from 'pelext'
import { PALETTES } from 'pelext/palettes'
import { render } from 'pelext/pele'

const PIE = 'pie title Where time goes\n  "Layout" : 45\n  "Edges" : 30\n  "Text" : 25'
const FLOW = 'flowchart TD\n  A[Start] --> B{Working?}\n  B -->|yes| C[Ship]\n  B -->|no| D[Debug]'
const WIDE = 'flowchart LR\n  a[User prompt] --> b[Claude Code] --> c[cellsmith] --> d[Pele layout] --> e[Cell grid] --> f[Any terminal]'
const mocha = PALETTES['catppuccin-mocha']

test('every diagram type pelext/pele registers draws', () => {
  const sources = [
    FLOW,
    'sequenceDiagram\n  A->>B: go\n  B-->>A: ok',
    'stateDiagram-v2\n  [*] --> Idle\n  Idle --> [*]',
    'classDiagram\n  class Grid {\n    +width: int\n  }',
    'erDiagram\n  USER ||--o{ SESSION : opens',
    PIE,
    'gantt\n  dateFormat YYYY-MM-DD\n  section Build\n  Parser :a1, 2026-10-18, 2d',
    'xychart-beta\n  x-axis [a, b]\n  bar [1, 2]',
    'timeline\n  0.1 : fork\n  0.2 : Pele',
    'mindmap\n  root((cellsmith))\n    Layout\n    Drawing',
    'quadrantChart\n  x-axis Slow --> Fast\n  y-axis Plain --> Pretty\n  pele: [0.9, 0.8]',
    'gitGraph\n  commit\n  branch pele\n  commit',
    'sankey-beta\nPrompt,Model,10\nModel,Text,6',
  ]
  for (const source of sources) {
    const art = drawPele(render, source, mocha, 120)
    assert.ok(art?.rows.length ?? 0 > 0)
  }
})

test('a chain whose compact layout is still too wide is laid out top-down instead of falling back', () => {
  for (const columns of [70, 90, 100]) {
    const art = drawPele(render, WIDE, mocha, columns)
    assert.ok(art.width <= columns)
    assert.match(art.art, /User prompt[\s\S]*Any terminal/)
  }
})

test('a single-series bar chart keeps one highlight for the tallest bar', () => {
  const art = drawPele(render, 'xychart-beta\n  x-axis [a, b, c]\n  y-axis 0 --> 10\n  bar [2, 9, 5]', mocha, 120)
  const fills = new Set(art.rows.flat().filter(s => /^█+$/.test(s.text)).map(s => s.fg))
  assert.deepEqual([...fills].sort(), [mocha.highlight, mocha.muted].sort())
})

test('tilted git commit labels lie flat and never print over each other', () => {
  const art = drawPele(render, 'gitGraph\n  commit id: "fork"\n  branch pele\n  commit id: "engine"\n  commit id: "colors"\n  checkout main\n  merge pele', mocha, 120)
  for (const label of ['fork', 'engine', 'colors']) assert.match(art.art, new RegExp(`(^|\\s)${label}(\\s|$)`, 'm'))
})

test('nodes inside a subgraph keep their own boxes and labels', () => {
  const art = drawPele(render, 'flowchart LR\n  subgraph Host[Claude Code]\n    R([Reply]) --> P[[cellsmith]]\n  end', mocha, 120)
  assert.match(art.art, /Reply.*►.*cellsmith/)
  assert.ok(art.art.includes('Claude Code'))
})

test('round and slanted node shapes are traced with box lines, not braille', () => {
  const art = drawPele(render, 'flowchart LR\n  A((Circle)) --> B{Decision} --> C{{Hexagon}}\n  C --> D(((Double)))', mocha, 120)
  assert.doesNotMatch(art.art, /[⠁-⣿]/)
  for (const label of ['Circle', 'Decision', 'Hexagon', 'Double']) assert.ok(art.art.includes(label))
})

test('a line chart draws flat steps on the rows of their values over dotted gridlines and ticked axes', () => {
  const art = drawPele(render, 'xychart-beta\n  x-axis [30, 34, 38, 42]\n  y-axis "lead" -2 --> 12\n  line [11, 6, 1, -1]', mocha, 100)
  const lines = art.art.split('\n')
  const at = (label) => lines.findIndex(l => new RegExp(`^\\s*${label}[┤╮┴]`).test(l))
  assert.doesNotMatch(art.art, /[⠁-⣿]/)
  assert.match(art.art, /┤·{10,}/)
  assert.ok(art.art.includes('┬'))
  assert.equal(at('10') - at('12'), 2)
  assert.match(lines[at('12') + 1], /│ +─+╮/)
  assert.match(lines[at('2') + 1], /╰─+╮/)
})

test('a line over bars stays readable and bars stop at their axis', () => {
  const canvas = mocha.canvas
  const art = drawPele(render, 'xychart-beta\n  x-axis [g1, g2, g3]\n  y-axis 0 --> 100\n  bar [40, 62, 80]\n  line [35, 50, 66]', mocha, 100)
  const crossing = art.rows.flat().filter(s => s.bg && /[─│╭╮╰╯]/.test(s.text))
  assert.ok(crossing.length > 0)
  assert.equal(crossing.every(s => s.fg === canvas), true)
  const axis = art.rows.find(r => r.some(s => s.text.includes('┴')))
  assert.equal(axis.every(s => !s.bg), true)
})

test('gantt bars and section bands keep to their own row and leave the axis row bare', () => {
  const art = drawPele(render, 'gantt\n  dateFormat YYYY-MM-DD\n  section Build\n  Parser :a1, 2020-01-01, 2d\n  section Ship\n  Release :crit, b1, after a1, 3d', mocha, 100)
  const axis = art.rows.find(r => r.some(s => /──/.test(s.text)))
  assert.equal(axis.every(s => !s.bg && !/[█▀▄]/.test(s.text)), true)
  assert.equal(art.rows.filter(r => r.some(s => s.bg === mocha.critical)).length, 1)
})

test('a composite state keeps its border and header line, and end states draw as a ring with a dot', () => {
  const art = drawPele(render, 'stateDiagram-v2\n  [*] --> Work\n  state Work {\n    [*] --> Step\n    Step --> [*]\n  }\n  Work --> [*]', mocha, 100)
  assert.match(art.art, /├─+┤/)
  assert.doesNotMatch(art.art, /[▐▌▗▖▝▘]/)
  assert.equal(art.art.match(/◉/g)?.length, 2)
})

test('a point label spilling over a quadrant edge leaves the quadrant boxes their size', () => {
  const art = drawPele(render, 'quadrantChart\n  x-axis Slow --> Fast\n  y-axis Plain --> Pretty\n  a-very-long-point-label: [0.55, 0.55]', mocha, 80)
  const tops = art.art.split('\n').filter(l => l.includes('╮'))
  assert.equal(tops.length, 2)
  for (const top of tops) assert.match(top.trim(), /^╭─+╮╭─+╮$/)
})

test('stacked timeline events stay separate boxes and the pie legend keeps even rows', () => {
  const timeline = drawPele(render, 'timeline\n  Oct 18 : Fork : Engine', mocha, 100).art.split('\n')
  const fork = timeline.findIndex(l => l.includes('Fork')), engine = timeline.findIndex(l => l.includes('Engine'))
  assert.deepEqual(timeline.slice(fork + 1, engine).map(l => l.trim()[0]), ['▀', '▄'])
  const pie = drawPele(render, 'pie\n  "Pele layout" : 52\n  "SVG to cells" : 18\n  "Text placement" : 12\n  "Colors" : 8\n  "Ink tree" : 10', mocha, 100).art.split('\n')
  const rows = ['Pele layout', 'SVG to cells', 'Text placement', 'Colors', 'Ink tree'].map(l => pie.findIndex(line => line.includes(l)))
  assert.deepEqual(rows.slice(1).map((r, i) => r - rows[i]), [1, 1, 1, 1])
})

test('git merge commits draw as a ring with a dot', () => {
  const art = drawPele(render, 'gitGraph\n  commit\n  branch pele\n  commit\n  checkout main\n  merge pele', mocha, 100)
  assert.ok(art.art.includes('◉'))
})

test('the art copy is plain text with the same rows as the drawing', () => {
  const art = drawPele(render, FLOW, mocha, 120)
  const lines = art.art.split('\n')
  assert.equal(lines.length, art.rows.length)
  lines.forEach((line, i) => assert.equal(line, art.rows[i].map(s => s.text).join('').trimEnd()))
})

test('the width counts two cells for each wide emoji in the widest row', () => {
  const cells = line => [...line].reduce((n, ch) => n + (/[✅❌⭐]/u.test(ch) ? 2 : 1), 0)
  for (const columns of [40, 100]) {
    const art = drawPele(render, 'pie\n  "✅ ship ⭐" : 60\n  "❌ drop" : 40', mocha, columns)
    assert.equal(art.width, Math.max(...art.art.split('\n').map(cells)))
  }
})

test('combining marks stay on the letter they mark and take no cell', () => {
  for (const label of ['हिन्दी', 'café', 'がけ']) {
    const art = drawPele(render, `flowchart LR\n  A[${label}] --> B[x]`, mocha, 60)
    const bare = drawPele(render, `flowchart LR\n  A[${label.replace(/\p{Mn}/gu, '')}] --> B[x]`, mocha, 60)
    assert.ok(art.art.includes(label), label)
    assert.equal(art.art.replace(/\p{Mn}/gu, ''), bare.art)
    assert.equal(art.width, bare.width)
  }
})

test('edges run right up to filled nodes', () => {
  const art = drawPele(render, 'mindmap\n  root\n    a\n      b\n        c', mocha, 100)
  assert.match(art.art, /─█a█─+█b█─/)
  assert.doesNotMatch(art.art, /█ *╶|╴ *█/)
})

test('a rotated axis label reads across beside the chart, clear of its border', () => {
  const art = drawPele(render, 'quadrantChart\n  x-axis Rarely --> Often\n  y-axis Easy to draw --> Hard to draw\n  pele: [0.9, 0.8]', mocha, 80)
  assert.match(art.art, /^Hard to +│/m)
  assert.match(art.art, /^ *draw +│/m)
  assert.doesNotMatch(art.art, /^[A-Za-z]│/m)
})

test('the mono theme fills each pie slice with its own shade', () => {
  const mono = PALETTES.mono
  const art = drawPele(render, 'pie\n  "Layout" : 50\n  "Edges" : 30\n  "Text" : 20', mono, 100)
  for (const shade of ['█', '▓', '▒']) assert.ok(art.art.includes(shade))
  assert.match(art.art, /▓ Edges/)
  assert.equal(art.rows.flat().every(s => s.fg === undefined && s.bg === undefined), true)
})

test('a centered label keeps a space on both sides inside its box', () => {
  const art = drawPele(render, 'sequenceDiagram\n  User->>Claude: draw\n  Claude->>Pele: render', mocha, 40)
  assert.match(art.art, /│ User +│/)
  assert.doesNotMatch(art.art, /│[A-Za-z]|[A-Za-z]│/)
})

test('sequence activations, notes and cancels, and state choices keep their glyphs', () => {
  const seq = drawPele(render, 'sequenceDiagram\n  U->>+C: draw\n  Note right of C: busy\n  C-->>-U: art\n  U-xC: cancel', mocha, 60)
  assert.ok(seq.art.includes('┃'))
  assert.ok(seq.art.includes('busy'))
  assert.ok(seq.art.includes('╳'))
  const state = drawPele(render, 'stateDiagram-v2\n  state pick <<choice>>\n  [*] --> pick\n  pick --> Shown: fits\n  pick --> Source: too wide', mocha, 100)
  assert.ok(state.art.includes('◇'))
})

test('a narrow sequence wraps labels at word breaks and keeps them off the lifelines', () => {
  const art = drawPele(render, 'sequenceDiagram\n  participant U as User\n  participant C as Claude\n  participant P as Pele\n  U->>C: draw a diagram\n  C->>P: render(text)\n  P-->>C: SVG\n  C-->>U: text art', mocha, 40)
  assert.ok(art.width <= 40)
  assert.ok(art.art.includes('render(text)'))
  assert.doesNotMatch(art.art, /│[A-Za-z(]|[A-Za-z)]│/)
})

test('a sequence with no clean layout at its width is left to the fallback', () => {
  const source = 'sequenceDiagram\n  participant Alice\n  participant Bob\n  participant Carol\n  participant Dave\n  participant Erin\n  Alice->>Bob: hi\n  Bob->>Carol: hi\n  Carol->>Dave: hi\n  Dave->>Erin: hi\n  Erin-->>Alice: ok'
  assert.equal(drawPele(render, source, mocha, 50), null)
  assert.match(drawPele(render, source, mocha, 80)?.art, /╮ +╭/)
})

test('a chart a few columns too wide is laid out again to fit', () => {
  const art = drawPele(render, 'xychart-beta\n  title "Render time (ms)"\n  x-axis [flow, seq, class, state, er, pie]\n  y-axis "ms" 0 --> 120\n  bar [80, 60, 110, 90, 100, 40]', mocha, 60)
  assert.ok(art?.width ?? 99 <= 60)
})

test('a connector stops at the edge of the box it leaves', () => {
  const art = drawPele(render, 'timeline\n  title cellsmith so far\n  Oct 18 : Fork prismantis : Pele engine in\n  Oct 18 : 3x faster converter : Warm-up at start\n  Oct 19 : Traced node shapes : Git and subgraph fixes\n  Oct 19 : Step line charts : Lowered x axis', mocha, 70)
  const periods = art.art.split('\n').filter(l => /Oct 1\d/.test(l))
  assert.equal(periods.length, 4)
  for (const line of periods) assert.match(line, /█─●/)
})

test('a label on a thin ribbon keeps a space from the line and its node', () => {
  const art = drawPele(render, 'sankey-beta\nSource,Big,95\nSource,Tiny,1\nSource,Small,4\nBig,Sink,95\nTiny,Sink,1', mocha, 100)
  assert.match(art.art, /■ Tiny 1 ─/)
  assert.match(art.art, /─ Small 4 ■/)
})

test('a point label never sits on a quadrant border', () => {
  const art = drawPele(render, 'quadrantChart\n  title Diagram engines\n  x-axis Slow --> Fast\n  y-axis Plain --> Pretty\n  Real SVG: [0.2, 0.85]\n  Pele: [0.8, 0.7]\n  beautiful-mermaid: [0.6, 0.55]', mocha, 100)
  const row = art.art.split('\n').find(l => l.includes('beautiful-mermaid'))
  assert.equal(row.split('│').length - 1, 4)
})

test('mono knocks the shade out around a label and draws tabs in reverse video', () => {
  const mono = PALETTES.mono
  const pie = drawPele(render, 'pie\n  "Layout" : 40\n  "Edges" : 25\n  "Text" : 15\n  "Colors" : 10\n  "Ink" : 10', mono, 100)
  assert.doesNotMatch(pie.art, /[░▒▓]\d|%[░▒▓]/)
  const seq = drawPele(render, 'sequenceDiagram\n  A->>B: go\n  loop each block\n    B->>A: draw\n  end', mono, 60)
  assert.equal(seq.rows.flat().some(s => s.inverse && s.text.includes('loop')), true)
})

test('a message label steps off the lifelines it would cover', () => {
  const art = drawPele(render, 'sequenceDiagram\n  participant Alice\n  participant Bob\n  participant Carol\n  participant Dave\n  participant Erin\n  Alice->>Bob: hi\n  Erin-->>Alice: ok', mocha, 100)
  const row = art.art.split('\n').find(l => /\bok\b/.test(l))
  assert.equal(row.split('│').length - 1, 5)
  assert.match(row, / ok /)
})

test('a frame condition keeps a space from its tab and steps off the lifelines', () => {
  const art = drawPele(render, 'sequenceDiagram\n  autonumber\n  actor U as User\n  participant S as Server\n  U->>+S: request\n  S->>S: self call\n  Note left of U: thinking\n  Note right of S: busy\n  S-->>-U: response\n  opt maybe\n    U-xS: cancel\n  end\n  par one\n    U->>S: a\n  and two\n    S->>U: b\n  end', mocha, 100)
  assert.match(art.art, /█opt█ \[maybe\]/)
  assert.match(art.art, /│ │ \[two\] +│ │/)
  const badges = art.rows.flat().filter(s => /^\d$/.test(s.text))
  assert.equal(badges.length, 6)
  assert.equal(new Set(badges.map(s => s.bg)).size, 1)
})

test('a frame condition that cannot step off a lifeline sits on a backdrop like its tab', () => {
  const art = drawPele(render, 'sequenceDiagram\n  participant C as Claude Code\n  participant P as Render mod\n  participant E as Pele\n  C->>P: render reply\n  loop each mermaid block\n    P->>E: layout(source)\n    E-->>P: SVG\n  end', mocha, 60)
  const spans = art.rows.flat(), tab = spans.find(s => s.text.includes('loop')), condition = spans.find(s => s.text.includes('mermaid'))
  assert.notEqual(condition.bg, undefined)
  assert.equal(condition.bg, tab.bg)
  assert.match(art.art, /█loop██\[each mermaid block\]█/)
})

test('a git tag draws as a one-row pill above its commit', () => {
  const art = drawPele(render, 'gitGraph\n  commit id: "x" tag: "v1"\n  commit id: "y"', mocha, 60)
  assert.match(art.art, /█v1█/)
  assert.doesNotMatch(art.art, /[⠁-⣿]/)
})

test('an actor keeps its whole figure at the bottom, and a two-line name stays on adjacent rows', () => {
  const art = drawPele(render, 'sequenceDiagram\n  actor U as Claude<br/>Code\n  participant P as Pele\n  U->>P: render', mocha, 60)
  const firsts = art.art.split('\n').map(l => l.trim().split(/\s+/)[0])
  assert.deepEqual(firsts.slice(-5), ['○', '┼', 'Λ', 'Claude', 'Code'])
  assert.equal(firsts[firsts.indexOf('Claude') + 1], 'Code')
})

test('a label that would spill past the left edge is drawn whole', () => {
  const art = drawPele(render, 'gitGraph TB:\n  commit id: "a-rather-long-commit-id"\n  commit id: "b"', mocha, 40)
  assert.match(art.art, /^a-rather-long-commit-id +●/m)
})

test('a quadrant chart at 40 columns keeps every point and its two-line axis titles', () => {
  const source = 'quadrantChart\n  x-axis Rarely used --> Often used\n  y-axis Easy to draw --> Hard to draw\n  Flowchart: [0.9, 0.55]\n  Sequence: [0.75, 0.3]\n  Sankey: [0.15, 0.85]\n  Gantt: [0.45, 0.6]\n  Pie: [0.5, 0.25]'
  const art = drawPele(render, source, mocha, 40)
  for (const label of ['Flowchart', 'Sequence', 'Sankey', 'Gantt', 'Pie']) assert.ok(art.art.includes(label))
  assert.equal(art.art.match(/●/g)?.length, 5)
  const lines = art.art.split('\n'), hard = lines.findIndex(l => /^Hard to +│/.test(l))
  assert.match(lines[hard + 1], /^ *draw +│/)
})

test('a wrapped gantt section label keeps each line on its own row', () => {
  const art = drawPele(render, 'gantt\n  dateFormat YYYY-MM-DD\n  section API long running background job\n  Parse :t1, 2026-10-05, 2d\n  Review :milestone, t2, 2026-10-08, 4d\n  Ship :milestone, t3, after t2, 3d\n  Draw :active, t4, after t3, 5d', mocha, 100)
  const lines = art.art.split('\n'), at = (word) => lines.findIndex(l => l.includes(word))
  assert.deepEqual([at('API long'), at('running'), at('background job')].map(r => r - at('API long')), [0, 1, 2])
})

test('a subgraph title Pele outlines with a halo is drawn once, not refused as two labels', () => {
  for (const columns of [40, 80]) {
    const art = drawPele(render, 'flowchart TD\n  a[Start] --> b[Inside]\n  a --> c[Other]\n  b --> d[End]\n  c --> d\n  subgraph s1 [Group title]\n    d\n  end', mocha, columns)
    assert.equal(art.art.match(/Group title/g)?.length, 1)
  }
})

test('label lines that Pele left-aligns in a box stay flush with each other', () => {
  const art = drawPele(render, 'mindmap\n  root((worker v123))\n    v123 long running background job\n      ((GPU API worker cache))\n        [API auth]\n    (nave caf x)', mocha, 60)
  const lines = art.art.split('\n'), start = (word) => lines.find(l => l.includes(word)).indexOf(word)
  assert.equal(start('v123 long'), start('background'))
})

test('a mindmap branch runs right up to its label', () => {
  const art = drawPele(render, 'mindmap\n  cellsmith\n    Drawing\n    Layout', mocha, 80)
  assert.match(art.art, /Layout ─+\(/)
  assert.match(art.art, /\)─+ Drawing/)
})

test('a colored block keeps whole rows where lifelines run through it', () => {
  const art = drawPele(render, 'sequenceDiagram\n  participant A\n  participant B\n  rect rgb(40,40,80)\n    A->>B: in rect\n  end', mocha, 100)
  assert.match(art.art, /█│█in rect/)
  assert.doesNotMatch(art.art, /[▀▄]/)
})

test('the lines of a wrapped point label move together and leave the quadrants their size', () => {
  const lines = drawPele(render, 'quadrantChart\n  a long label that Pele wraps over several lines: [0.62, 0.07]', mocha, 50).art.split('\n')
  for (const top of lines.filter(l => l.includes('╮'))) assert.match(top.trim(), /^╭─+╮╭─+╮$/)
  const middle = (words) => { const line = lines.find(l => l.includes(words)); return line.indexOf(words) + words.length / 2 }
  assert.ok(Math.abs(middle('a long label that') - middle('Pele wraps over')) <= 1)
  assert.ok(Math.abs(middle('a long label that') - middle('several lines')) <= 1)
})

test('a label with no room beside a border sits on a backdrop instead of touching it', () => {
  const art = drawPele(render, 'quadrantChart\n  Draw diagram: [0.15, 0.6]', mocha, 30)
  assert.doesNotMatch(art.art, /│Draw|diagram│/)
  assert.notEqual(art.rows.flat().find(s => s.text === 'Draw').bg, undefined)
})

test('a message label that cannot step off a lifeline sits on a backdrop', () => {
  const art = drawPele(render, 'sequenceDiagram\n  participant A as Alice\n  participant B as Bob\n  participant C as Carol\n  A->>C: send the whole report now\n  C-->>A: ok', mocha, 50)
  const row = art.rows.find(r => r.map(s => s.text).join('').includes('send the whole report now'))
  assert.equal(row.map(s => s.text).join('').split('│').length - 1, 2)
  assert.notEqual(row.find(s => s.text === 'send').bg, undefined)
})

test('a node keeps a space from the subgraph border around it', () => {
  const art = drawPele(render, 'flowchart LR\n  A[Start] --> B([Cache])\n  B --> C([Parse step])\n  subgraph S [Work]\n    B\n    C\n  end', mocha, 50)
  assert.match(art.art, /Parse step/)
  assert.doesNotMatch(art.art, /[)╮╯]│/)
})

test('an arrowhead sits on the border of the node it points at', () => {
  const art = drawPele(render, 'flowchart TD\n  A((Parse layout)) --> B((Render))', mocha, 60)
  assert.match(art.art, /▁▼▁/)
  assert.doesNotMatch(art.art, /▼\n *│/)
})

test('a wrapped gantt section label gets rows of its own instead of running into the next section', () => {
  const two = drawPele(render, 'gantt\n  dateFormat YYYY-MM-DD\n  section Parse the incoming source\n  Read :a1, 2020-01-01, 2d\n  section Draw\n  Paint :a2, after a1, 3d', mocha, 80)
  assert.doesNotMatch(two.art.split('\n').find(l => /^\s*Draw\b/.test(l)), /incoming|source/)
  const three = drawPele(render, 'gantt\n  dateFormat YYYY-MM-DD\n  section retry long running background job\n  OK :t1, 2020-01-01, 3d\n  Ship :t2, after t1, 3d\n  section Draw\n  Paint :t3, after t2, 2d', mocha, 80)
  const lines = three.art.split('\n'), at = (words) => lines.findIndex(l => l.includes(words))
  assert.deepEqual([at('running'), at('background job'), at('Draw')].map(r => r - at('retry long')), [1, 2, 3])
})

test('a self-message label steps off the loop line beside it', () => {
  const art = drawPele(render, 'sequenceDiagram\n  participant A as node\n  participant B as cache DB\n  participant C\n  participant D\n  alt node\n    C->>C: Render long running background job C Layout v123\n  else OK\n    D->>B: abc long running background job\n  end\n  B-)B: snake_case Queue\n  D->D: Parse worker\n  alt v123 retry retry\n    D->B: auth C C\n  else API\n    C-xC: node\n  end', mocha, 70)
  assert.match(art.art, /╯ worker/)
})

test('a stacked axis title keeps every letter', () => {
  const art = drawPele(render, 'xychart-beta\n  title "worker Ship it v123"\n  x-axis 1 --> 35\n  y-axis "long running background job" -34 --> 176\n  bar [1, 10, 2, 591, 5, -14, -8, 92, 53]', mocha, 60)
  assert.equal(art.art.split('\n').map(l => l[0] ?? ' ').join('').replace(/\s/g, ''), 'longrunningbackgroundjob')
})

test('a quadrant label never hides a point marker', () => {
  const source = 'quadrantChart\n  title Login page GPU\n  x-axis Parse --> node\n  y-axis GPU --> abc\n  quadrant-2 x x\n  quadrant-3 long running background job\n  quadrant-4 Ship it C\n  retry: [0.71, 0.67]\n  node: [0.39, 0.23]\n  GPU: [0.84, 0.15]'
  for (const columns of [30, 60, 100]) {
    const art = drawPele(render, source, mocha, columns)
    if (art) assert.equal(art.art.match(/●/g)?.length, 3)
  }
  const crowded = drawPele(render, 'quadrantChart\n  x-axis Parse --> DB\n  y-axis Login page --> worker\n  quadrant-1 auth Ship it\n  quadrant-2 Ship it x\n  quadrant-3 node\n  snake_case Login page: [0.27, 0.98]\n  long running background job 100: [0.33, 0.09]\n  OK: [0.56, 0.32]', mocha, 60)
  assert.equal(crowded.art.match(/●/g)?.length, 3)
  assert.ok(crowded.art.includes('Ship it x'))
})

test('a frame tab whose label sits on its bottom edge stays solid in mono', () => {
  const mono = PALETTES.mono
  const art = drawPele(render, 'sequenceDiagram\n  participant A\n  participant B\n  participant C as retry long running background job worker\n  actor D as C auth\n  participant E as Ship it\n  C-->C: Parse\n  D->>C: x\n  D-->D: GPU C GPU\n  E-->E: Parse long running background job v123\n  alt Edges v123 snake_case\n    E-->>B: v123 OK\n  else 100 OK\n    D-xA: auth x DB\n  end', mono, 60)
  assert.doesNotMatch(art.art.split('\n').find(l => l.includes('alt')), /░/)
})

test('a self-relationship line joins the entity border', () => {
  const art = drawPele(render, 'erDiagram\n  ABC6 |o--|{ SNAKE_CASE2 : "x auth"\n  EDGES7 ||..o{ ABC6 : "long running background job"\n  ABC6 |o..|{ ABC6 : "retry"\n  SNAKE_CASE2 }o--|{ ABC6 : "x"\n  EDGES7 {\n    string node3\n    date cache1 PK\n    int render8 "Layout cache GPU"\n  }\n  RENDER1 {\n    date draw1 "C"\n  }\n  ABC6 {\n    string draw2\n  }', mocha, 80)
  assert.match(art.art, /├┼┄*╯/)
  assert.doesNotMatch(art.art, /│┼┄*╯/)
})

test('a thin flow drawn over a band of its own shade leaves the band shaded in mono', () => {
  const mono = PALETTES.mono
  const art = drawPele(render, 'sankey-beta\nnave caf,Layout,48\nnave caf,Login page,1\nnave caf,Login page,85\nLayout,Login page,381\nLayout,Login page,9\nLayout,Login page,228', mono, 40)
  assert.ok(art.art.includes('Login page 704'))
  assert.doesNotMatch(art.art, /▓█+▒/)
})

test('a wrapped label is never drawn with another label between its lines', () => {
  const source = 'quadrantChart\n  x-axis Layout --> Queue\n  y-axis Ship it --> GPU\n  quadrant-2 long running background job nave caf\n  retry: [0.96, 0.62]\n  API C: [0.32, 0.87]\n  v123 cache: [0.13, 0.93]\n  x Parse: [0.24, 0.19]\n  retry: [0.46, 0.87]\n  Edges: [0.19, 0.09]\n  x abc: [0.56, 0.10]'
  for (const columns of [40, 100]) {
    const art = drawPele(render, source, mocha, columns)
    if (!art) continue
    const lines = art.art.split('\n'), first = lines.findIndex(l => l.includes('long running'))
    assert.match(lines[first + 1], /background job/)
  }
})

test('a subgraph title squeezed against an edge moves along its band to a gap with room', () => {
  const art = drawPele(render, 'flowchart RL\n  n0[/"long running background job snake_case"\\]\n  n1("worker 数据 C++ Login page")\n  n2[["x Login page Parse"]]\n  n3{{"retry 100% Edges"}}\n  n4{{"100%"}}\n  n0 --o|Layout Layout| n1\n  n1 ==>|DB| n2\n  n1 -.-> n3\n  n3 --- n4\n  n4 <--> n2\n  subgraph s1 [GPU nave caf]\n    n4\n    n3\n  end', mocha, 80)
  assert.match(art.art, /│█GPU nave caf█│/)
})

test('a label on a backdrop never runs into the label beside it', () => {
  const source = 'quadrantChart\n  x-axis Login page --> OK\n  y-axis auth --> Ship it\n  quadrant-1 Layout Ship it\n  quadrant-2 retry\n  quadrant-3 Login page\n  quadrant-4 Draw\n  DB: [0.43, 0.80]\n  nave caf Queue: [0.57, 0.09]\n  GPU: [0.76, 0.38]\n  abc: [0.47, 0.50]\n  Render: [0.65, 0.83]\n  v123 100: [0.86, 0.27]\n  cache: [0.26, 0.19]\n  C Queue: [0.25, 0.98]'
  for (const columns of [40, 60, 100]) {
    const art = drawPele(render, source, mocha, columns)
    if (art) assert.doesNotMatch(art.art, /\w█\w/)
  }
})

test('a subgraph border that moves out for a node inside never runs into a node outside', () => {
  const hexagon = 'flowchart RL\n  n0[["naïve café auth Queue 100%"]]\n  n1[/"API 100% retry Edges"/]\n  n2{{"x retry"}}\n  n3>"Login page naïve café auth"]\n  n4{{"OK"}}\n  n0 --x n1\n  n1 --- n2\n  n1 ==>|worker auth| n3\n  n1 -.->|retry| n4\n  n1 ==> n0\n  subgraph s1 [Parse]\n    n4\n    n3\n  end'
  const slope = 'flowchart RL\n  n0[\\"v1.2.3 Ship it v1.2.3 OK"\\]\n  n1(("日本語テキスト a-b-c"))\n  n2{"Edges 日本語テキスト Layout"}\n  n3[/"x auth"\\]\n  n4[["数据 C++ naïve café"]]\n  n5[("数据 retry auth")]\n  n0 --- n1\n  n1 -.->|API| n2\n  n2 --o n3\n  n2 --x n4\n  n2 <--> n5\n  n0 -.-> n1\n  subgraph s1 [auth]\n    n5\n    n4\n  end'
  for (const [source, edge] of [[hexagon, '>'], [slope, '╲']]) {
    const art = drawPele(render, source, mocha, 70)
    assert.ok(art.art.includes(`${edge} │`))
    assert.ok(!art.art.includes(`${edge}│`))
  }
})

test('a stacked axis title starts below a chart title it would touch', () => {
  const source = 'xychart-beta\n  title "Median render time by diagram size (warm cache)"\n  x-axis ["tiny", "small", "medium", "large", "huge"]\n  y-axis "render time in ms" 0 --> 40\n  line [4, 9, 14, 22, 37]'
  for (const columns of [30, 50]) assert.doesNotMatch(drawPele(render, source, mocha, columns).art, /^\w\w/m)
})

test('a mindmap cloud keeps its own border row under the node above', () => {
  const source = 'mindmap\n  root((node))\n    (cache)\n      )node(\n    {{Parse API}}'
  for (const columns of [30, 40]) assert.match(drawPele(render, source, mocha, columns).art, / cache\s*│\n.*╰┬─*╯/)
})

test('two numbers never run together into one', () => {
  const sankey = 'sankey-beta\nC,node,95\nnave caf,100,700\nC,100,1\n100,node,2\nC,node,811\nretry,nave caf,3'
  for (const columns of [60, 80, 160]) assert.doesNotMatch(drawPele(render, sankey, mocha, columns)?.art ?? '', /700\d|7100/)
  const chart = 'xychart-beta horizontal\n  title "OK Layout Login page"\n  x-axis ["v123", "Login page", "Edges", "retry"]\n  y-axis "node"\n  line [3, 865, 4, 598]\n  line [759, 660, -6, 59]\n  line [424, 364, 110, -5]'
  assert.doesNotMatch(drawPele(render, chart, mocha, 30)?.art ?? '', /\d{5}/)
})

test('a self-message label never runs into the participant boxes below', () => {
  const source = 'sequenceDiagram\n    participant L as Team lead\n    participant A as Server\n    participant C as Worker\n    participant M as Reviewers\n    L->>A: opens report (team id, workspace)\n    A->>C: existing request\n    C-->>A: task counts as JSON\n    C->>L: embed in report\n    A->>A: snapshot stored on report\n    L->>A: suggestions with @mentions + attachments\n    M->>A: Draft review\n    A-->>M: draft, Approve / Edit / Reject\n    M->>A: Approve\n    A->>A: store + log, queue, files, reply, announcement'
  for (const columns of [60, 80, 120]) {
    const lines = (drawPele(render, source, mocha, columns)?.art ?? '').split('\n'), foot = lines.findIndex(l => l.includes('┴'))
    assert.equal(lines.slice(foot < 0 ? lines.length : foot).some(l => l.includes('announcement')), false)
  }
})

test('a message label on a coloured block keeps the lifeline beside it whole', () => {
  const source = 'sequenceDiagram\n  participant A as GPU Layout Queue\n  participant B\n  actor C\n  participant D\n  actor E as Edges\n  D->>A: OK\n  rect rgb(41, 58, 74)\n    A-->>D: Ship it\n  end\n  rect rgb(50, 117, 182)\n    E-xB: DB\n  end\n  loop Parse retry GPU\n    C-xA: abc DB 100\n  end\n  alt Layout\n    D-)D: Ship it\n  else cache OK Render\n    A-->A: node\n  end\n  Note right of A: abc\n  critical GPU API\n    B-xC: Edges\n  end\n  rect rgb(165, 47, 98)\n    A-->>B: Render\n  end\n  E-)D: Ship it'
  const lines = drawPele(render, source, mocha, 60).art.split('\n'), row = lines.findIndex(l => l.includes('DB'))
  assert.equal([...lines[row]].some((ch, c) => ch === ' ' && /[│┼]/.test([...lines[row - 1]][c] ?? '') && /[│┼]/.test([...lines[row + 1]][c] ?? '')), false)
})

test('a mindmap that fits around its root keeps its radial layout instead of turning into a tree', () => {
  const source = 'mindmap\n  root((Pele in terminal))\n    Layout\n      measurer\n      cells\n    Drawing\n      box lines\n      braille curves\n    Color\n      truecolor'
  const art = drawPele(render, source, mocha, 80)
  assert.equal(art.art.split('\n').some(l => l.includes('Pele in terminal') && l.includes('Layout')), true)
})

test('a thin sankey flow rising to the top of its node ends in the node bar, not a row above it', () => {
  const mono = PALETTES.mono
  const art = drawPele(render, 'sankey-beta\nAPI,Parse,2\nx,Parse,503\nShip it,Parse,55\nShip it,API,2\nAPI,x,2', mono, 80)
  assert.doesNotMatch(art.art, /╭╴/)
  assert.match(art.art, /╭─+▒/)
})

test('a subgraph a few columns too wide for its border spacing still draws, with the nodes against the border', () => {
  const source = 'flowchart RL\n  n0[\\"v1.2.3 Ship it v1.2.3 OK"\\]\n  n1(("日本語テキスト a-b-c"))\n  n2{"Edges 日本語テキスト Layout"}\n  n3[/"x auth"\\]\n  n4[["数据 C++ naïve café"]]\n  n5[("数据 retry auth")]\n  n0 --- n1\n  n1 -.->|API| n2\n  n2 --o n3\n  n2 --x n4\n  n2 <--> n5\n  n0 -.-> n1\n  subgraph s1 [auth]\n    n5\n    n4\n  end'
  const art = drawPele(render, source, mocha, 60)
  assert.ok(art?.width <= 60)
  assert.doesNotMatch(drawPele(render, source, mocha, 80).art, /│┌┬/)
})

test('a self-loop is drawn with box lines instead of braille dots', () => {
  const source = 'flowchart LR\n  U[You] --> M[Memory tree<br/>builds view]\n  M --> C[claude -p]\n  C -- messages --> M\n  M -. summaries via<br/>claude -p haiku .-> M'
  for (const columns of [80, 120]) {
    const art = drawPele(render, source, mocha, columns).art
    assert.doesNotMatch(art, /[\u2801-\u28ff]/)
    assert.match(art, /╰[─┄]*╯/)
  }
})

test('a self-loop on the side of a three-row box comes back on a row of its own', () => {
  const state = 'stateDiagram-v2\n  [*] --> None\n  None --> Asking: turn ends\n  Asking --> Shown: reply arrives, saved\n  Asking --> None: quit, dropped\n  Shown --> None: you send or /clear, saved empty\n  Shown --> Shown: quit and restart'
  for (const [source, name] of [[state, 'Shown'], ['flowchart TD\n  A[Start] --> A\n  A --> B[End]', 'Start']]) for (const columns of [60, 100]) {
    const lines = drawPele(render, source, mocha, columns).art.split('\n'), at = lines.findIndex(l => l.includes(name)), c = lines[at].indexOf('├─╮')
    assert.ok(c > 0)
    assert.equal(lines[at + 1].slice(c, c + 3), '│◄╯')
  }
})

test('two or three self-loops on one side of a box each leave and come back on rows of their own', () => {
  const two = 'stateDiagram-v2\n  Shown --> Shown: you send your own message\n  Shown --> Shown: Esc or a failed turn\n  Shown --> Gone: you send it\n  Shown --> Gone: illi answers, next one asked'
  for (const columns of [60, 100]) {
    const lines = drawPele(render, two, mocha, columns).art.split('\n'), at = lines.findIndex(l => l.includes('├──╮')), c = lines[at].indexOf('├──╮')
    assert.deepEqual(lines.slice(at, at + 4).map(l => l.slice(c, c + 4)), ['├──╮', '├─╮│', '│◄╯│', '│◄─╯'])
  }
  assert.doesNotMatch(drawPele(render, 'stateDiagram-v2\n  A --> A: one\n  A --> A: two\n  A --> A: three', mocha, 80).art, /╯◄/)
})

test('text level with a row stretched to keep a label\'s lines together gets its own row, not a divider or pill edge', () => {
  const classes = 'classDiagram\n  class GPU2 {\n    #String layout\n    +parse(x) int\n    -parse()\n    +retry()\n  }\n  class Render47 {\n    String api\n    #bool shipit\n    +navecaf(x) int\n    +x() void\n  }\n  class Loginpage48 {\n    -int node\n    -100()\n    -shipit() void\n    +v123() void\n  }\n  GPU2 *-- GPU2 : snake_case'
  const timeline = 'timeline\n    2014 : Layout Draw Edges : OK long running background job Ship it Parse worker Edges\n    1997 : Queue C\n  section 100\n    1996 : abc\n    2026 : Edges : x Queue : v123 abc Parse\n    1998 : cache Login page worker worker : x auth Queue'
  assert.doesNotMatch(drawPele(render, classes, mocha, 100).art, /─[+#~-]?[A-Za-z]/)
  assert.doesNotMatch(drawPele(render, timeline, mocha, 100).art, /[▄▀][A-Za-z0-9]|[A-Za-z0-9][▄▀]/)
})

test('a mindmap branch squeezed to no length ends in a line stub, not a braille dot', () => {
  for (const columns of [30, 50]) assert.doesNotMatch(drawPele(render, 'mindmap\n  root((Project))\n    Plan\n      Scope\n      Budget\n    Build\n      Code\n      Test\n    Ship', mocha, columns).art, /[⠁-⣿]/)
})

test('the lines of a wrapped label stay on consecutive rows', () => {
  const source = 'flowchart LR\n  U[You in illi TUI] --> M[Memory tree<br/>builds view]\n  M --> C["claude -p<br/>system = illi prompt + view<br/>--mcp-config zoom/date"]\n  C -- stream-json --> U\n  C -- messages --> M\n  M -. summaries via<br/>claude -p haiku .-> M'
  const lines = drawPele(render, source, mocha, 120).art.split('\n')
  assert.equal(lines.findIndex(l => l.includes('zoom/date')), lines.findIndex(l => l.includes('--mcp-config')) + 1)
  const members = drawPele(render, 'classDiagram\n  class GPU89 {\n    +int ok\n    int c\n  }\n  class DB11 {\n    -String ok\n    String layout\n    +layout() void\n    +navecaf()\n  }\n  DB11 "*" ..> "many" DB11', PALETTES.mono, 60).art.split('\n')
  assert.equal(members.findIndex(l => l.includes('int c ')), members.findIndex(l => l.includes('+int ok')) + 1)
  assert.doesNotMatch(members.join('\n'), /─\+int ok/)
})

test('a diagram type pelext/pele does not register is not drawn', () => {
  assert.equal(drawPele(render, 'journey\n  title Day\n  section Work\n    Code: 5: Me', mocha, 80), null)
})

test('toAnsi colors each row of the drawing and keeps its characters', () => {
  const art = drawPele(render, PIE, mocha, 80)
  const rows = toAnsi(art)
  assert.equal(rows.length, art.rows.length)
  assert.ok(rows.some(r => r.includes('\x1b[0;38;2;137;180;250m')))
  assert.deepEqual(rows.map(r => r.replace(/\x1b\[[\d;]*m/g, '').trimEnd()), art.art.split('\n'))
})

test('a mono pie draws its shaded slices only on rows the pie covers at least half of', () => {
  const coverage = s => {
    const level = '▁▂▃▄▅▆▇'.indexOf(s.text[0]) + 1
    return s.text.trim() === '' && !s.bg ? 0 : level && !s.bg ? (s.inverse ? 1 - level / 8 : level / 8) : 1
  }
  const source = readFileSync(new URL('../samples/pie.mmd', import.meta.url), 'utf8')
  for (const columns of [40, 60]) {
    const color = drawPele(render, source, mocha, columns), mono = drawPele(render, source, PALETTES.mono, columns)
    const half = color.rows.map(spans => spans.some(s => coverage(s) >= 0.5))
    mono.art.split('\n').forEach((line, r) => { if (/[▓▒░▚]/.test(line.replace(/■.*$/, ''))) assert.ok(half[r], `row ${r}: ${line}`) })
  }
})

const stacked = (art, cell, above, below) => {
  const rows = art.split('\n').map(line => [...line])
  return rows.some((row, r) => row.some((ch, c) => ch === cell && r > 0 && !(cell === ' ' && /\w/.test(row[c - 1] ?? '') && /\w/.test(row[c + 1] ?? '')) && above.includes(rows[r - 1][c]) && below.includes(rows[r + 1]?.[c] ?? '')))
}

test('a sequence frame label never erases the lifelines beside it', () => {
  const art = drawPele(render, 'sequenceDiagram\n  critical Login page\n    A-)A: Layout Ship it Layout Layout Edges\n  end\n  alt Layout Login page Edges\n    B-->>C: DB DB OK\n  else retry\n  end\n  critical worker auth\n  end\n  critical Edges Parse\n  end', mocha, 120)
  assert.ok(!stacked(art.art, ' ', '│┼├┤', '│┼├┤'), art.art)
})

test('a frame tab, an else label or a self-message label never covers the border it meets', () => {
  const cases = [['sequenceDiagram\n  participant A as retry Layout retry\n  participant B as auth\n  actor C as C Layout\n  actor D as C\n  loop long running background job snake_case cache 100\n  end\n  par node\n  end\n  C->B: long running background job Parse\n  loop GPU abc\n    C-->>B: GPU 100\n  end\n  loop v123 Draw\n    C->>C: Layout\n  end', [70, 80, 100, 120]], ['sequenceDiagram\n  participant B as Ship it cache Ship it\n  actor C\n  participant D as nave caf C\n  alt x Queue long running background job\n    C->C: snake_case Edges\n    E-)E: v123 auth\n  end\n  opt Queue DB\n    B->C: long running background job Edges\n  end\n  alt C C\n  else Parse DB Layout\n    C-)E: Layout Draw auth\n  end', [100]], ['sequenceDiagram\n  actor B as Draw C Ship it\n  opt API\n  end\n  loop abc Ship it\n  end\n  loop cache\n  end\n  opt Login page retry retry\n  end\n  C-->C: worker OK auth\n  par Layout\n  end', [100, 160]]]
  for (const [source, widths] of cases) for (const columns of widths) {
    const art = drawPele(render, source, mocha, columns)
    assert.ok(!stacked(art.art, '█', '╭├╮┤', '│├┤╰╯'), art.art)
  }
})

test('a subgraph title with no room between edges hides the edge under its band instead of touching it', () => {
  for (const columns of [60, 100]) assert.doesNotMatch(drawPele(render, 'flowchart LR\n  n3[\\"Draw"/]\n  n5["OK naïve café Layout DB"]\n  n6{"Parse 100%"}\n  n3 ==>|long running background job snake_case Login page| n5\n  n3 <--> n5\n  subgraph s1 [nave caf]\n    n5\n  end', mocha, columns).art, /[│┃]\w|\w[│┃]/)
})

test('a thin sankey flow reaches a node whose edge only grazes its row', () => {
  for (const columns of [30, 40, 50]) assert.doesNotMatch(drawPele(render, 'sankey-beta\nDraw,abc,841\nx,abc,77\nsnake_case,x,11\nsnake_case,Draw,3', mocha, columns).art, /╴ [▁▂▃▄▅▆▇█]/)
})

test('a sankey label that would hide the end of a flow moves to a free row beside it', () => {
  for (const columns of [60, 100]) assert.doesNotMatch(drawPele(render, 'sankey-beta\nnave caf cache DB,nave caf,586\nnave caf,retry,2\nnave caf,Draw,3\nParse snake_case OK,C,627\nretry,Draw,61\nnave caf cache DB,retry,260', PALETTES.mono, columns).art, /[┬┴┼]\w|\w[┬┴┼]/)
})

test('a one-cell hole between two cells of the same shade is filled', () => {
  for (const columns of [30, 100]) assert.doesNotMatch(drawPele(render, 'sankey-beta\nx,node,577\nnode,Render,26\nRender,Layout,129', PALETTES.mono, columns).art, /([▓▒░]) \1/)
})
