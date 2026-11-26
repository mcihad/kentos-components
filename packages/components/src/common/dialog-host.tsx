import { type ComponentProps, lazy, type ReactNode, Suspense, useSyncExternalStore } from "react";
import type * as Dialogs from "./dialogs";

// The dialogs load on first use, so mounting the host costs the initial
// bundle almost nothing.
const load = () => import("./dialogs");
const MessageDialog = lazy(() => load().then((m) => ({ default: m.MessageDialog })));
const ConfirmDialog = lazy(() => load().then((m) => ({ default: m.ConfirmDialog })));
const InputDialog = lazy(() => load().then((m) => ({ default: m.InputDialog })));
const BusyDialog = lazy(() => load().then((m) => ({ default: m.BusyDialog })));
const ProgressDialog = lazy(() => load().then((m) => ({ default: m.ProgressDialog })));
const CountdownDialog = lazy(() => load().then((m) => ({ default: m.CountdownDialog })));

/*
 * Dialogs as function calls, for event handlers that just need an answer:
 *
 *   if (await dialogs.confirm({ title: "Proje silinsin mi?", tone: "danger", confirmLabel: "Sil" })) …
 *   const name = await dialogs.prompt({ title: "Panoyu yeniden adlandır", label: "Ad", defaultValue: d.name });
 *   const job = dialogs.busy("Rapor hazırlanıyor…"); try { … } finally { job.close(); }
 *   const p = dialogs.progress({ title: "Olaylar aktarılıyor", value: 0 }); p.update({ value: 40 }); p.done();
 *
 * Mount <DialogHost /> once near the root (next to the Toaster). The store
 * lives outside React, so the functions work anywhere in the application.
 */

type Entry = {
  id: number;
  open: boolean;
  props: unknown;
  render: (props: unknown, open: boolean, close: () => void) => ReactNode;
};

let entries: Entry[] = [];
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function patch(id: number, change: Partial<Entry>) {
  entries = entries.map((e) => (e.id === id ? { ...e, ...change } : e));
  emit();
}

// Close first (exit animation), then drop the entry.
function dismiss(id: number) {
  if (!entries.some((e) => e.id === id && e.open)) return;
  patch(id, { open: false });
  window.setTimeout(() => {
    entries = entries.filter((e) => e.id !== id);
    emit();
  }, 300);
}

function show<P>(props: P, render: (props: P, open: boolean, close: () => void) => ReactNode) {
  const id = ++seq;
  entries = [...entries, { id, open: true, props, render: (p, o, c) => render(p as P, o, c) }];
  emit();
  return {
    update(next: Partial<P>) {
      const entry = entries.find((e) => e.id === id);
      if (entry) patch(id, { props: { ...(entry.props as P), ...next } });
    },
    close() {
      dismiss(id);
    },
  };
}

type Without<T, K extends keyof T> = Omit<T, K>;

export type AlertOptions = Without<ComponentProps<typeof Dialogs.MessageDialog>, "open" | "onOpenChange">;
export type ConfirmOptions = Without<
  ComponentProps<typeof Dialogs.ConfirmDialog>,
  "open" | "onOpenChange" | "onConfirm"
> & {
  /** Work to run on confirm; while its promise runs the dialog shows a spinner. */
  onConfirm?: () => unknown | Promise<unknown>;
};
export type PromptOptions = Without<
  ComponentProps<typeof Dialogs.InputDialog>,
  "open" | "onOpenChange" | "onSubmit"
> & {
  onSubmit?: (value: string) => unknown | Promise<unknown>;
};
export type BusyOptions = Without<ComponentProps<typeof Dialogs.BusyDialog>, "open">;
export type ProgressOptions = Without<ComponentProps<typeof Dialogs.ProgressDialog>, "open" | "onOpenChange">;
export type CountdownOptions = Without<
  ComponentProps<typeof Dialogs.CountdownDialog>,
  "open" | "onOpenChange" | "onElapsed"
> & { onElapsed?: () => void };
export type CountdownResult = "confirm" | "cancel" | "elapsed";

/** A dialog that stays until the code closes it. */
export type DialogHandle<P> = { update: (next: Partial<P>) => void; close: () => void };

export const dialogs = {
  /** A message with one button; resolves when it is acknowledged. */
  alert(options: AlertOptions): Promise<void> {
    return new Promise((resolve) => {
      show(options, (p, open, close) => (
        <MessageDialog
          {...p}
          open={open}
          onOpenChange={(next) => {
            if (next) return;
            close();
            resolve();
          }}
        />
      ));
    });
  },

  /** Resolves true once confirmed (and onConfirm succeeded), false when cancelled. */
  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      let confirmed = false;
      show(options, (p, open, close) => (
        <ConfirmDialog
          {...p}
          open={open}
          onConfirm={() => {
            const result = p.onConfirm?.();
            if (result instanceof Promise)
              return result.then(() => {
                confirmed = true;
              });
            confirmed = true;
            return undefined;
          }}
          onOpenChange={(next) => {
            if (next) return;
            close();
            resolve(confirmed);
          }}
        />
      ));
    });
  },

  /** Resolves with the submitted value, or null when cancelled. */
  prompt(options: PromptOptions): Promise<string | null> {
    return new Promise((resolve) => {
      let value: string | null = null;
      show(options, (p, open, close) => (
        <InputDialog
          {...p}
          open={open}
          onSubmit={(v) => {
            const result = p.onSubmit?.(v);
            const keep = () => {
              value = v;
            };
            if (result instanceof Promise) return result.then(keep);
            keep();
            return undefined;
          }}
          onOpenChange={(next) => {
            if (next) return;
            close();
            resolve(value);
          }}
        />
      ));
    });
  },

  /** Blocks the screen until close(); update() changes the text. */
  busy(options: BusyOptions | string = {}): DialogHandle<BusyOptions> {
    const props = typeof options === "string" ? { title: options } : options;
    return show(props, (p, open) => <BusyDialog {...p} open={open} />);
  },

  /** Measurable work: update({ value, status, steps }), then done() or close(). */
  progress(options: ProgressOptions): DialogHandle<ProgressOptions> & {
    done: (next?: Partial<ProgressOptions>) => void;
  } {
    const handle = show(options, (p, open, close) => (
      <ProgressDialog
        {...p}
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      />
    ));
    return { ...handle, done: (next) => handle.update({ ...next, done: true }) };
  },

  /** Resolves with how it ended: the confirm button, the cancel button or the timer. */
  countdown(options: CountdownOptions): Promise<CountdownResult> {
    return new Promise((resolve) => {
      let result: CountdownResult = "confirm";
      show(options, (p, open, close) => (
        <CountdownDialog
          {...p}
          open={open}
          onConfirm={() => {
            result = "confirm";
            p.onConfirm?.();
          }}
          onCancel={() => {
            result = "cancel";
            p.onCancel?.();
          }}
          onElapsed={() => {
            result = "elapsed";
            p.onElapsed?.();
          }}
          onOpenChange={(next) => {
            if (next) return;
            close();
            resolve(result);
          }}
        />
      ));
    });
  },
};

/** Renders the dialogs opened through `dialogs`; mount once. */
export function DialogHost() {
  const list = useSyncExternalStore(
    subscribe,
    () => entries,
    () => entries,
  );
  return (
    <>
      {list.map((e) => (
        <Suspense key={e.id} fallback={null}>
          {e.render(e.props, e.open, () => dismiss(e.id))}
        </Suspense>
      ))}
    </>
  );
}
