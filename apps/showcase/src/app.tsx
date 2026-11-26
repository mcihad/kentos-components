import { AppearancePanel } from "@kentos/components/common/appearance-panel";
import { DialogHost } from "@kentos/components/common/dialog-host";
import {
  AppShell,
  AppShellActions,
  AppShellHeader,
  AppShellMain,
  AppShellMenuButton,
  AppShellSidebar,
} from "@kentos/components/layout/app-shell";
import {
  SidebarBrand,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarSearch,
} from "@kentos/components/layout/sidebar";
import { useAppearance } from "@kentos/components/lib/theme";
import { Button } from "@kentos/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@kentos/components/ui/sheet";
import { Toaster, type ToastTone } from "@kentos/components/ui/sonner";
import { TooltipProvider } from "@kentos/components/ui/tooltip";
import {
  AppWindowIcon,
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChartColumnIcon,
  FolderOpenIcon,
  FormInputIcon,
  LayersIcon,
  LayoutListIcon,
  LayoutTemplateIcon,
  ListChecksIcon,
  type LucideIcon,
  MessageSquareWarningIcon,
  MoonIcon,
  MousePointerClickIcon,
  PaletteIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PanelsTopLeftIcon,
  Rows3Icon,
  SquareMenuIcon,
  SunIcon,
  SwatchBookIcon,
  TableIcon,
  TextCursorInputIcon,
} from "lucide-react";
import { type ComponentType, useEffect, useState } from "react";
import { type PageMeta, PageMetaContext, ToastToneContext } from "./demo";
import { ButtonsPage } from "./pages/buttons";
import { ChoicesPage } from "./pages/choices";
import { ContentPage } from "./pages/content";
import { DataPage } from "./pages/data";
import { DataTablePage } from "./pages/data-table";
import { DatesPage } from "./pages/dates";
import { DialogsPage } from "./pages/dialogs";
import { DrawerPage } from "./pages/drawer";
import { FeedbackPage } from "./pages/feedback";
import { FormsPage } from "./pages/forms";
import { InputsPage } from "./pages/inputs";
import { MenusPage } from "./pages/menus";
import { NavigationPage } from "./pages/navigation";
import { OverlaysPage } from "./pages/overlays";
import { OverviewPage } from "./pages/overview";
import { PageLayoutPage } from "./pages/page-layout";
import { PatternsPage } from "./pages/patterns";
import { ShellPage } from "./pages/shell";
import { SidebarPage } from "./pages/sidebar";
import { TabsPage } from "./pages/tabs";
import { ThemingPage } from "./pages/theming";
import { TokensPage } from "./pages/tokens";

type ShowcasePage = {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  /** Component names on the page, so the menu search finds them. */
  keywords: string[];
  component: ComponentType;
};

