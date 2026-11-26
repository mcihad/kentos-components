# Integrating the kit into an application

The kit is consumed as TypeScript and CSS **source**. The application's Vite
and TypeScript compile it like their own code, and Tailwind generates the
classes the kit uses.

## Requirements

- React 19, Vite 6+ (izci uses Vite 8), TypeScript with
  `"moduleResolution": "bundler"` (needed for the `exports` map).
- Tailwind CSS v4 through `@tailwindcss/vite`.
- Peer dependencies installed by the app: `react`, `react-dom`, `radix-ui`,
  `lucide-react`, `sonner`, `cmdk`, `tailwindcss`. The kit brings its own
  `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` and the
  Fontsource packages.

## 1. Dependency

The repository sits next to the application's repository
(`~/Projects/kentos-components` beside `~/Projects/kentos-izci`):

```jsonc
// web/package.json of izci (two levels below Projects/)
"dependencies": {
  "@kentos/components": "file:../../kentos-components/packages/components"
}
```

pnpm installs a `file:` directory as an **injected** package: its files are
hard-linked into `node_modules/.pnpm/…`, its dependencies are installed, and
its peers resolve to the application's own `react`, `radix-ui`, … (one React
instance, one set of types). Consequences:

- Editing an existing kit file is visible in the app immediately (same inode).
  Editors that save by replacing the file break the link; then, and after
  adding or deleting kit files, run `pnpm install --force` in the app.
- Docker builds need the kit in the build context. izci passes it as a named
  context: `docker build --build-context kentos-components=../kentos-components .`
  and its Dockerfile copies it to the path the `file:` reference expects.
- CI clones this repository next to the checkout before installing.

## 2. CSS

One import in the application's main CSS file, then the application's own
tokens:

```css
/* src/index.css */
@import "@kentos/components/styles/index.css";

/* Application tokens after the kit's, e.g. izci's severity colours: */
:root {
  --level-error: var(--red-600);
}
@theme inline {
  --color-level-error: var(--level-error);
}
```

`styles/index.css` imports Tailwind, `tw-animate-css`, the fonts and the
tokens, and declares `@source "../"` so Tailwind scans the kit's components.
Do **not** import `tailwindcss` again in the app. The app's own files are
found by Tailwind's automatic source detection as before.

## 3. Theme before first paint

Copy `packages/components/src/theme-init.js` to the app's `public/` and load
it in `<head>` with the app's storage key:

```html
<script src="/theme-init.js" data-storage-key="my-app-appearance"></script>
```

Call `configureAppearance` with the same key before rendering:

```ts
// src/main.tsx
import "./index.css";
import { configureAppearance } from "@kentos/components/lib/theme";

configureAppearance({ storageKey: "my-app-appearance" });
```

izci keeps its historical keys: `configureAppearance({ storageKey:
"izci-appearance", legacyKey: "izci-theme" })` and its own
`public/theme-init.js` reading the same keys. Both files must stay in step
with `classesOf` in `lib/theme.ts`.

## 4. Providers

Mount once near the root:

```tsx
import { Toaster } from "@kentos/components/ui/sonner";
import { TooltipProvider } from "@kentos/components/ui/tooltip";

<TooltipProvider>
  <App />
  <Toaster position="bottom-right" />
</TooltipProvider>;
```

`Toaster` follows the resolved light/dark mode of the appearance store.
Show toasts with `toast()` from `sonner`.

## 5. Imports

Every file is an entry point; there is no barrel file (keeps bundles small):

| Path                               | Content                                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `@kentos/components/ui/<name>`     | Primitives: `button`, `dialog`, `select`, …                                                                    |
| `@kentos/components/common/<name>` | `field`, `stat-strip`, `states`, `segmented`, `kbd`, `copy-button`, `user-avatar`, `appearance-panel`, `table` |
| `@kentos/components/layout/<name>` | `sidebar` (application sidebar)                                                                                |
| `@kentos/components/charts/<name>` | `stacked-bars`, `sparkline`                                                                                    |
| `@kentos/components/lib/<name>`    | `utils` (`cn`), `theme`, `format`, `search`                                                                    |
| `@kentos/components/styles/<file>` | `index.css`, `tokens.css`, `fonts.css`                                                                         |

## 6. Adapting application types

Wrap kit components where the app has its own types instead of teaching the
kit about them. izci's examples:

- `components/common/states.tsx` renders the kit's `ErrorState` with
  `message={errorMessage(error)}` for API errors.
- `components/charts/sparkline.tsx` turns an API `Series` into the kit's
  `Point[]`.
- `lib/format.ts` re-exports the kit's formatters and adds versions taking
  protobuf `Timestamp`s.
