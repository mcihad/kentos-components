import { MenuIcon, SearchIcon, XIcon } from "lucide-react";
import { Slot } from "radix-ui";
import {
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Kbd } from "../common/kbd";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet";
import { Sidebar, SidebarProvider, SidebarTrigger, useSidebar } from "./sidebar";

/*
 * The application frame. Every region is a component that appears only when
 * it is used (or hidden with `hidden`):
 *
 *   <AppShell sidebarStorageKey="app-sidebar">
 *     <AppShellSidebar>…sidebar parts…</AppShellSidebar>   left rail / phone drawer
 *     <AppShellBanner>…</AppShellBanner>                    announcement strip
 *     <AppShellHeader>                                       app bar, sticky
 *       <AppShellMenuButton /> <AppShellBrand … /> <AppShellNav>…</AppShellNav>
 *       <AppShellSearch … /> <AppShellActions>…</AppShellActions>
 *     </AppShellHeader>
 *     <AppShellMain>…pages…</AppShellMain>
 *     <AppShellFooter>…</AppShellFooter>                    status line
 *     <AppShellBottomNav>…</AppShellBottomNav>              phone tab bar
 *   </AppShell>
 *
 * Each region places itself in a named grid area, so their order and any
 * wrapper components around them do not matter. Regions register with the
 * shell, so others can adapt: the menu button opens the sidebar or, without
 * one, the navigation drawer; with a bottom tab bar, page footers and
 * floating buttons move above it (--shell-bottom).
 */

type Part = "sidebar" | "header" | "nav" | "bottomNav" | "banner" | "footer";

type ShellState = {
  has: (part: Part) => boolean;
  register: (part: Part) => () => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
};

const ShellContext = createContext<ShellState | null>(null);

/** The shell's state, or null outside an AppShell. */
export function useAppShell(): ShellState | null {
  return useContext(ShellContext);
}

// Announces a region while it is mounted.
function useRegion(part: Part, active = true) {
  // Depend on the stable register function, not on the shell state, which
  // changes with every registration.
  const register = useContext(ShellContext)?.register;
  useLayoutEffect(() => {
    if (!register || !active) return;
    return register(part);
  }, [register, part, active]);
}

const areas = `"sidebar banner" "sidebar header" "sidebar main" "sidebar footer" "bottom bottom"`;

/**
 * The root: holds the sidebar state and lays the regions out. By default it
 * fills the window; with `height` it becomes a scrolling box of that height
 * (previews, embedded apps).
 */
