import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import { ActionMenu, type MenuEntry } from "./action-menu";

/*
 * Buttons that belong together, drawn as one control: segmented filters,
 * zoom in / out, a split button. Only the outer corners stay round and
 * neighbouring borders merge; the focused button rises above its siblings.
 */
export function ButtonGroup({
  orientation = "horizontal",
  className,
  ...props
}: ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would add form semantics to a row of buttons.
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(
        "inline-flex w-fit items-stretch [&>*:focus-visible]:relative [&>*:focus-visible]:z-10",
        orientation === "horizontal"
          ? "[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none"
          : "flex-col [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The main action with its alternatives in a menu beside it ("Kaydet" ▾
 * "Kaydet ve yeni", "Taslak olarak kaydet"). The menu is a dropdown on
 * desktop and a bottom sheet on phones.
 */
export function SplitButton({
  label,
  icon: Icon,
  onClick,
  entries,
  menuLabel = "Diğer seçenekler",
  variant = "default",
  size = "default",
  loading,
  loadingText,
  disabled,
  className,
}: {
  label: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  onClick: () => void;
  entries: readonly MenuEntry[];
  /** Accessible name of the menu button and title of the phone sheet. */
  menuLabel?: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
  size?: "sm" | "default" | "lg";
  loading?: boolean;
  loadingText?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const iconSize = size === "sm" ? "icon-sm" : size === "lg" ? "icon-lg" : "icon";
  const solid = variant === "default" || variant === "destructive";
  return (
    <ButtonGroup className={className}>
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        loading={loading}
        loadingText={loadingText}
        disabled={disabled}
      >
        {Icon ? <Icon /> : null}
        {label}
      </Button>
      <ActionMenu entries={entries} title={menuLabel}>
        <Button
          variant={variant}
          size={iconSize}
          aria-label={menuLabel}
          disabled={disabled || loading}
          // Solid halves are told apart by a faint line in the text colour.
          className={cn(solid && "border-l border-l-current/20")}
        >
          <ChevronDownIcon />
        </Button>
      </ActionMenu>
    </ButtonGroup>
  );
}
