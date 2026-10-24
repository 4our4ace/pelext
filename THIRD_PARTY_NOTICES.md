# Third-party notices

pelext bundles no third-party code. [Pele](https://github.com/obsidianmd/pele) (MIT, Copyright (c) 2026 kepano) is a peer dependency, installed next to pelext and imported by `pelext/pele` and the CLI.

## Color palettes

Each palette in `src/palettes.ts` maps a published color scheme onto pelext's palette fields. All are MIT licensed.

| Palette | Source | Copyright |
| --- | --- | --- |
| `catppuccin-mocha`, `catppuccin-latte` | [catppuccin/palette](https://github.com/catppuccin/palette) | Copyright (c) 2021 Catppuccin |
| `dracula` | [dracula/dracula-theme](https://github.com/dracula/dracula-theme) | Copyright (c) 2023 Dracula Theme |
| `nord` | [nordtheme/nord](https://github.com/nordtheme/nord) | Copyright (c) 2016-present Sven Greb |
| `tokyo-night` | [tokyo-night/tokyo-night-vscode-theme](https://github.com/tokyo-night/tokyo-night-vscode-theme) | Copyright (c) 2018-present Enkia |
| `gruvbox-dark`, `gruvbox-light` | [morhetz/gruvbox](https://github.com/morhetz/gruvbox) | Pavel Pertsev, MIT/X11 as stated in its README |
| `rose-pine`, `rose-pine-dawn` | [rose-pine/rose-pine-palette](https://github.com/rose-pine/rose-pine-palette) | Copyright (c) mvllow |
| `everforest` | [sainnhe/everforest](https://github.com/sainnhe/everforest) | Copyright (c) 2019 sainnhe |
| `github-dark`, `github-light` | [primer/primitives](https://github.com/primer/primitives) 7.10.0 | Copyright (c) 2018 GitHub Inc. |
| `one-dark` | [atom/one-dark-syntax](https://github.com/atom/one-dark-syntax) | Copyright (c) 2016 GitHub Inc. |
| `solarized-dark`, `solarized-light` | [altercation/solarized](https://github.com/altercation/solarized) | Copyright (c) 2011 Ethan Schoonover |

## Character widths

The width table in `src/pelext.ts` is generated from the [Unicode Character Database](https://www.unicode.org/ucd/) 18.0.0 (`EastAsianWidth.txt` and `extracted/DerivedGeneralCategory.txt`), under the Unicode License v3:

```
UNICODE LICENSE V3

COPYRIGHT AND PERMISSION NOTICE

Copyright © 1991-2026 Unicode, Inc.

NOTICE TO USER: Carefully read the following legal agreement. BY
DOWNLOADING, INSTALLING, COPYING OR OTHERWISE USING DATA FILES, AND/OR
SOFTWARE, YOU UNEQUIVOCALLY ACCEPT, AND AGREE TO BE BOUND BY, ALL OF THE
TERMS AND CONDITIONS OF THIS AGREEMENT. IF YOU DO NOT AGREE, DO NOT
DOWNLOAD, INSTALL, COPY, DISTRIBUTE OR USE THE DATA FILES OR SOFTWARE.

Permission is hereby granted, free of charge, to any person obtaining a
copy of data files and any associated documentation (the "Data Files") or
software and any associated documentation (the "Software") to deal in the
Data Files or Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, and/or sell
copies of the Data Files or Software, and to permit persons to whom the
Data Files or Software are furnished to do so, provided that either (a)
this copyright and permission notice appear with all copies of the Data
Files or Software, or (b) this copyright and permission notice appear in
associated Documentation.

THE DATA FILES AND SOFTWARE ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF
THIRD PARTY RIGHTS.

IN NO EVENT SHALL THE COPYRIGHT HOLDER OR HOLDERS INCLUDED IN THIS NOTICE
BE LIABLE FOR ANY CLAIM, OR ANY SPECIAL INDIRECT OR CONSEQUENTIAL DAMAGES,
OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THE DATA
FILES OR SOFTWARE.

Except as contained in this notice, the name of a copyright holder shall
not be used in advertising or otherwise to promote the sale, use or other
dealings in these Data Files or Software without prior written
authorization of the copyright holder.
```
