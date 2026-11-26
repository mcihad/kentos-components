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

### `ui/alert` — `Alert`, `AlertTitle`, `AlertDescription`, `AlertActions`, `AlertDismiss`, `alertVariants`

Inline messages that stay on the page. `variant`: `default | info | success |
warning | destructive`; status variants tint the box with the
`--status-*` tokens. An icon as the first child gets its own column.
`AlertActions` holds buttons under the description; `AlertDismiss`
(`onClick`, `label` "Kapat") puts a close button in the corner. Warning and
destructive alerts use `role="alert"`, the others `role="status"`.

```tsx
<Alert variant="warning">
  <TriangleAlertIcon />
  <AlertTitle>Aylık kotanın %80'i doldu</AlertTitle>
  <AlertDescription>Kota dolunca yeni olaylar reddedilir.</AlertDescription>
  <AlertActions>
    <Button size="sm" variant="outline">
      Kotayı artır
    </Button>
  </AlertActions>
  <AlertDismiss onClick={hide} />
</Alert>;
```

Use an alert for a state the user should see while working on the page;
use a toast for the result of an action, a dialog when an answer is needed.

### `ui/badge` — `Badge`, `BadgeAnchor`, `badgeVariants`, `formatCount`

Statuses, counts and tags. `variant`: solid `default` (brand) and
`destructive`; soft tones `secondary`, `neutral`, `brand`, `info`, `success`,
`warning`, `danger` (status tokens, readable in every theme); quiet
`outline`, `ghost`, `link`. `size`: `sm | md | lg`; `shape`: `pill | square`
(versions, identifiers). `dot` leads with a dot (`pulse` for live states),
`icon` with an icon, `onRemove` adds a remove button (filter chips, tags).

```tsx
<Badge variant="success" dot>Çözüldü</Badge>
<Badge variant="danger" dot pulse>Canlı</Badge>
<Badge variant="secondary" onRemove={() => remove(tag)}>{tag}</Badge>
<BadgeAnchor count={unread} label={`${unread} okunmamış bildirim`}>
  <Button variant="ghost" size="icon" aria-label="Bildirimler"><BellIcon /></Button>
</BadgeAnchor>
```

`BadgeAnchor` puts a count (`max` 99 → "99+", hidden at zero unless
`showZero`) or a `dot` on its child's corner; give it a `label`.

### `ui/skeleton` — `Skeleton`

Placeholder block; give it the shape of the content (`h-5 w-1/2`). Prefer
skeletons to spinners for loading lists and pages.

### `ui/sonner` — `Toaster`, `tintedToastClassNames`, type `ToastTone`

Sonner with the kit's styling: a close button and kit buttons for `action`
and `cancel`. `tone` picks the look for the whole application:

- `"plain"` (default): every toast on the card surface, the type shown by a
  coloured icon.
