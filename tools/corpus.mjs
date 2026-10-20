import { mkdirSync, writeFileSync } from 'node:fs'

const out = process.argv[2] ?? 'corpus'
const SEEDS = [1, 2, 3], PER_TYPE = 20

let seed = 0
const rnd = () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1))
const pick = a => a[Math.floor(rnd() * a.length)]
const chance = p => rnd() < p
const WORDS = ['API', 'Parse', 'Render', 'cache', 'Queue', 'worker', 'DB', 'auth', 'Login page', 'retry', 'x', 'OK', 'v1.2.3', '100%', 'snake_case', 'a-b-c', 'naïve café', '数据', '日本語テキスト', 'C++', 'GPU', 'long running background job', 'Ship it', 'Draw', 'Edges', 'Layout']
const label = (max = 3) => Array.from({ length: int(1, max) }, () => pick(WORDS)).join(' ')
const plain = (max = 3) => label(max).replace(/[^\w ]/g, '').replace(/\s+/g, ' ').trim() || 'node'
const id = i => 'n' + i

const gens = {
  flowchart() {
    const n = int(2, 9), shapes = [['[', ']'], ['(', ')'], ['([', '])'], ['[[', ']]'], ['[(', ')]'], ['((', '))'], ['{', '}'], ['{{', '}}'], ['>', ']'], ['[/', '/]'], ['[\\', '\\]'], ['[/', '\\]'], ['[\\', '/]']]
    const lines = [`flowchart ${pick(['TD', 'LR', 'RL', 'BT'])}`]
    for (let i = 0; i < n; i++) { const [a, b] = pick(shapes); lines.push(`  ${id(i)}${a}"${label(4)}"${b}`) }
    for (let i = 1; i < n + int(0, 3); i++) {
      const a = int(0, Math.min(i, n) - 1), b = i < n ? i : int(0, n - 1), arrow = pick(['-->', '---', '-.->', '==>', '--o', '--x', '<-->'])
      lines.push(`  ${id(a)} ${arrow}${chance(0.4) ? `|${plain(3)}|` : ''} ${id(b)}`)
    }
    if (chance(0.4) && n > 3) lines.push(`  subgraph s1 [${plain(2)}]`, `    ${id(n - 1)}`, `    ${id(n - 2)}`, '  end')
    return lines.join('\n')
  },
  sequence() {
    const n = int(2, 6), names = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i))
    const lines = ['sequenceDiagram']
    if (chance(0.3)) lines.push('  autonumber')
    for (const p of names) lines.push(`  ${chance(0.2) ? 'actor' : 'participant'} ${p}${chance(0.6) ? ` as ${plain(3)}` : ''}`)
    const msg = () => { const a = pick(names), b = pick(names); return `${a}${pick(['->>', '-->>', '-)', '-x', '->', '-->'])}${b}: ${plain(chance(0.3) ? 6 : 3)}` }
    for (let k = int(3, 10); k > 0; k--) {
      const r = rnd()
      if (r < 0.12) lines.push(`  loop ${plain(4)}`, `    ${msg()}`, '  end')
      else if (r < 0.22) lines.push(`  alt ${plain(3)}`, `    ${msg()}`, `  else ${plain(3)}`, `    ${msg()}`, '  end')
      else if (r < 0.28) lines.push(`  opt ${plain(3)}`, `    ${msg()}`, '  end')
      else if (r < 0.33) lines.push(`  par ${plain(2)}`, `    ${msg()}`, `  and ${plain(2)}`, `    ${msg()}`, '  end')
      else if (r < 0.37) lines.push(`  critical ${plain(2)}`, `    ${msg()}`, '  end')
      else if (r < 0.41) lines.push(`  rect rgb(${int(20, 200)}, ${int(20, 200)}, ${int(20, 200)})`, `    ${msg()}`, '  end')
      else if (r < 0.5) lines.push(`  Note ${pick(['left of', 'right of', 'over'])} ${pick(names)}${chance(0.3) && n > 1 ? `,${names[1]}` : ''}: ${plain(4)}`)
      else lines.push(`  ${msg()}`)
    }
    return lines.join('\n')
  },
  class() {
    const n = int(2, 6), names = Array.from({ length: n }, () => plain(1).replace(/\W/g, '') + int(1, 99))
    const lines = ['classDiagram']
    for (const c of names) {
      lines.push(`  class ${c} {`)
      for (let k = int(0, 3); k > 0; k--) lines.push(`    ${pick(['+', '-', '#', ''])}${pick(['String', 'int', 'List~int~', 'bool'])} ${plain(1).replace(/\W/g, '').toLowerCase() || 'f'}`)
      for (let k = int(0, 3); k > 0; k--) lines.push(`    ${pick(['+', '-'])}${plain(1).replace(/\W/g, '').toLowerCase() || 'm'}(${chance(0.5) ? 'x' : ''}) ${pick(['void', 'int', ''])}`.trimEnd())
      lines.push('  }')
    }
    for (let k = int(1, n); k > 0; k--) lines.push(`  ${pick(names)} ${chance(0.4) ? `"${pick(['1', '*', '0..1', '1..*'])}" ` : ''}${pick(['<|--', '*--', 'o--', '-->', '..>', '..|>', '--'])}${chance(0.4) ? ` "${pick(['1', '*', 'many'])}"` : ''} ${pick(names)}${chance(0.4) ? ` : ${plain(2)}` : ''}`)
    return lines.join('\n')
  },
  state() {
    const n = int(2, 7), names = Array.from({ length: n }, (_, i) => 'S' + i)
    const lines = ['stateDiagram-v2', `  [*] --> ${names[0]}`]
    for (const s of names) if (chance(0.5)) lines.push(`  ${s} : ${plain(3)}`)
    for (let k = 1; k < n; k++) lines.push(`  ${names[int(0, k - 1)]} --> ${names[k]}${chance(0.5) ? ` : ${plain(3)}` : ''}`)
    if (chance(0.5)) lines.push(`  ${pick(names)} --> [*]`)
    if (chance(0.3)) lines.push('  state Choice <<choice>>', `  ${names[0]} --> Choice`, `  Choice --> ${pick(names)} : ${plain(2)}`)
    if (chance(0.35)) lines.push(`  state ${plain(1).replace(/\W/g, '') || 'Group'}X {`, '    [*] --> Inner1', `    Inner1 --> Inner2 : ${plain(2)}`, '  }')
    if (chance(0.25)) lines.push(`  note right of ${pick(names)} : ${plain(4)}`)
    return lines.join('\n')
  },
  er() {
    const n = int(2, 5), names = Array.from({ length: n }, () => plain(1).replace(/\W/g, '').toUpperCase() + int(1, 9))
    const lines = ['erDiagram']
    for (let k = 1; k < n + int(0, 2); k++) lines.push(`  ${names[int(0, n - 1)]} ${pick(['||', '|o', '}|', '}o'])}${pick(['--', '..'])}${pick(['||', 'o|', '|{', 'o{'])} ${names[int(0, n - 1)]} : "${plain(2)}"`)
    for (const e of names) if (chance(0.7)) {
      lines.push(`  ${e} {`)
      for (let k = int(1, 4); k > 0; k--) lines.push(`    ${pick(['string', 'int', 'date'])} ${plain(1).replace(/\W/g, '').toLowerCase() || 'col'}${int(1, 9)}${chance(0.3) ? ' PK' : chance(0.2) ? ' FK' : ''}${chance(0.2) ? ` "${plain(3)}"` : ''}`)
      lines.push('  }')
    }
    return lines.join('\n')
  },
  pie() {
    const lines = [`pie${chance(0.3) ? ' showData' : ''}`]
    if (chance(0.6)) lines.push(`  title ${plain(4)}`)
    for (let k = int(1, 10); k > 0; k--) lines.push(`  "${plain(3)} ${k}" : ${pick([int(1, 100), int(1, 5), int(50, 500), 0.5])}`)
    return lines.join('\n')
  },
  gantt() {
    const lines = ['gantt', '  dateFormat YYYY-MM-DD']
    if (chance(0.6)) lines.push(`  title ${plain(4)}`)
    let day = int(1, 25), t = 0
    for (let s = int(1, 3); s > 0; s--) {
      lines.push(`  section ${plain(2)}`)
      for (let k = int(1, 4); k > 0; k--) {
        const tag = pick(['', '', 'done, ', 'active, ', 'crit, ', 'crit, active, ', 'milestone, '])
        lines.push(t && chance(0.4) ? `  ${plain(chance(0.2) ? 6 : 3)} :${tag}t${t + 1}, after t${t}, ${int(1, 6)}d` : `  ${plain(chance(0.2) ? 6 : 3)} :${tag}t${t + 1}, 2026-10-${String(Math.min(28, day)).padStart(2, '0')}, ${int(1, 6)}d`)
        t++; day += int(0, 3)
      }
    }
    return lines.join('\n')
  },
  xychart() {
    const n = int(2, 10), lines = [`xychart-beta${chance(0.25) ? ' horizontal' : ''}`]
    if (chance(0.6)) lines.push(`  title "${plain(4)}"`)
    lines.push(chance(0.7) ? `  x-axis ${chance(0.4) ? `"${plain(2)}" ` : ''}[${Array.from({ length: n }, () => `"${plain(chance(0.2) ? 3 : 1)}"`).join(', ')}]` : `  x-axis ${int(0, 10)} --> ${int(20, 100)}`)
    if (chance(0.6)) lines.push(`  y-axis "${plain(2)}"${chance(0.4) ? ` ${int(-50, 0)} --> ${int(10, 500)}` : ''}`)
    for (let k = int(1, 3); k > 0; k--) lines.push(`  ${pick(['bar', 'line'])} [${Array.from({ length: n }, () => pick([int(0, 100), int(-20, 20), int(100, 900)])).join(', ')}]`)
    return lines.join('\n')
  },
  timeline() {
    const lines = ['timeline']
    if (chance(0.6)) lines.push(`  title ${plain(4)}`)
    for (let s = int(0, 2); s >= 0; s--) {
      if (chance(0.5)) lines.push(`  section ${plain(2)}`)
      for (let k = int(1, 3); k > 0; k--) lines.push(`    ${int(1990, 2030)} : ${Array.from({ length: int(1, 3) }, () => plain(chance(0.2) ? 6 : 3)).join(' : ')}`)
    }
    return lines.join('\n')
  },
  mindmap() {
    const shapes = [['', ''], ['[', ']'], ['(', ')'], ['((', '))'], ['{{', '}}'], [')', '('], ['))', '((']]
    const lines = ['mindmap', `  root((${plain(2)}))`]
    const grow = (depth, indent) => { for (let k = int(1, depth === 1 ? 4 : 3); k > 0; k--) { const [a, b] = pick(shapes); lines.push(`${' '.repeat(indent)}${a}${plain(chance(0.2) ? 5 : 2)}${b}`); if (depth < 3 && chance(0.4)) grow(depth + 1, indent + 2) } }
    grow(1, 4)
    return lines.join('\n')
  },
  quadrant() {
    const lines = ['quadrantChart']
    if (chance(0.6)) lines.push(`  title ${plain(4)}`)
    lines.push(`  x-axis ${plain(1)} --> ${plain(1)}`, `  y-axis ${plain(1)} --> ${plain(1)}`)
    for (let q = 1; q <= 4; q++) if (chance(0.7)) lines.push(`  quadrant-${q} ${plain(2)}`)
    for (let k = int(1, 8); k > 0; k--) lines.push(`  ${plain(chance(0.2) ? 4 : 2)}: [${rnd().toFixed(2)}, ${rnd().toFixed(2)}]`)
    return lines.join('\n')
  },
  gitGraph() {
    const lines = ['gitGraph'], branches = ['main']
    let cur = 'main'
    for (let k = int(3, 12); k > 0; k--) {
      const r = rnd()
      if (r < 0.2 && branches.length < 4) { const b = 'b' + branches.length; branches.push(b); lines.push(`  branch ${b}`); cur = b }
      else if (r < 0.35 && branches.length > 1) { const b = pick(branches); if (b !== cur) { lines.push(`  checkout ${b}`); cur = b } }
      else if (r < 0.45 && branches.length > 1) { const b = pick(branches.filter(x => x !== cur)); lines.push(`  merge ${b}`) }
      else lines.push(`  commit${chance(0.3) ? ` id: "${plain(2)}"` : ''}${chance(0.2) ? ` tag: "v${int(1, 9)}.${int(0, 9)}"` : ''}${chance(0.15) ? ` type: ${pick(['HIGHLIGHT', 'REVERSE'])}` : ''}`)
    }
    return lines.join('\n')
  },
  sankey() {
    const n = int(3, 7), names = Array.from({ length: n }, () => plain(chance(0.2) ? 3 : 1))
    const lines = ['sankey-beta']
    for (let k = int(2, 9); k > 0; k--) { const a = int(0, n - 2), b = int(a + 1, n - 1); lines.push(`${names[a]},${names[b]},${pick([int(1, 100), int(1, 3), int(100, 1000)])}`) }
    return lines.join('\n')
  },
}

