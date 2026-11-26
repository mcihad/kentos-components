import { AppearancePanel } from "@kentos/components/common/appearance-panel";
import { useAppearance } from "@kentos/components/lib/theme";
import { cn } from "@kentos/components/lib/utils";
import { Button } from "@kentos/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@kentos/components/ui/sheet";
import { Toaster } from "@kentos/components/ui/sonner";
import { TooltipProvider } from "@kentos/components/ui/tooltip";
import { MenuIcon, MoonIcon, PaletteIcon, SunIcon } from "lucide-react";
import { type ComponentType, useEffect, useState } from "react";
import { ButtonsPage } from "./pages/buttons";
import { DataPage } from "./pages/data";
import { FeedbackPage } from "./pages/feedback";
import { FormsPage } from "./pages/forms";
import { NavigationPage } from "./pages/navigation";
import { OverlaysPage } from "./pages/overlays";
import { OverviewPage } from "./pages/overview";
import { PatternsPage } from "./pages/patterns";
import { ThemingPage } from "./pages/theming";
import { TokensPage } from "./pages/tokens";

const pages: { id: string; label: string; group: string; component: ComponentType }[] = [
  { id: "", label: "Genel bakış", group: "Başlangıç", component: OverviewPage },
  { id: "tokens", label: "Renkler ve tokenlar", group: "Başlangıç", component: TokensPage },
  { id: "theming", label: "Görünüm ve temalar", group: "Başlangıç", component: ThemingPage },
  { id: "buttons", label: "Düğmeler", group: "Bileşenler", component: ButtonsPage },
  { id: "forms", label: "Form elemanları", group: "Bileşenler", component: FormsPage },
  { id: "feedback", label: "Geri bildirim", group: "Bileşenler", component: FeedbackPage },
  { id: "overlays", label: "Katmanlar", group: "Bileşenler", component: OverlaysPage },
  { id: "navigation", label: "Gezinme ve düzen", group: "Bileşenler", component: NavigationPage },
  { id: "data", label: "Veri gösterimi", group: "Bileşenler", component: DataPage },
  { id: "patterns", label: "Sayfa kalıpları", group: "Örnekler", component: PatternsPage },
];

function currentId() {
  return window.location.hash.replace(/^#\/?/, "").split("#")[0] ?? "";
}

function Nav({ active, onNavigate }: { active: string; onNavigate?: () => void }) {
  const groups = [...new Set(pages.map((p) => p.group))];
  return (
    <nav className="grid gap-5 p-4" aria-label="Bölümler">
      {groups.map((g) => (
        <div key={g} className="grid gap-0.5">
          <p className="px-2 pb-1 font-semibold text-2xs text-(--sidebar-fg-muted) uppercase tracking-(--tracking-caps)">
            {g}
          </p>
          {pages
            .filter((p) => p.group === g)
            .map((p) => (
              <a
                key={p.id}
                href={`#/${p.id}`}
                onClick={onNavigate}
                aria-current={active === p.id ? "page" : undefined}
                className={cn(
                  "rounded-md px-2 py-1.5 text-sm transition-colors",
                  active === p.id
                    ? "bg-(--sidebar-item-active-bg) font-medium text-(--sidebar-item-active-fg)"
                    : "text-(--sidebar-fg) hover:bg-(--sidebar-item-hover)",
                )}
              >
                {p.label}
              </a>
            ))}
        </div>
      ))}
    </nav>
  );
}

/** The showcase site: a sidebar of sections and the selected page. */
export function App() {
  const [active, setActive] = useState(currentId);
  const [menu, setMenu] = useState(false);
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
  return (
    <TooltipProvider>
      <div className="flex min-h-dvh bg-background">
        <aside className="on-dark sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-(--sidebar-border) border-r bg-(--sidebar-bg) md:block">
          <a
            href="#/"
            className="flex h-(--topbar-h) items-center gap-2 border-(--sidebar-border) border-b px-5"
          >
            <span className="grid size-7 place-items-center rounded-md bg-primary font-bold text-primary-foreground text-sm">
              K
            </span>
            <span className="font-semibold text-white">KentOS Bileşenleri</span>
          </a>
          <Nav active={active} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-(--topbar-h) items-center gap-2 border-(--topbar-border) border-b bg-(--topbar-bg) px-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenu(true)}
              aria-label="Menüyü aç"
            >
              <MenuIcon />
            </Button>
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
                Görünüm
              </Button>
            </div>
          </header>
          <main className="min-w-0 flex-1">
            <Current />
          </main>
        </div>
      </div>
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="on-dark w-72 bg-(--sidebar-bg) p-0">
          <SheetTitle className="sr-only">Bölümler</SheetTitle>
          <SheetDescription className="sr-only">Vitrin sayfaları</SheetDescription>
          <Nav active={active} onNavigate={() => setMenu(false)} />
        </SheetContent>
      </Sheet>
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
