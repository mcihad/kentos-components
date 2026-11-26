import { EyeIcon, EyeOffIcon, MinusIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { type ComponentProps, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { Kbd } from "./kbd";

/*
 * Inputs with things attached: an icon or text before and after (a search
 * glass, "₺", ".kentos.dev"), buttons inside (clear, show password, + / −).
 * The group draws the field's border, hover and focus ring, and the invalid
 * state when the input has aria-invalid; the input inside stays bare.
 *
 *   <InputGroup>
 *     <InputGroupAddon><GlobeIcon /></InputGroupAddon>
 *     <InputGroupInput placeholder="alt-alan" />
 *     <InputGroupAddon align="end">.kentos.dev</InputGroupAddon>
 *   </InputGroup>
 *
 * Ready-made: SearchInput, PasswordInput, NumberInput.
 */

export function InputGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "relative flex h-[max(var(--control-h-md),2.5rem)] w-full min-w-0 items-stretch rounded-md border border-(--input-border) bg-(--input-bg) text-foreground transition-[box-shadow,border-color] duration-(--duration-fast) md:h-(--control-h-md)",
        "hover:border-(--input-border-hover) has-[input:focus-visible]:border-(--input-border-focus) has-[input:focus-visible]:shadow-(--focus-shadow)",
        "has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:has-[input:focus-visible]:shadow-(--shadow-focus-danger)",
        "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-(--surface-muted) has-[input:disabled]:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

/** The bare input inside a group. */
export function InputGroupInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-input"
      className={cn(
        "min-w-0 flex-1 bg-transparent px-2.5 text-base outline-none placeholder:text-subtle disabled:cursor-not-allowed md:text-sm",
        "[[data-align=start]+&]:pl-2 [&:has(+[data-align=end])]:pr-1.5",
        className,
      )}
      {...props}
    />
  );
}

/** An icon, text or buttons before (start) or after (end) the input. */
export function InputGroupAddon({
  align = "start",
  className,
  ...props
}: ComponentProps<"div"> & { align?: "start" | "end" }) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex shrink-0 select-none items-center gap-1 text-muted-foreground text-sm [&>svg:not([class*='size-'])]:size-4",
        align === "start" ? "order-first pl-2.5" : "order-last pr-1",
        className,
      )}
      {...props}
    />
  );
}

/** A small button inside a group (clear, reveal, step). */
export function InputGroupButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="input-group-button"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-sm text-muted-foreground outline-none transition-colors duration-(--duration-fast) hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow) disabled:pointer-events-none disabled:opacity-40 md:size-7 [&>svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A search field: glass icon, a clear button while there is text (Escape
 * clears too) and an optional shortcut hint.
 */
export function SearchInput({
  value,
  onValueChange,
  shortcut,
  clearLabel = "Aramayı temizle",
  className,
  onKeyDown,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
  /** Shown while empty, e.g. "/". */
  shortcut?: string;
  clearLabel?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onValueChange("");
          }
        }}
        autoComplete="off"
        spellCheck={false}
        className="[&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {value ? (
        <InputGroupAddon align="end">
          <InputGroupButton
            aria-label={clearLabel}
            onClick={() => {
              onValueChange("");
              ref.current?.focus();
            }}
          >
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      ) : shortcut ? (
        <InputGroupAddon align="end" className="pr-2 max-md:hidden">
          <Kbd>{shortcut}</Kbd>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

/** A password field with a show / hide button. */
export function PasswordInput({
  className,
  showLabel = "Parolayı göster",
  hideLabel = "Parolayı gizle",
  ...props
}: Omit<ComponentProps<"input">, "type"> & { showLabel?: string; hideLabel?: string }) {
  const [shown, setShown] = useState(false);
  return (
    <InputGroup className={className}>
      <InputGroupInput
        type={shown ? "text" : "password"}
        spellCheck={false}
        autoCapitalize="off"
        {...props}
      />
      <InputGroupAddon align="end">
        <InputGroupButton
          aria-label={shown ? hideLabel : showLabel}
          aria-pressed={shown}
          onClick={() => setShown(!shown)}
        >
          {shown ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

const trNumber = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 6, useGrouping: false });

// Accepts Turkish (1,5) and plain (1.5) decimals.
function parse(text: string): number | null {
  const t = text.trim().replace(/\s/g, "").replace(",", ".");
  if (t === "" || t === "-") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/**
 * A number field with − / + buttons, arrow keys (Shift for ×10), Turkish
 * decimal commas, clamping to min/max when the field is left, and optional
 * text around the value (prefix "₺", suffix "gün").
 */
export function NumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  decrementLabel = "Azalt",
  incrementLabel = "Artır",
  className,
  disabled,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange" | "type" | "min" | "max" | "step" | "prefix"> & {
  value: number | null;
  onValueChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  decrementLabel?: string;
  incrementLabel?: string;
}) {
  const [text, setText] = useState(value === null ? "" : trNumber.format(value));
  const editing = useRef(false);
  // Follow outside changes while the user is not typing.
  useEffect(() => {
    if (!editing.current) setText(value === null ? "" : trNumber.format(value));
  }, [value]);

  const clamp = (n: number) =>
    Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, n));
  const round = (n: number) => Number.parseFloat(n.toFixed(6));
  const commit = (n: number | null) => {
    const v = n === null ? null : round(clamp(n));
    onValueChange(v);
    setText(v === null ? "" : trNumber.format(v));
  };
  const nudge = (dir: 1 | -1, big = false) => commit((value ?? min ?? 0) + dir * step * (big ? 10 : 1));
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      nudge(e.key === "ArrowUp" ? 1 : -1, e.shiftKey);
    }
  };

  return (
    <InputGroup className={className}>
      {prefix ? <InputGroupAddon>{prefix}</InputGroupAddon> : null}
      <InputGroupInput
        type="text"
        inputMode="decimal"
        role="spinbutton"
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        value={text}
        disabled={disabled}
        onFocus={() => {
          editing.current = true;
        }}
        onChange={(e) => {
          setText(e.target.value);
          onValueChange(parse(e.target.value));
        }}
        onBlur={() => {
          editing.current = false;
          commit(parse(text));
        }}
        onKeyDown={onKey}
        className="tabular"
        {...props}
      />
      <InputGroupAddon align="end" className="gap-0.5">
        {suffix ? <span className="pr-1">{suffix}</span> : null}
        <InputGroupButton
          aria-label={decrementLabel}
          tabIndex={-1}
          disabled={disabled || (min !== undefined && value !== null && value <= min)}
          onClick={() => nudge(-1)}
        >
          <MinusIcon />
        </InputGroupButton>
        <InputGroupButton
          aria-label={incrementLabel}
          tabIndex={-1}
          disabled={disabled || (max !== undefined && value !== null && value >= max)}
          onClick={() => nudge(1)}
        >
          <PlusIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
