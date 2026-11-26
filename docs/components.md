# Component reference

Every public module of `@kentos/components`, grouped as in the showcase.
Primitives are shadcn/ui (new-york) on Radix (`radix-ui` package); their
props are Radix's plus `className`. All components accept `className`, merged
with `cn()` so callers can override classes.

Conventions shared by all components:

- `data-slot="<name>"` marks each part (style hooks, tests).
- Interactive primitives support `asChild` (Radix `Slot`) to render as the
  child element, e.g. a router link: `<Button asChild><Link …/></Button>`.
- Default texts are Turkish ("Kapat", "Kopyala", "Yeniden dene").
- Sizes follow density tokens (`--control-h-sm|md|lg`); do not set fixed
  heights.

## Buttons

### `ui/button` — `Button`, `buttonVariants`

| Prop      | Values                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| `variant` | `default` (primary, one per view), `secondary`, `outline`, `ghost`, `destructive` (irreversible actions), `link` |
| `size`    | `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`                                             |
| `asChild` | render the child (links)                                                                                         |

```tsx
<Button><PlusIcon />Proje oluştur</Button>
<Button variant="outline" size="sm">Vazgeç</Button>
<Button variant="ghost" size="icon" aria-label="Ayarlar"><SettingsIcon /></Button>
```

Rules: label says the action ("Kaydet", "Hatayı çöz"); icon-only buttons need
`aria-label`; while pending, `disabled` plus a progress label ("Kaydediliyor…").
`buttonVariants({ variant, size })` gives the classes for non-button elements.

## Form controls

### `ui/input` — `Input`; `ui/textarea` — `Textarea`

Native elements with kit styling. Mark invalid fields with `aria-invalid`.
Inputs use 16px text below `md` so iOS does not zoom.

### `ui/label` — `Label`

Radix label; pair with `htmlFor`.

### `common/field` — `Field`, `FormError`

```tsx
<Field label="Proje adı" htmlFor="name" hint="Kısa kimlikler bu adla başlar." error={error}>
  <Input id="name" aria-invalid={!!error} />
</Field>
<FormError message={submitError} />
```

| Prop      | Type        | Notes                             |
| --------- | ----------- | --------------------------------- |
| `label`   | `ReactNode` | required                          |
| `htmlFor` | `string`    | id of the control                 |
| `hint`    | `ReactNode` | shown when there is no error      |
| `error`   | `string`    | replaces the hint, `role="alert"` |

### `ui/select` — `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`

```tsx
<Select value={env} onValueChange={setEnv}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Ortam seçin" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="production">production</SelectItem>
  </SelectContent>
</Select>;
```

`SelectTrigger` takes `size="sm" | "default"`. Item values must be non-empty strings.

### `ui/checkbox` — `Checkbox`; `ui/switch` — `Switch`

`checked` / `onCheckedChange`. Checkbox values can be `"indeterminate"`:
use `onCheckedChange={(v) => set(v === true)}`. Use `Switch` for settings that
apply at once, `Checkbox` inside forms that are submitted.

### `ui/radio-group` — `RadioGroup`, `RadioGroupItem`

```tsx
<RadioGroup value={v} onValueChange={setV}>
  <div className="flex items-center gap-2.5">
    <RadioGroupItem value="full" id="ip-full" />
    <Label htmlFor="ip-full">Tam adres</Label>
  </div>
</RadioGroup>;
```

### `common/segmented` — `Segmented`, `SegmentedOption`

A row of native radio buttons for 2–4 exclusive options (keyboard: arrows).

```tsx
<Segmented
  label="Tema" // accessible group name (legend)
  value={mode}
  onChange={setMode} // typed by the options' values
  options={[
    { value: "light", label: "Açık", icon: SunIcon },
    { value: "dark", label: "Koyu" },
  ]}
/>;
```

### `ui/toggle` — `Toggle`, `toggleVariants`; `ui/toggle-group` — `ToggleGroup`, `ToggleGroupItem`

`variant`: `default | outline`; `size`: `sm | default | lg`. `ToggleGroup`
takes `type="single" | "multiple"` and passes `variant`/`size` to items.

## Feedback

### `ui/alert` — `Alert`, `AlertTitle`, `AlertDescription`

`variant`: `default | destructive`. An icon as the first child gets its own
column.

### `ui/badge` — `Badge`, `badgeVariants`

`variant`: `default | secondary | destructive | outline | ghost | link`.

### `ui/skeleton` — `Skeleton`

Placeholder block; give it the shape of the content (`h-5 w-1/2`). Prefer
skeletons to spinners for loading lists and pages.

### `ui/sonner` — `Toaster`

Mount once (see integration). Then `toast.success("Kaydedildi")`,
`toast.error(message)`, `toast(title, { description, action: { label, onClick } })`
from `sonner`. Repeat the action's verb: "Kaydet" → "Kaydedildi".

### `common/states` — `EmptyState`, `ErrorState`

```tsx
<EmptyState icon={SearchXIcon} title="Eşleşen hata yok" action={<Button size="sm">Filtreleri temizle</Button>}>
  Aramayı genişletin.
</EmptyState>
<ErrorState message="Sunucuya ulaşılamadı." onRetry={refetch} retryLabel="Yeniden dene" />
```

`ErrorState` takes a ready `message`; applications map their errors to text.

