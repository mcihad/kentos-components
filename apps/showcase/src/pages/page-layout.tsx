import {
  ActionSheet,
  ActionSheetContent,
  ActionSheetGroup,
  ActionSheetItem,
  ActionSheetSeparator,
  ActionSheetTrigger,
} from "@kentos/components/common/action-sheet";
import { Fab } from "@kentos/components/common/fab";
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "@kentos/components/common/toolbar";
import {
  PageAction,
  PageActionMenu,
  PageActionSeparator,
  PageActionToolbar,
  PageWrapper,
} from "@kentos/components/layout/page";
import { Badge } from "@kentos/components/ui/badge";
import { Button } from "@kentos/components/ui/button";
import {
  ArchiveIcon,
  BoxesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  EllipsisIcon,
  FilterIcon,
  LayoutGridIcon,
  ListIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Demo, Page } from "../demo";

const projects = [
  { name: "e-Belediye", platform: ".NET", events: "12.480", errors: 14 },
  { name: "Su faturası ödeme", platform: "JavaScript", events: "8.205", errors: 3 },
  { name: "Kent kart", platform: "Android", events: "31.902", errors: 41 },
  { name: "Ruhsat başvuru", platform: ".NET", events: "2.117", errors: 0 },
  { name: "Mezarlık bilgi", platform: "JavaScript", events: "640", errors: 1 },
  { name: "Zabıta mobil", platform: "iOS", events: "5.330", errors: 7 },
  { name: "İmar durumu", platform: "Go", events: "1.904", errors: 2 },
  { name: "Çağrı merkezi", platform: ".NET", events: "9.771", errors: 9 },
  { name: "Otopark", platform: "Python", events: "3.415", errors: 0 },
];

function ProjectActions() {
  const say = (text: string) => () => toast(text);
  return (
    <>
      <PageActionToolbar label="Liste">
        <PageAction
          icon={RefreshCwIcon}
          label="Yenile"
          description="Listeyi sunucudan yeniden yükle"
          onClick={say("Liste yenilendi")}
        />
        <PageAction
          icon={FilterIcon}
          label="Filtrele"
          description="Platforma göre süz"
          onClick={say("Filtreler")}
        />
        <PageActionSeparator />
        <PageAction
          icon={DownloadIcon}
          label="Dışa aktar"
          description="CSV dosyası olarak indir"
          onClick={say("CSV hazırlanıyor")}
        />
      </PageActionToolbar>
      <PageActionMenu icon={EllipsisIcon} label="Diğer işlemler" hideLabel>
        <PageAction icon={CopyIcon} label="Bağlantıyı kopyala" onClick={say("Bağlantı kopyalandı")} />
        <PageAction icon={ArchiveIcon} label="Arşivlenen projeler" onClick={say("Arşiv")} />
        <PageActionSeparator />
        <PageAction
          icon={Trash2Icon}
          label="Seçilenleri sil"
          variant="destructive"
          description="Geri alınamaz"
          onClick={say("Silme onayı istenir")}
        />
      </PageActionMenu>
      <PageAction
        icon={PlusIcon}
        label="Proje oluştur"
        variant="default"
        description="Yeni bir uygulama için DSN alın"
        onClick={say("Yeni proje")}
      />
    </>
  );
}

