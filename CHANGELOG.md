# Changelog

## [Unreleased]

## [0.1.0] - 2026-10-20

The diagram engine of cellsmith 0.1.0 as a package of its own. Every drawing matches cellsmith's.

### Added

- `drawPele(render, source, palette, columns)` draws a Mermaid diagram laid out by Pele as rows of colored terminal cells, and `toAnsi(art)` turns them into escape codes.
- `pelext/palettes`: 16 palettes, from Catppuccin to Solarized, and `mono`.
- `pelext/pele`: Pele's `render` with the 13 diagram types the engine is tested on.
- The `pelext` command: files or stdin, `--theme`, `--cols` and `--plain`.
- `npm run corpus`, `compare` and `defects`: generated diagrams, a before-and-after comparison of every drawing, and a glitch scan.
