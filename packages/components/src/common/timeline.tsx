import type { ComponentProps, ComponentType, ReactNode } from "react";
import { cn } from "../lib/utils";

/*
 * Events in order along a vertical line: an issue's history, a release's
 * steps, an audit log. Each item has a marker (a dot, or an icon in a
 * circle), a title, an optional time and any content below.
 *
 *   <Timeline>
 *     <TimelineItem icon={RocketIcon} tone="success" title="1.4.2 yayınlandı" time="2 saat önce" dateTime="2026-11-26T10:00">
 *       Ayşe Yılmaz yayınladı.
 *     </TimelineItem>
 *     <TimelineItem tone="muted" pending title="Onay bekleniyor" />
 *   </Timeline>
 */

type Tone = "default" | "brand" | "success" | "warning" | "danger" | "muted";

const markerTone: Record<Tone, string> = {
  default: "border-(--border-strong) bg-(--surface-card) text-muted-foreground",
  brand: "border-(--border-brand) bg-(--surface-brand-subtle) text-(--text-brand)",
  success: "border-(--status-success-border) bg-(--status-success-bg) text-(--status-success-fg)",
  warning: "border-(--status-warning-border) bg-(--status-warning-bg) text-(--status-warning-fg)",
  danger: "border-(--status-danger-border) bg-(--status-danger-bg) text-(--status-danger-fg)",
  muted: "border-(--border-default) bg-(--surface-muted) text-subtle",
};

const dotTone: Record<Tone, string> = {
  default: "bg-(--border-strong)",
  brand: "bg-(--brand-bg)",
  success: "bg-(--status-success-solid)",
  warning: "bg-(--status-warning-solid)",
  danger: "bg-(--status-danger-solid)",
  muted: "bg-(--border-default)",
};

/** The list; `compact` uses small dots and tighter spacing (no icon circles). */
export function Timeline({
  compact = false,
  className,
  ...props
}: ComponentProps<"ol"> & { compact?: boolean }) {
  return (
    <ol
      data-slot="timeline"
      data-compact={compact || undefined}
      className={cn("group/timeline flex flex-col", className)}
      {...props}
    />
  );
}

/** One event. */
export function TimelineItem({
  icon: Icon,
  tone = "default",
  title,
  time,
  dateTime,
  pending = false,
  className,
  children,
  ...props
}: Omit<ComponentProps<"li">, "title"> & {
  icon?: ComponentType<{ className?: string }>;
  tone?: Tone;
  title: ReactNode;
  /** Shown after the title ("2 saat önce", "26 Kas 14.05"). */
  time?: ReactNode;
  /** Machine-readable time for the <time> element. */
  dateTime?: string;
  /** Not happened yet: hollow marker and a dashed line. */
  pending?: boolean;
}) {
  return (
    <li
      data-slot="timeline-item"
      className={cn(
        "relative grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 pb-5 last:pb-0",
        "group-data-[compact]/timeline:grid-cols-[0.75rem_minmax(0,1fr)] group-data-[compact]/timeline:pb-3.5",
        // The line runs from under this marker to the next one.
        "before:absolute before:top-8 before:bottom-1 before:left-[calc(0.875rem-1px)] before:w-0.5 before:rounded-full before:bg-(--border-default) last:before:hidden",
        "group-data-[compact]/timeline:before:top-5 group-data-[compact]/timeline:before:bottom-0.5 group-data-[compact]/timeline:before:left-[calc(0.375rem-1px)]",
        pending &&
          "before:border-(--border-strong) before:border-l-2 before:border-dashed before:bg-transparent",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="flex justify-center pt-0.5 group-data-[compact]/timeline:pt-1.5">
        {Icon ? (
          <span
            className={cn(
              "grid size-7 place-items-center rounded-full border group-data-[compact]/timeline:hidden [&>svg]:size-3.5",
              markerTone[tone],
              pending && "border-dashed bg-transparent",
            )}
          >
            <Icon />
          </span>
        ) : null}
        <span
          className={cn(
            "mt-2.5 size-2.5 rounded-full ring-4 ring-(--surface-card) group-data-[compact]/timeline:mt-0",
            Icon && "hidden group-data-[compact]/timeline:block",
            dotTone[tone],
            pending && "border-2 border-(--border-strong) bg-transparent",
          )}
        />
      </span>
      <div className="min-w-0 pt-1 group-data-[compact]/timeline:pt-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span className={cn("font-medium text-sm text-strong", pending && "text-muted-foreground")}>
            {title}
          </span>
          {time ? (
            <time dateTime={dateTime} className="shrink-0 text-muted-foreground text-xs tabular">
              {time}
            </time>
          ) : null}
        </div>
        {children ? (
          <div className="mt-1 text-muted-foreground text-sm leading-relaxed">{children}</div>
        ) : null}
      </div>
    </li>
  );
}