const systematic = []
const add = (type, source) => systematic.push([type, source])
const SHAPES = [['[', ']'], ['(', ')'], ['([', '])'], ['[[', ']]'], ['[(', ')]'], ['((', '))'], ['{', '}'], ['{{', '}}'], ['>', ']'], ['[/', '/]'], ['[\\', '\\]'], ['[/', '\\]'], ['[\\', '/]'], ['(((', ')))']]
const ARROWS = ['-->', '---', '-.->', '==>', '--o', '--x', '<-->', '-->|yes|', '-- label -->']
const NAMES = ['Start', 'Parse', 'Render', 'Cache', 'Ship it', 'Draw layout', 'Queue', 'Done']
const node = (id, k, name) => `${id}${SHAPES[k][0]}${name}${SHAPES[k][1]}`
let a = 0
for (const dir of ['TD', 'LR']) for (let i = 0; i < SHAPES.length; i++) for (const j of [0, i, (i + 5) % SHAPES.length]) add('flowchart', `flowchart ${dir}\n  ${node('A', i, NAMES[i % 8])} ${ARROWS[a++ % ARROWS.length]} ${node('B', j, NAMES[(i + 3) % 8])}`)
for (const dir of ['TD', 'LR', 'BT', 'RL']) for (let i = 0; i < SHAPES.length; i += 2) {
  const s = (k) => SHAPES[(i + k) % SHAPES.length]
  add('flowchart', `flowchart ${dir}\n  A${s(0)[0]}Start${s(0)[1]} --> B{Ready?}\n  B -->|yes| C${s(1)[0]}Ship${s(1)[1]}\n  B -->|no| D${s(2)[0]}Fix the build${s(2)[1]}\n  D --> B`)
  add('flowchart', `flowchart ${dir}\n  A${s(3)[0]}Input${s(3)[1]} --> B${s(4)[0]}Parse${s(4)[1]} --> C${s(5)[0]}Layout${s(5)[1]} --> D${s(6)[0]}Draw${s(6)[1]}`)
  add('flowchart', `flowchart ${dir}\n  A[Client] --> B${s(0)[0]}Gateway${s(0)[1]}\n  subgraph S [Services]\n    B --> C${s(1)[0]}Auth${s(1)[1]}\n    B --> D${s(2)[0]}Data${s(2)[1]}\n  end\n  C --> E[(Store)]\n  D --> E`)
  add('flowchart', `flowchart ${dir}\n  A${s(4)[0]}One${s(4)[1]} --> B${s(5)[0]}Two${s(5)[1]}\n  A --> C${s(6)[0]}Three${s(6)[1]}\n  A --> D${s(7)[0]}Four${s(7)[1]}\n  B & C & D --> E${s(8)[0]}Merge${s(8)[1]}`)
}
const MSG = ['->>', '-->>', '->', '-->', '-x', '--x', '-)', '--)']
for (let i = 0; i < MSG.length; i++) {
  add('sequence', `sequenceDiagram\n  participant A as Alice\n  participant B as Bob\n  A${MSG[i]}B: hello there\n  B${MSG[(i + 1) % 8]}A: hi`)
  add('sequence', `sequenceDiagram\n  actor U as User\n  participant S as Server\n  participant D as Database\n  U${MSG[i]}S: request\n  S${MSG[(i + 2) % 8]}D: query\n  D${MSG[(i + 3) % 8]}S: rows\n  S${MSG[(i + 4) % 8]}U: response`)
}
for (const block of ['loop every minute', 'opt if cached', 'critical lock held', 'break on error'])
  add('sequence', `sequenceDiagram\n  participant A\n  participant B\n  participant C\n  A->>B: start\n  ${block}\n    B->>C: work\n    C-->>B: done\n  end\n  B-->>A: finish`)