- `"tinted"`: success, error, warning and info toasts filled with their
  status colours (`--status-*-bg/-border/-fg`, laid over the card colour so
  they stay opaque on dark mode's translucent fills); plain and loading
  toasts stay on the card.

To tint a single toast under the plain tone:
`toast.error("Ödeme alınamadı", { classNames: tintedToastClassNames })`.

Mount once (see integration), then call from anywhere:

```ts
import { toast } from "sonner";
toast.success("Proje ayarları kaydedildi");
toast.error("Bağlantı kurulamadı", { description: "Ağ bağlantınızı denetleyip yeniden deneyin." });
toast.warning("Kotanın %80'i doldu");
toast.info("Yeni sürüm yayımlandı");
toast("KALEM-1B ayrıldı", { action: { label: "Geri al", onClick: undo } });
const id = toast.loading("Rapor hazırlanıyor…");
toast.success("Rapor hazır", { id });
toast.promise(save(), { loading: "Kaydediliyor…", success: "Kaydedildi", error: (e) => message(e) });
```

Repeat the action's verb: "Kaydet" → "Kaydedildi".

### `common/spinner` — `Spinner`

Rotating indicator (`label` for screen readers, default "Yükleniyor"); size
with `className="size-5"`. Inside buttons while their action runs.

### `ui/progress` — `Progress`

Radix progress bar: `value` and `max`; `value={null}` sweeps
indeterminately. The indicator moves with `transform`; colour with
`indicatorClassName`.

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

## Dialogs

### `ui/alert-dialog` — `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`

Radix alert dialog: focus trapped, closes only through its buttons or
Escape (never a click outside). `AlertDialogAction` takes
`variant="default" | "destructive"`. The ready-made dialogs below build on it.

### `common/dialogs`

Controlled (`open`, `onOpenChange`) dialogs for the common moments. `tone`
(`neutral | info | success | warning | danger`) sets the round icon tile
(`DialogToneIcon`) and, for `danger`, a destructive main button. Buttons
stack full width on phones.

| Component         | Use                                                                                                                                                       | Main props                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MessageDialog`   | A message acknowledged with one button (the standard alert dialog).                                                                                       | `tone`, `icon` (or `false`), `title`, `description`, `children`, `okLabel` ("Tamam"), `onOk`                                                                                                             |
| `ConfirmDialog`   | Ask before acting. A promise from `onConfirm` keeps the dialog open with a spinner and shows its error. `confirmText` makes the user type it first.       | `tone`, `title`, `description`, `confirmLabel` ("Onayla"), `pendingLabel`, `cancelLabel` ("Vazgeç"), `confirmText`, `confirmTextLabel`, `onConfirm`, `onCancel`, `errorFallback`                         |
| `InputDialog`     | Ask for one value. Required by default; `validate` returns an error sentence.                                                                             | `title`, `description`, `label`, `placeholder`, `defaultValue`, `hint`, `multiline`, `type`, `required`, `maxLength` (shows a counter), `submitLabel` ("Kaydet"), `pendingLabel`, `validate`, `onSubmit` |
| `BusyDialog`      | Block the screen during work of unknown length. Not dismissible unless `onCancel`.                                                                        | `open`, `title` ("İşleniyor…"), `description`, `onCancel`, `cancelLabel`                                                                                                                                 |
| `ProgressDialog`  | Measurable work: bar, percentage, status line, optional step list; `done` turns it green with a close button.                                             | `value` (`null` = indeterminate), `max`, `status`, `steps` (`{ label, state: pending \| active \| done \| error }`), `done`, `doneTitle`, `doneLabel`, `onCancel`                                        |
| `LoadingDialog`   | A dialog whose content is still loading: skeleton lines, then children.                                                                                   | `loading`, `lines`, `title`, `description`, `footer`                                                                                                                                                     |
| `CountdownDialog` | Something happens when time runs out (sign-out, redirect). The ring empties in one CSS animation; the number ticks each second; Escape counts as confirm. | `seconds`, `tone` ("warning"), `title`, `description` (node or `(remaining) => node`), `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, `onElapsed`                                               |

Errors thrown by `onConfirm`/`onSubmit` are shown with their `message`;
throw an `Error` with a Turkish sentence (map API errors first).

### `common/drawer` — `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerBody`, `DrawerFooter`, `DrawerClose`

A panel sliding in from an edge (details beside a list, filters, forms,
logs), on Radix Dialog. Not Vaul: it is unmaintained since 2024, brings its
own Radix copy and has no resizable side drawers.

```tsx
<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline">Hata ayrıntısı</Button>
  </DrawerTrigger>
  <DrawerContent side="right" size="md" resizable sizeStorageKey="issue-drawer">
    <DrawerHeader>
      <DrawerTitle>KALEM-1B</DrawerTitle>
      <DrawerDescription>NullPointerException · Kent kart</DrawerDescription>
    </DrawerHeader>
    <DrawerBody>…</DrawerBody>
    <DrawerFooter>
      <Button>Çözüldü işaretle</Button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>;
```

| Part                                         | Props and behaviour                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Drawer`                                     | Radix root; `modal` (default true). `modal={false}` leaves the page usable (an inspector); add `onInteractOutside={(e) => e.preventDefault()}` on the content so outside clicks do not close it.                                                                                                                                                                                                                                       |
| `DrawerContent`                              | `side`: `right` (default), `left`, `top`, `bottom`. `size`: `sm \| md \| lg \| xl \| full \| auto` or a CSS length (width for left/right: 360–800px; height for top/bottom: 30–88svh). `mobileSide` (default `bottom`, or `same`) and `mobileSize` (default `auto`): what a side drawer becomes on phones. `resizable`, `minSize`, `maxSize` (px), `sizeStorageKey` (remembers the size), `showClose`, `closeLabel`, `mobile` (force). |
| Resizing                                     | Left/right/top: a grip on the inner edge; drag it, or focus it and use the arrow keys (Shift ×4), Home and End; double-click restores the default. It is a `separator` with `aria-valuenow`. Bottom: pull the grab handle up to grow (up to 92% of the screen); pulling down shrinks back to the opening height, then closes.                                                                                                          |
| Bottom sheets                                | Drag the grab handle down to close (over 28% of the height or a flick); a short drag springs back. Same motion as `ActionSheet`.                                                                                                                                                                                                                                                                                                       |
| `DrawerHeader`, `DrawerBody`, `DrawerFooter` | Header with room for the close button; scrolling body; footer that stays visible (buttons stack on phones).                                                                                                                                                                                                                                                                                                                            |

Use a drawer for work that keeps the page in context; a `Dialog` for a
short decision; a page for long flows.

### `common/dialog-host` — `DialogHost`, `dialogs`

The same dialogs as function calls, for handlers that only need an answer.
Mount `<DialogHost />` once next to the `Toaster`.

```ts
import { dialogs } from "@kentos/components/common/dialog-host";

if (
  await dialogs.confirm({
    tone: "danger",
    title: "Pano silinsin mi?",
    confirmLabel: "Sil",
    onConfirm: () => remove.mutateAsync({ id }),
  })
)
  navigate("/dashboards");
const tag = await dialogs.prompt({ title: "Yeni etiket", label: "Etiket" }); // string | null
await dialogs.alert({ tone: "success", title: "Dışa aktarma tamamlandı" });
const job = dialogs.busy("Önbellek temizleniyor…");
job.update({ title: "…" });
job.close();
const p = dialogs.progress({ title: "Yükleniyor", value: 0 });
p.update({ value: 50 });
p.done();
const how = await dialogs.countdown({ seconds: 10, title: "Yönlendiriliyorsunuz" }); // confirm | cancel | elapsed
```

`confirm` resolves `true` only after `onConfirm` succeeded; `prompt`
resolves the value after `onSubmit` succeeded. Never use `window.confirm`,
`window.prompt` or `window.alert`.

## Application shell

### `layout/app-shell`

`AppShell`, `AppShellSidebar`, `AppShellBanner`, `AppShellHeader`,
`AppShellMenuButton`, `AppShellBrand`, `AppShellNav`, `AppShellNavItem`,
`AppShellSearch`, `AppShellActions`, `AppShellSpacer`, `AppShellMain`,
`AppShellFooter`, `AppShellBottomNav`, `AppShellBottomNavItem`,
`useAppShell`.

The skeleton of every KentOS application. Each region is a component that
appears only when used and takes `hidden` to disappear; each places itself
in a named grid area (`sidebar`, `banner`, `header`, `main`, `footer`,
`bottom`), so their order and wrapper components do not matter. Regions
register with the shell and adapt to each other.

```tsx
<AppShell sidebarStorageKey="app-sidebar">
  <AppShellSidebar label="Menü">
    …SidebarHeader, SidebarSearch, SidebarContent, SidebarFooter…
  </AppShellSidebar>
  <AppShellBanner tone="warning">Bakım duyurusu</AppShellBanner>
  <AppShellHeader>
    <AppShellMenuButton />
    <AppShellBrand logo={<Logo />} title="İzci" asChild>
      <Link to="/" />
    </AppShellBrand>
    <AppShellSearch placeholder="Ara" onClick={openPalette} />
    <AppShellActions>
      <NotificationsMenu />
    </AppShellActions>
  </AppShellHeader>
  <AppShellMain>
    <Outlet />
  </AppShellMain>
  <AppShellFooter>İzci 1.4.0</AppShellFooter>
</AppShell>;
```

| Part                                         | Props and behaviour                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AppShell`                                   | `sidebarStorageKey`, `defaultSidebarCollapsed`, `sidebarShortcut` (⌘/Ctrl letter, default "b", `null` off), `mobile` (force), `height` (a fixed-height box that scrolls inside, for previews), `skipLinkLabel` ("İçeriğe geç"). Fills the window by default; renders the skip link and the sidebar state (`useSidebar`).                                                       |
| `AppShellSidebar`                            | The kit `Sidebar` in the `sidebar` area (sticky rail, drawer on phones).                                                                                                                                                                                                                                                                                                       |
| `AppShellBanner`                             | `tone`: `info`, `warning`, `danger`, `brand`. Above the app bar in the content column.                                                                                                                                                                                                                                                                                         |
| `AppShellHeader`                             | Sticky app bar, `--topbar-h` tall.                                                                                                                                                                                                                                                                                                                                             |
| `AppShellMenuButton`                         | Sidebar present: opens/collapses it. Otherwise, with `AppShellNav`: opens the nav drawer on phones. Neither: renders nothing.                                                                                                                                                                                                                                                  |
| `AppShellBrand`                              | `logo`, `title`, `asChild` (home link). Hidden from md up when a sidebar shows the brand.                                                                                                                                                                                                                                                                                      |
| `AppShellNav`, `AppShellNavItem`             | Horizontal navigation in the app bar (underlined current item) for apps without a sidebar; on phones a left drawer with the same items (`drawerHeader`). Items: `icon`, `label`, `active` or `asChild` link with `aria-current`.                                                                                                                                               |
| `AppShellSearch`                             | `placeholder`, `shortcut` ("⌘K", display only), `onClick`. Field-like button on desktop, icon on phones.                                                                                                                                                                                                                                                                       |
| `AppShellActions`, `AppShellSpacer`          | Trailing button group; a flexible gap.                                                                                                                                                                                                                                                                                                                                         |
| `AppShellMain`                               | `#app-main`, the skip link's target; `contained` (default) keeps pages within `--content-max-wide`. A `PageWrapper` inside fills it.                                                                                                                                                                                                                                           |
| `AppShellFooter`                             | Quiet status line under the content.                                                                                                                                                                                                                                                                                                                                           |
| `AppShellBottomNav`, `AppShellBottomNavItem` | Phone tab bar (up to five destinations; items `icon`, `label`, `badge` with `badgeLabel` for screen readers and `badgeTone` (`danger` for counts needing attention, `neutral` for plain totals), `active`/`asChild`), sticky at the bottom; hidden from md up unless `always`. While shown it sets `--shell-bottom`, which `PageFooter` and the page FAB add to their offsets. |
| `useAppShell()`                              | `has(part)`, `navOpen`, `setNavOpen`; null outside a shell.                                                                                                                                                                                                                                                                                                                    |

## Application sidebar

### `layout/sidebar`

`SidebarProvider`, `Sidebar`, `SidebarInset`, `SidebarHeader`, `SidebarBrand`,
`SidebarSearch`, `SidebarContent`, `SidebarGroup`, `SidebarItem`,
`SidebarCollapsible`, `SidebarSeparator`, `SidebarFooter`, `SidebarUser`,
`SidebarTrigger`, `useSidebar`, type `SidebarIcon`.

The application's left navigation: a dark rail (colours from `--sidebar-*`,
widths `--sidebar-w` / `--sidebar-w-collapsed`). On desktop it collapses to
an icon rail (labels in tooltips, badges as dots, collapsibles as flyout
menus); below `md` it is a drawer that closes when an item is chosen. The
search filters items Turkish-aware and without diacritics ("musteri" finds
"Müşteriler", keywords included), highlights the match, hides empty groups
and shows an empty state.

