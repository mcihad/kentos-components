import type { CSSProperties } from "react";
import { initials } from "../lib/format";
import { cn } from "../lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  type AvatarShape,
  type AvatarSize,
  type AvatarStatus,
  AvatarStatusDot,
  avatarStatusLabels,
} from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

/** One of the eight categorical colours, the same for the same name every time. */
export function avatarTone(name: string): number {
  let hash = 0;
  for (const ch of name.trim().toLocaleLowerCase("tr")) hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return (hash % 8) + 1;
}

// Initials tinted with the name's colour: a soft fill over the card and a
// deep ink (light in dark mode) so they keep their contrast.
function toneStyle(name: string): CSSProperties {
  return { ["--avatar-tone" as string]: `var(--cat-${avatarTone(name)})` };
}
const toneClass =
  "bg-[color-mix(in_oklab,var(--avatar-tone)_18%,var(--surface-card))] text-[color-mix(in_oklab,var(--avatar-tone)_70%,var(--text-strong))]";

/**
 * A person (or, square, an organization): the picture, or the initials in a
 * colour derived from the name. status adds a presence dot; tooltip shows
 * the name on hover.
 */
export function UserAvatar({
  name,
  src,
  size = "default",
  shape = "circle",
  status,
  tooltip = false,
  className,
  fallbackClassName,
}: {
  name: string;
  src?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  /** Shows the name (and status) in a tooltip. */
  tooltip?: boolean;
  className?: string;
  fallbackClassName?: string;
}) {
  const letters = initials(name);
  const avatar = (
    <Avatar
      size={size}
      shape={shape}
      className={className}
      aria-label={tooltip ? undefined : name || undefined}
    >
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback style={toneStyle(name)} className={cn(toneClass, fallbackClassName)}>
        {size === "xs" ? letters.slice(0, 1) : letters}
      </AvatarFallback>
      {status ? <AvatarStatusDot status={status} /> : null}
    </Avatar>
  );
  if (!tooltip) return avatar;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent>
        {name}
        {status ? <span className="ml-1.5 opacity-70">{avatarStatusLabels[status]}</span> : null}
      </TooltipContent>
    </Tooltip>
  );
}

export type AvatarPerson = { name: string; src?: string; status?: AvatarStatus };

/**
 * Overlapping avatars with names in tooltips; beyond max a "+N" circle
 * lists the rest in its tooltip. Status dots are left out: the next avatar
 * would cover them.
 */
export function UserAvatarGroup({
  people,
  max = 4,
  size = "default",
  label,
  className,
}: {
  people: readonly AvatarPerson[];
  max?: number;
  size?: AvatarSize;
  /** Accessible name of the group, e.g. "Atananlar". */
  label?: string;
  className?: string;
}) {
  const shown = people.length > max ? people.slice(0, max - 1) : people;
  const rest = people.slice(shown.length);
  return (
    <AvatarGroup role="group" aria-label={label} className={className}>
      {shown.map((p, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: people may share a name.
        <UserAvatar key={i} name={p.name} src={p.src} size={size} tooltip />
      ))}
      {rest.length ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <AvatarGroupCount size={size} aria-label={`${rest.length} kişi daha`} tabIndex={0}>
              +{rest.length}
            </AvatarGroupCount>
          </TooltipTrigger>
          <TooltipContent className="grid max-w-60 gap-0.5">
            {rest.map((p, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: people may share a name.
              <span key={i}>{p.name}</span>
            ))}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </AvatarGroup>
  );
}
