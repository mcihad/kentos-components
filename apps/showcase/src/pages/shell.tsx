import {
  AppShell,
  AppShellActions,
  AppShellBanner,
  AppShellBottomNav,
  AppShellBottomNavItem,
  AppShellBrand,
  AppShellFooter,
  AppShellHeader,
  AppShellMain,
  AppShellMenuButton,
  AppShellNav,
  AppShellNavItem,
  AppShellSearch,
  AppShellSidebar,
} from "@kentos/components/layout/app-shell";
import { PageWrapper } from "@kentos/components/layout/page";
import {
  SidebarBrand,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarSearch,
  SidebarUser,
} from "@kentos/components/layout/sidebar";
import { BadgeAnchor } from "@kentos/components/ui/badge";
import { Button } from "@kentos/components/ui/button";
import { Label } from "@kentos/components/ui/label";
import { Switch } from "@kentos/components/ui/switch";
import {
  BellIcon,
  BoxesIcon,
  BugIcon,
  CompassIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { type MouseEvent, useState } from "react";
import { toast } from "sonner";
import { Demo, Page } from "../demo";

const sections: { id: string; label: string; icon: LucideIcon; badge?: number }[] = [
  { id: "overview", label: "Genel bakış", icon: CompassIcon },
  { id: "issues", label: "Hatalar", icon: BugIcon, badge: 12 },
  { id: "dashboards", label: "Panolar", icon: LayoutDashboardIcon },
  { id: "projects", label: "Projeler", icon: BoxesIcon },
  { id: "settings", label: "Ayarlar", icon: SettingsIcon },
];

function Logo() {
  return (
    <span className="grid size-7 place-items-center rounded-md bg-primary font-bold text-primary-foreground text-sm">
      K
    </span>
  );
}

function Content({ section }: { section: string }) {
  const s = sections.find((x) => x.id === section) ?? sections[0];
  return (
    <PageWrapper icon={s?.icon} title={s?.label ?? ""} description="Kabuğun içindeki sayfa: PageWrapper ile.">
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholders.
          <div key={i} className="card h-24 p-4 text-muted-foreground text-sm">
            İçerik {i + 1}
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}

function link(id: string, set: (id: string) => void) {
  return {
    href: `#/shell?bolum=${id}`,
    onClick: (e: MouseEvent) => {
      e.preventDefault();
      set(id);
    },
  };
}

function Bell() {
  return (
    <BadgeAnchor count={3} label="3 okunmamış bildirim">
      <Button variant="ghost" size="icon" aria-label="Bildirimler" onClick={() => toast("Bildirimler")}>
        <BellIcon />
      </Button>
    </BadgeAnchor>
  );
}

/** Sidebar, app bar with search, page and status line: an admin application. */
function SidebarExample({ parts }: { parts: Record<"sidebar" | "header" | "footer" | "banner", boolean> }) {
  const [section, setSection] = useState("issues");
  return (
    <AppShell height="540px" sidebarShortcut={null}>
      <AppShellSidebar label="Örnek menü" hidden={!parts.sidebar}>
        <SidebarHeader>
          <SidebarBrand
            logo={<span className="font-bold text-sm">K</span>}
            title="Bursa Belediyesi"
            subtitle="İzci"
          />
        </SidebarHeader>
        <SidebarSearch />
        <SidebarContent>
          <SidebarGroup>
            {sections.map((s) => (
              <SidebarItem
                key={s.id}
                icon={s.icon}
                label={s.label}
                badge={s.badge}
                active={section === s.id}
                onClick={() => setSection(s.id)}
              />
            ))}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarUser name="Ayşe Yılmaz" description="ayse@kentos.dev" />
        </SidebarFooter>
      </AppShellSidebar>
      <AppShellBanner hidden={!parts.banner} tone="warning">
        Pazar 02.00–02.30 arasında bakım var; olaylar kuyrukta bekler.
      </AppShellBanner>
      <AppShellHeader hidden={!parts.header}>
        <AppShellMenuButton />
        <AppShellBrand logo={<Logo />} title="İzci" href="#/shell" />
        <AppShellSearch placeholder="Hata, proje ya da sayfa ara" onClick={() => toast("Komut paleti")} />
        <AppShellActions>
          <Bell />
        </AppShellActions>
      </AppShellHeader>
      <AppShellMain>
        <Content section={section} />
      </AppShellMain>
      <AppShellFooter hidden={!parts.footer}>
        <span>İzci 1.4.0</span>
        <span>Bağlı · son olay 2 sn önce</span>
      </AppShellFooter>
    </AppShell>
  );
}

/** No sidebar: navigation in the app bar, a drawer on phones. */
function TopNavExample() {
  const [section, setSection] = useState("overview");
  return (
    <AppShell height="480px" sidebarShortcut={null}>
      <AppShellHeader>
        <AppShellMenuButton />
        <AppShellBrand logo={<Logo />} title="Kent Rehberi" href="#/shell" />
        <AppShellNav drawerHeader={<AppShellBrand logo={<Logo />} title="Kent Rehberi" />}>
          {sections.slice(0, 4).map((s) => (
            <AppShellNavItem
              key={s.id}
              icon={s.icon}
              label={s.label}
              active={section === s.id}
              {...link(s.id, setSection)}
            />
          ))}
        </AppShellNav>
        <AppShellActions>
          <Bell />
          <Button variant="ghost" size="icon" aria-label="Hesabım">
            <UserIcon />
          </Button>
        </AppShellActions>
      </AppShellHeader>
      <AppShellMain>
        <Content section={section} />
      </AppShellMain>
    </AppShell>
  );
}

/** A phone app: app bar and a bottom tab bar. */
function PhoneExample() {
  const [section, setSection] = useState("issues");
  return (
    <AppShell height="100%" mobile sidebarShortcut={null}>
      <AppShellHeader>
        <AppShellBrand logo={<Logo />} title="İzci" href="#/shell" />
        <AppShellActions>
          <Bell />
        </AppShellActions>
      </AppShellHeader>
      <AppShellMain>
        <Content section={section} />
      </AppShellMain>
      <AppShellBottomNav>
        {sections.slice(0, 4).map((s) => (
          <AppShellBottomNavItem
            key={s.id}
            icon={s.icon}
            label={s.label}
            badge={s.badge}
            active={section === s.id}
            {...link(s.id, setSection)}
          />
        ))}
      </AppShellBottomNav>
    </AppShell>
  );
}

const parts: [string, string][] = [
  [
    "AppShell",
    "Kök: sidebar durumunu tutar, bölgeleri adlı ızgara alanlarına yerleştirir. Varsayılan olarak pencereyi doldurur; height ile kendi içinde kayan bir kutu olur.",
  ],
  ["AppShellSidebar", "Sol menü (telefonda çekmece). İçine kenar çubuğu parçaları gelir."],
  ["AppShellBanner", "App bar'ın üstünde duyuru şeridi; tone: info, warning, danger, brand."],
  [
    "AppShellHeader",
    "Yapışkan app bar. AppShellMenuButton, AppShellBrand, AppShellNav, AppShellSearch, AppShellActions, AppShellSpacer ile dolar.",
  ],
  [
    "AppShellMenuButton",
    "Sidebar varsa onu açar ya da daraltır; yoksa telefonda yatay menünün çekmecesini açar; ikisi de yoksa görünmez.",
  ],
  ["AppShellBrand", "Logo ve ad. Sidebar varsa masaüstünde gizlenir (marka sidebar'dadır)."],
  [
    "AppShellNav / AppShellNavItem",
    "Sidebar'sız uygulamalar için app bar'da yatay menü; telefonda çekmeceye taşınır.",
  ],
  ["AppShellSearch", "Masaüstünde geniş arama kutusu görünümlü düğme, telefonda simge; komut paletini açar."],
  [
    "AppShellMain",
    "İçerik sütunu; contained ile --content-max-wide genişliğinde kalır. Başında “İçeriğe geç” bağlantısının hedefidir.",
  ],
  ["AppShellFooter", "İçeriğin altında sessiz durum satırı (sürüm, bağlantı, yasal bağlantılar)."],
  [
    "AppShellBottomNav / Item",
    "Telefonda alt sekme çubuğu (en çok beş hedef, rozetli). Varken sayfa alt çubukları ve yüzen düğmeler üstüne kayar.",
  ],
];

/** The application shell and its regions. */
export function ShellPage() {
  const [shown, setShown] = useState({ sidebar: true, header: true, footer: true, banner: false });
  const toggle = (key: keyof typeof shown) => setShown((s) => ({ ...s, [key]: !s[key] }));
  return (
    <Page
      title="Uygulama kabuğu"
      description="Her KentOS uygulamasının iskeleti. Sidebar, app bar, yatay menü, duyuru şeridi, durum satırı ve telefon alt sekme çubuğu ayrı bileşenlerdir: eklenen görünür, hidden ile gizlenir; parçalar birbirini tanır ve yerleşim kendiliğinden uyar. Bu vitrin de aynı kabukla kuruludur."
    >
      <Demo
        title="Bölgeleri açıp kapatın"
        description="Sidebar, app bar, duyuru şeridi ve durum satırı ayrı ayrı gizlenebilir; kalanlar yerleşimi doldurur. Sidebar kapanınca app bar'daki marka görünür, menü düğmesi kaybolur."
        className="block p-0 md:p-0"
        code={`<AppShell sidebarStorageKey="izci-sidebar">
  <AppShellSidebar label="Menü">…</AppShellSidebar>
  <AppShellBanner tone="warning">Bakım duyurusu</AppShellBanner>
  <AppShellHeader>
    <AppShellMenuButton />
    <AppShellBrand logo={<Logo />} title="İzci" />
    <AppShellSearch placeholder="Hata, proje ya da sayfa ara" onClick={openPalette} />
    <AppShellActions><NotificationsMenu /><UserMenu /></AppShellActions>
  </AppShellHeader>
  <AppShellMain><Outlet /></AppShellMain>
  <AppShellFooter>İzci 1.4.0</AppShellFooter>
</AppShell>`}
      >
        <div className="flex flex-wrap gap-x-6 gap-y-3 border-b px-4 py-3">
          {(
            [
              ["sidebar", "Sidebar"],
              ["header", "App bar"],
              ["banner", "Duyuru şeridi"],
              ["footer", "Durum satırı"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <Switch id={`shell-${key}`} checked={shown[key]} onCheckedChange={() => toggle(key)} />
              <Label htmlFor={`shell-${key}`}>{label}</Label>
            </div>
          ))}
        </div>
        <div className="isolate">
          <SidebarExample parts={shown} />
        </div>
      </Demo>

      <Demo
        title="Üst menülü"
        description="Sidebar'ı olmayan uygulamalar menüyü app bar'a koyar; etkin bölümün altını çizer. Telefonda menü düğmesi çıkar ve aynı bağlantılar soldan açılan çekmecede listelenir."
        className="block p-0 md:p-0"
        code={`<AppShell>
  <AppShellHeader>
    <AppShellMenuButton />
    <AppShellBrand logo={<Logo />} title="Kent Rehberi" />
    <AppShellNav drawerHeader={<AppShellBrand logo={<Logo />} title="Kent Rehberi" />}>
      <AppShellNavItem icon={CompassIcon} label="Genel bakış" asChild><Link to="/" /></AppShellNavItem>
      …
    </AppShellNav>
    <AppShellActions>…</AppShellActions>
  </AppShellHeader>
  <AppShellMain>…</AppShellMain>
</AppShell>`}
      >
        <div className="isolate">
          <TopNavExample />
        </div>
      </Demo>

      <Demo
        title="Telefon: alt sekme çubuğu"
        description="Telefonda ana hedefler başparmağın ulaştığı alt çubukta durur; etkin olanın simgesi hapla vurgulanır, rozet sayıyı gösterir. Masaüstünde çubuk gizlenir (always ile her ekranda kalır)."
        className="justify-center bg-sunken p-4 md:p-8"
        code={`<AppShell>
  <AppShellHeader>…</AppShellHeader>
  <AppShellMain>…</AppShellMain>
  <AppShellBottomNav>
    <AppShellBottomNavItem icon={BugIcon} label="Hatalar" badge={12} asChild><Link to="/issues" /></AppShellBottomNavItem>
    …
  </AppShellBottomNav>
</AppShell>`}
      >
        <div className="isolate h-[min(680px,calc(100svh-11rem))] w-full max-w-[390px] overflow-hidden rounded-[2rem] border-8 border-(--border-strong) bg-background shadow-(--shadow-lg)">
          <PhoneExample />
        </div>
      </Demo>

      <section className="grid gap-3">
        <h2 className="font-semibold text-lg">Parçalar</h2>
        <div className="card divide-y">
          {parts.map(([name, text]) => (
            <div key={name} className="grid gap-1 px-4 py-3 sm:grid-cols-[15rem_1fr] sm:gap-4">
              <code className="font-medium text-sm">{name}</code>
              <p className="text-muted-foreground text-sm">{text}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          İçe aktarma: <code>@kentos/components/layout/app-shell</code>. Kabuk, kenar çubuğunun durumunu
          (useSidebar) ve useAppShell ile hangi bölgelerin açık olduğunu paylaşır.
        </p>
      </section>
    </Page>
  );
}
