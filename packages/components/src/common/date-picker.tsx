import { CalendarIcon, XIcon } from "lucide-react";
import { Popover as PopoverPrimitive, Slot } from "radix-ui";
import { type ReactElement, type ReactNode, useRef, useState } from "react";
import {
  type DateRange,
  type DateRangePreset,
  defaultRangePresets,
  formatDay,
  formatRange,
  isSameDay,
  today,
} from "../lib/date";
import { useIsMobile } from "../lib/use-mobile";
import { cn } from "../lib/utils";
import { ActionSheet, ActionSheetContent } from "./action-sheet";
import { Calendar } from "./calendar";

/*
 * Date fields: a button that shows the chosen day (or range) and opens a
 * calendar, as a dropdown on desktop and a bottom sheet on phones.
 *
 *   <DatePicker value={due} onValueChange={setDue} clearable />
 *   <DateRangePicker value={period} onValueChange={setPeriod} />
 *
 * DateRangePicker lists presets ("Son 7 gün", "Bu ay", …) beside two months;
 * a range is applied when its end is picked or a preset is chosen.
 */

type FieldBase = {
  placeholder?: string;
  min?: Date | null;
  max?: Date | null;
  /** Days that cannot be picked besides those outside min/max. */
  isDisabled?: (day: Date) => boolean;
  /** Shows an × that empties the field. */
  clearable?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  /** Forces the phone (true) or desktop (false) presentation. */
  mobile?: boolean;
};

const triggerClass = cn(
  "flex h-[max(var(--control-h-md),2.5rem)] w-full min-w-0 items-center gap-2 rounded-md border border-(--input-border) bg-(--input-bg) px-2.5 text-left text-foreground text-sm outline-none transition-[color,box-shadow,border-color] duration-(--duration-fast) md:h-(--control-h-md)",
  "hover:border-(--input-border-hover) focus-visible:border-(--input-border-focus) focus-visible:shadow-(--focus-shadow) data-[state=open]:border-(--input-border-focus)",
  "disabled:cursor-not-allowed disabled:bg-(--surface-muted) disabled:opacity-70",
  "aria-invalid:border-destructive aria-invalid:focus-visible:shadow-(--shadow-focus-danger)",
);

