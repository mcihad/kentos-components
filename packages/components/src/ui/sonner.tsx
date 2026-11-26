import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useAppearance } from "../lib/theme";

// Toasts confirm what just happened ("Kaydedildi") or report a failure.
// tone="plain" (default) keeps them on the card surface with a coloured icon
// per type; tone="tinted" fills success, error, warning and info toasts with
// the status colours (light in light mode, deep in dark mode). Show them with
// toast(), toast.success(), toast.error(), toast.warning(), toast.info(),
// toast.loading() and toast.promise() from "sonner".

type ToastTone = "plain" | "tinted"

const surface = "!border-(--border-default) !bg-(--surface-card) !text-foreground"

// Dark-mode status fills are translucent; the tint is laid as an image over
// the card colour so a toast never shows what is behind it.

/**
 * Per-type classes of the tinted tone. Pass them to one toast to tint only
 * that one: toast.error("…", { classNames: tintedToastClassNames }).
 */
const tintedToastClassNames = {
  success: "!border-(--status-success-border) !bg-(--surface-card) !bg-[image:linear-gradient(var(--status-success-bg),var(--status-success-bg))] !text-(--status-success-fg)",
  error: "!border-(--status-danger-border) !bg-(--surface-card) !bg-[image:linear-gradient(var(--status-danger-bg),var(--status-danger-bg))] !text-(--status-danger-fg)",
  warning: "!border-(--status-warning-border) !bg-(--surface-card) !bg-[image:linear-gradient(var(--status-warning-bg),var(--status-warning-bg))] !text-(--status-warning-fg)",
  info: "!border-(--status-info-border) !bg-(--surface-card) !bg-[image:linear-gradient(var(--status-info-bg),var(--status-info-bg))] !text-(--status-info-fg)",
  default: surface,
  loading: surface,
}

const Toaster = ({ tone = "plain", toastOptions, ...props }: ToasterProps & { tone?: ToastTone }) => {
  const { resolved } = useAppearance();
  const tinted = tone === "tinted"

  return (
    <Sonner
      theme={resolved}
      className="toaster group"
      closeButton
      icons={{
        success: <CircleCheckIcon className="size-[1.125rem] text-status-success-fg" />,
        info: <InfoIcon className="size-[1.125rem] text-status-info-fg" />,
        warning: <TriangleAlertIcon className="size-[1.125rem] text-status-warning-fg" />,
        error: <OctagonXIcon className="size-[1.125rem] text-destructive" />,
        loading: <Loader2Icon className="size-[1.125rem] animate-spin text-muted-foreground" />,
      }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: `!items-start !gap-3 !rounded-lg !border !px-4 !py-3 !font-sans !shadow-(--shadow-lg) ${tinted ? "" : surface}`,
          title: tinted ? "!font-semibold !text-sm !text-current" : "!font-semibold !text-sm !text-strong",
          description: tinted ? "!text-current !text-sm" : "!text-muted-foreground !text-sm",
          icon: "!mt-px",
          actionButton:
            "!h-(--control-h-sm) !rounded-md !bg-primary !px-3 !font-semibold !text-primary-foreground !text-xs",
          cancelButton:
            "!h-(--control-h-sm) !rounded-md !border !border-current/25 !bg-transparent !px-3 !font-semibold !text-current !text-xs",
          closeButton:
            "!border-(--border-default) !bg-(--surface-card) !text-muted-foreground hover:!text-foreground",
          ...(tinted ? tintedToastClassNames : {}),
          ...toastOptions?.classNames,
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-lg)",
          "--width": "min(380px, calc(100vw - 2rem))",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, tintedToastClassNames, type ToastTone };