function ProjectList() {
  return (
    <div className="@container">
      <div className="grid gap-3 @xl:grid-cols-2 @5xl:grid-cols-3">
        {projects.map((p) => (
          <div key={p.name} className="card grid gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-semibold">{p.name}</p>
              <Badge variant={p.errors > 10 ? "destructive" : "secondary"}>{p.errors} hata</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {p.platform} · son 24 saatte {p.events} olay
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pagination() {
  return (
    <>
      <p className="truncate text-muted-foreground text-sm">9 projeden 1–9</p>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" disabled>
          <ChevronLeftIcon />
          <span className="max-sm:sr-only">Önceki</span>
        </Button>
        <Button variant="outline" size="sm" disabled>
          <span className="max-sm:sr-only">Sonraki</span>
          <ChevronRightIcon />
        </Button>
      </div>
    </>
  );
}

function ExamplePage({ mobile }: { mobile?: boolean }) {
  return (
    <PageWrapper
      mobile={mobile}
      className="min-h-full"
      icon={BoxesIcon}
      title="Projeler"
      description="Hata ve olay toplayan uygulamalarınız"
      meta={<Badge variant="outline">9</Badge>}
      actions={<ProjectActions />}
      footer={<Pagination />}
      footerFixed
    >
      <ProjectList />
    </PageWrapper>
  );
}

const pageCode = `<PageWrapper
  icon={BoxesIcon}
  title="Projeler"
  description="Hata ve olay toplayan uygulamalarınız"
  meta={<Badge variant="outline">9</Badge>}
  actions={
    <>
      <PageActionToolbar label="Liste">
        <PageAction icon={RefreshCwIcon} label="Yenile" onClick={refetch} />
        <PageAction icon={FilterIcon} label="Filtrele" onClick={openFilters} />
        <PageActionSeparator />
        <PageAction icon={DownloadIcon} label="Dışa aktar" description="CSV dosyası olarak indir" onClick={exportCsv} />
      </PageActionToolbar>
      <PageActionMenu icon={EllipsisIcon} label="Diğer işlemler" hideLabel>
        <PageAction icon={CopyIcon} label="Bağlantıyı kopyala" onClick={copyLink} />
        <PageActionSeparator />
        <PageAction icon={Trash2Icon} label="Seçilenleri sil" variant="destructive" onClick={remove} />
      </PageActionMenu>
      <PageAction icon={PlusIcon} label="Proje oluştur" variant="default" onClick={create} />
    </>
  }
  footer={<Pagination />}
  footerFixed
>
  <ProjectList />
</PageWrapper>`;

const parts: [string, string][] = [
  [
    "PageWrapper",
    "Sayfa çerçevesi: icon, title, description (slogan), meta, actions, footer, footerFixed, padded. İçerik bütün genişliği doldurur; kenar boşlukları yoğunluk seçimine göre değişir.",
  ],
  [
    "PageHeader / PageBody / PageFooter",
    "Parçalar ayrı da kullanılabilir; başlığın altına sekme ya da filtre koymak için PageHeader'ın children'ı vardır.",
  ],
  [
    "PageAction",
    'Tek işlem. Başlıkta küçük düğme (ana işlem için variant="default"), menüde öğe, araç çubuğunda simge düğmesi, telefonda açıklamalı satır olur.',
  ],
  [
    "PageActionMenu",
    "Açılır menü; hideLabel ile yalnızca simge (“daha fazla”). Telefonda başlıklı grup olur.",
  ],
  ["PageActionToolbar", "Birleşik araç çubuğu; ok tuşlarıyla gezilir. Telefonda başlıklı grup olur."],
  [
    "PageActionSeparator / PageActionDesktop",
    "Bulunduğu yere uyan ayırıcı; yalnızca masaüstünde görünecek içerik (ör. arama kutusu).",
  ],
  [
    "Fab",
    "Yüzen işlem düğmesi; extended ile etiketli. Aşağı kaydırırken kayarak gizlenir (useHideOnScroll).",
  ],
  [
    "ActionSheet",
    "Alttan açılan menü: tutamaçtan sürüklenerek kapatılır (hız ve mesafeye göre), Esc ve dışarı dokunmayla kapanır, öğeler sırayla belirir. Yalnızca transform ve opacity canlandırılır.",
  ],
  [
    "Toolbar",
    "ToolbarButton, ToolbarToggleGroup / ToolbarToggleItem ve ToolbarSeparator ile sıkışık denetim grubu.",
  ],
];

/** The page frame, actions, toolbar, floating button and bottom sheet. */
export function PageLayoutPage() {
  const [view, setView] = useState("list");
  return (
    <Page
      title="Sayfa düzeni"
      description="İçerik sayfalarının çerçevesi: simgeli başlık, slogan, işlemler, bütün genişliği dolduran gövde ve sabitlenebilen alt çubuk. Telefonda işlemler yüzen düğmeye taşınır ve alttan açılan bir menüde listelenir. Bu vitrinin her sayfası da bu bileşenle çizilir."
    >
      <Demo
        title="Tam sayfa"
        description="Araç çubuğu, “daha fazla” menüsü ve ana işlem başlıkta; sayfalama sabit alt çubukta. Alt çubuğun yüksekliği kenar çubuğunun alt bölümüyle aynıdır (--footer-h). Ekran daraldığında aynı örnek telefon düzenine geçer."
        className="block p-0 md:p-0"
        code={pageCode}
      >
        <div className="isolate h-[540px] overflow-y-auto overscroll-contain bg-background">
          <ExamplePage />
        </div>
      </Demo>
      <Demo
        title="Telefon"
        description="İşlemler sağ alttaki yüzen düğmede toplanır; düğme aşağı kaydırırken gizlenir, yukarı kaydırınca geri gelir. Dokununca alttan açılan menüde ana işlem en üstte, gruplar başlıklarıyla görünür. Menüyü tutamacından aşağı çekerek kapatabilirsiniz."
        className="justify-center bg-sunken p-4 md:p-8"
        code={`// Normalde ekran genişliğine göre kendiliğinden seçilir.
<PageWrapper mobile …>…</PageWrapper>`}
      >
        <div className="isolate h-[min(680px,calc(100svh-11rem))] w-full max-w-[390px] overflow-y-auto overscroll-contain rounded-[2rem] border-8 border-(--border-strong) bg-background shadow-(--shadow-lg)">
          <ExamplePage mobile />
        </div>
      </Demo>
      <Demo
        title="Alttan açılan menü"
        description="Her yerde kullanılabilir. Öğe seçilince menü kapanır; keepOpen ile açık kalır. Geniş ekranda ortada, alttan biraz yukarıda durur."
        code={`<ActionSheet>
  <ActionSheetTrigger asChild><Button variant="outline">Proje işlemleri</Button></ActionSheetTrigger>
  <ActionSheetContent title="e-Belediye" description=".NET · 14 açık hata">
    <ActionSheetItem icon={PencilIcon} label="Yeniden adlandır" onClick={rename} />
    <ActionSheetItem icon={Share2Icon} label="Paylaş" description="Bağlantıyı ekibe gönder" onClick={share} />
    <ActionSheetSeparator />
    <ActionSheetGroup label="Tehlikeli">
      <ActionSheetItem icon={Trash2Icon} label="Projeyi sil" variant="destructive" onClick={remove} />
    </ActionSheetGroup>
  </ActionSheetContent>
</ActionSheet>`}
      >
        <ActionSheet>
          <ActionSheetTrigger asChild>
            <Button variant="outline">Proje işlemleri</Button>
          </ActionSheetTrigger>
          <ActionSheetContent title="e-Belediye" description=".NET · 14 açık hata">
            <ActionSheetItem
              icon={PencilIcon}
              label="Yeniden adlandır"
              onClick={() => toast("Yeniden adlandır")}
            />
            <ActionSheetItem
              icon={Share2Icon}
              label="Paylaş"
              description="Bağlantıyı ekibe gönder"
              onClick={() => toast("Bağlantı kopyalandı")}
            />
            <ActionSheetItem icon={ArchiveIcon} label="Arşivle" onClick={() => toast("Arşivlendi")} />
            <ActionSheetSeparator />
            <ActionSheetGroup label="Tehlikeli">
              <ActionSheetItem
                icon={Trash2Icon}
                label="Projeyi sil"
                description="Olaylar ve ayarlar kalıcı olarak silinir"
                variant="destructive"
                onClick={() => toast("Silme onayı istenir")}
              />
            </ActionSheetGroup>
          </ActionSheetContent>
        </ActionSheet>
      </Demo>
      <Demo
        title="Araç çubuğu"
        description="Görünüm değiştirme, yenileme gibi sık işlemler. Tek sekme durağıdır; içinde ok tuşlarıyla gezilir. Simgeli düğmelerin adı ipucunda görünür."
        code={`<Toolbar aria-label="Liste">
  <ToolbarToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v)}>
    <ToolbarToggleItem value="list" icon={ListIcon} label="Liste" />
    <ToolbarToggleItem value="grid" icon={LayoutGridIcon} label="Izgara" />
  </ToolbarToggleGroup>
  <ToolbarSeparator />
  <ToolbarButton icon={RefreshCwIcon} label="Yenile" onClick={refetch} />
  <ToolbarButton icon={DownloadIcon} label="Dışa aktar" showLabel />
</Toolbar>`}
      >
        <Toolbar aria-label="Liste">
          <ToolbarToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v)}>
            <ToolbarToggleItem value="list" icon={ListIcon} label="Liste" />
            <ToolbarToggleItem value="grid" icon={LayoutGridIcon} label="Izgara" />
          </ToolbarToggleGroup>
          <ToolbarSeparator />
          <ToolbarButton icon={RefreshCwIcon} label="Yenile" onClick={() => toast("Liste yenilendi")} />
          <ToolbarButton
            icon={DownloadIcon}
            label="Dışa aktar"
            showLabel
            onClick={() => toast("CSV hazırlanıyor")}
          />
        </Toolbar>
      </Demo>
      <Demo
        title="Yüzen işlem düğmesi"
        description="Telefon ekranının ana işlemi, başparmağın ulaştığı yerde. Etiketli (extended) ya da yalnızca simgeli olur; basınca hafifçe küçülür."
        code={`<Fab icon={PlusIcon} label="Proje oluştur" className="fixed right-4 bottom-4" />
<Fab icon={EllipsisIcon} label="İşlemler" extended />`}
      >
        <Fab icon={PlusIcon} label="Proje oluştur" onClick={() => toast("Yeni proje")} />
        <Fab icon={EllipsisIcon} label="İşlemler" extended onClick={() => toast("İşlemler")} />
      </Demo>
      <section className="grid gap-3">
        <h2 className="font-semibold text-lg">Parçalar</h2>
        <div className="card divide-y">
          {parts.map(([name, text]) => (
            <div key={name} className="grid gap-1 px-4 py-3 sm:grid-cols-[16rem_1fr] sm:gap-4">
              <code className="font-medium text-sm">{name}</code>
              <p className="text-muted-foreground text-sm">{text}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          İçe aktarma: <code>@kentos/components/layout/page</code>,{" "}
          <code>@kentos/components/common/action-sheet</code>, <code>common/fab</code>,{" "}
          <code>common/toolbar</code>.
        </p>
      </section>
    </Page>
  );
}