/** The field button, an optional clear button, and the dropdown or sheet. */
function DateField({
  open,
  onOpenChange,
  text,
  placeholder,
  sheetTitle,
  onClear,
  clearLabel,
  disabled,
  id,
  className,
  ariaLabel,
  ariaInvalid,
  sheet,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string | null;
  placeholder: string;
  sheetTitle: string;
  onClear?: () => void;
  clearLabel: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  ariaLabel?: string;
  ariaInvalid?: FieldBase["aria-invalid"];
  sheet: boolean;
  children: ReactNode;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const field = (
    <button
      ref={button}
      id={id}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={ariaLabel ? `${ariaLabel}: ${text ?? placeholder}` : undefined}
      aria-invalid={ariaInvalid}
      disabled={disabled}
      className={cn(triggerClass, onClear && "pr-9")}
    >
      <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className={cn("min-w-0 flex-1 truncate tabular", !text && "text-subtle")}>
        {text ?? placeholder}
      </span>
    </button>
  );
  const clear = onClear ? (
    <button
      type="button"
      aria-label={clearLabel}
      onClick={() => {
        onClear();
        button.current?.focus();
      }}
      className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow) [&>svg]:size-3.5"
    >
      <XIcon />
    </button>
  ) : null;

  if (sheet) {
    return (
      <div className={cn("relative w-full min-w-0", className)}>
        <Slot.Root onClick={() => onOpenChange(true)}>{field as ReactElement}</Slot.Root>
        {clear}
        <ActionSheet open={open} onOpenChange={onOpenChange}>
          <ActionSheetContent title={sheetTitle} bodyClassName="items-center">
            {children}
          </ActionSheetContent>
        </ActionSheet>
      </div>
    );
  }
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Anchor asChild>
        <div className={cn("relative w-full min-w-0", className)}>
          <PopoverPrimitive.Trigger asChild>{field}</PopoverPrimitive.Trigger>
          {clear}
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          // The calendar focuses its own day.
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-50 w-auto origin-(--radix-popover-content-transform-origin) overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-(--shadow-lg) outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

const footerButton =
  "h-8 rounded-md px-2.5 font-medium text-sm outline-none transition-colors duration-(--duration-fast) hover:bg-(--surface-hover) focus-visible:shadow-(--focus-shadow) disabled:pointer-events-none disabled:opacity-40";

/** One day. */
export function DatePicker({
  value,
  onValueChange,
  placeholder = "Tarih seçin",
  min,
  max,
  isDisabled,
  clearable = false,
  clearLabel = "Tarihi temizle",
  showToday = true,
  format = formatDay,
  disabled,
  id,
  className,
  mobile,
  ...aria
}: FieldBase & {
  value: Date | null;
  onValueChange: (value: Date | null) => void;
  /** A "Bugün" button under the calendar. */
  showToday?: boolean;
  /** How the field writes the day; "26 Kas 2026" by default. */
  format?: (day: Date) => string;
}) {
  const [open, setOpen] = useState(false);
  const sheet = useIsMobile(mobile);
  const now = today();
  const todayAllowed = (!min || now >= min) && (!max || now <= max) && !(isDisabled?.(now) ?? false);
  const choose = (d: Date | null) => {
    onValueChange(d);
    setOpen(false);
  };
  return (
    <DateField
      open={open}
      onOpenChange={setOpen}
      text={value ? format(value) : null}
      placeholder={placeholder}
      sheetTitle={placeholder}
      onClear={clearable && value && !disabled ? () => onValueChange(null) : undefined}
      clearLabel={clearLabel}
      disabled={disabled}
      id={id}
      className={className}
      ariaLabel={aria["aria-label"]}
      ariaInvalid={aria["aria-invalid"]}
      sheet={sheet}
    >
      <Calendar
        value={value}
        onValueChange={choose}
        min={min}
        max={max}
        isDisabled={isDisabled}
        autoFocus={!sheet}
      />
      {showToday ? (
        <div className="flex justify-between gap-2 border-t px-3 py-2 max-md:w-full max-md:border-t-0">
          <button
            type="button"
            className={cn(footerButton, "text-(--text-brand)")}
            disabled={!todayAllowed || isSameDay(value, now)}
            onClick={() => choose(now)}
          >
            Bugün
          </button>
          {value && clearable ? (
            <button
              type="button"
              className={cn(footerButton, "text-muted-foreground")}
              onClick={() => choose(null)}
            >
              Temizle
            </button>
          ) : null}
        </div>
      ) : null}
    </DateField>
  );
}

/** A range of days, with presets. */
export function DateRangePicker({
  value,
  onValueChange,
  placeholder = "Tarih aralığı seçin",
  presets = defaultRangePresets,
  maxDays,
  min,
  max,
  isDisabled,
  clearable = false,
  clearLabel = "Aralığı temizle",
  disabled,
  id,
  className,
  mobile,
  ...aria
}: FieldBase & {
  value: DateRange;
  onValueChange: (value: DateRange) => void;
  /** Named ranges beside the calendar; [] hides them. */
  presets?: readonly DateRangePreset[];
  /** Longest range in days. */
  maxDays?: number;
}) {
  const [open, setOpen] = useState(false);
  const sheet = useIsMobile(mobile);
  // The range being picked; applied when it is complete.
  const [draft, setDraft] = useState<DateRange>(value);
  const openChange = (next: boolean) => {
    if (next) setDraft(value);
    setOpen(next);
  };
  const apply = (r: DateRange) => {
    onValueChange(r);
    setOpen(false);
  };
  const complete = value.from && value.to ? value : null;
  const active = complete
    ? presets.find((p) => {
        const r = p.range();
        return isSameDay(r.from, complete.from) && isSameDay(r.to, complete.to);
      })
    : undefined;

  return (
    <DateField
      open={open}
      onOpenChange={openChange}
      text={complete?.from && complete.to ? formatRange(complete.from, complete.to) : null}
      placeholder={placeholder}
      sheetTitle={placeholder}
      onClear={clearable && complete && !disabled ? () => onValueChange({ from: null, to: null }) : undefined}
      clearLabel={clearLabel}
      disabled={disabled}
      id={id}
      className={className}
      ariaLabel={aria["aria-label"]}
      ariaInvalid={aria["aria-invalid"]}
      sheet={sheet}
    >
      <div className={cn("flex", sheet ? "w-full flex-col items-center" : "items-stretch")}>
        {presets.length ? (
          // biome-ignore lint/a11y/useSemanticElements: a fieldset would add form semantics to a row of shortcuts.
          <div
            role="group"
            aria-label="Hazır aralıklar"
            className={cn(
              sheet
                ? "flex w-full gap-1.5 overflow-x-auto px-3 pt-1 pb-2 [scrollbar-width:none]"
                : "flex w-36 shrink-0 flex-col gap-0.5 border-r p-2",
            )}
          >
            {presets.map((p) => {
              const on = p === active;
              return (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => apply(p.range())}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-md text-left text-sm outline-none transition-colors duration-(--duration-fast) focus-visible:shadow-(--focus-shadow)",
                    sheet ? "h-9 rounded-full border px-3.5" : "h-8 px-2.5 hover:bg-(--surface-hover)",
                    on &&
                      (sheet
                        ? "border-(--border-brand) bg-(--surface-brand-subtle) font-medium text-(--text-brand)"
                        : "bg-(--surface-selected) font-medium text-(--text-brand) hover:bg-(--surface-selected)"),
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        ) : null}
        <div className="grid">
          <Calendar
            mode="range"
            value={draft}
            numberOfMonths={sheet ? 1 : 2}
            month={undefined}
            min={min}
            max={max}
            maxDays={maxDays}
            isDisabled={isDisabled}
            autoFocus={!sheet}
            onValueChange={(r) => {
              setDraft(r);
              if (r.from && r.to) apply(r);
            }}
          />
          <p aria-live="polite" className="px-4 pb-3 text-muted-foreground text-xs">
            {draft.from && !draft.to
              ? `Başlangıç: ${formatDay(draft.from)}. Bitiş gününü seçin.`
              : "Başlangıç ve bitiş gününü seçin."}
            {maxDays ? ` En çok ${maxDays} gün.` : null}
          </p>
        </div>
      </div>
    </DateField>
  );
}
