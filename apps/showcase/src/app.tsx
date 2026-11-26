import { AppearancePanel } from "@kentos/components/common/appearance-panel";
import {
  Sidebar,
  SidebarBrand,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarItem,
  SidebarProvider,
  SidebarSearch,
  SidebarTrigger,
} from "@kentos/components/layout/sidebar";
import { useAppearance } from "@kentos/components/lib/theme";
import { Button } from "@kentos/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@kentos/components/ui/sheet";
import { Toaster } from "@kentos/components/ui/sonner";
import { TooltipProvider } from "@kentos/components/ui/tooltip";
import {
  BellIcon,
  BookOpenIcon,
  ChartColumnIcon,
  FormInputIcon,
  LayersIcon,
  LayoutTemplateIcon,
  type LucideIcon,
  MoonIcon,
  MousePointerClickIcon,
  PaletteIcon,
  PanelLeftIcon,
  SunIcon,
  SwatchBookIcon,
  TableIcon,
} from "lucide-react";
import { type ComponentType, useEffect, useState } from "react";
import { ButtonsPage } from "./pages/buttons";
import { DataPage } from "./pages/data";
import { FeedbackPage } from "./pages/feedback";
import { FormsPage } from "./pages/forms";
import { NavigationPage } from "./pages/navigation";
import { OverlaysPage } from "./pages/overlays";
import { OverviewPage } from "./pages/overview";
import { PatternsPage } from "./pages/patterns";
import { SidebarPage } from "./pages/sidebar";
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
    keywords: ["Button", "Toggle", "ToggleGroup", "buton"],
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
    id: "feedback",
    label: "Geri bildirim",
    group: "Bileşenler",
    icon: BellIcon,
    keywords: ["Alert", "Badge", "Skeleton", "toast", "EmptyState", "ErrorState"],
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
    id: "sidebar",
    label: "Kenar çubuğu",
    group: "Bileşenler",
    icon: PanelLeftIcon,
    keywords: ["Sidebar", "menü", "navigasyon"],
    component: SidebarPage,
  },
  {
    id: "navigation",
    label: "Gezinme ve düzen",
    group: "Bileşenler",
    icon: LayoutTemplateIcon,
    keywords: ["Tabs", "sekme", "Collapsible", "ScrollArea", "Separator", "Kbd"],
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
  const page = pages.find((p) => p.id === active) ?? pages[0];
  const Current = page?.component ?? OverviewPage;
  const groups = [...new Set(pages.map((p) => p.group))];
  return (
    <TooltipProvider>
      <SidebarProvider storageKey="kentos-showcase-sidebar" className="bg-background">
        <Sidebar label="Vitrin menüsü">
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
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-(--topbar-h) items-center gap-2 border-(--topbar-border) border-b bg-(--topbar-bg) px-2 md:px-3">
            <SidebarTrigger />
            <span className="truncate font-medium text-sm">{page?.label}</span>
            <div className="ml-auto flex items-center gap-1">
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
            </div>
          </header>
          <main className="min-w-0 flex-1">
            <Current />
          </main>
        </SidebarInset>
      </SidebarProvider>
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
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
