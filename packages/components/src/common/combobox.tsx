import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { Popover as PopoverPrimitive, Slot } from "radix-ui";
import { type ComponentType, type ReactElement, type ReactNode, useMemo, useRef, useState } from "react";
import { matchesQuery } from "../lib/search";
import { useIsMobile } from "../lib/use-mobile";
import { cn } from "../lib/utils";
import { Badge } from "../ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { ActionSheet, ActionSheetContent } from "./action-sheet";
import { Spinner } from "./spinner";

/*
 * Pickers with a search box: Combobox chooses one value, MultiSelect several.
 * On desktop the list drops down under the field; on phones it opens as a
 * bottom sheet with a large touch target per row. Matching is Turkish-aware
 * ("istanbul" finds "İstanbul", "cankaya" finds "Çankaya") and also looks at
 * each option's keywords. For server-side search pass onSearchChange (the
 * list is then shown as given) and loading.
 *
 *   <Combobox options={districts} value={district} onValueChange={setDistrict} placeholder="İlçe seçin" />
 *   <MultiSelect options={tags} value={tags} onValueChange={setTags} placeholder="Etiket ekleyin" />
 */

export type ComboboxOption = {
  value: string;
  label: string;
  description?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  /** Options with the same group are listed under that heading, in order of first appearance. */
  group?: string;
  /** Extra words the search matches (codes, old names). */
  keywords?: readonly string[];
  disabled?: boolean;
};

type PickerText = {
  /** Shown in the field while nothing is chosen. */
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  /** Title of the phone sheet; defaults to the placeholder. */
  title?: string;
};

type PickerBase = PickerText & {
  options: readonly ComboboxOption[];
  /** Server-side search: called with the query; the options are shown unfiltered. */
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  /** Forces the phone (true) or desktop (false) presentation. */
  mobile?: boolean;
};

const triggerClass = cn(
  "flex w-full min-w-0 items-center gap-2 rounded-md border border-(--input-border) bg-(--input-bg) px-2.5 text-left text-foreground text-sm outline-none transition-[color,box-shadow,border-color] duration-(--duration-fast)",
  "hover:border-(--input-border-hover) focus-visible:border-(--input-border-focus) focus-visible:shadow-(--focus-shadow)",
  "data-[state=open]:border-(--input-border-focus)",
  "disabled:cursor-not-allowed disabled:bg-(--surface-muted) disabled:opacity-70",
  "aria-invalid:border-destructive aria-invalid:focus-visible:shadow-(--shadow-focus-danger)",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
);

function useFiltered(options: readonly ComboboxOption[], query: string, server: boolean) {
  return useMemo(() => {
    const shown = server ? options : options.filter((o) => matchesQuery(query, o.label, o.keywords));
    const groups = new Map<string, ComboboxOption[]>();
    for (const o of shown) {
      const key = o.group ?? "";
      const list = groups.get(key);
      if (list) list.push(o);
      else groups.set(key, [o]);
    }
    return [...groups.entries()];
  }, [options, query, server]);
}

