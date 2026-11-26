import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleIcon,
  CircleXIcon,
  InfoIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  type ComponentType,
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../lib/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import { Spinner } from "./spinner";

/*
 * Ready-made dialogs for the common moments of an application:
 *
 *   MessageDialog    tell something that needs acknowledging (info, success, warning, danger)
 *   ConfirmDialog    ask before acting; async confirm keeps it open with a spinner
 *   InputDialog      ask for one value with validation
 *   BusyDialog       block the screen while work runs (indeterminate)
 *   ProgressDialog   show measurable progress, optional steps, then done
 *   LoadingDialog    a dialog whose content is still loading (skeleton)
 *   CountdownDialog  something happens automatically when time runs out
 *
 * All are controlled (open / onOpenChange). For one-off calls from event
 * handlers, use the promise API in common/dialog-host (dialogs.confirm()).
 */

/** The colour and default icon of a dialog. */
export type DialogTone = "neutral" | "info" | "success" | "warning" | "danger";

type Icon = ComponentType<{ className?: string }>;

const toneIcon: Record<DialogTone, Icon> = {
  neutral: CircleHelpIcon,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: OctagonAlertIcon,
};

const toneClass: Record<DialogTone, string> = {
  neutral: "bg-(--surface-muted) text-muted-foreground",
  info: "bg-(--status-info-bg) text-(--status-info-fg)",
  success: "bg-(--status-success-bg) text-(--status-success-fg)",
  warning: "bg-(--status-warning-bg) text-(--status-warning-fg)",
  danger: "bg-(--status-danger-bg) text-(--status-danger-fg)",
};

/** The round icon tile at the start of a dialog. */
export function DialogToneIcon({
  tone = "neutral",
  icon,
  className,
}: {
  tone?: DialogTone;
  icon?: Icon;
  className?: string;
}) {
  const ToneIcon = icon ?? toneIcon[tone];
  return (
    <span
      aria-hidden
      data-tone={tone}
      className={cn("grid size-10 shrink-0 place-items-center rounded-full", toneClass[tone], className)}
    >
      <ToneIcon className="size-5" />
    </span>
  );
}

// Icon, title and description side by side; the body continues under the text.
function Heading({
  tone,
  icon,
  title,
  description,
  children,
  alert = true,
}: {
  tone?: DialogTone;
  icon?: Icon | false;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  alert?: boolean;
}) {
  const Title = alert ? AlertDialogTitle : DialogTitle;
  const Description = alert ? AlertDialogDescription : DialogDescription;
  return (
    <div className="flex gap-4">
      {icon === false ? null : <DialogToneIcon tone={tone} icon={icon || undefined} />}
      <div className="grid min-w-0 flex-1 content-start gap-1.5 pt-1.5">
        <Title>{title}</Title>
        {description ? <Description>{description}</Description> : null}
        {children ? <div className="mt-1.5 text-sm">{children}</div> : null}
      </div>
    </div>
  );
}

const footerClass = "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end";

/** Turns a thrown value into a sentence for the dialog. */
function describeError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

