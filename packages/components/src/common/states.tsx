import { InboxIcon, type LucideIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";

/** Shown when a list has nothing to show; says what to do next. */
export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  children,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2.5 px-6 py-12 text-center", className)}>
      <span className="mb-0.5 grid size-12 place-items-center rounded-lg bg-(--surface-muted) text-muted-foreground">
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <div className="max-w-sm space-y-1">
        <p className="font-semibold text-md text-strong">{title}</p>
        {children ? <div className="text-muted-foreground text-sm leading-relaxed">{children}</div> : null}
      </div>
      {action}
    </div>
  );
}

/**
 * Shown when loading failed: what went wrong, in the user's language, and a
 * way to try again. Applications turn their errors into `message`.
 */
export function ErrorState({
  message,
  onRetry,
  retryLabel = "Yeniden dene",
  className,
}: {
  message: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-12 text-center", className)}>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
