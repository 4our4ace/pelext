import type { PelePalette } from './pelext.js'

const palette = (p: Omit<PelePalette, 'border' | 'hues'>): PelePalette => ({ ...p, border: p.line, hues: p.series })

export const PALETTES: Record<string, PelePalette> = {
  'catppuccin-mocha': palette({ canvas: '#1e1e2e', text: '#cdd6f4', muted: '#9399b2', line: '#89b4fa', accent: '#cba6f7', critical: '#f38ba8', highlight: '#f5c2e7', series: ['#89b4fa', '#a6e3a1', '#f9e2af', '#f5c2e7', '#89dceb', '#f38ba8', '#cba6f7'] }),
  'catppuccin-latte': palette({ canvas: '#eff1f5', text: '#4c4f69', muted: '#6c6f85', line: '#1e66f5', accent: '#8839ef', critical: '#d20f39', highlight: '#ea76cb', series: ['#1e66f5', '#40a02b', '#df8e1d', '#ea76cb', '#209fb5', '#d20f39', '#8839ef'] }),
  dracula: palette({ canvas: '#282a36', text: '#f8f8f2', muted: '#6272a4', line: '#bd93f9', accent: '#bd93f9', critical: '#ff79c6', highlight: '#ff79c6', series: ['#8be9fd', '#bd93f9', '#ff79c6', '#ffb86c', '#f1fa8c'] }),
  nord: palette({ canvas: '#2e3440', text: '#d8dee9', muted: '#81a1c1', line: '#81a1c1', accent: '#88c0d0', critical: '#81a1c1', highlight: '#b48ead', series: ['#88c0d0', '#b48ead', '#8fbcbb', '#81a1c1', '#a3be8c'] }),
  'tokyo-night': palette({ canvas: '#1a1b26', text: '#c0caf5', muted: '#9aa5ce', line: '#7aa2f7', accent: '#bb9af7', critical: '#bb9af7', highlight: '#f7768e', series: ['#73daca', '#ff9e64', '#7dcfff', '#f7768e', '#2ac3de', '#bb9af7', '#9ece6a'] }),
  'gruvbox-dark': palette({ canvas: '#282828', text: '#ebdbb2', muted: '#a89984', line: '#83a598', accent: '#d3869b', critical: '#fe8019', highlight: '#d3869b', series: ['#83a598', '#d3869b', '#fabd2f', '#8ec07c', '#fe8019', '#b8bb26'] }),
  'gruvbox-light': palette({ canvas: '#fbf1c7', text: '#3c3836', muted: '#7c6f64', line: '#076678', accent: '#8f3f71', critical: '#af3a03', highlight: '#8f3f71', series: ['#076678', '#8f3f71', '#b57614', '#427b58', '#af3a03', '#79740e'] }),
  'rose-pine': palette({ canvas: '#191724', text: '#e0def4', muted: '#908caa', line: '#c4a7e7', accent: '#c4a7e7', critical: '#eb6f92', highlight: '#ebbcba', series: ['#c4a7e7', '#ebbcba', '#9ccfd8', '#eb6f92', '#f6c177'] }),
  'rose-pine-dawn': palette({ canvas: '#faf4ed', text: '#464261', muted: '#797593', line: '#907aa9', accent: '#907aa9', critical: '#b4637a', highlight: '#d7827e', series: ['#907aa9', '#d7827e', '#286983', '#b4637a', '#ea9d34'] }),
  everforest: palette({ canvas: '#2d353b', text: '#d3c6aa', muted: '#9da9a0', line: '#7fbbb3', accent: '#a7c080', critical: '#e67e80', highlight: '#d699b6', series: ['#7fbbb3', '#d699b6', '#e69875', '#83c092', '#e67e80', '#a7c080'] }),
  'github-dark': palette({ canvas: '#0d1117', text: '#e6edf3', muted: '#7d8590', line: '#58a6ff', accent: '#d2a8ff', critical: '#ff7b72', highlight: '#d2a8ff', series: ['#58a6ff', '#79c0ff', '#d2a8ff', '#7ee787', '#ff7b72', '#a5d6ff'] }),
  'github-light': palette({ canvas: '#ffffff', text: '#1f2328', muted: '#656d76', line: '#0969da', accent: '#8250df', critical: '#cf222e', highlight: '#8250df', series: ['#0969da', '#0550ae', '#8250df', '#116329', '#cf222e', '#0a3069'] }),
  'one-dark': palette({ canvas: '#282c34', text: '#abb2bf', muted: '#828997', line: '#61afef', accent: '#c678dd', critical: '#e06c75', highlight: '#c678dd', series: ['#61afef', '#d19a66', '#e06c75', '#c678dd', '#56b6c2', '#98c379'] }),
  'solarized-dark': palette({ canvas: '#002b36', text: '#93a1a1', muted: '#657b83', line: '#268bd2', accent: '#6c71c4', critical: '#cb4b16', highlight: '#d33682', series: ['#268bd2', '#859900', '#b58900', '#d33682', '#2aa198', '#cb4b16', '#6c71c4'] }),
  'solarized-light': palette({ canvas: '#fdf6e3', text: '#586e75', muted: '#839496', line: '#268bd2', accent: '#6c71c4', critical: '#cb4b16', highlight: '#d33682', series: ['#268bd2', '#859900', '#b58900', '#d33682', '#2aa198', '#cb4b16', '#6c71c4'] }),
  mono: palette({ canvas: '#000000', series: [] }),
}