export function AppShell({
  sidebarStorageKey,
  defaultSidebarCollapsed,
  sidebarShortcut,
  mobile,
  height,
  skipLinkLabel = "İçeriğe geç",
  className,
  style,
  children,
}: {
  sidebarStorageKey?: string;
  defaultSidebarCollapsed?: boolean;
  /** Letter toggling the sidebar with ⌘/Ctrl (default "b"); null disables it. */
  sidebarShortcut?: string | null;
  /** Forces the phone (true) or desktop (false) layout. */
  mobile?: boolean;
  /** A fixed height (e.g. "560px"); the shell then scrolls inside itself. */
  height?: string;
  skipLinkLabel?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [counts, setCounts] = useState<Partial<Record<Part, number>>>({});
  const [navOpen, setNavOpen] = useState(false);
  const register = useCallback((part: Part) => {
    setCounts((c) => ({ ...c, [part]: (c[part] ?? 0) + 1 }));
    return () => setCounts((c) => ({ ...c, [part]: Math.max(0, (c[part] ?? 1) - 1) }));
  }, []);
  const state = useMemo<ShellState>(
    () => ({ has: (p) => (counts[p] ?? 0) > 0, register, navOpen, setNavOpen }),
    [counts, register, navOpen],
  );
  const bottomNav = (counts.bottomNav ?? 0) > 0;

  return (
    <ShellContext.Provider value={state}>
      <SidebarProvider
        storageKey={sidebarStorageKey}
        defaultCollapsed={defaultSidebarCollapsed}
        toggleShortcut={sidebarShortcut}
        mobile={mobile}
        data-slot="app-shell"
        data-bottom-nav={bottomNav || undefined}
        className={cn(
          "grid min-h-svh w-full grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_auto_1fr_auto_auto] bg-background",
          // Room the bottom tab bar takes on phones; page footers and FABs add it.
          bottomNav && "max-md:[--shell-bottom:calc(4rem+env(safe-area-inset-bottom))]",
          bottomNav && mobile && "[--shell-bottom:calc(4rem+env(safe-area-inset-bottom))]",
          height && "min-h-0 overflow-y-auto overscroll-contain",
          className,
        )}
        style={{
          gridTemplateAreas: areas,
          ["--shell-h" as string]: height ?? "100svh",
          ...(height ? { height } : null),
          ...style,
        }}
      >
        <a
          href="#app-main"
          className="sr-only z-50 rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {skipLinkLabel}
        </a>
        {children}
      </SidebarProvider>
    </ShellContext.Provider>
  );
}

/** The left rail (a drawer on phones). Children are the sidebar parts (SidebarHeader, SidebarContent…). */
export function AppShellSidebar({
  hidden = false,
  className,
  ...props
}: ComponentProps<typeof Sidebar> & { hidden?: boolean }) {
  useRegion("sidebar", !hidden);
  const { isMobile } = useSidebar();
  if (hidden) return null;
  // The grid placement and shell height are for the desktop rail only: the
  // phone drawer is portalled out of the shell and sizes to the viewport.
  return (
    <Sidebar
      className={cn(!isMobile && "[grid-area:sidebar] h-(--shell-h) self-start", className)}
      {...props}
    />
  );
}

/** A strip above the app bar for announcements (maintenance, trial ends). */
export function AppShellBanner({
  hidden = false,
  tone = "info",
  className,
  children,
  ...props
}: ComponentProps<"div"> & { hidden?: boolean; tone?: "info" | "warning" | "danger" | "brand" }) {
  useRegion("banner", !hidden);
  if (hidden) return null;
  return (
    <div
      role="status"
      data-slot="app-shell-banner"
      className={cn(
        "flex min-h-10 items-center justify-center gap-2 px-4 py-2 text-center text-sm [grid-area:banner] print:hidden",
        tone === "info" && "bg-(--status-info-bg) text-(--status-info-fg)",
        tone === "warning" && "bg-(--status-warning-bg) text-(--status-warning-fg)",
        tone === "danger" && "bg-(--status-danger-bg) text-(--status-danger-fg)",
        tone === "brand" && "bg-primary text-primary-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** The app bar: sticky at the top of the content column. */
export function AppShellHeader({
  hidden = false,
  className,
  children,
  ...props
}: ComponentProps<"header"> & { hidden?: boolean }) {
  useRegion("header", !hidden);
  if (hidden) return null;
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "sticky top-0 z-30 flex h-(--topbar-h) min-w-0 shrink-0 items-center gap-1.5 border-(--topbar-border) border-b bg-(--topbar-bg) px-2 [grid-area:header] md:gap-3 md:px-4 print:hidden",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

/**
 * Opens the sidebar on phones and collapses it on desktop; without a sidebar
 * it opens the navigation drawer on phones. Renders nothing when there is
 * neither.
 */
export function AppShellMenuButton({ className }: { className?: string }) {
  const shell = useAppShell();
  if (shell?.has("sidebar")) return <SidebarTrigger className={className} />;
  if (shell?.has("nav"))
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Menüyü aç"
        aria-expanded={shell.navOpen}
        onClick={() => shell.setNavOpen(true)}
        className={cn("md:hidden", className)}
      >
        <MenuIcon className="size-5" />
      </Button>
    );
  return null;
}

/**
 * Logo and name in the app bar. With a sidebar (which shows the brand on
 * desktop) it appears on phones only.
 */
export function AppShellBrand({
  logo,
  title,
  asChild = false,
  className,
  children,
  ...props
}: Omit<ComponentProps<"a">, "title"> & {
  logo?: ReactNode;
  title: ReactNode;
  /** Render the child element (a router link to the home page). */
  asChild?: boolean;
}) {
  const shell = useAppShell();
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      data-slot="app-shell-brand"
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-2 rounded-md outline-none focus-visible:shadow-(--focus-shadow)",
        shell?.has("sidebar") && "md:hidden",
        className,
      )}
      {...props}
    >
      {logo ? <span className="grid size-7 shrink-0 place-items-center">{logo}</span> : null}
      <Slot.Slottable>{children}</Slot.Slottable>
      <span className="truncate font-semibold text-lg text-strong">{title}</span>
    </Comp>
  );
}

/** A flexible gap pushing what follows to the end of the app bar. */
export function AppShellSpacer() {
  return <div aria-hidden className="flex-1" />;
}

/**
 * The search entry of the app bar: a wide field-like button on desktop, an
 * icon on phones. It opens whatever search the application has (a command
 * palette); the shortcut is only displayed.
 */
export function AppShellSearch({
  placeholder = "Ara",
  shortcut = "⌘K",
  onClick,
  className,
}: {
  placeholder?: string;
  shortcut?: string | null;
  onClick: () => void;
  className?: string;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "hidden h-(--control-h-sm) w-[min(21rem,38vw)] items-center gap-2 rounded-md border border-(--input-border) bg-(--input-bg) px-2.5 text-muted-foreground text-sm transition-colors duration-(--duration-fast) hover:border-(--input-border-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow) focus-visible:outline-none md:flex",
          className,
        )}
      >
        <SearchIcon className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">{placeholder}</span>
        {shortcut ? <Kbd>{shortcut}</Kbd> : null}
      </button>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onClick} aria-label={placeholder}>
        <SearchIcon className="size-5" />
      </Button>
    </>
  );
}

