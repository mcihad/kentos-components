import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useAppearance } from "../lib/theme";

// Toasts confirm what just happened ("Kaydedildi") or report a failure. They
// sit on the card surface with a coloured icon per type; actions use the
// kit's button styles. Show them with toast(), toast.success(),
// toast.error(), toast.warning(), toast.info(), toast.loading() and
// toast.promise() from "sonner".
const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { resolved } = useAppearance();

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
          toast:
            "!items-start !gap-3 !rounded-lg !border-(--border-default) !bg-(--surface-card) !px-4 !py-3 !font-sans !shadow-(--shadow-lg)",
          title: "!font-semibold !text-sm !text-strong",
          description: "!text-muted-foreground !text-sm",
          icon: "!mt-px",
          actionButton:
            "!h-(--control-h-sm) !rounded-md !bg-primary !px-3 !font-semibold !text-primary-foreground !text-xs",
          cancelButton:
            "!h-(--control-h-sm) !rounded-md !border !border-(--border-default) !bg-transparent !px-3 !font-semibold !text-foreground !text-xs",
          closeButton:
            "!border-(--border-default) !bg-(--surface-card) !text-muted-foreground hover:!text-foreground",
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

export { Toaster };