## Overlays

All overlays trap focus, close on Escape and portal to `<body>`.

### `ui/dialog` — `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogOverlay`, `DialogPortal`

`DialogContent` takes `showCloseButton` (default `true`). `DialogTitle` is
required (Radix warns otherwise); use `className="sr-only"` to hide it. Width
via `className="sm:max-w-md"`.

### `ui/sheet` — `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`

`SheetContent` takes `side="right" | "left" | "top" | "bottom"` and
`showCloseButton`. Mobile navigation: `side="left"`.

### `ui/popover` — `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription`

`PopoverContent` takes `align` and `sideOffset`.

### `ui/dropdown-menu` — `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`, `DropdownMenuPortal`

`DropdownMenuItem` takes `variant="default" | "destructive"` and `inset`; use
`onSelect` (not `onClick`) for actions.

### `ui/tooltip` — `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`

Needs one `TooltipProvider` at the root. Tooltips are for short hints, never
the only place of essential information.

### `ui/hover-card` — `HoverCard`, `HoverCardTrigger`, `HoverCardContent`

Preview of a link's target on hover.

### `ui/command` — `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`

cmdk based. `CommandDialog` takes `open`, `onOpenChange`, `title`
(default "Komut paleti"), `description`, `showCloseButton`.

## Navigation and layout

### `ui/tabs` — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `tabsListVariants`

`TabsList` takes `variant="default" | "line"`. For page sections, keep the
active tab in the URL so links can be shared.

### `ui/collapsible` — `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`

### `ui/scroll-area` — `ScrollArea`, `ScrollBar`

### `ui/separator` — `Separator` (`orientation="horizontal" | "vertical"`)

### `common/kbd` — `Kbd`

```tsx
<Kbd>⌘K</Kbd>;
```

## Data display

### `common/stat-strip` — `StatStrip`, `Stat`

```tsx
<StatStrip stats={[{ label: "Olay", value: formatCompact(48210), note: "kotanın %48'i" }]} />;
```

A responsive grid of cards (2 → 3 → 4/5/6 columns by count).

### `common/table` — `theadClass`, `thClass`, `trClass`, `tdClass`

Class strings for native tables: tinted header, density-driven row height,
quiet hover. Numbers: `text-right tabular`. On phones, render a list instead
of the table (`md:hidden` list + `hidden md:block` table).

### `charts/stacked-bars` — `StackedBars`, `BarLayer`, `Point`

```tsx
<StackedBars
  height={180}
  step={3_600_000}
  layers={[{ key: "accepted", label: "Kabul edilen", color: "var(--primary)", points }]}
/>;
```

`Point = { t: Date; v: number }`; `step` is the bucket width in ms (used for
the axis and the hover label). Colours are CSS colours, preferably tokens.

### `charts/sparkline` — `Sparkline`

`points: Point[]`, optional `label` (accessible text; default "Toplam N"),
`height`. Inherits `currentColor` (`className="text-primary"`).

### `ui/avatar` — `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarBadge`, `AvatarGroup`, `AvatarGroupCount`

### `common/user-avatar` — `UserAvatar`

```tsx
<UserAvatar name="Ayşe Yılmaz" src={user.avatarUrl} className="size-8" />;
```

Initials from the name when there is no picture.

### `common/copy-button` — `CopyButton`, `SecretValue`, `copyText`

`CopyButton value label?` copies and toasts "Kopyalandı"; `SecretValue value`
shows a key/DSN in a code box with a copy button; `copyText(text, done?)` for
custom triggers.

## Appearance

### `common/appearance-panel` — `AppearancePanel`

The controls for every appearance choice (mode, typeface, density, corners,
accent, cards), bound to the appearance store. Place it in a sheet, dialog or
settings page. See [theming.md](theming.md).

## Helpers

### `lib/utils` — `cn(...classes)`

`clsx` + `tailwind-merge`: later classes win over earlier conflicting ones.

### `lib/format` (tr-TR)

| Function                                                     | Example                                             |
| ------------------------------------------------------------ | --------------------------------------------------- |
| `formatNumber(n)`                                            | `12.345`                                            |
| `formatCompact(n)`                                           | `1,2 Mn` (exact below 10.000)                       |
| `formatPercent(ratio)`                                       | `%12,5`                                             |
| `formatBytes(n)`                                             | `1,4 MB`                                            |
| `formatDuration(ms)`                                         | `3 dk 12 sn`                                        |
| `formatDateTime(d)` / `formatDate(d)` / `formatShortDate(d)` | `26 Eylül 2026 14:32:05` / `26 Eyl 2026` / `26 Eyl` |
| `formatTime(d)` / `formatClock(d)`                           | `14:32` / `14:32:05`                                |
| `formatRelative(d, now?)`                                    | `az önce`, `5 dk önce`, `2 gün sonra`               |
| `initials(name)`                                             | `AY`                                                |

Numbers accept `number | bigint` (`Numeric`); dates are `Date`.

### `lib/theme`

`useAppearance()`, `setAppearance`, `resetAppearance`, `setTheme`,
`configureAppearance`, `classesOf`, `defaultAppearance` and the types
`Appearance`, `ThemeMode`, `FontChoice`, `Density`, `Radius`, `Accent`,
`Elevation`. See [theming.md](theming.md).
