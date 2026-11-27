import { ChevronRightIcon } from "lucide-react";
import {
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../lib/utils";

/*
 * A tree of expandable items: source files, an organisation's teams,
 * nested categories. Follows the WAI-ARIA tree pattern: one tab stop,
 * Up/Down move through the visible items, Right opens a branch or enters
 * it, Left closes it or goes to the parent, Home/End jump to the ends, "*"
 * opens every sibling, typing a letter jumps to the next item starting with
 * it, Enter or Space selects.
 *
 * Expanded and selected items can be controlled or left to the tree. A
 * branch whose children are not loaded yet sets `hasChildren`; load them in
 * onExpandedChange.
 *
 *   <TreeView
 *     label="Kaynak dosyalar"
 *     nodes={[{ id: "src", label: "src", children: [{ id: "app", label: "app.tsx", icon: FileIcon }] }]}
 *     defaultExpanded={["src"]}
 *     onSelect={(node) => open(node.id)}
 *   />
 */

type Icon = ComponentType<{ className?: string }>;

export type TreeNode = {
  id: string;
  label: ReactNode;
  /** Plain text of the label for type-ahead when `label` is not a string. */
  text?: string;
  icon?: Icon;
  /** Shown at the end of the row (a count, a badge). */
  aside?: ReactNode;
  children?: TreeNode[];
  /** A branch whose children are loaded on demand. */
  hasChildren?: boolean;
  disabled?: boolean;
};

type Visible = { node: TreeNode; level: number; parent: string | null; branch: boolean };

function flatten(
  nodes: TreeNode[],
  expanded: Set<string>,
  level = 1,
  parent: string | null = null,
): Visible[] {
  const out: Visible[] = [];
  for (const node of nodes) {
    const branch = !!node.children?.length || !!node.hasChildren;
    out.push({ node, level, parent, branch });
    if (branch && expanded.has(node.id) && node.children)
      out.push(...flatten(node.children, expanded, level + 1, node.id));
  }
  return out;
}

function textOf(node: TreeNode): string {
  return (node.text ?? (typeof node.label === "string" ? node.label : "")).toLocaleLowerCase("tr");
}

export function TreeView({
  nodes,
  label,
  expanded: expandedProp,
  defaultExpanded = [],
  onExpandedChange,
  selected: selectedProp,
  defaultSelected = null,
  onSelect,
  className,
}: {
  nodes: TreeNode[];
  /** Accessible name of the tree. */
  label: string;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  selected?: string | null;
  defaultSelected?: string | null;
  onSelect?: (node: TreeNode) => void;
  className?: string;
}) {
  const [expandedState, setExpandedState] = useState(defaultExpanded);
  const [selectedState, setSelectedState] = useState(defaultSelected);
  const expandedList = expandedProp ?? expandedState;
  const selected = selectedProp !== undefined ? selectedProp : selectedState;
  const expanded = useMemo(() => new Set(expandedList), [expandedList]);
  const visible = useMemo(() => flatten(nodes, expanded), [nodes, expanded]);
  const [focused, setFocused] = useState<string | null>(null);
  const rows = useRef(new Map<string, HTMLElement>());
  const typed = useRef({ text: "", at: 0 });

  // The tab stop: the focused item, else the selected one, else the first.
  const tabStop =
    (focused && visible.some((v) => v.node.id === focused) ? focused : null) ??
    (selected && visible.some((v) => v.node.id === selected) ? selected : null) ??
    visible[0]?.node.id;

  const setExpanded = useCallback(
    (next: string[]) => {
      if (expandedProp === undefined) setExpandedState(next);
      onExpandedChange?.(next);
    },
    [expandedProp, onExpandedChange],
  );

  const toggle = (id: string, open = !expanded.has(id)) => {
    if (open === expanded.has(id)) return;
    setExpanded(open ? [...expandedList, id] : expandedList.filter((e) => e !== id));
  };

  const select = (node: TreeNode) => {
    if (node.disabled) return;
    if (selectedProp === undefined) setSelectedState(node.id);
    onSelect?.(node);
  };

  const focusItem = (id: string | undefined) => {
    if (!id) return;
    setFocused(id);
    rows.current.get(id)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const at = visible.findIndex((v) => v.node.id === (focused ?? tabStop));
    const item = visible[at];
    if (!item) return;
    const { node, branch, parent } = item;
    const open = expanded.has(node.id);
    let handled = true;
    switch (e.key) {
      case "ArrowDown":
        focusItem(visible[at + 1]?.node.id);
        break;
      case "ArrowUp":
        focusItem(visible[at - 1]?.node.id);
        break;
      case "ArrowRight":
        if (branch && !open) toggle(node.id, true);
        else if (branch && open) {
          const next = visible[at + 1];
          focusItem(next && next.level > item.level ? next.node.id : undefined);
        }
        break;
      case "ArrowLeft":
        if (branch && open) toggle(node.id, false);
        else focusItem(parent ?? undefined);
        break;
      case "Home":
        focusItem(visible[0]?.node.id);
        break;
      case "End":
        focusItem(visible.at(-1)?.node.id);
        break;
      case "Enter":
      case " ":
        select(node);
        break;
      case "*": {
        const siblings = visible.filter((v) => v.parent === parent && v.branch).map((v) => v.node.id);
        setExpanded([...new Set([...expandedList, ...siblings])]);
        break;
      }
      default:
        handled = false;
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // Type-ahead: letters typed within a second build up a prefix.
          const now = e.timeStamp;
          typed.current.text =
            (now - typed.current.at < 1000 ? typed.current.text : "") + e.key.toLocaleLowerCase("tr");
          typed.current.at = now;
          const prefix = typed.current.text;
          const order = [...visible.slice(at + (prefix.length === 1 ? 1 : 0)), ...visible.slice(0, at + 1)];
          const match = order.find((v) => textOf(v.node).startsWith(prefix));
          if (match) {
            focusItem(match.node.id);
            handled = true;
          }
        }
    }
    if (handled) e.preventDefault();
  };

  const renderNodes = (list: TreeNode[], level: number): ReactNode =>
    list.map((node, i) => {
      const branch = !!node.children?.length || !!node.hasChildren;
      const open = expanded.has(node.id);
      const isSelected = selected === node.id;
      const NodeIcon = node.icon;
      return (
        <div
          key={node.id}
          ref={(el) => {
            if (el) rows.current.set(node.id, el);
            else rows.current.delete(node.id);
          }}
          role="treeitem"
          aria-level={level}
          aria-setsize={list.length}
          aria-posinset={i + 1}
          aria-expanded={branch ? open : undefined}
          aria-selected={isSelected}
          aria-disabled={node.disabled || undefined}
          tabIndex={node.id === tabStop ? 0 : -1}
          onFocus={(e) => {
            if (e.target === e.currentTarget) setFocused(node.id);
          }}
          className="group/item outline-none"
        >
          {/* biome-ignore lint/a11y/noStaticElementInteractions: the row is the treeitem's visual; keyboard handling lives on the tree. */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling lives on the tree. */}
          <div
            onClick={() => {
              // A click on a branch row also opens or closes it.
              focusItem(node.id);
              select(node);
              if (branch) toggle(node.id);
            }}
            style={{ paddingLeft: `calc(${level - 1} * 1.25rem + 0.25rem)` }}
            className={cn(
              "flex h-8 cursor-pointer select-none items-center gap-1.5 rounded-md pr-2 text-sm transition-colors duration-(--duration-fast)",
              "hover:bg-(--surface-hover) group-focus-visible/item:shadow-(--focus-shadow)",
              isSelected &&
                "bg-(--surface-brand-subtle) font-medium text-(--text-brand) hover:bg-(--surface-brand-subtle)",
              node.disabled && "pointer-events-none opacity-50",
            )}
          >
            {branch ? (
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                onClick={(e) => {
                  e.stopPropagation();
                  focusItem(node.id);
                  toggle(node.id);
                }}
                className="grid size-6 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-(--surface-active) hover:text-foreground"
              >
                <ChevronRightIcon
                  className={cn(
                    "size-4 transition-transform duration-(--duration-fast) ease-(--ease-out)",
                    open && "rotate-90",
                  )}
                />
              </button>
            ) : (
              <span aria-hidden className="size-6 shrink-0" />
            )}
            {NodeIcon ? (
              <NodeIcon
                className={cn("size-4 shrink-0 text-muted-foreground", isSelected && "text-(--text-brand)")}
              />
            ) : null}
            <span className="min-w-0 flex-1 truncate">{node.label}</span>
            {node.aside ? <span className="shrink-0 text-muted-foreground text-xs">{node.aside}</span> : null}
          </div>
          {branch && open && node.children?.length ? (
            // biome-ignore lint/a11y/useSemanticElements: role="group" is the tree pattern's subtree.
            <div role="group">{renderNodes(node.children, level + 1)}</div>
          ) : null}
        </div>
      );
    });

  return (
    <div
      role="tree"
      aria-label={label}
      data-slot="tree-view"
      onKeyDown={onKeyDown}
      className={cn("grid gap-px", className)}
    >
      {renderNodes(nodes, 1)}
    </div>
  );
}
