import { ChevronDownIcon, EllipsisIcon } from "lucide-react";
import { Slot } from "radix-ui";
import {
  type ComponentProps,
  type ComponentType,
  createContext,
  type ReactNode,
  useContext,
  useRef,
} from "react";
import {
  ActionSheet,
  ActionSheetContent,
  ActionSheetGroup,
  ActionSheetItem,
  ActionSheetSeparator,
  ActionSheetTrigger,
} from "../common/action-sheet";
import { Fab, useHideOnScroll } from "../common/fab";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "../common/toolbar";
import { useIsMobile } from "../lib/use-mobile";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

/*
 * The frame of a content page: a header (icon, title, tagline, actions), a
 * body that fills the width, and an optional footer that can stay fixed at
 * the bottom, level with the sidebar footer. On phones the header actions
 * move into a floating action button that opens a bottom sheet.
 *
 * Actions are described once with PageAction, PageActionMenu,
 * PageActionToolbar and PageActionSeparator; each renders itself for where it
 * ends up: buttons in the header, items in a dropdown, toolbar buttons, or
 * rows of the bottom sheet.
 *
 *   <PageWrapper
 *     icon={BoxesIcon}
 *     title="Projeler"
 *     description="Hata toplayan uygulamalar"
 *     actions={
 *       <>
 *         <PageActionMenu label="Diğer" icon={EllipsisIcon} hideLabel>
 *           <PageAction icon={DownloadIcon} label="Dışa aktar" onClick={exportCsv} />
 *         </PageActionMenu>
 *         <PageAction icon={PlusIcon} label="Proje oluştur" variant="default" onClick={create} />
 *       </>
 *     }
 *     footer={<Pagination />}
 *     footerFixed
 *   >
 *     …
 *   </PageWrapper>
 */

type Icon = ComponentType<{ className?: string }>;

// Where an action is being rendered.
type Surface = "bar" | "menu" | "toolbar" | "sheet";
const SurfaceContext = createContext<Surface>("bar");
const MobileContext = createContext<boolean | undefined>(undefined);

function usePageMobile() {
  const forced = useContext(MobileContext);
  return useIsMobile(forced);
}

/**
 * A content page. Without a title it renders only the body and footer, for
 * pages that draw their own header with PageHeader.
 */
export function PageWrapper({
  icon,
  title,
  description,
  meta,
  actions,
  actionsLabel = "İşlemler",
  fabIcon = EllipsisIcon,
  footer,
  footerFixed = false,
  padded = true,
  mobile,
  className,
  bodyClassName,
  children,
  ...props
}: Omit<ComponentProps<"div">, "title"> & {
  icon?: Icon;
  title?: string;
  /** One line under the title: what the page is for. */
  description?: ReactNode;
  /** Small elements beside the title, e.g. a status badge. */
  meta?: ReactNode;
  /** PageAction, PageActionMenu, PageActionToolbar and PageActionSeparator elements. */
  actions?: ReactNode;
  /** Name of the floating button and title of the sheet on phones. */
  actionsLabel?: string;
  fabIcon?: Icon;
  footer?: ReactNode;
  /** Keeps the footer at the bottom of the screen while the body scrolls. */
  footerFixed?: boolean;
  /** Gutters around the body; false for edge-to-edge content (maps, tables). */
  padded?: boolean;
  /** Forces the phone (true) or desktop (false) layout regardless of the viewport. */
  mobile?: boolean;
  bodyClassName?: string;
}) {
  const isMobile = useIsMobile(mobile);
  const fab = isMobile && actions !== undefined && actions !== null && actions !== false;
  return (
    <MobileContext.Provider value={isMobile}>
      <div
        data-slot="page"
        data-mobile={isMobile || undefined}
        className={cn("flex min-h-[calc(100svh-var(--topbar-h))] min-w-0 flex-col", className)}
        {...props}
      >
        {title ? (
          <PageHeader icon={icon} title={title} description={description} meta={meta} actions={actions} />
        ) : null}
        <PageBody padded={padded} className={cn(fab && "pb-24", bodyClassName)}>
          {children}
        </PageBody>
        {fab ? (
          <PageFab
            label={actionsLabel}
            icon={fabIcon}
            description={title}
            footerFixed={footerFixed && !!footer}
          >
            {actions}
          </PageFab>
        ) : null}
        {footer ? <PageFooter fixed={footerFixed}>{footer}</PageFooter> : null}
      </div>
    </MobileContext.Provider>
  );
}