/** The search box and the list; shared by the dropdown and the sheet. */
function PickerList({
  options,
  isSelected,
  onPick,
  multiple,
  searchPlaceholder = "Ara",
  emptyText = "Eşleşen seçenek yok.",
  onSearchChange,
  loading,
  sheet,
}: {
  options: readonly ComboboxOption[];
  isSelected: (value: string) => boolean;
  onPick: (option: ComboboxOption) => void;
  multiple: boolean;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  sheet: boolean;
}) {
  const [query, setQuery] = useState("");
  const groups = useFiltered(options, query, !!onSearchChange);
  return (
    <Command shouldFilter={false} loop className={cn("bg-transparent", sheet && "min-h-0 flex-1")}>
      <CommandInput
        value={query}
        onValueChange={(q) => {
          setQuery(q);
          onSearchChange?.(q);
        }}
        placeholder={searchPlaceholder}
        // A phone keyboard would cover half of a short list; desktop types at once.
        autoFocus={!sheet}
        className={cn(sheet && "text-base")}
      />
      <CommandList className={cn(sheet ? "max-h-none min-h-0 flex-1" : "max-h-72")}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
            <Spinner />
            Yükleniyor…
          </div>
        ) : (
          <CommandEmpty className="py-6 text-center text-muted-foreground text-sm">{emptyText}</CommandEmpty>
        )}
        {loading
          ? null
          : groups.map(([group, items]) => (
              <CommandGroup key={group} heading={group || undefined}>
                {items.map((o) => {
                  const selected = isSelected(o.value);
                  const Icon = o.icon;
                  return (
                    <CommandItem
                      key={o.value}
                      value={o.value}
                      disabled={o.disabled}
                      onSelect={() => onPick(o)}
                      aria-selected={undefined}
                      data-checked={selected || undefined}
                      className={cn(
                        "gap-2.5 data-[selected=true]:bg-(--surface-hover) data-[selected=true]:text-foreground",
                        sheet && "min-h-11 rounded-lg px-3 text-md",
                      )}
                    >
                      {multiple ? (
                        <span
                          aria-hidden
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded-[4px] border border-input",
                            selected && "border-primary bg-primary text-primary-foreground",
                          )}
                        >
                          {selected ? <CheckIcon className="size-3 text-current" /> : null}
                        </span>
                      ) : null}
                      {Icon ? <Icon /> : null}
                      <span className="grid min-w-0 flex-1">
                        <span className={cn("truncate", selected && !multiple && "font-medium")}>
                          {o.label}
                        </span>
                        {o.description ? (
                          <span className="truncate text-muted-foreground text-xs">{o.description}</span>
                        ) : null}
                      </span>
                      {!multiple && selected ? <CheckIcon className="text-(--text-brand)" /> : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
      </CommandList>
    </Command>
  );
}

/**
 * The button that opens the list: the popover's own trigger on desktop (so a
 * second click closes it), a plain button that opens the sheet on phones.
 */
function TriggerSlot({
  sheet,
  onOpen,
  children,
}: {
  sheet: boolean;
  onOpen: () => void;
  children: ReactElement;
}) {
  if (sheet) return <Slot.Root onClick={onOpen}>{children}</Slot.Root>;
  return <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>;
}

/** Dropdown on desktop, bottom sheet on phones, around the given trigger. */
function PickerFrame({
  open,
  onOpenChange,
  trigger,
  title,
  sheet,
  tall,
  doneLabel,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  sheet: boolean;
  /** Keeps a long list's sheet the same height while the search narrows it. */
  tall: boolean;
  doneLabel: string;
  children: (sheet: boolean) => ReactNode;
}) {
  if (sheet) {
    return (
      <>
        {trigger}
        <ActionSheet open={open} onOpenChange={onOpenChange}>
          <ActionSheetContent
            title={title}
            cancelLabel={doneLabel}
            className={cn(tall && "h-[min(80svh,40rem)]")}
            // The list scrolls under a fixed search box.
            bodyClassName="overflow-hidden"
          >
            {children(true)}
          </ActionSheetContent>
        </ActionSheet>
      </>
    );
  }
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Anchor asChild>
        <div className="w-full min-w-0">{trigger}</div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="z-50 w-(--radix-popover-trigger-width) min-w-60 max-w-[calc(100vw-1rem)] origin-(--radix-popover-content-transform-origin) overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-(--shadow-lg) outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {children(false)}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/** Chooses one option from a searchable list. */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Seçin",
  title,
  clearable = false,
  clearLabel = "Seçimi temizle",
  disabled,
  id,
  className,
  mobile,
  searchPlaceholder,
  emptyText,
  onSearchChange,
  loading,
  ...aria
}: PickerBase & {
  value: string | null;
  onValueChange: (value: string | null) => void;
  /** Shows an × that empties the field. */
  clearable?: boolean;
  clearLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const sheet = useIsMobile(mobile);
  const button = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);
  const Icon = selected?.icon;
  const showClear = clearable && value !== null && !disabled;

  const trigger = (
    <div className={cn("relative w-full min-w-0", className)}>
      <TriggerSlot sheet={sheet} onOpen={() => setOpen(true)}>
        <button
          ref={button}
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={aria["aria-label"]}
          aria-invalid={aria["aria-invalid"]}
          disabled={disabled}
          data-placeholder={selected ? undefined : ""}
          className={cn(
            triggerClass,
            "h-[max(var(--control-h-md),2.5rem)] md:h-(--control-h-md)",
            showClear && "pr-14",
          )}
        >
          {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
          <span className={cn("min-w-0 flex-1 truncate", !selected && "text-subtle")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
        </button>
      </TriggerSlot>
      {showClear ? (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => {
            onValueChange(null);
            button.current?.focus();
          }}
          className="absolute top-1/2 right-7 grid size-7 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow) [&>svg]:size-3.5"
        >
          <XIcon />
        </button>
      ) : null}
    </div>
  );

  return (
    <PickerFrame
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title ?? placeholder}
      sheet={sheet}
      tall={options.length > 6 || !!onSearchChange}
      doneLabel="Vazgeç"
    >
      {(sheet) => (
        <PickerList
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
          onSearchChange={onSearchChange}
          loading={loading}
          options={options}
          multiple={false}
          sheet={sheet}
          isSelected={(v) => v === value}
          onPick={(o) => {
            onValueChange(o.value);
            setOpen(false);
          }}
        />
      )}
    </PickerFrame>
  );
}

/**
 * Chooses several options. The field shows the choices as badges (the first
 * maxBadges, then "+n"); each badge has its own remove button. The list stays
 * open while picking.
 */
export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Seçin",
  title,
  maxBadges = 3,
  removeLabel = (label: string) => `${label} seçimini kaldır`,
  clearLabel = "Tümünü temizle",
  disabled,
  id,
  className,
  mobile,
  searchPlaceholder,
  emptyText,
  onSearchChange,
  loading,
  ...aria
}: PickerBase & {
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  /** Badges shown before collapsing the rest into "+n". */
  maxBadges?: number;
  removeLabel?: (label: string) => string;
  clearLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const sheet = useIsMobile(mobile);
  const button = useRef<HTMLButtonElement>(null);
  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);
  const chosen = value.map((v) => byValue.get(v) ?? { value: v, label: v });
  const shown = chosen.slice(0, maxBadges);
  const hidden = chosen.length - shown.length;
  const toggle = (v: string) =>
    onValueChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  const trigger = (
    <div
      data-slot="multi-select"
      className={cn(
        triggerClass,
        "relative min-h-[max(var(--control-h-md),2.5rem)] flex-wrap gap-1 py-1 pr-14 md:min-h-(--control-h-md)",
        "has-[[data-trigger]:focus-visible]:border-(--input-border-focus) has-[[data-trigger]:focus-visible]:shadow-(--focus-shadow)",
        open && "border-(--input-border-focus)",
        disabled && "cursor-not-allowed bg-(--surface-muted) opacity-70",
        aria["aria-invalid"] && "border-destructive",
        className,
      )}
    >
      {shown.map((o) => (
        <Badge key={o.value} variant="secondary" className="max-w-40 gap-0.5 pr-0.5">
          <span className="truncate">{o.label}</span>
          <button
            type="button"
            aria-label={removeLabel(o.label)}
            disabled={disabled}
            onClick={() => toggle(o.value)}
            className="relative z-10 grid size-4 place-items-center rounded-sm opacity-60 outline-none hover:bg-(--surface-active) hover:opacity-100 focus-visible:shadow-(--focus-shadow) [&>svg]:size-3"
          >
            <XIcon />
          </button>
        </Badge>
      ))}
      {hidden > 0 ? (
        <Badge variant="outline" className="tabular">
          +{hidden}
        </Badge>
      ) : null}
      {/* The trigger covers the field; badges and the clear button sit above it. */}
      <TriggerSlot sheet={sheet} onOpen={() => setOpen(true)}>
        <button
          ref={button}
          id={id}
          type="button"
          role="combobox"
          data-trigger
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={
            aria["aria-label"] ??
            (chosen.length ? `${placeholder}: ${chosen.map((o) => o.label).join(", ")}` : placeholder)
          }
          aria-invalid={aria["aria-invalid"]}
          disabled={disabled}
          className="min-w-16 flex-1 self-stretch text-left outline-none before:absolute before:inset-0 before:content-[''] disabled:cursor-not-allowed"
        >
          {chosen.length === 0 ? <span className="text-subtle">{placeholder}</span> : null}
        </button>
      </TriggerSlot>
      {chosen.length > 0 && !disabled ? (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => {
            onValueChange([]);
            button.current?.focus();
          }}
          className="absolute top-1/2 right-7 z-10 grid size-7 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow) [&>svg]:size-3.5"
        >
          <XIcon />
        </button>
      ) : null}
      <ChevronsUpDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );

  return (
    <PickerFrame
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title ?? placeholder}
      sheet={sheet}
      tall={options.length > 6 || !!onSearchChange}
      doneLabel={value.length ? `Bitti (${value.length})` : "Bitti"}
    >
      {(sheet) => (
        <PickerList
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
          onSearchChange={onSearchChange}
          loading={loading}
          options={options}
          multiple
          sheet={sheet}
          isSelected={(v) => value.includes(v)}
          onPick={(o) => toggle(o.value)}
        />
      )}
    </PickerFrame>
  );
}
