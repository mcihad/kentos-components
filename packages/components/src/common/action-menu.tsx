import {
  type ComponentType,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  useRef,
  useState,
} from "react";
import { useIsMobile } from "../lib/use-mobile";
import { cn } from "../lib/utils";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  ActionSheet,
  ActionSheetContent,
  ActionSheetGroup,
  ActionSheetItem,
  ActionSheetSeparator,
  ActionSheetTrigger,
} from "./action-sheet";

/*
 * Menus described once as data, shown the right way for the device:
 *
 *   ActionMenu         a button's menu: a dropdown on desktop, a bottom sheet on phones
 *   ActionContextMenu  an area's menu: right-click on desktop, long-press -> bottom sheet on phones
 *
 *   const entries: MenuEntry[] = [
 *     { label: "Düzenle", icon: PencilIcon, shortcut: "E", onSelect: edit },
 *     { type: "submenu", label: "Taşı", icon: FolderIcon, items: [...] },
 *     { type: "checkbox", label: "Sabitle", checked: pinned, onCheckedChange: setPinned },
 *     { type: "radio", label: "Öncelik", value: p, onValueChange: setP, options: [...] },
 *     { type: "separator" },
 *     { label: "Sil", icon: Trash2Icon, variant: "destructive", onSelect: remove },
 *   ];
 *   <ActionMenu entries={entries} title="Proje"><Button …/></ActionMenu>
 *   <ActionContextMenu entries={entries} title="KALEM-1B"><IssueRow …/></ActionContextMenu>
 *
 * On phones shortcuts are left out, submenus become titled groups and
 * choices show a check.
 */

type Icon = ComponentType<{ className?: string }>;

export type MenuEntry =
  | {
      type?: "item";
      label: string;
      icon?: Icon;
      /** Second line in the phone sheet. */
      description?: string;
      /** Shown on desktop only, e.g. "⌘E". */
      shortcut?: string;
      variant?: "default" | "destructive";
      disabled?: boolean;
      onSelect?: () => void;
    }
  | { type: "separator" }
  | { type: "label"; label: string }
  | {
      type: "checkbox";
      label: string;
      icon?: Icon;
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      disabled?: boolean;
    }
  | {
      type: "radio";
      /** Heading of the choice. */
      label: string;
      value: string;
      onValueChange: (value: string) => void;
      options: { value: string; label: string; icon?: Icon }[];
    }
  | { type: "submenu"; label: string; icon?: Icon; items: MenuEntry[] };

// Dropdown and context menu parts share their API; one renderer serves both.
const dropdownParts = {
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
};
const contextParts = {
  Item: ContextMenuItem,
  CheckboxItem: ContextMenuCheckboxItem,
  RadioGroup: ContextMenuRadioGroup,
  RadioItem: ContextMenuRadioItem,
  Label: ContextMenuLabel,
  Separator: ContextMenuSeparator,
  Shortcut: ContextMenuShortcut,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
};
type Parts = typeof dropdownParts | typeof contextParts;

const labelClass = "font-normal text-muted-foreground text-xs";

function renderFloating(entries: readonly MenuEntry[], P: Parts): ReactNode {
  return entries.map((e, i) => {
    const key = i;
    switch (e.type) {
      case "separator":
        return <P.Separator key={key} />;
      case "label":
        return (
          <P.Label key={key} className={labelClass}>
            {e.label}
          </P.Label>
        );
      case "checkbox":
        return (
          <P.CheckboxItem
            key={key}
            checked={e.checked}
            disabled={e.disabled}
            onCheckedChange={(v) => e.onCheckedChange(v === true)}
            onSelect={(ev) => ev.preventDefault()}
          >
            {e.icon ? <e.icon /> : null}
            {e.label}
          </P.CheckboxItem>
        );
      case "radio":
        return (
          <div key={key} role="none">
            <P.Label className={labelClass}>{e.label}</P.Label>
            <P.RadioGroup value={e.value} onValueChange={e.onValueChange}>
              {e.options.map((o) => (
                <P.RadioItem key={o.value} value={o.value} onSelect={(ev) => ev.preventDefault()}>
                  {o.icon ? <o.icon /> : null}
                  {o.label}
                </P.RadioItem>
              ))}
            </P.RadioGroup>
          </div>
        );
      case "submenu":
        return (
          <P.Sub key={key}>
            <P.SubTrigger>
              {e.icon ? <e.icon /> : null}
              {e.label}
            </P.SubTrigger>
            <P.SubContent className="min-w-48">{renderFloating(e.items, P)}</P.SubContent>
          </P.Sub>
        );
      default:
        return (
          <P.Item key={key} variant={e.variant} disabled={e.disabled} onSelect={() => e.onSelect?.()}>
            {e.icon ? <e.icon /> : null}
            {e.label}
            {e.shortcut ? <P.Shortcut>{e.shortcut}</P.Shortcut> : null}
          </P.Item>
        );
    }
  });
}