/** Buttons at the end of the app bar (notifications, appearance, account). */
export function AppShellActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-actions"
      className={cn("ml-auto flex items-center gap-1", className)}
      {...props}
    />
  );
}

type NavPlace = "bar" | "drawer";
const NavPlaceContext = createContext<NavPlace>("bar");

/**
 * Horizontal navigation in the app bar for applications without a sidebar.
 * On phones the same items move into a drawer opened by AppShellMenuButton.
 */
export function AppShellNav({
  label = "Ana menü",
  hidden = false,
  drawerHeader,
  className,
  children,
}: {
  label?: string;
  hidden?: boolean;
  /** Shown at the top of the phone drawer, e.g. the brand. */
  drawerHeader?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  useRegion("nav", !hidden);
  const shell = useAppShell();
  const sidebar = useSidebar();
  if (hidden) return null;
  const drawer = sidebar.isMobile && !shell?.has("sidebar");
  return (
    <>
      <nav
        aria-label={label}
        data-slot="app-shell-nav"
        className={cn(
          "scrollbar-none hidden min-w-0 items-center gap-0.5 overflow-x-auto md:flex",
          sidebar.isMobile && "md:hidden",
          className,
        )}
      >
        <NavPlaceContext.Provider value="bar">{children}</NavPlaceContext.Provider>
      </nav>
      {drawer && shell ? (
        <Sheet open={shell.navOpen} onOpenChange={shell.setNavOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            aria-describedby={undefined}
            className="w-[min(20rem,86vw)] gap-0 p-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:max-w-none"
          >
            <SheetTitle className="sr-only">{label}</SheetTitle>
            <div className="flex items-center gap-2 border-b px-3 py-2.5">
              <div className="min-w-0 flex-1">{drawerHeader}</div>
              <button
                type="button"
                onClick={() => shell.setNavOpen(false)}
                aria-label="Menüyü kapat"
                className="grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-(--surface-hover) hover:text-foreground"
              >
                <XIcon className="size-5" />
              </button>
            </div>
            <nav aria-label={label} className="grid gap-0.5 overflow-y-auto p-2">
              <NavPlaceContext.Provider value="drawer">{children}</NavPlaceContext.Provider>
            </nav>
          </SheetContent>
        </Sheet>
      ) : null}
    </>
  );
}

/**
 * One navigation link: a compact tab in the app bar, a full row in the phone
 * drawer. Marks the current page with `active` or aria-current from a router
 * link (asChild).
 */
export function AppShellNavItem({
  icon: Icon,
  label,
  active,
  asChild = false,
  className,
  children,
  onClick,
  ...props
}: Omit<ComponentProps<"a">, "children"> & {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  asChild?: boolean;
  children?: ReactNode;
}) {
  const place = useContext(NavPlaceContext);
  const shell = useAppShell();
  const Comp = asChild ? Slot.Root : "a";
  const current = active ? { "aria-current": "page" as const } : {};
  return (
    <Comp
      data-slot="app-shell-nav-item"
      {...current}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (place === "drawer") shell?.setNavOpen(false);
      }}
      className={cn(
        "relative flex shrink-0 items-center gap-2 rounded-md font-medium text-muted-foreground text-sm outline-none transition-colors duration-(--duration-fast) hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow) [&_svg]:size-4 [&_svg]:shrink-0",
        "aria-[current=page]:text-(--tabs-fg-active)",
        place === "bar"
          ? "h-(--control-h-sm) px-3 after:absolute after:inset-x-3 after:-bottom-[calc((var(--topbar-h)-var(--control-h-sm))/2)] after:h-0.5 after:rounded-full after:bg-(--tabs-indicator) after:opacity-0 aria-[current=page]:after:opacity-100"
          : "h-11 px-3 aria-[current=page]:bg-(--surface-selected)",
        className,
      )}
      {...props}
    >
      {Icon ? <Icon /> : null}
      <Slot.Slottable>{children}</Slot.Slottable>
      <span className="truncate">{label}</span>
    </Comp>
  );
}