add('sequence', 'sequenceDiagram\n  participant A\n  participant B\n  alt is ok\n    A->>B: ship\n  else is broken\n    A->>B: fix\n  end')
add('sequence', 'sequenceDiagram\n  participant A\n  participant B\n  participant C\n  par to B\n    A->>B: one\n  and to C\n    A->>C: two\n  end')
add('sequence', 'sequenceDiagram\n  autonumber\n  Alice->>+John: Hello John, how are you?\n  Alice->>+John: John, can you hear me?\n  John-->>-Alice: Hi Alice, I can hear you!\n  John-->>-Alice: I feel great!')
for (const where of ['left of A', 'right of A', 'over A', 'over A,B', 'right of B']) add('sequence', `sequenceDiagram\n  participant A\n  participant B\n  A->>B: ping\n  Note ${where}: a short note\n  B-->>A: pong`)
add('sequence', 'sequenceDiagram\n  participant A\n  A->>A: think it over\n  A->>A: and again')
add('sequence', 'sequenceDiagram\n  participant A as Web\n  participant B as API\n  participant C as Worker\n  participant D as Store\n  A->>D: write directly across everyone\n  D-->>A: ok')
add('sequence', 'sequenceDiagram\n  participant A\n  participant B\n  rect rgb(40, 60, 100)\n    A->>B: inside\n  end\n  A->>B: outside')
add('state', 'stateDiagram-v2\n  [*] --> Idle\n  Idle --> Running : start\n  Running --> Idle : stop\n  Running --> [*]')
add('state', 'stateDiagram-v2\n  [*] --> Active\n  state Active {\n    [*] --> Working\n    Working --> Waiting : block\n    Waiting --> Working : wake\n  }\n  Active --> [*]')
add('state', 'stateDiagram-v2\n  state check <<choice>>\n  [*] --> check\n  check --> Small : n < 10\n  check --> Large : n >= 10')
add('state', 'stateDiagram-v2\n  state fork_state <<fork>>\n  [*] --> fork_state\n  fork_state --> A\n  fork_state --> B\n  state join_state <<join>>\n  A --> join_state\n  B --> join_state\n  join_state --> [*]')
add('state', 'stateDiagram-v2\n  [*] --> Draft\n  Draft --> Review\n  note right of Review : someone reads it\n  Review --> Published\n  Published --> [*]')
add('state', 'stateDiagram-v2\n  direction LR\n  [*] --> A\n  A --> B : go\n  B --> C : go on\n  C --> [*]')
add('state', 'stateDiagram-v2\n  [*] --> Still\n  Still --> [*]\n  Still --> Moving\n  Moving --> Still\n  Moving --> Crash\n  Crash --> [*]')
const REL = ['<|--', '*--', 'o--', '-->', '..>', '..|>', '--', '..']
for (let i = 0; i < REL.length; i++) {
  add('class', `classDiagram\n  class Animal {\n    +String name\n    +eat() void\n  }\n  class Dog {\n    +bark() void\n  }\n  Animal ${REL[i]} Dog`)
  add('class', `classDiagram\n  Order "1" ${REL[i]} "many" Item : contains\n  class Order {\n    +int id\n  }\n  class Item`)
}
add('class', 'classDiagram\n  class Shape {\n    <<interface>>\n    +area() double\n  }\n  Shape <|.. Circle\n  Shape <|.. Square\n  class Circle {\n    -double r\n  }\n  class Square {\n    -double side\n  }')
const CARD = ['||--o{', '}|..|{', '||--||', '|o--o|', '}o--o{', '||--|{']
for (const c of CARD) {
  add('er', `erDiagram\n  CUSTOMER ${c} ORDER : places`)
  add('er', `erDiagram\n  CUSTOMER ${c} ORDER : places\n  CUSTOMER {\n    string name\n    int id PK\n  }\n  ORDER {\n    int id PK\n    int customer FK\n  }`)
}
add('gantt', 'gantt\n  title Plan\n  dateFormat YYYY-MM-DD\n  section Build\n  Design :done, d1, 2026-10-01, 3d\n  Code :active, c1, after d1, 5d\n  section Ship\n  Test :crit, t1, after c1, 2d\n  Release :milestone, m1, after t1, 0d')
add('gantt', 'gantt\n  dateFormat YYYY-MM-DD\n  A task :a1, 2026-10-10, 7d\n  Another task :after a1, 5d')
add('gantt', 'gantt\n  title Week\n  dateFormat YYYY-MM-DD\n  section One\n  Mon :2026-10-19, 1d\n  Tue :2026-10-20, 1d\n  section Two\n  Wed :2026-10-21, 1d\n  Thu to Fri :2026-10-22, 2d')
add('gantt', 'gantt\n  dateFormat YYYY-MM-DD\n  excludes weekends\n  section Long section name that wraps\n  A very long task name for the chart :2026-10-15, 10d')
for (const n of [2, 3, 5, 8]) add('pie', `pie title Share\n${Array.from({ length: n }, (_, i) => `  "${NAMES[i]}" : ${(n - i) * 10}`).join('\n')}`)
add('pie', 'pie showData\n  "Yes" : 70\n  "No" : 30')
add('pie', 'pie\n  "Tiny" : 1\n  "Huge" : 99')
add('mindmap', 'mindmap\n  root((Project))\n    Plan\n      Scope\n      Budget\n    Build\n      Code\n      Test\n    Ship')
add('mindmap', 'mindmap\n  Root\n    A[Square]\n    B(Rounded)\n    C((Circle))\n    D))Bang((\n    E)Cloud(\n    F{{Hexagon}}')
add('mindmap', 'mindmap\n  Engine\n    Layout\n    Drawing\n      Lines\n      Text\n      Fills')
add('timeline', 'timeline\n  title History\n  2024 : Started\n  2025 : Grew : Hired\n  2026 : Shipped')
add('timeline', 'timeline\n  section Early\n    Jan : Idea\n    Feb : Prototype\n  section Late\n    Mar : Beta : Feedback\n    Apr : Launch')
add('gitGraph', 'gitGraph\n  commit\n  branch dev\n  checkout dev\n  commit\n  checkout main\n  merge dev\n  commit')
add('gitGraph', 'gitGraph\n  commit id: "init"\n  commit id: "feat" tag: "v1.0"\n  branch fix\n  commit id: "patch"\n  checkout main\n  merge fix tag: "v1.1"')
add('gitGraph', 'gitGraph TB:\n  commit\n  branch a\n  commit\n  checkout main\n  commit\n  merge a')
add('gitGraph', 'gitGraph\n  commit\n  branch one\n  branch two\n  checkout one\n  commit\n  checkout two\n  commit\n  checkout main\n  merge one\n  merge two')
for (const pts of [[[0.2, 0.8], [0.8, 0.2]], [[0.5, 0.5]], [[0.05, 0.95], [0.95, 0.05], [0.5, 0.95]], [[0.3, 0.3], [0.32, 0.32], [0.7, 0.7]]])
  add('quadrant', `quadrantChart\n  title Priorities\n  x-axis Low effort --> High effort\n  y-axis Low value --> High value\n  quadrant-1 Do now\n  quadrant-2 Plan\n  quadrant-3 Skip\n  quadrant-4 Delegate\n${pts.map(([x, y], i) => `  ${NAMES[i]}: [${x}, ${y}]`).join('\n')}`)
