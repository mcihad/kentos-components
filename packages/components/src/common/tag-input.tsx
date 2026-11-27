import { XIcon } from "lucide-react";
import { type ClipboardEvent, type ComponentProps, type KeyboardEvent, useId, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { Badge } from "../ui/badge";

/*
 * Free-text tags in one field: labels, e-mail recipients, release names.
 * Enter or a comma adds the typed text; pasting a list (commas, semicolons,
 * new lines) adds each item; Backspace in an empty field selects the last
 * tag and a second Backspace removes it. Duplicates (case-insensitive,
 * Turkish rules) are ignored. For choosing from a known list use
 * MultiSelect instead.
 *
 *   <TagInput value={tags} onValueChange={setTags} placeholder="Etiket ekleyin" />
 *   <TagInput value={emails} onValueChange={setEmails} validate={(t) => (isEmail(t) ? undefined : "Geçerli bir e-posta yazın.")} />
 */

const separators = /[,;\n\r\t]+/;

export function TagInput({
  value,
  onValueChange,
  placeholder,
  max,
  validate,
  normalize = (t) => t.trim(),
  disabled = false,
  invalid = false,
  removeLabel = (t) => `${t} kaldır`,
  className,
  id,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange" | "defaultValue" | "max"> & {
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Most tags allowed; the field hides when reached. */
  max?: number;
  /** Returns an error sentence to reject a tag (shown under the field). */
  validate?: (tag: string) => string | undefined;
  /** Cleans a tag before it is added (default: trim). */
  normalize?: (tag: string) => string;
  invalid?: boolean;
  removeLabel?: (tag: string) => string;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();
  const [armed, setArmed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const inputId = id ?? autoId;
  const full = max !== undefined && value.length >= max;

  const add = (raw: string[]) => {
    const next = [...value];
    const seen = new Set(next.map((t) => t.toLocaleLowerCase("tr")));
    let problem: string | undefined;
    for (const item of raw) {
      const tag = normalize(item);
      if (!tag) continue;
      const key = tag.toLocaleLowerCase("tr");
      if (seen.has(key)) continue;
      if (max !== undefined && next.length >= max) break;
      const message = validate?.(tag);
      if (message) {
        problem = message;
        continue;
      }
      seen.add(key);
      next.push(tag);
    }
    setError(problem);
    if (next.length !== value.length) onValueChange(next);
    return !problem;
  };

  const commit = () => {
    if (!draft.trim()) return;
    if (add([draft])) setDraft("");
  };

  const remove = (index: number) => {
    onValueChange(value.filter((_, i) => i !== index));
    setArmed(false);
    input.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      if (draft.trim()) {
        e.preventDefault();
        commit();
      } else if (e.key === ",") e.preventDefault();
      return;
    }
    if (e.key === "Backspace" && !draft && value.length > 0) {
      e.preventDefault();
      if (armed) remove(value.length - 1);
      else setArmed(true);
      return;
    }
    if (e.key === "Escape" && armed) {
      setArmed(false);
      return;
    }
    setArmed(false);
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!separators.test(text)) return;
    e.preventDefault();
    add((draft + text).split(separators));
    setDraft("");
  };

  return (
    <div className="grid gap-1.5">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: a click on the frame focuses the field inside; the field itself is the control. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users reach the field directly. */}
      <div
        data-slot="tag-input"
        data-disabled={disabled || undefined}
        aria-invalid={invalid || !!error || undefined}
        onClick={() => input.current?.focus()}
        className={cn(
          "flex min-h-[max(var(--control-h-md),2.5rem)] w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border border-(--input-border) bg-(--input-bg) px-1.5 py-1 md:min-h-(--control-h-md)",
          "transition-[border-color,box-shadow] duration-(--duration-fast) hover:border-(--input-border-hover)",
          "has-[input:focus-visible]:border-(--input-border-focus) has-[input:focus-visible]:shadow-(--focus-shadow)",
          "aria-invalid:border-destructive aria-invalid:has-[input:focus-visible]:shadow-(--shadow-focus-danger)",
          "data-[disabled]:cursor-not-allowed data-[disabled]:bg-(--surface-muted) data-[disabled]:opacity-70",
          className,
        )}
      >
        <ul aria-label="Eklenenler" className="contents">
          {value.map((tag, i) => (
            <li key={tag} className="contents">
              <Badge
                variant="secondary"
                shape="square"
                className={cn(
                  "h-6 max-w-full pr-0.5 text-sm",
                  armed && i === value.length - 1 && "bg-(--surface-active) shadow-(--focus-shadow)",
                )}
              >
                <span className="truncate">{tag}</span>
                {disabled ? null : (
                  <button
                    type="button"
                    aria-label={removeLabel(tag)}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(i);
                    }}
                    className="grid size-5 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow)"
                  >
                    <XIcon className="size-3" />
                  </button>
                )}
              </Badge>
            </li>
          ))}
        </ul>
        {full ? null : (
          <input
            ref={input}
            id={inputId}
            value={draft}
            disabled={disabled}
            placeholder={value.length === 0 ? placeholder : undefined}
            aria-invalid={invalid || !!error || undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            onChange={(e) => {
              setError(undefined);
              setArmed(false);
              const text = e.target.value;
              // Phone keyboards send the comma as text, not as a key event.
              if (separators.test(text)) {
                const parts = text.split(separators);
                const rest = parts.pop() ?? "";
                // A rejected tag stays in the field (without the separator) to be fixed.
                setDraft(add(parts) ? rest : text.replace(/[,;\n\r\t]+$/, ""));
                return;
              }
              setDraft(text);
            }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            onBlur={() => {
              commit();
              setArmed(false);
            }}
            enterKeyHint="enter"
            autoComplete="off"
            className="h-7 min-w-24 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-subtle disabled:cursor-not-allowed md:text-sm"
            {...props}
          />
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-(--status-danger-fg) text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
