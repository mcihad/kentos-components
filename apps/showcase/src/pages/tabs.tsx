import { Button } from "@kentos/components/ui/button";
import { Input } from "@kentos/components/ui/input";
import { Label } from "@kentos/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsNav,
  TabsNavItem,
  TabsTrigger,
  type TabsVariant,
} from "@kentos/components/ui/tabs";
import {
  ActivityIcon,
  BellIcon,
  BotIcon,
  BugIcon,
  FileCodeIcon,
  KeyRoundIcon,
  MessageSquareTextIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { lazy, useState } from "react";
import { Demo, Page } from "../demo";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

// A tab body that "downloads" for a moment, like a code-split route section.
const SlowReport = lazy(async () => {
  await wait(1200);
  return {
    default: function SlowReport() {
      return (
        <div className="grid gap-1 text-sm">
          <p className="font-medium">Haftalık rapor yüklendi</p>
          <p className="text-muted-foreground">Bu bölüm ilk açıldığında ayrı bir paket olarak indirildi.</p>
        </div>
      );
    },
  };
});

function VariantDemo({ variant }: { variant: TabsVariant }) {
  return (
    <Tabs defaultValue="issues">
      <TabsList variant={variant} aria-label="Bölümler">
        <TabsTrigger value="issues" icon={BugIcon} badge={12}>
          Hatalar
        </TabsTrigger>
        <TabsTrigger value="feedback" icon={MessageSquareTextIcon} badge={3} badgeVariant="primary">
          Geri bildirim
        </TabsTrigger>
        <TabsTrigger value="activity" icon={ActivityIcon}>
          Etkinlik
        </TabsTrigger>
        <TabsTrigger value="ai" icon={BotIcon} badgeVariant="dot">
          Yapay zekâ
        </TabsTrigger>
        <TabsTrigger value="archive" disabled>
          Arşiv
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

const months = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

type Doc = { id: string; name: string; dirty?: boolean };
let docSeq = 4;

function ClosableDemo() {
  const [docs, setDocs] = useState<Doc[]>([
    { id: "1", name: "Program.cs" },
    { id: "2", name: "appsettings.json", dirty: true },
    { id: "3", name: "SentrySetup.cs" },
  ]);
  const [active, setActive] = useState("1");
  const close = (id: string) => {
    const i = docs.findIndex((d) => d.id === id);
    const next = docs.filter((d) => d.id !== id);
    setDocs(next);
    if (id === active) setActive(next[Math.min(i, next.length - 1)]?.id ?? "");
  };
  const add = () => {
    const id = String(docSeq++);
    setDocs([...docs, { id, name: `Yeni-${id}.cs` }]);
    setActive(id);
  };
  return (
    <Tabs value={active} onValueChange={setActive} className="w-full">
      <TabsList
        variant="line"
        aria-label="Açık dosyalar"
        action={
          <Button variant="ghost" size="icon-sm" aria-label="Yeni dosya" onClick={add}>
            <PlusIcon />
          </Button>
        }
      >
        {docs.map((d) => (
          <TabsTrigger
            key={d.id}
            value={d.id}
            icon={FileCodeIcon}
            badgeVariant={d.dirty ? "dot" : undefined}
            onClose={() => close(d.id)}
          >
            {d.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {docs.length === 0 ? (
        <p className="text-muted-foreground text-sm">Açık dosya yok. + ile yeni bir dosya açın.</p>
      ) : (
        docs.map((d) => (
          <TabsContent key={d.id} value={d.id} className="text-sm">
            <code>{d.name}</code> düzenleniyor.
          </TabsContent>
        ))
      )}
    </Tabs>
  );
}

function NavDemo() {
  const [section, setSection] = useState("general");
  const items = [
    { id: "general", label: "Genel", icon: SettingsIcon },
    { id: "members", label: "Üyeler", icon: UsersIcon, badge: 2, badgeVariant: "warning" as const },
    { id: "keys", label: "Anahtarlar", icon: KeyRoundIcon },
    { id: "alerts", label: "Uyarılar", icon: BellIcon },
  ];
  return (
    <TabsNav label="Ayar bölümleri">
      {items.map((item) => (
        <TabsNavItem
          key={item.id}
          href={`#/tabs?bolum=${item.id}`}
          active={section === item.id}
          icon={item.icon}
          badge={item.badge}
          badgeVariant={item.badgeVariant}
          onClick={(e) => {
            e.preventDefault();
            setSection(item.id);
          }}
        >
          {item.label}
        </TabsNavItem>
      ))}
    </TabsNav>
  );
}

/** The tabs component in all its looks and behaviours. */
export function TabsPage() {
  const [note, setNote] = useState("");
  return (
    <Page
      title="Sekmeler"
      description="Bir sayfanın bölümleri arasında geçiş. Üç görünüm, simge ve rozet, kapatılabilir ve devre dışı sekmeler; sığmayan satır tekerlekle, dokunarak ya da kenar düğmeleriyle kayar ve etkin sekme hep görünür kalır. İçerik ilk açılışta yüklenip sonra korunabilir."
    >
      <Demo
        title="Görünümler"
        description="default bölmeli bir yuvadır (kısa, eşit önemli seçenekler); line alt çizgilidir ve çizgi etkin sekmeye kayar (sayfa bölümleri); pill hap biçimlidir (süzgeç benzeri seçimler). Rozet sayıyı, dot çalışan bir işi gösterir; Arşiv devre dışıdır."
        className="grid w-full gap-6"
        code={`<Tabs defaultValue="issues">
  <TabsList variant="line" aria-label="Bölümler">          // default | line | pill
    <TabsTrigger value="issues" icon={BugIcon} badge={12}>Hatalar</TabsTrigger>
    <TabsTrigger value="feedback" icon={MessageSquareTextIcon} badge={3} badgeVariant="primary">Geri bildirim</TabsTrigger>
    <TabsTrigger value="ai" icon={BotIcon} badgeVariant="dot">Yapay zekâ</TabsTrigger>
    <TabsTrigger value="archive" disabled>Arşiv</TabsTrigger>
  </TabsList>
  <TabsContent value="issues">…</TabsContent>
</Tabs>`}
      >
        <VariantDemo variant="default" />
        <VariantDemo variant="line" />
        <VariantDemo variant="pill" />
      </Demo>

      <Demo
        title="Taşan sekmeler"
        description="Sığmayan satır yana kayar: fare tekerleği satırı yatay kaydırır (uca gelince sayfa kaymaya devam eder), dokunmatik ekranda parmakla kaydırılır, farede kenar düğmeleri çıkar. Kenarlar solarak devamı olduğunu gösterir; seçilen sekme görünür alana kayar."
        className="block"
        code={`<TabsList variant="line" aria-label="Aylar">
  {months.map((m) => <TabsTrigger key={m} value={m}>{m}</TabsTrigger>)}
</TabsList>`}
      >
        <Tabs defaultValue="Kasım">
          <TabsList variant="line" aria-label="Aylar">
            {months.map((m, i) => (
              <TabsTrigger key={m} value={m} badge={i % 4 === 1 ? i * 7 : undefined}>
                {m} 2026
              </TabsTrigger>
            ))}
          </TabsList>
          {months.map((m) => (
            <TabsContent key={m} value={m} className="text-muted-foreground text-sm">
              {m} ayının hata özeti.
            </TabsContent>
          ))}
        </Tabs>
      </Demo>

      <Demo
        title="Kapatılabilir sekmeler"
        description="onClose kapatma düğmesini ekler; odaktaki sekme Delete ya da Backspace ile de kapanır. Etkin sekme kapanınca hangi sekmeye geçileceğine uygulama karar verir (burada komşusu). action satırın sonuna, kaymayan alana bir denetim koyar."
        className="block"
        code={`<TabsList variant="line" action={<Button variant="ghost" size="icon-sm" aria-label="Yeni dosya" onClick={add}><PlusIcon /></Button>}>
  {docs.map((d) => (
    <TabsTrigger key={d.id} value={d.id} icon={FileCodeIcon} onClose={() => close(d.id)}
                 badgeVariant={d.dirty ? "dot" : undefined}>
      {d.name}
    </TabsTrigger>
  ))}
</TabsList>`}
      >
        <ClosableDemo />
      </Demo>

      <Demo
        title="Tembel yükleme"
        description="mount=&quot;lazy&quot; içeriği ilk açılışta yükler, sonra gizleyerek korur: Notlar'a bir şey yazıp başka sekmeye geçin, geri döndüğünüzde yazı yerinde olur. Kod bölünmüş (React.lazy) içerik yüklenirken iskelet görünür; fallback ile değiştirilebilir."
        className="block"
        code={`const Report = lazy(() => import("./report"));

<TabsContent value="notes" mount="lazy">…</TabsContent>       // ilk ziyarette yüklenir, sonra korunur
<TabsContent value="report" mount="lazy"><Report /></TabsContent>  // yüklenirken iskelet
<TabsContent value="summary" mount="eager">…</TabsContent>     // her zaman yüklü
<TabsContent value="live">…</TabsContent>                      // varsayılan: yalnız açıkken`}
      >
        <Tabs defaultValue="notes">
          <TabsList aria-label="Rapor bölümleri">
            <TabsTrigger value="notes">Notlar</TabsTrigger>
            <TabsTrigger value="report">Haftalık rapor</TabsTrigger>
            <TabsTrigger value="plain">Korunmayan</TabsTrigger>
          </TabsList>
          <TabsContent value="notes" mount="lazy" className="grid max-w-sm gap-2">
            <Label htmlFor="tab-note">Not</Label>
            <Input
              id="tab-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bir şey yazın"
            />
          </TabsContent>
          <TabsContent value="report" mount="lazy">
            <SlowReport />
          </TabsContent>
          <TabsContent value="plain" className="grid max-w-sm gap-2">
            <Label htmlFor="tab-plain">Bu alan sekmeden çıkınca sıfırlanır</Label>
            <Input id="tab-plain" placeholder="Yazıp sekme değiştirin" />
          </TabsContent>
        </Tabs>
      </Demo>

      <Demo
        title="Eşit genişlik ve dikey"
        description="fullWidth sekmeleri satıra eşit dağıtır (telefonda iki-üç seçenek için). orientation=&quot;vertical&quot; ayar sayfalarında soldaki bölüm listesidir."
        className="grid w-full gap-8 md:grid-cols-2"
        code={`<TabsList fullWidth>…</TabsList>

<Tabs orientation="vertical" defaultValue="general">
  <TabsList variant="line">…</TabsList>
  <TabsContent value="general">…</TabsContent>
</Tabs>`}
      >
        <Tabs defaultValue="week">
          <TabsList fullWidth aria-label="Dönem">
            <TabsTrigger value="day">Gün</TabsTrigger>
            <TabsTrigger value="week">Hafta</TabsTrigger>
            <TabsTrigger value="month">Ay</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs orientation="vertical" defaultValue="general" className="sm:flex-row">
          <TabsList variant="line" aria-label="Ayarlar" className="sm:w-44">
            <TabsTrigger value="general" icon={SettingsIcon}>
              Genel
            </TabsTrigger>
            <TabsTrigger value="members" icon={UsersIcon} badge={2}>
              Üyeler
            </TabsTrigger>
            <TabsTrigger value="keys" icon={KeyRoundIcon}>
              Anahtarlar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="text-sm">
            Organizasyon adı ve saat dilimi.
          </TabsContent>
          <TabsContent value="members" className="text-sm">
            Üyeler ve davetler.
          </TabsContent>
          <TabsContent value="keys" className="text-sm">
            Erişim anahtarları.
          </TabsContent>
        </Tabs>
      </Demo>

      <Demo
        title="Bağlantı sekmeleri"
        description="Bölüm adres çubuğunda tutulacaksa (paylaşılabilir bağlantı) TabsNav kullanın: aynı görünüm, her öğe bir bağlantıdır. Router bağlantısı için asChild ve label verin."
        className="block"
        code={`<TabsNav label="Ayar bölümleri">
  {tabs.map((t) => (
    <TabsNavItem key={t.id} asChild active={tab === t.id} icon={t.icon} label={t.label} badge={t.count}>
      <Link search={{ tab: t.id }} />
    </TabsNavItem>
  ))}
</TabsNav>`}
      >
        <NavDemo />
      </Demo>
    </Page>
  );
}