/** The content column; `contained` keeps it within --content-max-wide. */
export function AppShellMain({
  contained = true,
  className,
  children,
  ...props
}: ComponentProps<"main"> & { contained?: boolean }) {
  return (
    <main
      id="app-main"
      tabIndex={-1}
      data-slot="app-shell-main"
      className={cn("flex min-w-0 flex-col outline-none [grid-area:main]", className)}
      {...props}
    >
      <div className={cn("flex w-full flex-1 flex-col", contained && "mx-auto max-w-(--content-max-wide)")}>
        {children}
      </div>
    </main>
  );
}

/** A quiet status line under the content (version, connection, legal links). */
export function AppShellFooter({
  hidden = false,
  className,
  ...props
}: ComponentProps<"footer"> & { hidden?: boolean }) {
  useRegion("footer", !hidden);
  if (hidden) return null;
  return (
    <footer
      data-slot="app-shell-footer"
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 text-muted-foreground text-xs [grid-area:footer] md:px-(--gutter) print:hidden",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The phone tab bar: up to five primary destinations at the bottom, in
 * thumb reach. Hidden from md up (the sidebar or app bar navigation takes
 * over) unless `always`.
 */
export function AppShellBottomNav({
  label = "Alt menü",
  hidden = false,
  always = false,
  className,
  children,
}: {
  label?: string;
  hidden?: boolean;
  always?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const sidebar = useSidebar();
  const visible = !hidden && (always || sidebar.isMobile);
  useRegion("bottomNav", visible);
  if (!visible) return null;
  return (
    <nav
      aria-label={label}
      data-slot="app-shell-bottom-nav"
      className={cn(
        "sticky bottom-0 z-30 grid auto-cols-fr grid-flow-col border-t bg-(--topbar-bg) pb-[env(safe-area-inset-bottom)] [grid-area:bottom] print:hidden",
        className,
      )}
    >
      {children}
    </nav>
  );
}

/** One destination of the tab bar: icon over a short label, with an optional count. */
export function AppShellBottomNavItem({
  icon: Icon,
  label,
  badge,
  badgeLabel,
  badgeTone = "danger",
  active,
  asChild = false,
  className,
  children,
  ...props
}: Omit<ComponentProps<"a">, "children"> & {
  icon: ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  /** What the count means for screen readers, e.g. "12 açık hata". */
  badgeLabel?: string;
  /** danger for counts that need attention, neutral for plain totals. */
  badgeTone?: "danger" | "neutral";
  active?: boolean;
  asChild?: boolean;
  children?: ReactNode;
}) {
  const Comp = asChild ? Slot.Root : "a";
  const current = active ? { "aria-current": "page" as const } : {};
  return (
    <Comp
      data-slot="app-shell-bottom-nav-item"
      {...current}
      className={cn(
        "group/bottom relative flex h-16 min-w-0 flex-col items-center justify-center gap-1 font-medium text-2xs text-muted-foreground outline-none transition-colors duration-(--duration-fast) focus-visible:bg-(--surface-hover) aria-[current=page]:text-(--tabs-fg-active)",
        className,
      )}
      {...props}
    >
      <span className="relative grid h-7 w-14 place-items-center rounded-full transition-colors duration-(--duration-fast) group-aria-[current=page]/bottom:bg-brand-subtle">
        <Icon className="size-5" />
        {badge ? (
          <span
            aria-hidden={badgeLabel ? true : undefined}
            className={cn(
              "absolute -top-1 right-1.5 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-1 font-semibold text-2xs tabular leading-none",
              badgeTone === "danger"
                ? "bg-(--danger-bg) text-(--danger-fg)"
                : "bg-(--surface-active) text-foreground shadow-[0_0_0_1px_var(--border-default)]",
            )}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <Slot.Slottable>{children}</Slot.Slottable>
      <span className="max-w-full truncate">{label}</span>
      {badge && badgeLabel ? <span className="sr-only">, {badgeLabel}</span> : null}
    </Comp>
  );
}
