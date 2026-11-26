# Page patterns and copy

How KentOS interfaces put the components together. The showcase's
"Sayfa kalıpları" page renders these recipes.

## Layout

- **Shell:** every application is an `AppShell`: an `AppShellSidebar` for
  admin tools (or `AppShellNav` in the app bar for small sites), an
  `AppShellHeader` starting with `AppShellMenuButton` and ending with
  `AppShellActions`, `AppShellMain` around the routes, and on phone-first
  apps an `AppShellBottomNav`. Add regions instead of writing frames.
- **Page:** every content page is a `PageWrapper`: icon, title and a
  one-line tagline in the header, actions described with `PageAction*`
  (primary action rightmost, `variant="default"`), the body across the full
  width, and (opt-in with `showFooter`) a fixed footer for pagination or
  save/cancel; filters go in `filters`, a trail of parent pages in
  `breadcrumb`. Phones get the
  actions in a floating button and bottom sheet automatically.
- **Lists:** a `card` with rows separated by `divide-y`; tables on desktop,
  a list on phones (`md:hidden` / `hidden md:block`). Below `sm`, list cards
  run edge to edge (`max-sm:-mx-4 max-sm:rounded-none max-sm:border-x-0`).
- **Forms:** one column, `max-w-2xl`, `grid gap-5`, `Field` for every
  control, the submit button at the end. Dangerous actions in a separate
  section: `rounded-lg border border-destructive/35 px-5 py-4` with a
  `destructive` button and a confirming dialog.
- **Empty and error:** `EmptyState` says what is missing and offers one
  action; `ErrorState` says what failed and offers a retry. Loading uses
  `Skeleton` shaped like the content.
- **Phones:** controls stay 36–44px tall below `md` (the tokens handle it),
  horizontal strips scroll (`scrollbar-none`, `fade-end`), sheets replace
  side panels.

- **Telling and asking:** a toast for the result of an action ("Kaydedildi");
  an `Alert` for a state that stays on the page; a `ConfirmDialog` (or
  `dialogs.confirm`) before destructive or far-reaching actions, with
  `tone="danger"` and `confirmText` for irreversible deletions; `BusyDialog`
  / `ProgressDialog` only for work that must block the screen. Never the
  browser's `confirm`, `prompt` or `alert`.

## Copy (Turkish)

- Sentence case, plain verbs, no filler: "Proje oluştur", "Hatayı çöz",
  "Değişiklikleri kaydet". The same verb through a flow: the button
  "Kaydet" produces the toast "Kaydedildi".
- Errors say what happened and what to do, without apologising:
  "Bağlantı kurulamadı. GitHub erişim anahtarını yenileyin." Never only
  "Bir hata oluştu".
- Empty states invite the next step: "Henüz proje yok. İlk projenizi
  oluşturup SDK'yı ekleyin."
- Name things by what users understand ("bildirimler", not "webhook
  yapılandırması").
- Numbers and dates through `lib/format` (Turkish separators and month
  names); never `toLocaleString()` with other locales.
- Turkish casing: `toLocaleUpperCase("tr-TR")` / `toLocaleLowerCase("tr")`
  (İ/ı).

## Accessibility checklist

- Every control has a visible label or `aria-label` (icon buttons, segmented
  groups take `label`).
- Dialogs and sheets have `DialogTitle` / `SheetTitle` (`sr-only` if hidden)
  and, ideally, a description.
- Focus is visible (`focus-visible:shadow-(--focus-shadow)` on custom
  controls); do not remove outlines without a replacement.
- Colour is never the only signal: pair status colours with text or icons.
- Motion respects `prefers-reduced-motion` (duration tokens drop to zero).