const pages: ShowcasePage[] = [
  {
    id: "",
    label: "Genel bakış",
    group: "Başlangıç",
    icon: BookOpenIcon,
    keywords: ["kurulum", "giriş"],
    component: OverviewPage,
  },
  {
    id: "tokens",
    label: "Renkler ve tokenlar",
    group: "Başlangıç",
    icon: SwatchBookIcon,
    keywords: ["renk", "yazı", "token", "font"],
    component: TokensPage,
  },
  {
    id: "theming",
    label: "Görünüm ve temalar",
    group: "Başlangıç",
    icon: PaletteIcon,
    keywords: ["tema", "koyu", "yoğunluk", "AppearancePanel"],
    component: ThemingPage,
  },
  {
    id: "buttons",
    label: "Düğmeler",
    group: "Bileşenler",
    icon: MousePointerClickIcon,
    keywords: ["Button", "ButtonGroup", "SplitButton", "loading", "yükleniyor", "buton"],
    component: ButtonsPage,
  },
  {
    id: "forms",
    label: "Form elemanları",
    group: "Bileşenler",
    icon: FormInputIcon,
    keywords: ["Input", "Select", "Checkbox", "Switch", "RadioGroup", "Field", "Segmented", "Textarea"],
    component: FormsPage,
  },
  {
    id: "inputs",
    label: "Girdiler",
    group: "Bileşenler",
    icon: TextCursorInputIcon,
    keywords: [
      "InputGroup",
      "SearchInput",
      "PasswordInput",
      "NumberInput",
      "Textarea",
      "OtpInput",
      "arama",
      "parola",
      "sayı",
      "kod",
      "2FA",
    ],
    component: InputsPage,
  },
  {
    id: "choices",
    label: "Seçim bileşenleri",
    group: "Bileşenler",
    icon: ListChecksIcon,
    keywords: [
      "Combobox",
      "MultiSelect",
      "Slider",
      "CheckboxCard",
      "RadioCard",
      "SwitchCard",
      "kart",
      "çoklu seçim",
      "kaydırıcı",
      "aralık",
    ],
    component: ChoicesPage,
  },
  {
    id: "dates",
    label: "Tarihler",
    group: "Bileşenler",
    icon: CalendarDaysIcon,
    keywords: ["Calendar", "DatePicker", "DateRangePicker", "takvim", "tarih", "aralık", "dönem"],
    component: DatesPage,
  },
  {
    id: "content",
    label: "İçerik düzeni",
    group: "Bileşenler",
    icon: LayoutListIcon,
    keywords: [
      "Card",
      "kart",
      "Accordion",
      "akordeon",
      "DescriptionList",
      "Timeline",
      "zaman çizelgesi",
      "dl",
    ],
    component: ContentPage,
  },
  {
    id: "feedback",
    label: "Geri bildirim",
    group: "Bileşenler",
    icon: BellIcon,
    keywords: [
      "Alert",
      "Badge",
      "Skeleton",
      "toast",
      "Toaster",
      "sonner",
      "bildirim",
      "EmptyState",
      "ErrorState",
    ],
    component: FeedbackPage,
  },
  {
    id: "overlays",
    label: "Katmanlar",
    group: "Bileşenler",
    icon: LayersIcon,
    keywords: ["Dialog", "Sheet", "Popover", "DropdownMenu", "Tooltip", "HoverCard", "Command"],
    component: OverlaysPage,
  },
  {
    id: "drawer",
    label: "Çekmece",
    group: "Bileşenler",
    icon: PanelRightIcon,
    keywords: ["Drawer", "panel", "yan panel", "bottom sheet", "resizable", "boyut", "inspector"],
    component: DrawerPage,
  },
  {
    id: "menus",
    label: "Menüler",
    group: "Bileşenler",
    icon: SquareMenuIcon,
    keywords: [
      "DropdownMenu",
      "ContextMenu",
      "ActionMenu",
      "sağ tık",
      "bağlam menüsü",
      "açılır menü",
      "uzun bas",
    ],
    component: MenusPage,
  },
  {
    id: "dialogs",
    label: "Diyaloglar",
    group: "Bileşenler",
    icon: MessageSquareWarningIcon,
    keywords: [
      "AlertDialog",
      "ConfirmDialog",
      "MessageDialog",
      "InputDialog",
      "BusyDialog",
      "ProgressDialog",
      "LoadingDialog",
      "CountdownDialog",
      "onay",
      "prompt",
      "Progress",
      "Spinner",
    ],
    component: DialogsPage,
  },
  {
    id: "tabs",
    label: "Sekmeler",
    group: "Bileşenler",
    icon: FolderOpenIcon,
    keywords: ["Tabs", "TabsList", "TabsTrigger", "TabsNav", "sekme", "rozet", "kapatılabilir", "lazy"],
    component: TabsPage,
  },
  {
    id: "shell",
    label: "Uygulama kabuğu",
    group: "Bileşenler",
    icon: AppWindowIcon,
    keywords: ["AppShell", "app bar", "üst çubuk", "alt menü", "bottom nav", "banner", "iskelet", "layout"],
    component: ShellPage,
  },
  {
    id: "sidebar",
    label: "Kenar çubuğu",
    group: "Bileşenler",
    icon: PanelLeftIcon,
    keywords: ["Sidebar", "menü", "navigasyon"],
    component: SidebarPage,
  },
  {
    id: "page",
    label: "Sayfa düzeni",
    group: "Bileşenler",
    icon: PanelsTopLeftIcon,
    keywords: ["PageWrapper", "PageAction", "Toolbar", "ActionSheet", "Fab", "footer", "alt menü"],
    component: PageLayoutPage,
  },
  {
    id: "navigation",
    label: "Gezinme ve düzen",
    group: "Bileşenler",
    icon: LayoutTemplateIcon,
    keywords: ["Collapsible", "ScrollArea", "Separator", "Kbd"],
    component: NavigationPage,
  },
  {
    id: "data",
    label: "Veri gösterimi",
    group: "Bileşenler",
    icon: ChartColumnIcon,
    keywords: ["StatStrip", "tablo", "grafik", "StackedBars", "Sparkline", "Avatar", "CopyButton"],
    component: DataPage,
  },
  {
    id: "data-table",
    label: "Veri tablosu",
    group: "Bileşenler",
    icon: Rows3Icon,
    keywords: ["DataTable", "Pagination", "tablo", "sayfalama", "sıralama", "sütun", "server side", "sunucu"],
    component: DataTablePage,
  },
  {
    id: "patterns",
    label: "Sayfa kalıpları",
    group: "Örnekler",
    icon: TableIcon,
    keywords: ["liste", "form", "boş durum"],
    component: PatternsPage,
  },
];