add('quadrant', 'quadrantChart\n  Alpha: [0.1, 0.1]\n  Beta: [0.9, 0.9]')
add('sankey', 'sankey-beta\n  Source,Middle,10\n  Middle,End,10')
add('sankey', 'sankey-beta\n  Solar,Grid,40\n  Wind,Grid,30\n  Grid,Homes,50\n  Grid,Industry,20')
add('sankey', 'sankey-beta\n  A,B,5\n  A,C,15\n  B,D,5\n  C,D,10\n  C,E,5')
add('xychart', 'xychart-beta\n  title Sales\n  x-axis [Jan, Feb, Mar, Apr]\n  y-axis "Units" 0 --> 100\n  bar [20, 45, 70, 90]')
add('xychart', 'xychart-beta\n  x-axis [Q1, Q2, Q3, Q4]\n  line [5, 9, 3, 7]')
add('xychart', 'xychart-beta\n  x-axis [a, b, c, d, e, f]\n  bar [3, 1, 4, 1, 5, 9]\n  line [2, 7, 1, 8, 2, 8]')
add('xychart', 'xychart-beta horizontal\n  x-axis [one, two, three]\n  bar [10, 20, 30]')

const save = (dir, sources) => {
  mkdirSync(`${out}/${dir}`, { recursive: true })
  const count = {}
  for (const [type, source] of sources) {
    count[type] = (count[type] ?? 0) + 1
    writeFileSync(`${out}/${dir}/${type}-${String(count[type]).padStart(3, '0')}.mmd`, `${source}\n`)
  }
  console.log(`${out}/${dir}: ${sources.length} diagrams`)
}

for (const s of SEEDS) {
  seed = s
  save(`random-${s}`, Object.entries(gens).flatMap(([type, gen]) => Array.from({ length: PER_TYPE }, () => [type, gen()])))
}
save('systematic', systematic)
