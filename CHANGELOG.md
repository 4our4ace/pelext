# Changelog

## [Unreleased]

## [0.2.1] - 2026-10-22

### Fixed

- State diagrams and flowcharts: a self-loop on a box three rows tall comes back on a row of its own instead of folding onto the box's bottom border, and a self-loop on a slanted shape or below a box shows both of its legs.
- State, class and ER diagrams: two or three self-loops on one side of a box each leave and come back on rows of their own, and a loop's return leg no longer lands on the box's divider.
- Class diagrams and timelines: a member or event level with a row stretched to keep another label's lines together no longer lands on its box's divider or its pill's edge.
- Mindmaps: a branch squeezed to no length at a narrow width ends in a line stub instead of a braille dot.

## [0.2.0] - 2026-10-20

### Fixed

- Mono pie charts: shaded slices no longer stick out half a cell past the round edge.
- Sequence diagrams: a frame's condition label no longer erases the lifelines beside it, and a frame's tab or else label no longer covers the frame's left border.
- Sequence diagrams: a self-message label next to its loop moves one cell out instead of covering the loop's side.
- Class diagrams: a multiplicity label next to a box moves one cell out instead of covering the box's border.
- Flowcharts: a subgraph title with no gap between the edges crossing its band no longer touches an edge.
- Sankey diagrams: a thin flow reaches a node whose top or bottom edge only grazes its row, a label that would hide the end of a flow moves to a free row beside it, and one-cell holes in mono ribbons are filled.
- `npm run defects` and `compare` no longer report lost text for a gantt chart whose last trial layout had different date ticks than the one drawn.

## [0.1.0] - 2026-10-20

The diagram engine of cellsmith 0.1.0 as a package of its own. Every drawing matches cellsmith's.

### Added

- `drawPele(render, source, palette, columns)` draws a Mermaid diagram laid out by Pele as rows of colored terminal cells, and `toAnsi(art)` turns them into escape codes.
- `pelext/palettes`: 16 palettes, from Catppuccin to Solarized, and `mono`.
- `pelext/pele`: Pele's `render` with the 13 diagram types the engine is tested on.
- The `pelext` command: files or stdin, `--theme`, `--cols` and `--plain`.
- `npm run corpus`, `compare` and `defects`: generated diagrams, a before-and-after comparison of every drawing, and a glitch scan.
