# Page patterns and copy

How KentOS interfaces put the components together. The showcase's
"Sayfa kalıpları" page renders these recipes.

## Layout

- **Shell:** a dark navy sidebar (`bg-(--sidebar-bg)`, add `on-dark`), a top
  bar of height `--topbar-h`, content on the grey page (`bg-background`) in
  white cards (`card`). Content width up to `--content-max-wide`, gutters
  `--gutter`.
- **Page header:** title (`text-xl font-semibold`), one-line description in
  `text-muted-foreground text-sm`, the primary action at the top right.
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
