---
name: style-guide
description: Dark color palette for the app, with tokens. Use for any style or design change (colors, layout, or appearance).
---
Palette (dark background + cyan/violet), always as tokens — never raw hex in classes:

| Token | Hex | Usage |
|---|---|---|
| bg | #0F172A | page background |
| bg-elevated | #1E293B | cards, headers, elevations |
| text | #E2E8F0 | primary text |
| text-muted | #94A3B8 | secondary text / labels |
| primary | #22D3EE | accents, buttons, links, charts |
| accent | #A78BFA | details, highlights, hover |

Rules:
- Use only classes with these tokens (bg-bg, text-text, bg-primary…). No `bg-[#…]` or default Tailwind colors (cyan-400, violet-400…).
- General dark background (#0F172A). Cards and elevations in bg-elevated (#1E293B) with rounded corners.
- Main button/icon in primary; hover or highlight in accent.
- Dark and legible tone.
