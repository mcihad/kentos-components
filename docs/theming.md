# Appearance and theming

Users personalise the interface per browser with seven choices. Each choice is
a scope class on `<html>` that redefines tokens; components need no props.
The accent recolours the whole interface (brand, headings, shadows,
overlays, tooltips, sidebar and the dark-mode surfaces); see "Accent tint"
in [tokens.md](tokens.md).

| Choice      | Values (default first)                                |
| ----------- | ----------------------------------------------------- |
| `mode`      | `system`, `light`, `dark`                             |
| `font`      | `jakarta`, `inter`, `plex`                            |
| `mono`      | `jetbrains`, `fira`, `plex`, `system`                 |
| `density`   | `standard`, `compact`, `roomy`                        |
| `radius`    | `moderate`, `square`, `tight`, `soft`                 |
| `accent`    | `navy`, `teal`, `violet`, `green`, `amber`, `neutral` |
| `elevation` | `bordered`, `flat`, `raised`                          |

## API (`@kentos/components/lib/theme`)

```ts
type Appearance = { mode; font; mono; density; radius; accent; elevation };

configureAppearance({ storageKey, legacyKey? }) // once, before rendering
useAppearance()   // { appearance, resolved: "light" | "dark", setAppearance, resetAppearance }
setAppearance(patch)  // applies and persists
resetAppearance()     // back to defaults
setTheme(mode)        // shorthand for { mode }
classesOf(appearance) // the scope classes, e.g. ["font-inter", "accent-teal"]
defaultAppearance
```

The store lives outside React (`useSyncExternalStore`), so any component can
read or change it; changes apply immediately to `<html>` and are written to
`localStorage[storageKey]` as JSON. Invalid stored values fall back to the
defaults. `mode: "system"` follows `prefers-color-scheme` live.

## No flash of the wrong theme

`theme-init.js` runs synchronously in `<head>` and applies the stored classes
before the first paint:

```html
<script src="/theme-init.js" data-storage-key="my-app-appearance"></script>
```

It mirrors `classesOf`; when a choice or value is added, change **both**
`lib/theme.ts` and `theme-init.js` (and the copies in applications'
`public/`), plus `tokens.css` for the new scope and the `AppearancePanel`
options. `lib/theme.test.ts` covers `classesOf`.

## UI

`AppearancePanel` (`common/appearance-panel`) renders every choice. izci puts
it in a right-hand sheet opened from the top bar; the showcase does the same
from its "Görünüm" button.

## Adding a scope

1. Add the type and allowed values in `lib/theme.ts` (`allowed`,
   `defaultAppearance`, `classesOf`).
2. Mirror them in `theme-init.js`.
3. Define the class in `tokens.css` (light and, if needed, `.dark.<class>`).
4. Add the control to `AppearancePanel` with Turkish labels.
5. Show it in the showcase's theming page; document it here and in
   `tokens.md`.
