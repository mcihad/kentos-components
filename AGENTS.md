# AGENTS.md — kentos-components

Guide for coding agents (and humans) working **on** or **with** the KentOS
component kit. Read this file first; the details are in `docs/`:

| File                                         | What it answers                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------ |
| [docs/integration.md](docs/integration.md)   | How an application installs and wires the kit (CSS, fonts, theme, Toaster, Tooltip). |
| [docs/components.md](docs/components.md)     | Every export: import path, parts, variants, props, a minimal example, rules.         |
| [docs/tokens.md](docs/tokens.md)             | Design tokens: palette, semantic colours, sizes, type scale, theme scopes.           |
| [docs/theming.md](docs/theming.md)           | The appearance system: choices, storage, `theme-init.js`, `useAppearance`.           |
| [docs/patterns.md](docs/patterns.md)         | Page recipes and copy rules (Turkish UI text, layout, accessibility).                |
| [docs/contributing.md](docs/contributing.md) | Adding or changing a component: checklist, showcase demo, verification.              |

## What this is

The **KentOS design system** ("KentOS Yönetim" kit) as one package,
`@kentos/components`: design tokens and theme scopes in Tailwind CSS v4,
shadcn/ui (new-york) primitives on Radix, composites built on them (form
field, input groups, OTP, choice cards, combobox and multi-select,
calendar and date pickers, description list, timeline, data table,
dialogs, drawer, menus, stat cards, empty/error states, appearance panel,
avatar, table classes), the application shell and page frame, two charts
and Turkish formatting and date helpers. It is consumed as **TypeScript source** (no build step)
by Vite + React 19 + Tailwind v4 applications, first of all
[izci](../kentos-izci).

## Repository map

| Path                                    | Content                                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `packages/components/src/ui/`           | shadcn/Radix primitives (button, dialog, select, …). Generated-style code, not linted.          |
| `packages/components/src/common/`       | Generic composites built from the primitives.                                                   |
| `packages/components/src/charts/`       | `StackedBars`, `Sparkline` (SVG, no chart library).                                             |
| `packages/components/src/layout/`       | Application frame: `app-shell.tsx` (AppShell regions), `sidebar.tsx`, `page.tsx` (PageWrapper). |
| `packages/components/src/lib/`          | `utils.ts` (`cn`), `theme.ts` (appearance store), `format.ts` (tr-TR), `search.ts`.             |
| `packages/components/src/styles/`       | `index.css` (single import for apps), `tokens.css`, `fonts.css`.                                |
| `packages/components/src/theme-init.js` | Pre-paint script applying the saved appearance; copied to apps' `public/`.                      |
| `apps/showcase/`                        | The showcase site (Vite): one page per area, live demos with their code.                        |
| `docs/`                                 | Reference for agents and developers (English).                                                  |

## Absolute rules

1. **Language.** Interface text is **Turkish** (labels, defaults such as
   "Kapat", "Yeniden dene", the showcase). **Code is English**: identifiers,
   comments, docs in `docs/`, commit messages.
2. **Relative imports inside the package.** Files under
   `packages/components/src` import each other with relative paths
   (`../lib/utils`), never an `@/` alias: consumers cannot resolve it.
3. **Tokens, not values.** Colours, radii, shadows, control heights, gutters
   and font sizes come from tokens (`bg-(--surface-card)`,
   `text-muted-foreground`, `h-(--control-h-md)`, `text-sm`). Never hardcode
   hex colours, `text-[13px]` or palette ramps (`--navy-700`) in components;
   ramps are only for defining tokens.
4. **No application knowledge.** The kit knows nothing about izci or any
   API: no protobuf types, no routers, no data fetching. Components take
   plain values (`Date`, `number`, `ReactNode`); applications adapt their
   types in thin wrappers.
5. **Stable public API.** Every file is a public entry point
   (`@kentos/components/<dir>/<file>`). Renaming or removing an export breaks
   consumers: search them (`../kentos-izci/web/src`) and update them in the
   same change.
6. **Showcase and docs move with the code.** A new or changed component gets
   a demo in `apps/showcase/src/pages/` and an entry in
   `docs/components.md`.
7. **Accessibility.** Keep Radix semantics; icon-only buttons need
   `aria-label`; dialogs and sheets need a title (use `sr-only` to hide it);
   no readable text under 12px (`text-2xs`); contrast at least 4.5:1 using
   the `*-fg` / `*-ink` tokens for coloured text.

## Commands

```bash
pnpm install         # once, at the repository root
pnpm dev             # showcase on http://localhost:5320
pnpm check           # biome lint, typecheck (kit + showcase), kit tests, showcase build
pnpm typecheck       # tsc for every workspace package
pnpm test            # vitest in packages/components
pnpm format          # biome --write
```

## Using the kit (short version)

```tsx
// package.json (app next to this repository)
"@kentos/components": "file:../../kentos-components/packages/components"

// src/index.css
@import "@kentos/components/styles/index.css";

// any component
import { Button } from "@kentos/components/ui/button";
import { Field } from "@kentos/components/common/field";
import { cn } from "@kentos/components/lib/utils";
```

The `file:` dependency hard-links the kit into the app's `node_modules`:
edits to existing kit files show up in the app at once; after adding or
removing kit files run `pnpm install --force` in the app (izci:
`pnpm -C web components:sync`). See [docs/integration.md](docs/integration.md).

## Definition of done

- `pnpm check` is green in this repository.
- Every consumer still type-checks and builds (izci: `make check` or
  `pnpm -C web typecheck && pnpm -C web build`, which also enforces izci's
  200 KB first-load budget).
- The showcase shows the change, in light and dark mode.
- `docs/components.md` (and `docs/tokens.md` for new tokens) describe it.