/** The page heading: icon tile, title, tagline and (on desktop) the actions. */
export function PageHeader({
  icon: HeaderIcon,
  title,
  description,
  meta,
  actions,
  className,
  children,
}: {
  icon?: Icon;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  /** Shown on desktop; PageWrapper moves them into the floating button on phones. */
  actions?: ReactNode;
  className?: string;
  /** Content under the heading, e.g. tabs or filters. */
  children?: ReactNode;
}) {
  const isMobile = usePageMobile();
  return (
    <header
      data-slot="page-header"
      className={cn("px-4 pt-4 pb-3 md:px-(--gutter) md:pt-5 md:pb-4", className)}
    >
      <div className="flex items-start gap-3 md:items-center md:gap-4">
        {HeaderIcon ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-(--border-brand)/25 bg-brand-subtle text-brand-ink md:size-11">
            <HeaderIcon className="size-5" />
          </span>
        ) : null}
        <div className="min-w-0 flex-1 self-center">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="min-w-0 truncate font-semibold text-lg text-strong leading-tight tracking-(--tracking-tight) md:text-xl">
              {title}
            </h1>
            {meta}
          </div>
          {description ? (
            <p className="mt-0.5 text-muted-foreground text-sm leading-snug">{description}</p>
          ) : null}
        </div>
        {actions && !isMobile ? <PageActions>{actions}</PageActions> : null}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </header>
  );
}

/** The actions row of a header; wraps on narrow desktops. */
export function PageActions({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      data-slot="page-actions"
      className={cn("flex shrink-0 flex-wrap items-center justify-end gap-2", className)}
    >
      <SurfaceContext.Provider value="bar">{children}</SurfaceContext.Provider>
    </div>
  );
}

/** The content area: fills the width, with density-aware gutters unless padded is false. */
export function PageBody({
  padded = true,
  className,
  ...props
}: ComponentProps<"div"> & { padded?: boolean }) {
  return (
    <div
      data-slot="page-body"
      className={cn("min-w-0 flex-1", padded && "px-4 pb-6 md:px-(--gutter)", className)}
      {...props}
    />
  );
}

/**
 * Bottom bar of the page (pagination, save and cancel, totals). Its height
 * is --footer-h, the same as the sidebar footer; fixed keeps it on screen.
 */
export function PageFooter({
  fixed = false,
  className,
  ...props
}: ComponentProps<"footer"> & { fixed?: boolean }) {
  return (
    <footer
      data-slot="page-footer"
      data-fixed={fixed || undefined}
      className={cn(
        "mt-auto flex min-h-[calc(var(--footer-h)+env(safe-area-inset-bottom))] shrink-0 items-center justify-between gap-3 border-t bg-(--surface-card) px-4 pb-[env(safe-area-inset-bottom)] md:px-(--gutter)",
        fixed && "sticky bottom-0 z-20",
        className,
      )}
      {...props}
    />
  );
}

