import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { cn } from "../lib/utils";

/*
 * Pictures of people and things. Six sizes, round (people) or square
 * (organizations, projects), a status dot, and stacked groups with a "+N"
 * count. common/user-avatar adds initials in a colour derived from the name.
 */

export type AvatarSize = "xs" | "sm" | "default" | "lg" | "xl" | "2xl";
export type AvatarShape = "circle" | "square";

function Avatar({
  className,
  size = "default",
  shape = "circle",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: AvatarSize;
  shape?: AvatarShape;
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 select-none rounded-full",
        "data-[size=xs]:size-5 data-[size=sm]:size-6 data-[size=lg]:size-10 data-[size=xl]:size-12 data-[size=2xl]:size-16",
        "data-[shape=square]:rounded-md data-[shape=square]:data-[size=xl]:rounded-lg data-[shape=square]:data-[size=2xl]:rounded-xl",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full rounded-[inherit] object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-[inherit] bg-(--surface-muted) font-semibold text-muted-foreground text-xs",
        "group-data-[size=xs]/avatar:text-2xs group-data-[size=sm]/avatar:text-2xs group-data-[size=lg]/avatar:text-sm group-data-[size=xl]/avatar:text-md group-data-[size=2xl]/avatar:text-xl",
        className,
      )}
      {...props}
    />
  );
}

export type AvatarStatus = "online" | "away" | "busy" | "offline";

const statusClass: Record<AvatarStatus, string> = {
  online: "bg-(--status-success-fg)",
  away: "bg-(--status-warning-fg)",
  busy: "bg-(--status-danger-fg)",
  offline: "bg-(--text-subtle)",
};

export const avatarStatusLabels: Record<AvatarStatus, string> = {
  online: "Çevrimiçi",
  away: "Uzakta",
  busy: "Meşgul",
  offline: "Çevrimdışı",
};

/** A presence dot on the bottom-right edge, sized with the avatar. */
function AvatarStatusDot({ status, className }: { status: AvatarStatus; className?: string }) {
  return (
    <span
      data-slot="avatar-status"
      role="img"
      aria-label={avatarStatusLabels[status]}
      className={cn(
        "absolute right-0 bottom-0 z-10 size-2.5 rounded-full shadow-[0_0_0_2px_var(--surface-card)]",
        "group-data-[size=xs]/avatar:size-1.5 group-data-[size=sm]/avatar:size-2 group-data-[size=lg]/avatar:size-3 group-data-[size=xl]/avatar:size-3.5 group-data-[size=2xl]/avatar:size-4",
        "group-data-[shape=square]/avatar:-right-0.5 group-data-[shape=square]/avatar:-bottom-0.5",
        statusClass[status],
        className,
      )}
    />
  );
}

/** A small badge on the avatar (an icon or a count). */
function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex size-2.5 select-none items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_2px_var(--surface-card)]",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className,
      )}
      {...props}
    />
  );
}

/** Overlapping avatars; each gets a ring in the surface colour. */
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex items-center -space-x-2 [&_[data-slot=avatar-group-count]]:shadow-[0_0_0_2px_var(--surface-card)] [&_[data-slot=avatar]]:shadow-[0_0_0_2px_var(--surface-card)]",
        className,
      )}
      {...props}
    />
  );
}

/** The "+N" circle closing a group. */
function AvatarGroupCount({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: AvatarSize }) {
  return (
    <div
      data-slot="avatar-group-count"
      data-size={size}
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-(--surface-muted) font-semibold text-muted-foreground text-xs tabular",
        "data-[size=xs]:size-5 data-[size=xs]:text-2xs data-[size=sm]:size-6 data-[size=sm]:text-2xs data-[size=lg]:size-10 data-[size=lg]:text-sm data-[size=xl]:size-12 data-[size=2xl]:size-16 data-[size=2xl]:text-md",
        className,
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarStatusDot,
  AvatarGroup,
  AvatarGroupCount,
};
