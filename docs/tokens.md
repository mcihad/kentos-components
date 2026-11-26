# Design tokens

Defined in `packages/components/src/styles/tokens.css` as CSS custom
properties, in layers:

1. **Palette ramps** — raw colours, `--<ramp>-<step>` with ramps `navy`
   (brand), `teal`, `neutral` (cool grey, `0`–`950`), `green`, `amber`, `red`,
   `violet` and steps `50, 100, … 900, 950`. Generated in OKLCH for even
   perceptual steps, written as sRGB hex. **Only token definitions use
   ramps.** Plus `--chrome-*` (dark-mode surfaces), `--tint-900` /
   `--tint-950` (the accent's darkest steps) and categorical chart colours
   `--cat-1` … `--cat-8`.
2. **Semantic tokens** — what components read (below).
3. **Theme scopes** — classes on `<html>` that redefine semantic tokens:
   `.dark`, `.font-*`, `.density-*`, `.radius-*`, `.accent-*`, `.elevation-*`.
4. **Bridge** — shadcn names (`--background`, `--primary`, …) mapped to
   semantic tokens, exposed to Tailwind with `@theme inline` as
   `bg-background`, `text-primary`, `border-border`, ….

## Accent tint

The accent (`.accent-*`) sets the brand tokens and `--tint-900` /
`--tint-950`. Everything that used to be navy-tinted derives from the tint:
shadows and scrollbars (`color-mix(in oklab, var(--tint-900) N%,
transparent)`), the dialog overlay, the tooltip, light-mode headings
(`--text-strong`) and, in dark mode, the whole `--chrome-*` ramp (rebuilt
from the tint for non-navy accents). Never hardcode a navy rgb value: mix the
tint instead, or the accent will stop at the sidebar.

## Semantic colours

| Token                                                                      | Use                                             | Tailwind                                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------- |
| `--surface-page`                                                           | grey page background                            | `bg-background`, `bg-page`                                                 |
| `--surface-card`                                                           | cards, popovers                                 | `bg-card`, `card` utility                                                  |
| `--surface-muted`                                                          | quiet fills (segmented track, empty-state icon) | `bg-muted`                                                                 |
| `--surface-sunken`                                                         | code boxes, footers                             | `bg-sunken`                                                                |
| `--surface-hover`                                                          | hovered rows and items                          | `bg-accent` / `bg-(--surface-hover)`                                       |
| `--surface-selected`                                                       | selected item                                   | `bg-selected`                                                              |
| `--surface-brand-subtle`                                                   | brand-tinted fill                               | `bg-brand-subtle`                                                          |
| `--text-strong`                                                            | headings                                        | `text-strong`                                                              |
| `--text-body`                                                              | body text                                       | `text-foreground`                                                          |
| `--text-muted`                                                             | secondary text                                  | `text-muted-foreground`                                                    |
| `--text-subtle`                                                            | faint text (still ≥ 4.5:1 on cards)             | `text-subtle`                                                              |
| `--text-link`, `--text-link-hover`                                         | links                                           | `text-link`, `hover:text-link-hover`                                       |
| `--text-brand`                                                             | brand-coloured text (readable in both modes)    | `text-brand-ink`                                                           |
| `--brand-bg`, `--brand-fg`                                                 | primary fills and their text                    | `bg-primary text-primary-foreground`                                       |
| `--border-subtle`, `--border-default`, `--border-strong`, `--border-brand` | borders                                         | `border-border`, `border-input`, `border-border-strong`                    |
| `--danger-ink`, `--danger-fg`                                              | destructive actions                             | `text-destructive`, `bg-destructive`                                       |
| `--status-{success,warning,danger,info,neutral}-{bg,fg,border}`            | alerts, badges, banners                         | `bg-status-warning-bg text-status-warning-fg border-status-warning-border` |
| `--focus-ring`, `--focus-shadow`                                           | focus indication                                | `focus-visible:shadow-(--focus-shadow)`                                    |

Rules:

- Coloured **text** uses an `*-fg` or `*-ink` token (contrast 4.5:1), never a
  fill colour: `text-primary` is a fill colour and too dark on dark
  surfaces; use `text-brand-ink` or `text-link`.
- Do not use palette ramps in components; if no token fits, add a semantic
  token (light and `.dark` values) to `tokens.css` and document it here.

## Sizes and motion

| Token                                                                                     | Meaning                                                          |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `--control-h-sm`, `--control-h-md`, `--control-h-lg`                                      | control heights (density-dependent)                              |
| `--control-px-sm`, `--control-px-md`, `--control-px-lg`                                   | control horizontal padding                                       |
| `--row-h`                                                                                 | table row height                                                 |
| `--topbar-h`, `--sidebar-w`, `--sidebar-w-collapsed`                                      | application shell                                                |
| `--footer-h`                                                                              | footer height shared by the sidebar footer and page footers      |
| `--gutter`, `--card-p`, `--content-max-wide`                                              | page gutters, card padding, max content width                    |
| `--card-bg`, `--card-border-color`, `--card-radius`, `--card-shadow`                      | the `card` utility (elevation-dependent)                         |
| `--border-w`, `--border-w-focus`, `--ring-w`, `--ring-offset`                             | strokes                                                          |
| `--duration-sheet`, `--ease-sheet`                                                        | bottom sheet and FAB motion (1ms under `prefers-reduced-motion`) |
| `--duration-fast`, `--duration-base`, `--duration-panel`, `--ease-out`, `--ease-entrance` | motion (zero under `prefers-reduced-motion`)                     |
| `--tracking-tight`, `--tracking-caps`                                                     | letter spacing for headings and caps labels                      |
| `--sidebar-*`, `--topbar-*`, `--table-*`, `--tabs-*`, `--tooltip-*`, `--input-*`          | component-specific tokens                                        |

Use them through Tailwind's arbitrary-value syntax: `h-(--control-h-md)`,
`px-(--gutter)`, `duration-(--duration-fast)`.

## Type

- Families: `--font-family-sans` (Plus Jakarta Sans by default; Inter or IBM
  Plex Sans via `.font-inter` / `.font-plex`) and `--font-family-mono`
  (JetBrains Mono) → `font-sans`, `font-mono`. Monospace is for code and
  identifiers only; ligatures are off for code.
- Scale (`@theme`): `text-2xs` 12px, `text-xs` 13px, `text-sm` 14px,
  `text-md` 15px (body), `text-base` 16px, `text-lg` 18px, `text-xl` 20px,
  `text-2xl` 24px, `text-3xl` 30px, each with its line height. Nothing
  readable below `text-2xs`; no `text-[Npx]`.
- Figures in tables and stats: `tabular` utility (tabular numerals).

## Radii and shadows

`--radius-xs` 3px … `--radius-2xl` 20px (`rounded-*`), redefined by the
`.radius-*` scopes; `--radius` (controls) is `--radius-md`. Shadows
`--shadow-xs` … `--shadow-xl` are navy-tinted.

## Utilities

- `card` — the basic surface: card background, border, radius, shadow.
- `tabular` — tabular numerals.
- `scrollbar-none` — horizontal strips without a visible scrollbar.
- `fade-end` — fade out the end of a horizontally scrolling strip.
- `on-dark` — on dark surfaces (sidebar) use the inverse scrollbar colour.

## Theme scopes

| Class on `<html>`                                                                | Effect                                  |
| -------------------------------------------------------------------------------- | --------------------------------------- |
| `dark`                                                                           | dark mode (layered navy surfaces)       |
| `font-inter`, `font-plex`                                                        | interface typeface (default Jakarta)    |
| `density-compact`, `density-roomy`                                               | control heights, row heights, gutters   |
| `radius-square`, `radius-tight`, `radius-soft`                                   | corner radii (default moderate)         |
| `accent-teal`, `accent-violet`, `accent-green`, `accent-amber`, `accent-neutral` | brand colour (default navy)             |
| `elevation-flat`, `elevation-raised`                                             | card borders/shadows (default bordered) |

Applications set them only through `lib/theme` (see [theming.md](theming.md)).
