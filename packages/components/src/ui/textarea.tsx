import * as React from "react";
import { cn } from "../lib/utils";

// field-sizing: content grows the box with its text where supported
// (Chromium, Safari); elsewhere the height follows scrollHeight on input.
const sizesItself =
  typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("field-sizing", "content");

function Textarea({
  className,
  minRows = 3,
  maxRows,
  showCount = false,
  style,
  onChange,
  value,
  defaultValue,
  maxLength,
  ref,
  ...props
}: React.ComponentProps<"textarea"> & {
  /** Height to start with, in lines (default 3). */
  minRows?: number;
  /** Stop growing here and scroll instead. */
  maxRows?: number;
  /** Shows "12/280" under the field (with maxLength) or the length. */
  showCount?: boolean;
}) {
  const inner = React.useRef<HTMLTextAreaElement | null>(null);
  const [length, setLength] = React.useState(String(value ?? defaultValue ?? "").length);
  const shownLength = value !== undefined ? String(value).length : length;

  const fit = React.useCallback(() => {
    const el = inner.current;
    if (!el || sizesItself) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: refit when a controlled value changes.
  React.useLayoutEffect(fit, [fit, value]);

  const textarea = (
    <textarea
      ref={(el) => {
        inner.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      data-slot="textarea"
      value={value}
      defaultValue={defaultValue}
      maxLength={maxLength}
      onChange={(e) => {
        setLength(e.target.value.length);
        fit();
        onChange?.(e);
      }}
      style={{
        minHeight: `calc(${minRows}lh + 1rem + 2px)`,
        maxHeight: maxRows ? `calc(${maxRows}lh + 1rem + 2px)` : undefined,
        ...style,
      }}
      className={cn(
        "flex field-sizing-content w-full resize-none rounded-md border border-(--input-border) bg-(--input-bg) px-2.5 py-2 text-base text-foreground leading-normal outline-none transition-[color,box-shadow,border-color] duration-(--duration-fast) placeholder:text-subtle hover:border-(--input-border-hover) focus-visible:border-(--input-border-focus) focus-visible:shadow-(--focus-shadow) focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-(--surface-muted) disabled:opacity-70 aria-invalid:border-destructive aria-invalid:focus-visible:shadow-(--shadow-focus-danger) md:text-sm",
        maxRows && "overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
  if (!showCount) return textarea;
  const near = maxLength !== undefined && shownLength >= maxLength * 0.9;
  return (
    <div data-slot="textarea-field" className="grid gap-1">
      {textarea}
      <p
        aria-live="polite"
        className={cn("justify-self-end text-subtle text-xs tabular", near && "text-(--status-warning-fg)")}
      >
        {shownLength}
        {maxLength !== undefined ? `/${maxLength}` : null}
      </p>
    </div>
  );
}

export { Textarea };
