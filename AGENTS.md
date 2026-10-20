# AGENTS.md

pelext draws Mermaid diagrams on a terminal's cell grid. Pele lays a diagram out as SVG; `src/pelext.ts` turns that SVG into rows of colored cells: box-drawing lines, braille curves, block fills and the labels as real text. cellsmith (github.com/4our4ace/cellsmith) vendors `dist/pelext.js`. AI coding agents write and review everything here.

## Layout

| Path | What |
| --- | --- |
| `src/pelext.ts` | the engine: `drawPele`, `toAnsi` and the public types. Pure and import-free, so it can be vendored as one file |
| `src/palettes.ts` | `PALETTES`, the 16 palettes (`pelext/palettes`) |
| `src/pele.ts` | Pele's core with the 13 diagram types the engine is tested on (`pelext/pele`) |
| `dist/` | `npm run build` output, committed so a GitHub install needs no build step; never edited by hand |
| `bin/pelext.mjs` | the command |
| `test/` | `node --test` suites; they import the package by name, so they test `dist/` |
| `samples/` | one `.mmd` per diagram type, drawn in the README images |
| `tools/` | the quality harness: `corpus.mjs` generates diagrams, `compare.mjs` diffs two engines, `defects.mjs` scans for glitches with `detect.mjs`; `lib.mjs` is shared |
| `docs/images/` | README images |

## Rules

- No code comments. The why goes in the commit message.
- Every dependency and copied palette must be MIT. The engine imports nothing; Pele is a peer dependency, TypeScript the only other dev dependency. Add a dependency only when writing it ourselves is unreasonable, and record it in THIRD_PARTY_NOTICES.md.
- Never copy code from other projects. Read them to learn, then write our own.
- Lean: `src/pelext.ts` stays one file of at most 1562 lines. A fix that adds lines pays for them elsewhere.
- Every change to `src/` rebuilds `dist/` in the same commit. After `npm run build`, `git status dist` shows nothing new.
- A change that should not change the look keeps every drawing identical: `npm run compare` says "all identical".
- A change to the look is reviewed drawing by drawing: `npm run compare -- --show 50` until every changed drawing has been looked at. "defects added" must be none, or each one explained in the commit message.
- Every fixed glitch gets a test in `test/pelext.test.mjs` that fails without the fix.
- CHANGELOG entries go under `## [Unreleased]`. Only the release commit sets the version.

## Verify

```
npm test           # tsc build and type check, then the tests
npm run corpus     # once: corpus/ is generated, never committed
npm run compare    # every sample and corpus diagram, 3 palettes, 9 widths, HEAD's engine against src/
npm run defects    # glitch scan of the same set with src/
```

`compare` takes `--base <git ref or file>` (default `HEAD`), `--engine <file>` (default `src/pelext.ts`), `--show <n>` and source folders. It exits with 1 when any drawing changed. `defects` takes `--engine`, `--themes`, `--widths`, `--examples` and source folders. Both spread the work over every CPU but one.

The defect kinds, from `tools/detect.mjs`:

| Kind | Flags |
| --- | --- |
| `lost-text` | a word of the SVG's text that appears nowhere in the drawing |
| `touching` | a vertical border right against a letter |
| `touch-fill` | a letter right against a block fill |
| `nearmiss` | a line end that stops one blank cell short of the glyph it points at |
| `overshoot` | a line that runs on past its arrowhead |
| `gap` | a sequence lifeline broken by one blank cell |
| `on-line` | a sequence label sitting on a lifeline |
| `merged-box`, `double-bar` | sequence boxes sharing a border, two vertical bars side by side |
| `invisible`, `low-contrast`, `low-contrast-canvas` | text in its background's color, under 3:1 against its background, under 2:1 against the canvas |

Run `defects` with `--themes` set to all 16 palette names after a color change: the default checks 3.

## Engine facts that bite

- Pele's `render` runs several times per drawing. A diagram wider than `columns` is laid out again narrower, then top-down; a sequence diagram tries up to 5 configurations. The first diagram of a kind pays Pele's first-run cost, about 30 ms for a flowchart.
- cellsmith runs the engine a handful of times per session, in a runtime that never reaches V8's optimizing tiers. There cost tracks the work done, and destructuring, `for...of`, `matchAll` and callback array helpers in hot loops cost far more than in warm Node. `node --jitless` ranks costs the same way.
- Wide characters (CJK, emoji) take two cells: `charWidth` in the engine and `WIDE` in `tools/detect.mjs` must agree.
- The tools fix "today" at 2026-10-19 so gantt charts, which mark today, draw the same on every run.
- Pele's own releases move layouts: from 1.6.0 to 1.7.0, 162 of 29376 drawings changed, all flowcharts, most with CJK labels. `compare` runs both engines on one Pele, so before bumping Pele run `npm run defects` on the old and the new version and look at the flowcharts and any new defects with `pelext --plain`.

## Release

1. Move the Unreleased entries under the new version and date, and set `version` in `package.json`.
2. `npm test`, `npm run compare`, `npm run defects`.
3. Commit, tag `vX.Y.Z`, push the tag. cellsmith pins pelext by tag.
