import { type ComponentProps, useId, useRef, useState } from "react";
import { cn } from "../lib/utils";

/*
 * A one-time code field (two-factor, e-mail verification): separate boxes
 * that are really one input underneath, so typing, pasting the whole code,
 * the phone's SMS autofill (autocomplete="one-time-code"), backspace and
 * screen readers all work as with a normal field. Calls onComplete when the
 * last character arrives.
 *
 *   <OtpInput length={6} value={code} onValueChange={setCode} onComplete={verify} />
 */
export function OtpInput({
  length = 6,
  value,
  onValueChange,
  onComplete,
  mode = "numeric",
  groupSize,
  disabled,
  className,
  id,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange" | "maxLength" | "type"> & {
  length?: number;
  value: string;
  onValueChange: (value: string) => void;
  onComplete?: (value: string) => void;
  /** numeric: digits only; alphanumeric: letters and digits (upper-cased). */
  mode?: "numeric" | "alphanumeric";
  /** Puts a gap after every n boxes, e.g. 3 for "123 456". */
  groupSize?: number;
}) {
  const fallbackId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [caret, setCaret] = useState(0);

  const clean = (text: string) =>
    (mode === "numeric"
      ? text.replace(/\D/g, "")
      : text.replace(/[^0-9a-z]/gi, "").toLocaleUpperCase("tr")
    ).slice(0, length);

  const update = (next: string) => {
    const v = clean(next);
    onValueChange(v);
    setCaret(Math.min(v.length, length - 1));
    if (v.length === length && v !== value) onComplete?.(v);
  };

  const active = Math.min(caret, value.length, length - 1);
  return (
    <div
      data-slot="otp-input"
      className={cn(
        "relative flex w-full min-w-0 max-w-max items-center gap-1.5 sm:gap-2",
        disabled && "opacity-60",
        className,
      )}
    >
      {Array.from({ length }, (_, i) => {
        const char = value[i] ?? "";
        const isActive = focused && i === active;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: the boxes are positions of the code.
          <div key={i} className="contents">
            {groupSize && i > 0 && i % groupSize === 0 ? (
              <span aria-hidden className="h-0.5 w-2 shrink-0 rounded-full bg-(--border-strong)" />
            ) : null}
            <div
              aria-hidden
              data-active={isActive || undefined}
              data-filled={char ? true : undefined}
              className={cn(
                "relative grid h-11 w-11 min-w-7 shrink place-items-center rounded-md border border-(--input-border) bg-(--input-bg) font-mono font-semibold text-lg text-strong transition-[border-color,box-shadow] duration-(--duration-fast) md:h-10 md:w-10",
                "data-[active]:border-(--input-border-focus) data-[active]:shadow-(--focus-shadow)",
                props["aria-invalid"] && "border-destructive",
              )}
            >
              {char}
              {isActive && !char ? <span className="h-5 w-px animate-pulse bg-foreground" /> : null}
            </div>
          </div>
        );
      })}
      <input
        ref={input}
        id={id ?? fallbackId}
        type="text"
        inputMode={mode === "numeric" ? "numeric" : "text"}
        autoComplete="one-time-code"
        autoCapitalize={mode === "numeric" ? "off" : "characters"}
        spellCheck={false}
        maxLength={length}
        value={value}
        disabled={disabled}
        onChange={(e) => update(e.target.value)}
        onFocus={(e) => {
          setFocused(true);
          // Continue where the code ends.
          const end = e.currentTarget.value.length;
          e.currentTarget.setSelectionRange(end, end);
          setCaret(end);
        }}
        onBlur={() => setFocused(false)}
        onSelect={(e) => setCaret(e.currentTarget.selectionStart ?? value.length)}
        className="absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent"
        {...props}
      />
    </div>
  );
}