// The floating button sits in a zero-height sticky strip after the body, so
// it stays above the fixed footer (or the bottom edge) of whatever scrolls:
// the window in an application, a framed preview in a showcase.
function PageFab({
  label,
  icon,
  description,
  footerFixed,
  children,
}: {
  label: string;
  icon: Icon;
  description?: string;
  footerFixed: boolean;
  children: ReactNode;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const hidden = useHideOnScroll(strip);
  return (
    <div
      ref={strip}
      data-slot="page-fab"
      className={cn(
        "pointer-events-none sticky z-30 h-0",
        footerFixed
          ? "bottom-[calc(var(--footer-h)+env(safe-area-inset-bottom))]"
          : "bottom-[env(safe-area-inset-bottom)]",
      )}
    >
      <ActionSheet>
        <ActionSheetTrigger asChild>
          <Fab
            icon={icon}
            label={label}
            extended
            hidden={hidden}
            className="pointer-events-auto absolute right-4 bottom-4"
          />
        </ActionSheetTrigger>
        <ActionSheetContent title={label} description={description}>
          <SurfaceContext.Provider value="sheet">{children}</SurfaceContext.Provider>
        </ActionSheetContent>
      </ActionSheet>
    </div>
  );
}

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";

/**
 * One action. In the header it is a small button (variant default for the
 * page's primary action); in a menu an item; in a toolbar an icon button; in
 * the phone sheet a row with its description.
 */
export function PageAction({
  icon: ActionIcon,
  label,
  description,
  variant = "outline",
  hideLabel = false,
  asChild = false,
  className,
  children,
  disabled,
  ...props
}: Omit<ComponentProps<"button">, "title"> & {
  icon?: Icon;
  label: string;
  /** Second line in the phone sheet. */
  description?: ReactNode;
  variant?: ButtonVariant;
  /** Icon-only button with a tooltip in the header. */
  hideLabel?: boolean;
  /** Render the child element (a link). */
  asChild?: boolean;
}) {
  const surface = useContext(SurfaceContext);

  if (surface === "sheet") {
    return (
      <ActionSheetItem
        icon={ActionIcon}
        label={label}
        description={description}
        variant={variant === "default" ? "primary" : variant === "destructive" ? "destructive" : "default"}
        asChild={asChild}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </ActionSheetItem>
    );
  }

  if (surface === "toolbar") {
    return (
      <ToolbarButton
        icon={ActionIcon}
        label={label}
        asChild={asChild}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </ToolbarButton>
    );
  }

  const Comp = asChild ? Slot.Root : "button";
  if (surface === "menu") {
    return (
      <DropdownMenuItem
        asChild
        disabled={disabled}
        variant={variant === "destructive" ? "destructive" : "default"}
      >
        <Comp type={asChild ? undefined : "button"} className={cn("w-full", className)} {...props}>
          {ActionIcon ? <ActionIcon className="size-4" /> : null}
          <Slot.Slottable>{children}</Slot.Slottable>
          {label}
        </Comp>
      </DropdownMenuItem>
    );
  }

  const iconOnly = hideLabel && !!ActionIcon;
  const button = (
    <Button
      variant={variant}
      size={iconOnly ? "icon-sm" : "sm"}
      asChild={asChild}
      disabled={disabled}
      aria-label={iconOnly ? label : undefined}
      className={className}
      {...props}
    >
      {ActionIcon ? <ActionIcon /> : null}
      <Slot.Slottable>{children}</Slot.Slottable>
      {iconOnly ? null : label}
    </Button>
  );
  if (!iconOnly) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Actions under one button: a dropdown in the header (use an ellipsis icon
 * with hideLabel for "more"), a titled group in the phone sheet.
 */
export function PageActionMenu({
  icon: MenuIcon,
  label,
  variant = "outline",
  hideLabel = false,
  align = "end",
  children,
}: {
  icon?: Icon;
  label: string;
  variant?: ButtonVariant;
  hideLabel?: boolean;
  align?: "start" | "center" | "end";
  /** PageAction and PageActionSeparator elements. */
  children: ReactNode;
}) {
  const surface = useContext(SurfaceContext);
  if (surface === "sheet") {
    return (
      <ActionSheetGroup label={label}>
        <SurfaceContext.Provider value="sheet">{children}</SurfaceContext.Provider>
      </ActionSheetGroup>
    );
  }
  if (surface === "menu") {
    return (
      <>
        <DropdownMenuLabel className="font-normal text-muted-foreground text-xs">{label}</DropdownMenuLabel>
        {children}
      </>
    );
  }
  const iconOnly = hideLabel && !!MenuIcon;
  const trigger = (
    <DropdownMenuTrigger asChild>
      <Button variant={variant} size={iconOnly ? "icon-sm" : "sm"} aria-label={iconOnly ? label : undefined}>
        {MenuIcon ? <MenuIcon /> : null}
        {iconOnly ? null : (
          <>
            {label}
            <ChevronDownIcon className="-mr-0.5 opacity-60" />
          </>
        )}
      </Button>
    </DropdownMenuTrigger>
  );
  return (
    <DropdownMenu>
      {iconOnly ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <DropdownMenuContent align={align} className="min-w-52">
        <SurfaceContext.Provider value="menu">{children}</SurfaceContext.Provider>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Related actions as a joined toolbar in the header, a titled group in the phone sheet. */
export function PageActionToolbar({
  label,
  className,
  children,
}: {
  /** Accessible name of the toolbar and heading of the group in the sheet. */
  label: string;
  className?: string;
  /** PageAction and PageActionSeparator elements, or toolbar controls. */
  children: ReactNode;
}) {
  const surface = useContext(SurfaceContext);
  if (surface === "sheet") {
    return (
      <ActionSheetGroup label={label}>
        <SurfaceContext.Provider value="sheet">{children}</SurfaceContext.Provider>
      </ActionSheetGroup>
    );
  }
  if (surface === "menu") return children;
  return (
    <Toolbar aria-label={label} className={className}>
      <SurfaceContext.Provider value="toolbar">{children}</SurfaceContext.Provider>
    </Toolbar>
  );
}

/** A divider that suits where it is rendered. */
export function PageActionSeparator() {
  const surface = useContext(SurfaceContext);
  if (surface === "sheet") return <ActionSheetSeparator />;
  if (surface === "menu") return <DropdownMenuSeparator />;
  if (surface === "toolbar") return <ToolbarSeparator />;
  return <span aria-hidden className="mx-0.5 h-5 w-px bg-border" />;
}

/** Content that only appears in the header (desktop), e.g. a search field. */
export function PageActionDesktop({ children }: { children: ReactNode }) {
  const surface = useContext(SurfaceContext);
  return surface === "sheet" ? null : children;
}