function ErrorLine({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 text-(--status-danger-fg) text-sm">
      <CircleXIcon className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

type Controlled = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * A message the user acknowledges with one button: the standard alert
 * dialog in four tones (and neutral).
 */
export function MessageDialog({
  open,
  onOpenChange,
  tone = "info",
  icon,
  title,
  description,
  children,
  okLabel = "Tamam",
  onOk,
}: Controlled & {
  tone?: DialogTone;
  icon?: Icon | false;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  okLabel?: string;
  onOk?: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <Heading tone={tone} icon={icon} title={title} description={description}>
          {children}
        </Heading>
        <div className={footerClass}>
          <Button
            variant={tone === "danger" ? "destructive" : "default"}
            onClick={() => {
              onOk?.();
              onOpenChange(false);
            }}
          >
            {okLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Asks before doing something. When onConfirm returns a promise the dialog
 * stays open with a spinner until it settles and shows the error if it
 * fails. With confirmText the user must type that text first (for
 * irreversible deletions).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  tone = "neutral",
  icon,
  title,
  description,
  children,
  confirmLabel = "Onayla",
  pendingLabel,
  cancelLabel = "Vazgeç",
  confirmText,
  confirmTextLabel,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  errorFallback = "İşlem tamamlanamadı. Yeniden deneyin.",
}: Controlled & {
  /** danger makes the confirm button destructive. */
  tone?: DialogTone;
  icon?: Icon | false;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  /** Button text while onConfirm runs, e.g. "Siliniyor…". */
  pendingLabel?: string;
  cancelLabel?: string;
  /** Text the user must type to enable the confirm button. */
  confirmText?: string;
  confirmTextLabel?: ReactNode;
  /** Keeps the confirm button off, e.g. until an acknowledgement in children is ticked. */
  confirmDisabled?: boolean;
  onConfirm: () => unknown | Promise<unknown>;
  onCancel?: () => void;
  errorFallback?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [typed, setTyped] = useState("");
  const inputId = useId();

  useEffect(() => {
    if (open) {
      setError(undefined);
      setTyped("");
      setPending(false);
    }
  }, [open]);

  // Case does not matter: e-mail addresses and slugs are typed as people remember them.
  const blocked =
    confirmDisabled ||
    (confirmText !== undefined && typed.trim().toLowerCase() !== confirmText.toLowerCase());
  const run = async () => {
    if (blocked || pending) return;
    setError(undefined);
    const result = onConfirm();
    if (!(result instanceof Promise)) {
      onOpenChange(false);
      return;
    }
    setPending(true);
    try {
      await result;
      onOpenChange(false);
    } catch (e) {
      setError(describeError(e, errorFallback));
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        if (!next) onCancel?.();
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <Heading tone={tone} icon={icon} title={title} description={description}>
          {children}
        </Heading>
        {confirmText !== undefined ? (
          <div className="grid gap-2">
            <Label htmlFor={inputId} className="font-normal text-sm">
              {confirmTextLabel ?? (
                <span>
                  Onaylamak için <strong className="font-mono font-semibold">{confirmText}</strong> yazın
                </span>
              )}
            </Label>
            <Input
              id={inputId}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void run();
              }}
              autoComplete="off"
              spellCheck={false}
              disabled={pending}
            />
          </div>
        ) : null}
        <ErrorLine message={error} />
        <div className={footerClass}>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <Button
            variant={tone === "danger" ? "destructive" : "default"}
            disabled={blocked || pending}
            onClick={() => void run()}
          >
            {pending ? <Spinner label={pendingLabel ?? confirmLabel} /> : null}
            {pending && pendingLabel ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Asks for one value (a name, a note). validate returns an error sentence or
 * nothing; onSubmit may be async and keeps the dialog open until it settles.
 */
export function InputDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  defaultValue = "",
  hint,
  multiline = false,
  type = "text",
  required = true,
  maxLength,
  submitLabel = "Kaydet",
  pendingLabel,
  cancelLabel = "Vazgeç",
  validate,
  onSubmit,
  errorFallback = "Kaydedilemedi. Yeniden deneyin.",
}: Controlled & {
  title: ReactNode;
  description?: ReactNode;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  hint?: ReactNode;
  multiline?: boolean;
  type?: "text" | "email" | "url" | "number";
  /** An empty value cannot be submitted. */
  required?: boolean;
  maxLength?: number;
  submitLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  validate?: (value: string) => string | undefined | null;
  onSubmit: (value: string) => unknown | Promise<unknown>;
  errorFallback?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [pending, setPending] = useState(false);
  const id = useId();
  const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setError(undefined);
      setSubmitError(undefined);
      setPending(false);
    }
  }, [open, defaultValue]);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (pending) return;
    const v = value.trim();
    const problem = required && !v ? `${label} boş bırakılamaz.` : validate?.(v);
    if (problem) {
      setError(problem);
      field.current?.focus();
      return;
    }
    setError(undefined);
    setSubmitError(undefined);
    const result = onSubmit(v);
    if (!(result instanceof Promise)) {
      onOpenChange(false);
      return;
    }
    setPending(true);
    try {
      await result;
      onOpenChange(false);
    } catch (err) {
      setSubmitError(describeError(err, errorFallback));
    } finally {
      setPending(false);
    }
  };

  const Field = multiline ? Textarea : Input;
  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <form onSubmit={(e) => void submit(e)} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Field
              ref={field}
              id={id}
              type={multiline ? undefined : type}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(undefined);
              }}
              placeholder={placeholder}
              maxLength={maxLength}
              aria-invalid={!!error}
              aria-describedby={error || hint ? `${id}-note` : undefined}
              disabled={pending}
              autoFocus
              rows={multiline ? 4 : undefined}
            />
            {error ? (
              <p id={`${id}-note`} role="alert" className="text-(--status-danger-fg) text-sm">
                {error}
              </p>
            ) : hint ? (
              <p id={`${id}-note`} className="text-muted-foreground text-sm">
                {hint}
              </p>
            ) : null}
            {maxLength ? (
              <p className="justify-self-end text-subtle text-xs tabular">
                {value.length}/{maxLength}
              </p>
            ) : null}
          </div>
          <ErrorLine message={submitError} />
          <div className={footerClass}>
            <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner label={pendingLabel ?? submitLabel} /> : null}
              {pending && pendingLabel ? pendingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Blocks the screen while work of unknown length runs. It cannot be
 * dismissed unless onCancel is given (then Escape and the button cancel).
 */
export function BusyDialog({
  open,
  title = "İşleniyor…",
  description,
  onCancel,
  cancelLabel = "İptal et",
}: {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  onCancel?: () => void;
  cancelLabel?: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => (!next ? onCancel?.() : undefined)}>
      <AlertDialogContent
        aria-busy="true"
        className="sm:max-w-sm"
        onEscapeKeyDown={(e) => {
          if (!onCancel) e.preventDefault();
        }}
      >
        <div className="grid justify-items-center gap-3 py-2 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-brand-subtle text-brand-ink">
            <Spinner className="size-6" label="Çalışıyor" />
          </span>
          <AlertDialogTitle className="text-md">{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
          {!description ? (
            <AlertDialogDescription className="sr-only">Lütfen bekleyin</AlertDialogDescription>
          ) : null}
        </div>
        {onCancel ? (
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** One line of a ProgressDialog's checklist. */
export type ProgressStep = {
  label: ReactNode;
  state: "pending" | "active" | "done" | "error";
};

function StepIcon({ state }: { state: ProgressStep["state"] }) {
  if (state === "done") return <CircleCheckIcon className="size-4 text-(--status-success-fg)" />;
  if (state === "error") return <CircleXIcon className="size-4 text-(--status-danger-fg)" />;
  if (state === "active") return <Spinner className="size-4 text-brand-ink" label="Sürüyor" />;
  return <CircleIcon className="size-4 text-subtle" />;
}

/**
 * Measurable work: a bar with percentage and a status line, optionally a
 * checklist of steps. value null shows an indeterminate bar. When done, the
 * bar turns green and the button closes the dialog; before that the optional
 * cancel button stops the work.
 */
export function ProgressDialog({
  open,
  onOpenChange,
  title,
  description,
  value,
  max = 100,
  status,
  steps,
  done = false,
  doneTitle,
  doneLabel = "Kapat",
  onCancel,
  cancelLabel = "İptal et",
}: Controlled & {
  title: ReactNode;
  description?: ReactNode;
  value: number | null;
  max?: number;
  /** What is happening now, e.g. "1.240 / 3.000 olay aktarıldı". */
  status?: ReactNode;
  steps?: ProgressStep[];
  done?: boolean;
  /** Title once done, e.g. "Aktarım tamamlandı". */
  doneTitle?: ReactNode;
  doneLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
}) {
  const percent = value === null ? null : Math.round((Math.min(value, max) / max) * 100);
  return (
    <AlertDialog open={open} onOpenChange={(next) => (done ? onOpenChange(next) : undefined)}>
      <AlertDialogContent
        aria-busy={!done}
        onEscapeKeyDown={(e) => {
          if (!done) {
            e.preventDefault();
            onCancel?.();
          }
        }}
      >
        <Heading
          tone={done ? "success" : "info"}
          icon={done ? CircleCheckIcon : undefined}
          title={done && doneTitle ? doneTitle : title}
          description={description}
        />
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-muted-foreground" aria-live="polite">
              {status}
            </span>
            {percent !== null ? (
              <span className="font-semibold text-strong tabular">%{done ? 100 : percent}</span>
            ) : null}
          </div>
          <Progress
            value={done ? max : value}
            max={max}
            aria-label="İlerleme"
            indicatorClassName={done ? "bg-(--status-success-fg)" : undefined}
          />
        </div>
        {steps?.length ? (
          <ol className="grid gap-2 rounded-lg border bg-sunken px-3 py-2.5 text-sm">
            {steps.map((step, i) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: steps are positional.
                key={i}
                data-state={step.state}
                className="flex items-center gap-2.5 data-[state=active]:font-medium data-[state=active]:text-strong data-[state=pending]:text-muted-foreground"
              >
                <StepIcon state={step.state} />
                <span className="min-w-0 flex-1">{step.label}</span>
              </li>
            ))}
          </ol>
        ) : null}
        <div className={footerClass}>
          {done ? (
            <Button onClick={() => onOpenChange(false)}>{doneLabel}</Button>
          ) : onCancel ? (
            <Button variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          ) : null}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * A regular dialog whose content arrives later: skeleton lines in the
 * content's place while loading, then the children.
 */
export function LoadingDialog({
  open,
  onOpenChange,
  title,
  description,
  loading,
  lines = 4,
  footer,
  className,
  children,
}: Controlled & {
  title: ReactNode;
  description?: ReactNode;
  loading: boolean;
  /** Number of skeleton lines while loading. */
  lines?: number;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-lg", className)} aria-busy={loading}>
        <div className="grid gap-1.5 pr-8">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </div>
        {loading ? (
          <div className="grid gap-2.5" role="status" aria-label="Yükleniyor">
            {Array.from({ length: lines }, (_, i) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholders.
                key={i}
                className={cn("h-4", i === lines - 1 ? "w-2/3" : i % 2 ? "w-5/6" : "w-full")}
              />
            ))}
          </div>
        ) : (
          <div className="min-w-0 text-sm">{children}</div>
        )}
        {footer ? <div className={footerClass}>{footer}</div> : null}
      </DialogContent>
    </Dialog>
  );
}

const ringRadius = 26;
const ringLength = 2 * Math.PI * ringRadius;

/**
 * Something happens automatically when the countdown ends (sign-out,
 * redirect, auto-confirm). The ring empties smoothly over the whole
 * duration (a single CSS animation); the number ticks each second.
 * confirm keeps the user (e.g. "Oturumda kal"); cancel acts now.
 */
export function CountdownDialog({
  open,
  onOpenChange,
  seconds,
  tone = "warning",
  title,
  description,
  confirmLabel = "Devam et",
  cancelLabel,
  onConfirm,
  onCancel,
  onElapsed,
}: Controlled & {
  seconds: number;
  tone?: DialogTone;
  title: ReactNode;
  /** Text, or a function of the seconds left. */
  description?: ReactNode | ((remaining: number) => ReactNode);
  confirmLabel?: string;
  /** Without it there is no second button. */
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onElapsed: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  // Callbacks in refs: a parent re-render must not restart the countdown.
  const elapsed = useRef(onElapsed);
  elapsed.current = onElapsed;
  const close = useRef(onOpenChange);
  close.current = onOpenChange;

  useEffect(() => {
    if (!open) return;
    const end = performance.now() + seconds * 1000;
    setRemaining(seconds);
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((end - performance.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(timer);
        elapsed.current();
        close.current(false);
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [open, seconds]);

  const text = typeof description === "function" ? description(remaining) : description;
  const stroke =
    tone === "danger"
      ? "var(--status-danger-fg)"
      : tone === "warning"
        ? "var(--status-warning-fg)"
        : "var(--brand-bg)";
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onEscapeKeyDown={() => onConfirm?.()}>
        <div className="flex gap-4">
          <div className="relative grid size-16 shrink-0 place-items-center" aria-hidden>
            <svg viewBox="0 0 64 64" className="absolute inset-0 size-16 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={ringRadius}
                fill="none"
                stroke="var(--surface-muted)"
                strokeWidth="5"
              />
              <circle
                key={open ? "running" : "idle"}
                cx="32"
                cy="32"
                r={ringRadius}
                fill="none"
                stroke={stroke}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={ringLength}
                style={{
                  ["--ring-length" as string]: `${ringLength}`,
                  animation: open ? `kentos-countdown ${seconds}s linear forwards` : undefined,
                }}
              />
            </svg>
            <span className="font-semibold text-lg text-strong tabular">{remaining}</span>
          </div>
          <div className="grid min-w-0 flex-1 content-start gap-1.5 pt-1">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription aria-live="polite">{text}</AlertDialogDescription>
          </div>
        </div>
        <div className={footerClass}>
          {cancelLabel ? (
            <Button
              variant="outline"
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            variant={tone === "danger" ? "destructive" : "default"}
            onClick={() => {
              onConfirm?.();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