function renderSheet(entries: readonly MenuEntry[], title?: string): ReactNode {
  return entries.map((e, i) => {
    // The sheet already carries the title; a heading repeating it is dropped.
    if (e.type === "label" && e.label === title) return null;
    const key = i;
    switch (e.type) {
      case "separator":
        return <ActionSheetSeparator key={key} />;
      case "label":
        return <ActionSheetGroup key={key} label={e.label} />;
      case "checkbox":
        return (
          <ActionSheetItem
            key={key}
            icon={e.icon}
            label={e.label}
            checked={e.checked}
            disabled={e.disabled}
            keepOpen
            onClick={() => e.onCheckedChange(!e.checked)}
          />
        );
      case "radio":
        return (
          <ActionSheetGroup key={key} label={e.label}>
            {e.options.map((o) => (
              <ActionSheetItem
                key={o.value}
                icon={o.icon}
                label={o.label}
                checked={o.value === e.value}
                keepOpen
                onClick={() => e.onValueChange(o.value)}
              />
            ))}
          </ActionSheetGroup>
        );
      case "submenu":
        return (
          <ActionSheetGroup key={key} label={e.label}>
            {renderSheet(e.items)}
          </ActionSheetGroup>
        );
      default:
        return (
          <ActionSheetItem
            key={key}
            icon={e.icon}
            label={e.label}
            description={e.description}
            variant={e.variant === "destructive" ? "destructive" : "default"}
            disabled={e.disabled}
            onClick={() => e.onSelect?.()}
          />
        );
    }
  });
}

/**
 * A button's menu: wrap the trigger (one element). Desktop: a dropdown
 * aligned to it; phones: a bottom sheet titled `title`.
 */
export function ActionMenu({
  entries,
  title,
  description,
  align = "end",
  mobile,
  contentClassName,
  children,
}: {
  entries: readonly MenuEntry[];
  /** Heading of the phone sheet (and its accessible name). */
  title: string;
  description?: ReactNode;
  align?: "start" | "center" | "end";
  /** Forces the sheet (true) or the dropdown (false). */
  mobile?: boolean;
  contentClassName?: string;
  /** The trigger, e.g. a Button. */
  children: ReactElement;
}) {
  const isMobile = useIsMobile(mobile);
  if (isMobile) {
    return (
      <ActionSheet>
        <ActionSheetTrigger asChild>{children}</ActionSheetTrigger>
        <ActionSheetContent title={title} description={description}>
          {renderSheet(entries, title)}
        </ActionSheetContent>
      </ActionSheet>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn("min-w-52", contentClassName)}>
        {renderFloating(entries, dropdownParts)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const longPressMs = 450;

/**
 * An area's menu: right-click (or the menu key) on desktop; on phones a
 * long press opens a bottom sheet, with a short vibration where supported,
 * and the tap that ends the press does not also activate the area.
 */
export function ActionContextMenu({
  entries,
  title,
  description,
  mobile,
  disabled = false,
  className,
  children,
}: {
  entries: readonly MenuEntry[];
  title: string;
  description?: ReactNode;
  mobile?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const isMobile = useIsMobile(mobile);
  const [open, setOpen] = useState(false);
  const timer = useRef(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);

  if (disabled) return <div className={className}>{children}</div>;

  if (!isMobile) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className={className}>{children}</div>
        </ContextMenuTrigger>
        <ContextMenuContent className="min-w-52">{renderFloating(entries, contextParts)}</ContextMenuContent>
      </ContextMenu>
    );
  }

  const cancel = () => {
    window.clearTimeout(timer.current);
    start.current = null;
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    fired.current = false;
    start.current = { x: e.clientX, y: e.clientY };
    timer.current = window.setTimeout(() => {
      fired.current = true;
      start.current = null;
      navigator.vibrate?.(8);
      setOpen(true);
    }, longPressMs);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 10) cancel();
  };

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: a long press is an extra way to reach the menu; the items stay reachable without it. */}
      <div
        className={cn("select-none [-webkit-touch-callout:none]", className)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onPointerLeave={cancel}
        onContextMenu={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          // The finger lifting after a long press is not a tap.
          if (fired.current) {
            e.preventDefault();
            e.stopPropagation();
            fired.current = false;
          }
        }}
      >
        {children}
      </div>
      <ActionSheet open={open} onOpenChange={setOpen}>
        <ActionSheetContent title={title} description={description}>
          {renderSheet(entries, title)}
        </ActionSheetContent>
      </ActionSheet>
    </>
  );
}