```tsx
<SidebarProvider storageKey="app-sidebar">
  <Sidebar label="Menü">
    <SidebarHeader>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarBrand logo={<Logo />} title="Bursa Belediyesi" subtitle="Yönetici" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">…</DropdownMenuContent>
      </DropdownMenu>
    </SidebarHeader>
    <SidebarSearch />
    <SidebarContent>
      <SidebarGroup label="İzleme">
        <SidebarItem icon={BugIcon} label="Hatalar" badge={12} keywords={["issue"]} asChild>
          <Link to="/issues" />
        </SidebarItem>
      </SidebarGroup>
      <SidebarCollapsible icon={SettingsIcon} label="Ayarlar">
        <SidebarItem label="Üyeler" asChild>
          <Link to="/settings/members" />
        </SidebarItem>
      </SidebarCollapsible>
    </SidebarContent>
    <SidebarFooter>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarUser name="Ayşe Yılmaz" description="ayse@kentos.dev" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start">
          …
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  </Sidebar>
  <SidebarInset>
    <header>
      <SidebarTrigger />…
    </header>
    <main>…</main>
  </SidebarInset>
</SidebarProvider>;
```

| Part                           | Props and behaviour                                                                                                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SidebarProvider`              | `storageKey` (remembers the collapsed rail), `defaultCollapsed`, `collapsed` + `onCollapsedChange` (controlled), `toggleShortcut` (letter with ⌘/Ctrl, default `"b"`, `null` disables), `mobile` (forces drawer or rail). Renders the flex frame and a `TooltipProvider`. |
| `Sidebar`                      | `label` (accessible name, drawer title). Sticky `h-svh` rail; pass `className="h-full"` inside a fixed-height container.                                                                                                                                                  |
| `SidebarHeader`                | Top section; adds the drawer's close button on phones.                                                                                                                                                                                                                    |
| `SidebarBrand`                 | `logo`, `title` (string), `subtitle`, `chevron`. A button; use as `DropdownMenuTrigger asChild` child for switches. Icon only on the rail.                                                                                                                                |
| `SidebarSearch`                | `placeholder` (default "Menüde ara"). Enter opens the first match, ↓ moves into the list, Esc clears. On the rail: a button that expands and focuses.                                                                                                                     |
| `SidebarContent`               | `label` (nav name, default "Ana menü"), `emptyText`. Scrolls; ↑ ↓ Home End move between items.                                                                                                                                                                            |
| `SidebarGroup`                 | `label`, `action` (control beside the label), `collapsible`, `defaultOpen`. Divider on the rail; hidden when a search finds nothing in it.                                                                                                                                |
| `SidebarItem`                  | `icon`, `label` (searched), `keywords`, `badge`, `active`, `asChild`. Active when `active` or the element has `aria-current="page"` (TanStack/React Router links set it). Choosing it clears the search and closes the drawer.                                            |
| `SidebarCollapsible`           | `icon`, `label`, `keywords`, `badge`, `defaultOpen`; children are `SidebarItem`s. Opens itself when a child becomes the current page or matches a search.                                                                                                                 |
| `SidebarFooter`, `SidebarUser` | Footer section; user button with `name`, `description`, `src`.                                                                                                                                                                                                            |
| `SidebarTrigger`               | Button for the top bar: collapses on desktop (tooltip with ⌘B), opens the drawer on phones.                                                                                                                                                                               |
| `useSidebar()`                 | `collapsed`, `setCollapsed`, `toggle`, `isMobile`, `openMobile`, `setOpenMobile`, `query`, `setQuery`, `iconOnly`.                                                                                                                                                        |

Rules: every item has an icon at the top level (the rail shows only icons);
labels are short nouns ("Hatalar", not "Hataları görüntüle"); add
`keywords` for synonyms and English terms users may type; at most one level
of nesting.

## Page frame and actions

### `layout/page`

`PageWrapper`, `PageHeader`, `PageBreadcrumb`, `PageActions`, `PageBody`, `PageFooter`,
`PageAction`, `PageActionMenu`, `PageActionToolbar`, `PageActionSeparator`,
`PageActionDesktop`.

The frame of every content page: header (icon tile, title, tagline, meta,
actions), a body that fills the width with density-aware gutters, and an
optional footer of height `--footer-h` (the sidebar footer's height) that can
stay fixed. On phones the actions move into an extended floating button that
opens an `ActionSheet`; it hides while the page scrolls down.

```tsx
<PageWrapper
  icon={BoxesIcon}
  title="Projeler"
  description="Hata ve olay toplayan uygulamalarınız"
  meta={<Badge variant="outline">9</Badge>}
  actions={
    <>
      <PageActionToolbar label="Liste">
        <PageAction icon={RefreshCwIcon} label="Yenile" onClick={refetch} />
        <PageActionSeparator />
        <PageAction
          icon={DownloadIcon}
          label="Dışa aktar"
          description="CSV dosyası olarak indir"
          onClick={exportCsv}
        />
      </PageActionToolbar>
      <PageActionMenu icon={EllipsisIcon} label="Diğer işlemler" hideLabel>
        <PageAction icon={Trash2Icon} label="Seçilenleri sil" variant="destructive" onClick={remove} />
      </PageActionMenu>
      <PageAction icon={PlusIcon} label="Proje oluştur" variant="default" onClick={create} />
    </>
  }
  footer={<Pagination />}
  showFooter
  footerFixed