function currentId() {
  return window.location.hash.replace(/^#\/?/, "").split("#")[0] ?? "";
}

/** The showcase site: a sidebar of sections and the selected page. */
export function App() {
  const [toastTone, setToastTone] = useState<ToastTone>("plain");
  const [active, setActive] = useState(currentId);
  const [appearance, setAppearance] = useState(false);
  const { resolved, setAppearance: set } = useAppearance();
  useEffect(() => {
    const on = () => {
      setActive(currentId());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const index = Math.max(
    0,
    pages.findIndex((p) => p.id === active),
  );
  const page = pages[index];
  const Current = page?.component ?? OverviewPage;
  const neighbour = (p: ShowcasePage | undefined) => (p ? { href: `#/${p.id}`, label: p.label } : undefined);
  const meta: PageMeta = {
    icon: page?.icon,
    prev: neighbour(pages[index - 1]),
    next: neighbour(pages[index + 1]),
  };
  const groups = [...new Set(pages.map((p) => p.group))];
  return (
    <TooltipProvider>
      <AppShell sidebarStorageKey="kentos-showcase-sidebar">
        <AppShellSidebar label="Vitrin menüsü">
          <SidebarHeader>
            <SidebarBrand
              logo={<span className="font-bold text-sm">K</span>}
              title="KentOS Bileşenleri"
              subtitle="Vitrin · v0.1"
              chevron={false}
              onClick={() => {
                window.location.hash = "#/";
              }}
            />
          </SidebarHeader>
          <SidebarSearch placeholder="Bileşen ara" />
          <SidebarContent label="Bölümler" emptyText="Eşleşen bileşen yok">
            {groups.map((g) => (
              <SidebarGroup key={g} label={g}>
                {pages
                  .filter((p) => p.group === g)
                  .map((p) => (
                    <SidebarItem
                      key={p.id}
                      icon={p.icon}
                      label={p.label}
                      keywords={p.keywords}
                      active={active === p.id}
                      asChild
                    >
                      {/* biome-ignore lint/a11y/useAnchorContent: SidebarItem renders the icon and label inside. */}
                      <a href={`#/${p.id}`} />
                    </SidebarItem>
                  ))}
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter>
            <SidebarItem icon={PaletteIcon} label="Görünümü özelleştir" onClick={() => setAppearance(true)} />
          </SidebarFooter>
        </AppShellSidebar>
        <AppShellHeader>
          <AppShellMenuButton />
          <span className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{page?.group}</span>
            <span aria-hidden className="hidden text-subtle sm:inline">
              /
            </span>
            <span className="truncate font-medium">{page?.label}</span>
          </span>
          <AppShellActions>
            <Button
              variant="ghost"
              size="icon"
              aria-label={resolved === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
              onClick={() => set({ mode: resolved === "dark" ? "light" : "dark" })}
            >
              {resolved === "dark" ? <SunIcon /> : <MoonIcon />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAppearance(true)}>
              <PaletteIcon />
              <span className="max-sm:sr-only">Görünüm</span>
            </Button>
          </AppShellActions>
        </AppShellHeader>
        <AppShellMain contained={false}>
          <PageMetaContext.Provider value={meta}>
            <ToastToneContext.Provider value={{ tone: toastTone, setTone: setToastTone }}>
              <Current key={page?.id} />
            </ToastToneContext.Provider>
          </PageMetaContext.Provider>
        </AppShellMain>
      </AppShell>
      <Sheet open={appearance} onOpenChange={setAppearance}>
        <SheetContent side="right" className="w-[min(22rem,100vw)] gap-0 overflow-y-auto sm:max-w-none">
          <SheetHeader>
            <SheetTitle>Görünüm</SheetTitle>
            <SheetDescription>
              Seçimler bütün bileşenlere anında uygulanır ve bu tarayıcıda saklanır.
            </SheetDescription>
          </SheetHeader>
          <AppearancePanel className="px-4 pb-6" />
        </SheetContent>
      </Sheet>
      <Toaster position="bottom-right" tone={toastTone} />
      <DialogHost />
    </TooltipProvider>
  );
}
