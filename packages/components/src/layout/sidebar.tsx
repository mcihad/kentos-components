import {
  ChevronRightIcon,
  ChevronsUpDownIcon,
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SearchIcon,
  SearchXIcon,
  XIcon,
} from "lucide-react";
import { Slot } from "radix-ui";
import {
  type ComponentProps,
  type ComponentType,
  createContext,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UserAvatar } from "../common/user-avatar";
import { matchesQuery, matchRange } from "../lib/search";
import { useIsMobile } from "../lib/use-mobile";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

/*
 * The application sidebar: a dark rail with a header (brand or switcher), a
 * search box that filters the items, groups of items with icons, badges and
 * nested items, and a footer (account). On desktop it collapses to an icon
 * rail (state remembered per browser); below md it becomes a drawer.
 *
 *   <SidebarProvider storageKey="app-sidebar">
 *     <Sidebar>
 *       <SidebarHeader>…</SidebarHeader>
 *       <SidebarSearch />
 *       <SidebarContent>
 *         <SidebarGroup label="İzleme">
 *           <SidebarItem icon={BugIcon} label="Hatalar" asChild><Link to="/issues" /></SidebarItem>
 *         </SidebarGroup>
 *       </SidebarContent>
 *       <SidebarFooter>…</SidebarFooter>
 *     </Sidebar>
 *     <SidebarInset><header><SidebarTrigger /></header>…</SidebarInset>
 *   </SidebarProvider>
 */

/** Any icon component, e.g. from lucide-react. */
export type SidebarIcon = ComponentType<{ className?: string }>;

type SidebarState = {
  /** The desktop rail shows icons only. */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** Collapses or expands on desktop, opens or closes the drawer on phones. */
  toggle: () => void;
  /** Below the md breakpoint: the sidebar is a drawer. */
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  /** The search text filtering the items. */
  query: string;
  setQuery: (query: string) => void;
  /** Collapsed and on desktop: labels hidden, tooltips shown. */
  iconOnly: boolean;
};

const SidebarContext = createContext<SidebarState | null>(null);

/** The sidebar's state; only inside a SidebarProvider. */
export function useSidebar(): SidebarState {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
}

// Where an item is rendered: in the rail, nested under a collapsible, or in
// the flyout menu a collapsible opens on the icon rail.
type Level = { nested: boolean; parentMatched: boolean; flyout: boolean };
const LevelContext = createContext<Level>({ nested: false, parentMatched: false, flyout: false });

function readStored(key: string | undefined, fallback: boolean) {
  if (!key) return fallback;
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === "collapsed";
  } catch {
    return fallback;
  }
}

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Holds the sidebar state and lays out the sidebar beside the page. Wrap the
 * whole application frame in it.
 */
