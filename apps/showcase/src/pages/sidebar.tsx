import {
  Sidebar,
  SidebarBrand,
  SidebarCollapsible,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarItem,
  SidebarProvider,
  SidebarSearch,
  SidebarTrigger,
  SidebarUser,
  useSidebar,
} from "@kentos/components/layout/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@kentos/components/ui/dropdown-menu";
import {
  BellRingIcon,
  BoxesIcon,
  BugIcon,
  Building2Icon,
  CheckIcon,
  CompassIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareTextIcon,
  PlusIcon,
  RadioIcon,
  SettingsIcon,
  TimerIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Demo, Page } from "../demo";

const organizations = ["Bursa Belediyesi", "Nilüfer Belediyesi", "KentOS Geliştirme"];

function Logo() {
  return <span className="font-bold text-(--sidebar-item-active-fg) text-sm">K</span>;
}

/** The example application frame used by the demos. */
function ExampleApp({ mobile, defaultCollapsed }: { mobile?: boolean; defaultCollapsed?: boolean }) {
  const [page, setPage] = useState("issues");
  const [org, setOrg] = useState(organizations[0] ?? "");
  const item = (id: string) => ({ active: page === id, onClick: () => setPage(id) });
  return (
    <SidebarProvider
      mobile={mobile}
      defaultCollapsed={defaultCollapsed}
      toggleShortcut={null}
      className="isolate h-[560px] min-h-0 overflow-hidden"
    >
      <Sidebar label="Örnek menü" className="h-full">
        <SidebarHeader>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarBrand logo={<Logo />} title={org} subtitle="Yönetici" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel className="font-normal text-muted-foreground text-xs">
                Organizasyonlar
              </DropdownMenuLabel>
              {organizations.map((o) => (
                <DropdownMenuItem key={o} onSelect={() => setOrg(o)}>
                  <span className="flex-1 truncate">{o}</span>
                  {o === org ? <CheckIcon className="size-4 text-brand-ink" /> : null}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <PlusIcon />
                Yeni organizasyon
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>
        <SidebarSearch />
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem icon={CompassIcon} label="Genel bakış" {...item("overview")} />
          </SidebarGroup>
          <SidebarGroup label="İzleme">
            <SidebarItem icon={BugIcon} label="Hatalar" badge={12} keywords={["issue"]} {...item("issues")} />
            <SidebarItem icon={LayoutDashboardIcon} label="Panolar" {...item("dashboards")} />
            <SidebarItem icon={RadioIcon} label="Canlı akış" {...item("live")} />
            <SidebarItem icon={TimerIcon} label="Zamanlanmış görevler" badge="1" {...item("monitors")} />
          </SidebarGroup>
          <SidebarGroup label="Müşteri" collapsible>
            <SidebarItem icon={Building2Icon} label="Müşteriler" {...item("customers")} />
            <SidebarItem
              icon={MessageSquareTextIcon}
              label="Geri bildirim"
              keywords={["şikâyet", "öneri"]}
              {...item("feedback")}
            />
          </SidebarGroup>
          <SidebarGroup label="Yönetim">
            <SidebarItem icon={BoxesIcon} label="Projeler" {...item("projects")} />
            <SidebarItem icon={BellRingIcon} label="Uyarılar" {...item("alerts")} />
            <SidebarCollapsible icon={SettingsIcon} label="Ayarlar">
              <SidebarItem label="Genel" {...item("settings")} />
              <SidebarItem label="Üyeler" keywords={["davet"]} {...item("members")} />
              <SidebarItem label="Erişim anahtarları" keywords={["token"]} {...item("tokens")} />
              <SidebarItem label="Kayıt defteri" keywords={["audit"]} {...item("audit")} />
            </SidebarCollapsible>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarUser name="Ayşe Yılmaz" description="ayse@kentos.dev" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuItem>
                <UserIcon />
                Hesabım
              </DropdownMenuItem>
              <DropdownMenuItem>
                <KeyRoundIcon />
                Erişim anahtarları
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOutIcon />
                Çıkış yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-h-0 bg-background">
        <header className="flex h-(--topbar-h) shrink-0 items-center gap-2 border-(--topbar-border) border-b bg-(--topbar-bg) px-2">
          <SidebarTrigger />
          <span className="truncate font-medium text-sm">{org}</span>
        </header>
        <div className="grid flex-1 content-start gap-3 overflow-y-auto p-5">
          <ModeNote />
          <div className="card grid gap-1 p-4">
            <p className="font-semibold">Seçili sayfa</p>
            <p className="text-muted-foreground text-sm">
              <code>{page}</code> — menüden başka bir sayfa seçin ya da arama kutusuna “müşteri”, “token” veya
              “şikayet” yazın.
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ModeNote() {
  const { isMobile, collapsed } = useSidebar();
  const text = isMobile
    ? "Telefon görünümü: menü sol üstteki düğmeyle açılan bir çekmecedir."
    : collapsed
      ? "Daraltılmış: yalnızca simgeler görünür, adlar ipucunda çıkar."
      : "Geniş: menüyü sol üstteki düğmeyle daraltabilirsiniz.";
  return <p className="text-muted-foreground text-sm">{text}</p>;
}

const fullCode = `<SidebarProvider storageKey="app-sidebar">
  <Sidebar>
    <SidebarHeader>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarBrand logo={<Logo />} title="Bursa Belediyesi" subtitle="Yönetici" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">…</DropdownMenuContent>
      </DropdownMenu>
    </SidebarHeader>
    <SidebarSearch />
    <SidebarContent>
      <SidebarGroup label="İzleme">
        <SidebarItem icon={BugIcon} label="Hatalar" badge={12} asChild>
          <Link to="/issues" />
        </SidebarItem>
        <SidebarItem icon={RadioIcon} label="Canlı akış" asChild>
          <Link to="/live" />
        </SidebarItem>
      </SidebarGroup>
      <SidebarGroup label="Müşteri" collapsible>
        <SidebarItem icon={MessageSquareTextIcon} label="Geri bildirim" keywords={["şikâyet"]} asChild>
          <Link to="/feedback" />
        </SidebarItem>
      </SidebarGroup>
      <SidebarCollapsible icon={SettingsIcon} label="Ayarlar">
        <SidebarItem label="Üyeler" keywords={["davet"]} asChild><Link to="/settings/members" /></SidebarItem>
      </SidebarCollapsible>
    </SidebarContent>
    <SidebarFooter>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarUser name="Ayşe Yılmaz" description="ayse@kentos.dev" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start">…</DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  </Sidebar>
  <SidebarInset>
    <header><SidebarTrigger /> …</header>
    <main>…</main>
  </SidebarInset>
</SidebarProvider>`;

const parts: [string, string][] = [
  [
    "SidebarProvider",
    "Durumu tutar, menüyü sayfanın yanına yerleştirir. storageKey daraltılmış hâli hatırlar; ⌘B kısayolu açıp kapatır.",
  ],
  ["Sidebar", "Masaüstünde yapışkan koyu ray, md altında soldan açılan çekmece."],
  ["SidebarHeader", "Üst bölüm. Telefonda çekmecenin kapatma düğmesini ekler."],
  [
    "SidebarBrand",
    "Logo, ad ve alt satır; organizasyon ya da modül değiştirici için DropdownMenuTrigger içinde kullanılır.",
  ],
  [
    "SidebarSearch",
    "Öğeleri süzer (Türkçe karakterlere duyarsız: “musteri” → Müşteriler). Enter ilk sonucu açar, oklar listeye iner, Esc temizler.",
  ],
  ["SidebarContent", "Kayan liste; sonuç yoksa boş durum gösterir. Oklar, Home ve End ile gezilir."],
  ["SidebarGroup", "Başlıklı grup; collapsible ile katlanır, daraltılmış rayda ince çizgiye döner."],
  [
    "SidebarItem",
    'Simge, ad ve rozet. asChild ile router bağlantısı olur; aria-current="page" etkin görünümü verir.',
  ],
  [
    "SidebarCollapsible",
    "Alt öğeli öğe. İçindeki sayfa açılınca kendiliğinden açılır; rayda sağa açılan menü olur.",
  ],
  ["SidebarFooter / SidebarUser", "Alt bölüm ve kullanıcı düğmesi (avatar, ad, e-posta)."],
  ["SidebarTrigger", "Üst çubuğun başına konur: masaüstünde daraltır, telefonda çekmeceyi açar."],
  ["useSidebar()", "collapsed, isMobile, openMobile, query ve bunları değiştiren işlevler."],
];

/** The application sidebar and its parts. */
export function SidebarPage() {
  return (
    <Page
      title="Kenar çubuğu"
      description="Uygulamanın sol menüsü: başlık, arama, simgeli ve rozetli öğe grupları, alt öğeler ve hesap bölümü. Masaüstünde simge rayına daralır, telefonda çekmeceye dönüşür; klavyeyle baştan sona kullanılabilir."
    >
      <Demo
        title="Tam menü"
        description="Organizasyon değiştirici, arama, gruplar, katlanan grup, alt öğeli Ayarlar ve kullanıcı menüsü. Ekran daraldığında aynı örnek çekmece olarak çalışır."
        className="block p-0 md:p-0"
        code={fullCode}
      >
        <ExampleApp />
      </Demo>
      <Demo
        title="Daraltılmış ray"
        description="Yalnızca simgeler görünür; adlar ipucunda, rozetler nokta olarak çıkar. Alt öğeli öğeler sağa açılan bir menüdür, arama düğmesi menüyü genişletip kutuya odaklanır."
        className="block p-0 md:p-0"
        code={`<SidebarProvider defaultCollapsed>…</SidebarProvider>

// Kontrollü kullanım
<SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed}>…</SidebarProvider>`}
      >
        <ExampleApp defaultCollapsed />
      </Demo>
      <Demo
        title="Telefon görünümü"
        description="md kırılma noktasının altında menü, üst çubuktaki düğmeyle açılan bir çekmecedir. Bir sayfa seçildiğinde kendiliğinden kapanır; çentikli ekranlarda güvenli alan boşlukları korunur. Bu örnek, geniş ekranda da çekmeceyi göstermek için mobile ile zorlanmıştır."
        className="block p-0 md:p-0"
        code={`// Normalde ekran genişliğine göre kendiliğinden seçilir.
<SidebarProvider mobile>…</SidebarProvider>`}
      >
        <ExampleApp mobile />
      </Demo>
      <section className="grid gap-3">
        <h2 className="font-semibold text-lg">Parçalar</h2>
        <div className="card divide-y">
          {parts.map(([name, text]) => (
            <div key={name} className="grid gap-1 px-4 py-3 sm:grid-cols-[14rem_1fr] sm:gap-4">
              <code className="font-medium text-sm">{name}</code>
              <p className="text-muted-foreground text-sm">{text}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          İçe aktarma: <code>@kentos/components/layout/sidebar</code>. Renkler <code>--sidebar-*</code>{" "}
          tokenlarından gelir; ana renk ve koyu tema seçimlerine kendiliğinden uyar. Genişlikler{" "}
          <code>--sidebar-w</code> ve <code>--sidebar-w-collapsed</code>, yoğunluk seçimine göre değişir.
        </p>
      </section>
    </Page>
  );
}