>
  …
</PageWrapper>;
```

| Part                     | Props and behaviour                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageWrapper`            | `icon`, `title`, `description`, `meta`, `breadcrumb` (a `PageBreadcrumb`), `filters` (selects that stay visible on phones: beside the actions on desktop, a scrolling row under the heading on phones), `actions`, `actionsLabel` (FAB and sheet title, default "İşlemler"), `fabIcon`, `footer`, `showFooter` (default `false`: the footer is hidden until enabled), `footerFixed`, `padded` (false for edge-to-edge content), `mobile` (force layout), `bodyClassName`. Minimum height: viewport minus `--topbar-h`; pass `className="min-h-full"` inside a fixed-height preview. Without `title` no header is drawn. |
| `PageHeader`             | `icon`, `title`, `description`, `meta`, `actions` (desktop only), `children` (tabs or filters under the heading).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `PageBreadcrumb`         | Children are links and the current page; chevrons between them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `PageBody`, `PageFooter` | Body with `padded`; footer with `fixed` (sticky to the bottom of the scroll container, so it also works in framed previews). Footer lays out its children `justify-between`.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `PageAction`             | `icon`, `label`, `description` (sheet only), `variant` (`outline` default; `default` for the page's one primary action, which also goes first in the sheet; `destructive`), `hideLabel` (icon button with tooltip), `asChild` (links), `disabled`, `onClick`.                                                                                                                                                                                                                                                                                                                                                           |
| `PageActionMenu`         | `icon`, `label`, `variant`, `hideLabel`, `align`; children are `PageAction`s. Dropdown on desktop, titled group in the sheet.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `PageActionToolbar`      | `label`; children are `PageAction`s (icon buttons) or toolbar controls. Joined toolbar on desktop, titled group in the sheet.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `PageActionSeparator`    | Divider for the surface it is on.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `PageActionDesktop`      | Children appear in the header only (e.g. a search field).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

Rules: one `variant="default"` action per page; give actions that end up in
the sheet a `description` when the label alone is ambiguous; keep the
footer to one row (pagination, totals, save/cancel).

### `common/action-sheet` — `ActionSheet`, `ActionSheetTrigger`, `ActionSheetContent`, `ActionSheetItem`, `ActionSheetGroup`, `ActionSheetSeparator`, `ActionSheetClose`

Bottom sheet on Radix Dialog. `ActionSheetContent` takes `title` (required),
`description`, `hideTitle`, `cancelLabel` ("Vazgeç"), `showCancel`.
`ActionSheetItem` takes `icon`, `label`, `description`, `variant`
(`default | primary | destructive`), `keepOpen`, `asChild`; choosing an item
closes the sheet. Drag the handle down to dismiss (over 28% of the height or
a flick); a short drag springs back. Only `transform` and `opacity` animate
(keyframes `kentos-sheet-*` in `tokens.css`, timing `--duration-sheet`,
`--ease-sheet`); items rise in one after another.

### `common/fab` — `Fab`, `useHideOnScroll`

`Fab` props: `icon` (default plus), `label`, `extended`, `hidden`. It has no
position; place it with `className`. `useHideOnScroll(ref)` returns true
while the nearest scrolling ancestor (or the window) scrolls down.

### `common/toolbar` — `Toolbar`, `ToolbarButton`, `ToolbarToggleGroup`, `ToolbarToggleItem`, `ToolbarSeparator`

Radix Toolbar (one tab stop, arrow keys inside). `ToolbarButton` and
`ToolbarToggleItem` take `icon`, `label`, `showLabel`; with an icon and no
`showLabel` the label moves into a tooltip. Height matches small buttons.

## Navigation and layout

### `ui/tabs` — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `TabsBadge`, `TabsNav`, `TabsNavItem`, `tabsListVariants`

Sections of a page. `TabsList` `variant`: `default` (segmented track, short
equal options), `line` (underline with an indicator that slides to the
active tab, page sections) or `pill` (rounded chips, filter-like choices).

```tsx
<Tabs defaultValue="issues">
  <TabsList
    variant="line"
    aria-label="Bölümler"
    action={
      <Button size="icon-sm" variant="ghost" aria-label="Ekle">
        <PlusIcon />
      </Button>
    }
  >
    <TabsTrigger value="issues" icon={BugIcon} badge={12}>
      Hatalar
    </TabsTrigger>
    <TabsTrigger value="ai" icon={BotIcon} badgeVariant="dot">
      Yapay zekâ
    </TabsTrigger>
    <TabsTrigger value="draft" onClose={() => close("draft")}>
      Taslak
    </TabsTrigger>
    <TabsTrigger value="archive" disabled>
      Arşiv
    </TabsTrigger>
  </TabsList>
  <TabsContent value="issues" mount="lazy">
    <IssueList />
  </TabsContent>
</Tabs>;
```

| Part                     | Props and behaviour                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Tabs`                   | Radix root (`value`/`defaultValue`/`onValueChange`, `orientation`). Remembers visited tabs for lazy content.                                                                                                                                                                                                                                                                                                                                     |
| `TabsList`               | `variant`, `fullWidth` (equal widths), `action` (controls after the tabs, outside the scroller), `rowClassName`. A row that does not fit scrolls: the wheel scrolls it sideways until an end (then the page scrolls), touch swipes, edge chevrons appear for mice (`pointer: fine`), the edges fade, and the active tab is scrolled into view on change and resize. Vertical orientation stacks full-width rows (line: marker on the left edge). |
| `TabsTrigger`            | `icon`, `badge` (numbers above 99 show 99+), `badgeVariant` (`default \| primary \| danger \| warning \| success \| dot`), `onClose` (close button; Delete/Backspace closes the focused tab), `closeLabel`, `disabled`. Closing the active tab is the caller's choice of the next one.                                                                                                                                                           |
| `TabsContent`            | `mount`: `active` (default, mounted while selected), `lazy` (from the first visit on, kept hidden so state survives), `eager` (always). Children suspend into `fallback` (a skeleton by default), so `React.lazy` sections need no extra boundary.                                                                                                                                                                                               |
| `TabsNav`, `TabsNavItem` | The same row for links (sections in the URL). `TabsNav`: `label`, `variant` (`line`), `fullWidth`, `action`, `className` (row). `TabsNavItem`: `active`, `disabled`, `icon`, `badge`, `badgeVariant`; with `asChild` wrap a router link and pass the text as `label`.                                                                                                                                                                            |
| `TabsBadge`              | The badge on its own.                                                                                                                                                                                                                                                                                                                                                                                                                            |

Keep the active section in the URL when it should be shareable (TabsNav);
use `Tabs` for state within a card or dialog.

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

### `common/data-table` — `DataTable`, types `DataColumn`, `SortState`, `SortValue`

A plain table for showing records (not a spreadsheet): sortable columns, a
column chooser, pagination, loading/refreshing/empty/error states, row
clicks, and a card list on phones. No table library: columns are plain
objects.

```tsx
const columns: DataColumn<Project>[] = [
  { id: "name", header: "Proje", value: (p) => p.name, sortable: true, hideable: false, mobile: "title" },
  { id: "events", header: "Olay", value: (p) => p.events, sortable: true, align: "end",
    cell: (p) => formatNumber(p.events) },
  { id: "owner", header: "Sorumlu", value: (p) => p.owner, hidden: true },
];

// In the browser
<DataTable columns={columns} rows={projects} getRowId={(p) => p.id} pageSize={20} pageSizes={[20, 50]}
           defaultSort={{ id: "events", desc: true }} columnsStorageKey="projects-columns" itemLabel="proje" />

// On the server
<DataTable columns={columns} rows={q.data?.rows ?? []} getRowId={(p) => p.id} manual
           sort={sort} onSortChange={(s) => { setSort(s); setPage(1); }}
           loading={q.isPending} refreshing={q.isFetching && !q.isPending}
           pagination={{ page, onPageChange: setPage, pageSize: 20, total: q.data?.total ?? 0 }} />
```

| Prop                                  | Meaning                                                                                                                                                                                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`                             | `id`, `header` (also the chooser and phone-card label), `value` (sorting and default cell), `cell`, `sortable`, `align` (`end` for numbers and dates, which also get tabular figures), `width`, `hideable` (default true), `hidden` (hidden by default), `mobile` (`title`, `detail`, `hidden`), `className`. |
| `rows`, `getRowId`, `caption`         | Data, a stable key, the screen-reader caption.                                                                                                                                                                                                                                                                |
| `sort`, `defaultSort`, `onSortChange` | Controlled or uncontrolled sort. A header click cycles ascending → descending → the data's order; headers carry `aria-sort`. Browser sorting compares numbers, bigints, dates and Turkish text (numeric-aware).                                                                                               |
| `manual`                              | Server mode: the table neither sorts nor pages; it reports choices.                                                                                                                                                                                                                                           |
| `pageSize`, `pageSizes`               | Browser paging (resets to page 1 on sort and when the data shrinks).                                                                                                                                                                                                                                          |
| `pagination`                          | Server paging: `Pagination` props rendered under the table.                                                                                                                                                                                                                                                   |
| `loading`, `refreshing`               | Skeleton rows on first load; dimmed rows and waiting controls while a new page or sort loads.                                                                                                                                                                                                                 |
| `empty`, `error`                      | Replace the rows / the table.                                                                                                                                                                                                                                                                                 |
| `columnsStorageKey`                   | Remembers hidden columns in the browser. The chooser keeps at least one column and offers "Varsayılana dön".                                                                                                                                                                                                  |
| `toolbar`                             | Controls before the column chooser (search, filters).                                                                                                                                                                                                                                                         |
| `onRowClick`, `rowClassName`          | Clickable rows (Enter works too).                                                                                                                                                                                                                                                                             |
| `mobile`                              | Forces the card layout (`true`) or the table (`false`); by default below md the rows become cards and sorting moves into a select.                                                                                                                                                                            |

### `common/pagination` — `Pagination`, `pageWindow`

`page` (1-based), `onPageChange`, `pageSize`, `pageSizes` +
`onPageSizeChange` (a "20 / sayfa" select), `itemLabel`, `disabled`, and
either `total` (numbered: "21–40 / 245 hata", first/previous, page numbers
with gaps, next/last; on phones "2 / 13") or `hasNextPage` (cursor APIs:
previous/next only). `pageWindow(page, pageCount)` returns the numbers and
gaps shown.

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

### `ui/avatar` — `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarStatusDot`, `AvatarBadge`, `AvatarGroup`, `AvatarGroupCount`

`Avatar` `size`: `xs | sm | default | lg | xl | 2xl` (20–64px); `shape`:
`circle` (people) or `square` (organizations, projects). `AvatarStatusDot`
`status`: `online | away | busy | offline`. `AvatarGroup` overlaps its
children with a ring in the surface colour; `AvatarGroupCount` closes it
with "+N".

### `common/user-avatar` — `UserAvatar`, `UserAvatarGroup`, `avatarTone`, type `AvatarPerson`

```tsx
<UserAvatar name="Ayşe Yılmaz" src={user.avatarUrl} size="lg" status="online" tooltip />
<UserAvatar name="Nilüfer Belediyesi" shape="square" />
<UserAvatarGroup label="Atananlar" people={assignees} max={4} />
```

Without a picture the initials (one letter at `xs`) appear on a soft fill
in one of the eight categorical colours, chosen from the name
(`avatarTone`), so a person keeps their colour everywhere. `tooltip` shows
the name and status on hover. `UserAvatarGroup` shows `max` avatars, folds
the rest into "+N" with their names in its tooltip, and leaves status dots
out (they would be covered).

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

### `lib/search`

`foldText(text)` (Turkish lowercase without diacritics, index-preserving),
`matchesQuery(query, label, keywords?)`, `matchRange(text, query)` — for
client-side filters such as the sidebar search.

### `lib/theme`

`useAppearance()`, `setAppearance`, `resetAppearance`, `setTheme`,
`configureAppearance`, `classesOf`, `defaultAppearance` and the types
`Appearance`, `ThemeMode`, `FontChoice`, `Density`, `Radius`, `Accent`,
`Elevation`. See [theming.md](theming.md).
