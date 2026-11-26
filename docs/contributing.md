# Adding or changing a component

## Where it goes

- `src/ui/` — a primitive, usually from shadcn/ui (new-york). Keep the
  shadcn shape (`data-slot`, `cn`, `cva` variants, Radix props passed
  through) so updates from upstream stay easy.
- `src/common/` — a composite of primitives that more than one KentOS
  application needs (form field, stat cards, states).
- `src/charts/` — SVG charts without a charting library.
- `src/layout/` — parts of the application frame (sidebar).
- `src/lib/` — framework-free helpers.

Application-specific components (anything that knows an API, a router or a
domain such as "issue" or "event") stay in the application.

## Adding a shadcn primitive

`packages/components/components.json` configures the shadcn CLI:

```bash
cd packages/components
pnpm dlx shadcn@latest add <name>
```

Then:

1. Replace `@/lib/utils` and `@/components/ui/...` imports with relative
   paths (`../lib/utils`, `./button`).
2. Replace hardcoded values with tokens (see [tokens.md](tokens.md)); match
   heights to `--control-h-*`, radii to `rounded-md`/`rounded-lg`, focus to
   `focus-visible:shadow-(--focus-shadow)`.
3. Translate default texts to Turkish ("Close" → "Kapat").
4. Add peer dependencies to `packages/components/package.json` if the
   component needs a new package (and to the showcase and consumers).

## Checklist

- [ ] Relative imports only; no application code.
- [ ] Tokens only; works in light and dark mode, every density, radius and
      accent (try them in the showcase's "Görünüm" panel).
- [ ] Keyboard and screen-reader behaviour (Radix defaults kept; labels).
- [ ] A demo in `apps/showcase/src/pages/<area>.tsx` with a `Demo` block:
      Turkish title and description, the live example and its code.
- [ ] An entry in [components.md](components.md): import path, parts,
      variants, props, a minimal example, rules.
- [ ] `pnpm check` green here; consumers type-check and build
      (izci: `pnpm -C web components:sync && pnpm -C web build`).

## Breaking changes

Exports are public API. When renaming or changing props, update every
consumer in the same change (search `@kentos/components/<path>` in
`../kentos-izci/web/src`) and mention it in the commit message.