export function SidebarProvider({
  storageKey,
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  toggleShortcut = "b",
  mobile,
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  /** localStorage key remembering the collapsed rail; omit to not remember. */
  storageKey?: string;
  defaultCollapsed?: boolean;
  /** Controlled collapsed state. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Letter toggling the sidebar with ⌘/Ctrl; null disables the shortcut. */
  toggleShortcut?: string | null;
  /** Forces the drawer (true) or the rail (false) regardless of the viewport. */
  mobile?: boolean;
}) {
  const isMobile = useIsMobile(mobile);
  const [stored, setStored] = useState(() => readStored(storageKey, defaultCollapsed));
  const collapsed = collapsedProp ?? stored;
  const [openMobile, setOpenMobile] = useState(false);
  const [query, setQuery] = useState("");

  const setCollapsed = useCallback(
    (next: boolean) => {
      setStored(next);
      onCollapsedChange?.(next);
      if (next) setQuery("");
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, next ? "collapsed" : "expanded");
      } catch {
        // Not remembered; still applied.
      }
    },
    [storageKey, onCollapsedChange],
  );

  const toggle = useCallback(() => {
    if (isMobile) setOpenMobile((open) => !open);
    else setCollapsed(!collapsed);
  }, [isMobile, collapsed, setCollapsed]);

  useEffect(() => {
    if (!isMobile) setOpenMobile(false);
  }, [isMobile]);

  useEffect(() => {
    if (!toggleShortcut) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      if (e.key.toLowerCase() !== toggleShortcut.toLowerCase() || isEditable(e.target)) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleShortcut, toggle]);

  const value = useMemo<SidebarState>(
    () => ({
      collapsed,
      setCollapsed,
      toggle,
      isMobile,
      openMobile,
      setOpenMobile,
      query,
      setQuery,
      iconOnly: collapsed && !isMobile,
    }),
    [collapsed, setCollapsed, toggle, isMobile, openMobile, query],
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>
        <div data-slot="sidebar-wrapper" className={cn("flex min-h-svh w-full", className)} {...props}>
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

/** The sidebar itself: a sticky rail on desktop, a drawer from the left on phones. */
export function Sidebar({
  label = "Kenar çubuğu",
  className,
  children,
  ...props
}: ComponentProps<"aside"> & {
  /** Accessible name of the sidebar (and the drawer's title). */
  label?: string;
}) {
  const { isMobile, openMobile, setOpenMobile, collapsed } = useSidebar();
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          showCloseButton={false}
          aria-describedby={undefined}
          data-slot="sidebar"
          data-mobile="true"
          className={cn(
            "on-dark w-[min(20rem,86vw)] gap-0 overflow-hidden border-(--sidebar-border) bg-(--sidebar-bg) p-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-(--sidebar-fg) sm:max-w-none",
            className,
            // Always exactly the visible viewport (dvh follows the phone's
            // browser bars), so the content scrolls and the footer stays put
            // whatever height classes the caller passes.
            "inset-y-0 h-dvh max-h-dvh",
          )}
        >
          <SheetTitle className="sr-only">{label}</SheetTitle>
          {children}
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <aside
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      aria-label={label}
      className={cn(
        "on-dark sticky top-0 flex h-svh shrink-0 flex-col overflow-hidden border-(--sidebar-border) border-r bg-(--sidebar-bg) text-(--sidebar-fg) transition-[width] duration-(--duration-panel) ease-(--ease-entrance) print:hidden",
        collapsed ? "w-(--sidebar-w-collapsed)" : "w-(--sidebar-w)",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

/** The column beside the sidebar holding the top bar and the page. */
export function SidebarInset({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-inset" className={cn("flex min-w-0 flex-1 flex-col", className)} {...props} />
  );
}

/** Top of the sidebar: brand, organization or module switch. On phones it adds the drawer's close button. */
export function SidebarHeader({ className, children, ...props }: ComponentProps<"div">) {
  const { isMobile, setOpenMobile, iconOnly } = useSidebar();
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex shrink-0 items-center gap-1.5 pt-2.5", iconOnly ? "px-2" : "px-2.5", className)}
      {...props}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {isMobile ? (
        <button
          type="button"
          onClick={() => setOpenMobile(false)}
          aria-label="Menüyü kapat"
          className="grid size-10 shrink-0 place-items-center rounded-md text-(--sidebar-fg-muted) outline-none transition-colors duration-(--duration-fast) hover:bg-(--sidebar-item-hover) hover:text-(--sidebar-item-active-fg) focus-visible:shadow-(--focus-shadow)"
        >
          <XIcon className="size-5" />
        </button>
      ) : null}
    </div>
  );
}

/**
 * The brand or switch button of the header: a logo tile, a title and an
 * optional subtitle. Use it as a DropdownMenuTrigger child (asChild) for an
 * organization or module switch, or with onClick/href-less as a plain button.
 */
export function SidebarBrand({
  logo,
  title,
  subtitle,
  chevron = true,
  className,
  ...props
}: Omit<ComponentProps<"button">, "title"> & {
  logo: ReactNode;
  title: string;
  subtitle?: ReactNode;
  /** Shows the up-down chevron of a switch. */
  chevron?: boolean;
}) {
  const { iconOnly } = useSidebar();
  return (
    <button
      type="button"
      data-slot="sidebar-brand"
      title={iconOnly ? title : undefined}
      aria-label={iconOnly ? title : undefined}
      className={cn(
        "flex h-12 w-full items-center gap-2.5 rounded-md border border-(--sidebar-border) bg-(--sidebar-item-hover) text-left text-(--sidebar-item-active-fg) outline-none transition-colors duration-(--duration-fast) hover:bg-(--sidebar-item-active-bg) focus-visible:shadow-(--focus-shadow) data-[state=open]:border-(--sidebar-accent-fg)/50 data-[state=open]:bg-(--sidebar-item-active-bg) md:h-11",
        iconOnly ? "justify-center px-0" : "px-2",
        className,
      )}
      {...props}
    >
      <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-sm bg-(--sidebar-item-active-bg)">
        {logo}
      </span>
      {iconOnly ? null : (
        <>
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className="truncate font-semibold text-sm leading-tight">{title}</span>
            {subtitle ? (
              <span className="truncate text-(--sidebar-fg-muted) text-2xs leading-tight">{subtitle}</span>
            ) : null}
          </span>
          {chevron ? <ChevronsUpDownIcon className="size-3.5 shrink-0 text-(--sidebar-fg-muted)" /> : null}
        </>
      )}
    </button>
  );
}

// Visible, focusable items of the sidebar in document order.
function actionsOf(root: Element | null): HTMLElement[] {
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>("[data-sidebar-action]")].filter((el) =>
    typeof el.checkVisibility === "function" ? el.checkVisibility() : el.offsetParent !== null,
  );
}

function sidebarRoot(from: Element | null) {
  return from?.closest("[data-slot=sidebar]") ?? null;
}

/**
 * Filters the items as the user types (Turkish-aware, ignores diacritics).
 * Enter opens the first match, arrow keys move into the list, Escape clears.
 * On the icon rail it is a button that expands the sidebar and focuses the box.
 */
export function SidebarSearch({
  placeholder = "Menüde ara",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const { query, setQuery, iconOnly, setCollapsed } = useSidebar();
  const input = useRef<HTMLInputElement>(null);
  const focusAfterExpand = useRef(false);

  useEffect(() => {
    if (!iconOnly && focusAfterExpand.current) {
      focusAfterExpand.current = false;
      input.current?.focus();
    }
  }, [iconOnly]);

  if (iconOnly) {
    return (
      <div data-slot="sidebar-search" className={cn("shrink-0 px-2 pt-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={placeholder}
              onClick={() => {
                focusAfterExpand.current = true;
                setCollapsed(false);
              }}
              className={itemClass}
              data-icon-only="true"
            >
              <SearchIcon className="size-4 shrink-0" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{placeholder}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const root = sidebarRoot(e.currentTarget);
    if (e.key === "Escape" && query) {
      e.preventDefault();
      e.stopPropagation();
      setQuery("");
    } else if (e.key === "Enter") {
      const first = actionsOf(root).find((el) => el.hasAttribute("data-sidebar-leaf"));
      if (first) {
        e.preventDefault();
        first.click();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      actionsOf(root)[0]?.focus();
    }
  };

  return (
    <div data-slot="sidebar-search" className={cn("relative shrink-0 px-2.5 pt-2", className)}>
      <SearchIcon className="pointer-events-none absolute top-[calc(50%+0.25rem)] left-5 size-4 -translate-y-1/2 text-(--sidebar-fg-muted)" />
      <input
        ref={input}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="h-10 w-full rounded-md border border-(--sidebar-border) bg-(--sidebar-item-hover) pr-9 pl-8 text-(--sidebar-item-active-fg) text-base outline-none transition-colors duration-(--duration-fast) placeholder:text-(--sidebar-fg-muted) hover:border-(--sidebar-accent-fg)/30 focus-visible:border-(--sidebar-accent-fg)/60 focus-visible:bg-(--sidebar-item-active-bg) md:h-(--control-h-sm) md:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            input.current?.focus();
          }}
          aria-label="Aramayı temizle"
          className="absolute top-[calc(50%+0.25rem)] right-3.5 grid size-7 -translate-y-1/2 place-items-center rounded-sm text-(--sidebar-fg-muted) hover:text-(--sidebar-item-active-fg)"
        >
          <XIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

// Hidden while a search is active and nothing inside matches. Checked after
// every commit because items decide on their own whether they match.
function useNoMatch(ref: RefObject<HTMLElement | null>, query: string) {
  const [hidden, setHidden] = useState(false);
  useLayoutEffect(() => {
    setHidden(query.trim() !== "" && !ref.current?.querySelector("[data-sidebar-match]"));
  });
  return hidden;
}

/** The scrolling list of groups and items, with an empty state for searches without results. */
export function SidebarContent({
  label = "Ana menü",
  emptyText = "Eşleşen sayfa yok",
  className,
  children,
  ...props
}: ComponentProps<"nav"> & {
  /** Accessible name of the navigation. */
  label?: string;
  emptyText?: string;
}) {
  const { iconOnly, query } = useSidebar();
  const ref = useRef<HTMLElement>(null);
  const empty = useNoMatch(ref, query);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const root = sidebarRoot(e.currentTarget);
    const actions = actionsOf(root);
    const at = actions.indexOf(document.activeElement as HTMLElement);
    if (at < 0) return;
    e.preventDefault();
    if (e.key === "Home") actions[0]?.focus();
    else if (e.key === "End") actions.at(-1)?.focus();
    else if (e.key === "ArrowUp" && at === 0)
      root?.querySelector<HTMLInputElement>("[data-slot=sidebar-search] input")?.focus();
    else actions[Math.min(actions.length - 1, Math.max(0, at + (e.key === "ArrowDown" ? 1 : -1)))]?.focus();
  };

  return (
    <nav
      ref={ref}
      data-slot="sidebar-content"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden overscroll-contain py-3",
        iconOnly ? "gap-2 px-2" : "px-2.5",
        className,
      )}
      {...props}
    >
      {children}
      {empty ? (
        <div
          data-slot="sidebar-empty"
          role="status"
          className="flex flex-col items-center gap-2 px-3 py-8 text-center text-(--sidebar-fg-muted) text-sm"
        >
          <SearchXIcon className="size-5" />
          <p>{emptyText}</p>
        </div>
      ) : null}
    </nav>
  );
}

/**
 * A titled group of items. Collapsible groups fold under their label; on the
 * icon rail the label becomes a thin divider. A search hides groups without
 * matches.
 */
export function SidebarGroup({
  label,
  action,
  collapsible = false,
  defaultOpen = true,
  className,
  children,
  ...props
}: Omit<ComponentProps<"div">, "title"> & {
  label?: string;
  /** A small control beside the label, e.g. an add button. */
  action?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const { iconOnly, query } = useSidebar();
  const ref = useRef<HTMLDivElement>(null);
  const hidden = useNoMatch(ref, query);
  const [open, setOpen] = useState(defaultOpen);
  const showItems = !collapsible || open || query.trim() !== "" || iconOnly;
  const labelClass =
    "font-semibold text-(--sidebar-fg-muted) text-2xs uppercase tracking-(--tracking-caps) leading-none";

  let heading: ReactNode = null;
  if (label && iconOnly) {
    heading = <div aria-hidden className="mx-auto my-1 h-px w-6 bg-(--sidebar-border)" />;
  } else if (label) {
    heading = (
      <div className="flex h-7 items-center gap-1 pr-1 pl-2.5">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={showItems}
            className={cn(
              labelClass,
              "flex h-full flex-1 items-center gap-1 rounded-sm text-left outline-none hover:text-(--sidebar-fg) focus-visible:shadow-(--focus-shadow)",
            )}
          >
            {label}
            <ChevronRightIcon
              className={cn(
                "size-3 transition-transform duration-(--duration-fast)",
                showItems && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span className={cn(labelClass, "flex-1")}>{label}</span>
        )}
        {action}
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would add form semantics to navigation.
    <div
      ref={ref}
      data-slot="sidebar-group"
      role="group"
      aria-label={label}
      hidden={hidden}
      className={cn("grid gap-0.5", className)}
      {...props}
    >
      {heading}
      {showItems ? children : null}
    </div>
  );
}

/** A thin line between items or groups. */
export function SidebarSeparator({ className, ...props }: ComponentProps<"hr">) {
  return (
    <hr
      data-slot="sidebar-separator"
      className={cn("mx-2 h-px shrink-0 border-0 bg-(--sidebar-border)", className)}
      {...props}
    />
  );
}

// Rail items: light text on the dark rail; the current page on a lighter tint
// with an accent bar. Active styling follows data-active or aria-current so
// router links that set aria-current="page" need no extra prop.
const itemClass = cn(
  "relative flex h-[max(var(--control-h-md),2.5rem)] w-full shrink-0 items-center gap-2.5 rounded-md px-2.5 text-left font-medium text-(--sidebar-fg) text-sm outline-none transition-colors duration-(--duration-fast) md:h-(--control-h-md)",
  "hover:bg-(--sidebar-item-hover) hover:text-(--sidebar-item-active-fg) focus-visible:shadow-(--focus-shadow) data-[state=open]:bg-(--sidebar-item-hover)",
  "[&_svg]:opacity-85 hover:[&_svg]:opacity-100",
  "before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-(--sidebar-accent-fg) before:opacity-0 before:transition-opacity",
  "data-[active=true]:bg-(--sidebar-item-active-bg) data-[active=true]:font-semibold data-[active=true]:text-(--sidebar-item-active-fg) data-[active=true]:before:opacity-100 data-[active=true]:[&_svg]:opacity-100",
  "aria-[current=page]:bg-(--sidebar-item-active-bg) aria-[current=page]:font-semibold aria-[current=page]:text-(--sidebar-item-active-fg) aria-[current=page]:before:opacity-100 aria-[current=page]:[&_svg]:opacity-100",
  "data-[icon-only=true]:justify-center data-[icon-only=true]:px-0 data-[icon-only=true]:before:hidden",
  "data-[nested=true]:h-[max(var(--control-h-sm),2.25rem)] data-[nested=true]:px-2.5 data-[nested=true]:font-normal data-[nested=true]:before:-left-2.5 md:data-[nested=true]:h-(--control-h-sm)",
);

const badgeClass =
  "ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-(--sidebar-item-active-bg) px-1.5 font-semibold text-(--sidebar-item-active-fg) text-2xs tabular";

function Highlight({ text, query }: { text: string; query: string }) {
  const range = matchRange(text, query);
  if (!range) return text;
  return (
    <>
      {text.slice(0, range[0])}
      <mark className="rounded-xs bg-(--sidebar-accent-fg)/35 text-inherit">
        {text.slice(range[0], range[1])}
      </mark>
      {text.slice(range[1])}
    </>
  );
}

/**
 * One navigation item: an icon, a label and an optional badge. Renders a
 * button, or the given link element with asChild (router links keep their own
 * active detection through aria-current="page"). On the icon rail the label
 * moves into a tooltip; on phones choosing an item closes the drawer.
 */
export function SidebarItem({
  icon: Icon,
  label,
  keywords,
  badge,
  active,
  asChild = false,
  className,
  children,
  onClick,
  ...props
}: Omit<ComponentProps<"button">, "title"> & {
  icon?: SidebarIcon;
  /** Visible text; also what the search matches. */
  label: string;
  /** Extra words the search matches, e.g. synonyms. */
  keywords?: readonly string[];
  /** A count or short status shown at the end (a dot on the icon rail). */
  badge?: ReactNode;
  /** Marks the current page when the element does not set aria-current itself. */
  active?: boolean;
  /** Render the child element (a link) instead of a button. */
  asChild?: boolean;
}) {
  const { iconOnly, query, setQuery, isMobile, setOpenMobile } = useSidebar();
  const level = useContext(LevelContext);
  if (!level.parentMatched && !matchesQuery(query, label, keywords)) return null;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (isMobile) setOpenMobile(false);
    if (query) setQuery("");
  };
  const showBadge = badge !== undefined && badge !== null && badge !== false;
  const railIcon = iconOnly && !level.flyout;
  const Comp = asChild ? Slot.Root : "button";
  const extra: Record<string, unknown> = {};
  if (!asChild) extra.type = "button";
  if (active !== undefined) {
    extra["data-active"] = active;
    if (active) extra["aria-current"] = "page";
  }

  if (level.flyout) {
    return (
      <DropdownMenuItem asChild>
        <Comp data-slot="sidebar-item" onClick={handleClick} className={className} {...extra} {...props}>
          {Icon ? <Icon className="size-4" /> : null}
          <Slot.Slottable>{children}</Slot.Slottable>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {showBadge ? <span className="ml-auto text-muted-foreground text-xs tabular">{badge}</span> : null}
        </Comp>
      </DropdownMenuItem>
    );
  }

  const element = (
    <Comp
      data-slot="sidebar-item"
      data-sidebar-action=""
      data-sidebar-leaf=""
      data-sidebar-match=""
      data-icon-only={railIcon || undefined}
      data-nested={level.nested || undefined}
      aria-label={railIcon ? label : undefined}
      onClick={handleClick}
      className={cn(itemClass, className)}
      {...extra}
      {...props}
    >
      {Icon ? (
        <span className="relative flex shrink-0">
          <Icon className="size-4" />
          {railIcon && showBadge ? (
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-(--sidebar-accent-fg) ring-2 ring-(--sidebar-bg)" />
          ) : null}
        </span>
      ) : null}
      <Slot.Slottable>{children}</Slot.Slottable>
      {railIcon ? null : (
        <span className="min-w-0 flex-1 truncate">
          <Highlight text={label} query={query} />
        </span>
      )}
      {!railIcon && showBadge ? <span className={badgeClass}>{badge}</span> : null}
    </Comp>
  );

  if (!railIcon) return element;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{element}</TooltipTrigger>
      <TooltipContent side="right">
        {label}
        {showBadge ? <span className="ml-1.5 opacity-70">{badge}</span> : null}
      </TooltipContent>
    </Tooltip>
  );
}

const activeSelector = '[aria-current="page"],[data-active="true"]';

/**
 * An item with nested items that folds open; it opens by itself when one of
 * its items becomes the current page, and during a search when anything in
 * it matches. On the icon rail it opens a menu to the right instead.
 */
export function SidebarCollapsible({
  icon: Icon,
  label,
  keywords,
  badge,
  defaultOpen = false,
  className,
  children,
}: {
  icon?: SidebarIcon;
  label: string;
  keywords?: readonly string[];
  badge?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  /** SidebarItem elements. */
  children: ReactNode;
}) {
  const { iconOnly, query } = useSidebar();
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);
  const hidden = useNoMatch(ref, query);
  const searching = query.trim() !== "";
  const ownMatch = searching && matchesQuery(query, label, keywords);
  const showBadge = badge !== undefined && badge !== null && badge !== false;

  // Open when a nested item becomes the current page (also after client-side
  // navigation, which re-renders only the link). Re-run when the rail mode
  // swaps the observed element.
  // biome-ignore lint/correctness/useExhaustiveDependencies: iconOnly changes what ref points at.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let had = false;
    const check = () => {
      const has = el.querySelector(activeSelector) !== null;
      if (has && !had) setOpen(true);
      had = has;
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(el, {
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-current", "data-active"],
    });
    return () => observer.disconnect();
  }, [iconOnly]);

  if (iconOnly) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-slot="sidebar-collapsible"
                data-sidebar-action=""
                data-icon-only="true"
                aria-label={label}
                className={cn(itemClass, className)}
              >
                {Icon ? <Icon className="size-4 shrink-0" /> : <ChevronRightIcon className="size-4" />}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="right" align="start" className="min-w-52">
          <DropdownMenuLabel className="font-normal text-muted-foreground text-xs">{label}</DropdownMenuLabel>
          <LevelContext.Provider value={{ nested: true, parentMatched: true, flyout: true }}>
            {children}
          </LevelContext.Provider>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Collapsible open={searching || open} onOpenChange={setOpen} asChild>
      <div
        ref={ref}
        data-slot="sidebar-collapsible"
        hidden={hidden}
        className={cn("grid gap-0.5", className)}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            data-sidebar-action=""
            data-sidebar-match={ownMatch ? "" : undefined}
            className={cn(itemClass, "group/collapsible")}
          >
            {Icon ? <Icon className="size-4 shrink-0" /> : null}
            <span className="min-w-0 flex-1 truncate">
              <Highlight text={label} query={query} />
            </span>
            {showBadge ? <span className={badgeClass}>{badge}</span> : null}
            <ChevronRightIcon className="size-3.5 shrink-0 transition-transform duration-(--duration-fast) group-data-[state=open]/collapsible:rotate-90" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent
          forceMount
          className="ml-[1.1875rem] grid gap-0.5 border-(--sidebar-border) border-l pl-2.5 data-[state=closed]:hidden"
        >
          <LevelContext.Provider value={{ nested: true, parentMatched: ownMatch, flyout: false }}>
            {children}
          </LevelContext.Provider>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/** Bottom of the sidebar: account menu, help links, version. */
export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  const { iconOnly } = useSidebar();
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "flex min-h-(--footer-h) shrink-0 flex-col justify-center border-(--sidebar-border) border-t",
        iconOnly ? "px-2" : "px-2.5",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The signed-in user as a button for the footer: avatar, name and a second
 * line (e-mail or role). Use it as a DropdownMenuTrigger child (asChild).
 */
export function SidebarUser({
  name,
  description,
  src,
  className,
  ...props
}: ComponentProps<"button"> & {
  name: string;
  description?: ReactNode;
  /** Picture URL; initials otherwise. */
  src?: string;
}) {
  const { iconOnly } = useSidebar();
  return (
    <button
      type="button"
      data-slot="sidebar-user"
      title={iconOnly ? name : undefined}
      aria-label={iconOnly ? name : undefined}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md p-1.5 text-left outline-none transition-colors duration-(--duration-fast) hover:bg-(--sidebar-item-hover) focus-visible:shadow-(--focus-shadow) data-[state=open]:bg-(--sidebar-item-hover)",
        iconOnly && "justify-center",
        className,
      )}
      {...props}
    >
      <UserAvatar
        name={name}
        src={src}
        className="size-8 md:size-7"
        fallbackClassName="bg-(--sidebar-item-active-bg) text-(--sidebar-item-active-fg)"
      />
      {iconOnly ? null : (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-(--sidebar-item-active-fg) text-sm leading-tight">
              {name}
            </span>
            {description ? (
              <span className="block truncate text-(--sidebar-fg-muted) text-2xs leading-tight">
                {description}
              </span>
            ) : null}
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 text-(--sidebar-fg-muted)" />
        </>
      )}
    </button>
  );
}

/**
 * Opens the drawer on phones and collapses or expands the rail on desktop.
 * Put it at the start of the top bar.
 */
export function SidebarTrigger({ className, onClick, ...props }: ComponentProps<typeof Button>) {
  const { isMobile, collapsed, toggle } = useSidebar();
  const label = isMobile ? "Menüyü aç" : collapsed ? "Menüyü genişlet" : "Menüyü daralt";
  const button = (
    <Button
      variant="ghost"
      size="icon"
      data-slot="sidebar-trigger"
      aria-label={label}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) toggle();
      }}
      className={className}
      {...props}
    >
      {isMobile ? (
        <MenuIcon className="size-5" />
      ) : collapsed ? (
        <PanelLeftOpenIcon />
      ) : (
        <PanelLeftCloseIcon />
      )}
    </Button>
  );
  if (isMobile) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="bottom">
        {label}
        <kbd className="ml-2 font-sans opacity-70">⌘B</kbd>
      </TooltipContent>
    </Tooltip>
  );
}
