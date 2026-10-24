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
| `tools/` | the quality harness: `corpus.mjs` generates diagrams, `compare.mjs` diffs two engines, `defects.mjs` scans for glitches with `detect.mjs`; `lib.mjs` is shared; `widths.mjs` regenerates the width table |
| `docs/images/` | README images |

## Rules

- No code comments. The why goes in the commit message.
- Every dependency and copied palette must be MIT; the width table is generated from Unicode's own data, under the Unicode License v3. The engine imports nothing; Pele is a peer dependency, TypeScript the only other dev dependency. Add a dependency only when writing it ourselves is unreasonable, and record it in THIRD_PARTY_NOTICES.md.
- Never copy code from other projects. Read them to learn, then write our own.
- Lean: `src/pelext.ts` stays one file of at most 1562 lines. A fix that adds lines pays for them elsewhere.
- Every change to `src/` rebuilds `dist/` in the same commit. After `npm run build`, `git status dist` shows nothing new.
- A change that should not change the look keeps every drawing identical: `npm run compare` says "all identical".
- A change to the look is reviewed drawing by drawing: `npm run compare -- --show 50` until every changed drawing has been looked at. "defects added" must be none, or each one explained in the commit message.
- Every fixed glitch gets a test in `test/pelext.test.mjs` that fails without the fix.
- CHANGELOG entries go under `## [Unreleased]`. Only the release commit sets the version.

## Palettes

Every palette maps its scheme's published colors onto the fields by one rule, and a new palette follows it too. The scheme's source goes in THIRD_PARTY_NOTICES.md.

- `canvas`: the scheme's default background.
- `line` (and `border`): the faintest tone on the scheme's neutral ramp, from background to body text, that reads at least 3:1 on the canvas. GitHub's ramp is its `fg` tokens.
- `text`: the body text; where `line` already is the body text, the next stronger tone.
- `muted`: the ramp's next tone after `line`, short of `text`, else `line` itself. It also fills the bars that are not the tallest.
- `accent` (and `highlight`): the scheme's named accent, else its signature color. `critical`: its red.
- `series` (and `hues`): the scheme's own blue, orange, green, red, purple, yellow, cyan and pink, in that order, leaving out a hue it has none of. Hues under 3:1 on the canvas move to the end, in the same order.
- `mono`: canvas `#000000` and no other color.

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
| `lost-text` | a word of Pele's text that appears nowhere in the drawing, checked against every layout Pele rendered for it and reported for the one that loses the fewest |
| `touching` | a vertical border right against a letter |
| `touch-fill` | a letter right against a block fill |
| `nearmiss` | a line end that stops one blank cell short of the glyph it points at |
| `overshoot` | a line that runs on past its arrowhead |
| `gap` | a sequence lifeline broken by one blank cell |
| `on-line` | a sequence label sitting on a lifeline |
| `merged-box`, `double-bar` | sequence boxes sharing a border, two vertical bars side by side |
| `invisible`, `low-contrast`, `low-contrast-canvas` | text in its background's color, under 3:1 against its background, under 2:1 against the canvas |

Run `defects` with `--themes` set to all 16 palette names after a color change: the default checks 3.

Known flags that are not glitches: `nearmiss` on xychart line series, which start at the first category, one cell right of the y-axis (11 per palette). Known and accepted: in `mono`, sankey `nearmiss` 4 and `touch-fill` 1, drawn the same since 0.2.1.

## Engine facts that bite

- Pele's `render` runs several times per drawing. A diagram wider than `columns` is laid out again narrower, then top-down; a sequence diagram tries up to 5 configurations. The first diagram of a kind pays Pele's first-run cost, about 30 ms for a flowchart.
- cellsmith runs the engine a handful of times per session, in a runtime that never reaches V8's optimizing tiers. There cost tracks the work done, and destructuring, `for...of`, `matchAll` and callback array helpers in hot loops cost far more than in warm Node. `node --jitless` ranks costs the same way.
- Character widths come from one table generated from Unicode's data. `widthCode` gives each code point one of four codes: 0 for controls, format characters (ZWJ among them) and variation selectors, which the drawing leaves out; 1; 2 for wide and fullwidth characters (CJK, emoji); 3 for combining and enclosing marks and Hangul medial vowels and final consonants, which take no cell and join the cell the label last wrote. `charWidth` folds 3 to 0, so measuring and wrapping count marks as nothing. A cell's text is one character or a letter with its marks, so code that reads `cv.ch` or span text must not assume one code point per cell. `WIDE` and `ZERO` in `tools/detect.mjs` come from the same table and must agree with it.
- `node tools/widths.mjs EastAsianWidth.txt DerivedGeneralCategory.txt` rebuilds the table and both classes in place from a Unicode release's files (unicode.org/Public/<version>/ucd/, the second under `extracted/`). It checks its encoding round trip, the engine's fast path below U+0300 and that nothing below U+1100 is wide (the output loop counts those as one cell unasked), and writes nothing unless every check passes. On a new Unicode version, run it, check `compare` and the tests, and set the version in THIRD_PARTY_NOTICES.md.
- The tools fix "today" at 2026-10-19 so gantt charts, which mark today, draw the same on every run.
- Pele's own releases move layouts: from 1.6.0 to 1.7.0, 162 of 29376 drawings changed, all flowcharts, most with CJK labels. `compare` runs both engines on one Pele, so before bumping Pele run `npm run defects` on the old and the new version and look at the flowcharts and any new defects with `pelext --plain`.

## Release

1. Move the Unreleased entries under the new version and date, and set `version` in `package.json`.
2. `npm test`, `npm run compare`, `npm run defects`.
3. Commit, tag `vX.Y.Z`, push the tag. cellsmith pins pelext by tag.
