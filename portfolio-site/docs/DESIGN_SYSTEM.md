# Portrait color system

The portfolio uses the warm ivory of Sohila's jacket, taupe and cocoa from the scarf and hair, and a muted burgundy accent inspired by the portrait. The photograph, technology marks, dashboard screenshots, and repository diagrams keep their original colors.

## Color authority

[`src/assets/theme.css`](../src/assets/theme.css) is loaded after the component styles and defines the shared tokens. Components use `--brand` for identity and `--action-bg` / `--action-text` for interactive states. The latter pair is intentionally separate so dark-mode buttons retain readable text.

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| `--bg` | `#fbf7f2` | `#211916` | Page canvas |
| `--surface` | `#fffdfa` | `#2b211d` | Cards, fields, menus |
| `--ink` | `#342724` | `#f6ede7` | Headings |
| `--text` | `#4b3b35` | `#e3d2c6` | Body copy |
| `--muted` | `#74635b` | `#c0a99b` | Secondary copy |
| `--line` | `#dfd0c4` | `#5c463c` | Borders and separators |
| `--soft` | `#efe5dc` | `#352820` | Preview and inset surfaces |
| `--brand` | `#743348` | `#ddbba5` | Brand details |
| `--action-bg` | `#743348` | `#ce9a98` | Primary actions and selected filters |
| `--action-text` | `#fffaf6` | `#291b18` | Text on primary actions |
| `--accent` | `#c4a084` | `#c5a085` | Decorative taupe accents |
| `--deep` | `#382724` | `#2d1e1b` | Hero and collaboration section |

## Contrast verification

The following foreground/background pairs were calculated using relative sRGB luminance on 30 October 2026. Each exceeds the 4.5:1 threshold for ordinary text in [WCAG 2.2 SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

| Pair | Light | Dark |
| --- | ---: | ---: |
| Body copy / page | 9.96:1 | 11.77:1 |
| Muted copy / page | 5.35:1 | 7.73:1 |
| Muted copy / surface | 5.62:1 | 7.02:1 |
| Action text / action background | 8.77:1 | 6.88:1 |
| Hero caption / hero background | 8.66:1 | 9.78:1 |
| Interactive-report badge | 6.97:1 | 8.97:1 |

This verifies these token pairs; it is not a certification of every embedded third-party report or asset.

## Interaction rules

- Preserve visible keyboard focus and minimum 44px targets for primary controls.
- Honor `prefers-reduced-motion`; visitors can pause animation.
- Keep continuous motion subtle and limited to the hero. Pause it off screen and in background tabs.
- Show project status and preview type in text, not through color alone.
- Keep reports click-to-load and retain a direct Power BI fallback link.
- Preserve the native dialog focus behavior for screenshots and project search.

The favicon, browser theme color, social card, and selected states use the same palette. Update the SVG and PNG social card together. The 1200 × 630 PNG is used by link previews and the repository README.

## Browser and saved-site icons

The favicon repeats the header's four-tile mark at a six-degree angle: three ivory tiles and one taupe tile on a burgundy rounded square. It uses paths rather than font glyphs so the mark remains consistent at small sizes.

`src/assets/favicon.svg` is the vector source. Matching exports are `favicon-32.png`, `favicon.ico` (16, 32, and 48px), and the opaque 180px `apple-touch-icon.png`. The shared HTML head references these assets with a versioned URL so updated icons can replace cached versions across every generated route. Regenerate all exports from the SVG when the mark changes.
