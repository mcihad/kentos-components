# CLAUDE.md — kentos-components

Read **[AGENTS.md](AGENTS.md)** first: it is the single source of truth for
working on this repository (rules, map, commands, definition of done).

The rules most often broken, repeated here because this file is always loaded:

- Interface text is **Turkish**; **all code is English**.
- Inside `packages/components/src`, import with **relative paths**, never `@/`.
- Use **tokens** (`--surface-*`, `--text-*`, `--control-h-*`, `text-sm`), never
  hex colours, palette ramps or `text-[Npx]` in components.
- The kit knows nothing about izci or any API; applications wrap it.
- Every new or changed component gets a **showcase demo** and an entry in
  `docs/components.md`; finish with `pnpm check` green and consumers building.
