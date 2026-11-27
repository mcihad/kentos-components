import { FilterChip, FilterChipGroup, FilterChipItem } from "@kentos/components/common/filter-chip";
import { RelativeTime } from "@kentos/components/common/relative-time";
import { Step, Stepper } from "@kentos/components/common/stepper";
import { TagInput } from "@kentos/components/common/tag-input";
import { type TreeNode, TreeView } from "@kentos/components/common/tree-view";
import { Badge } from "@kentos/components/ui/badge";
import { Button } from "@kentos/components/ui/button";
import { BugIcon, FileCodeIcon, FileJsonIcon, FolderIcon, SmartphoneIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { Demo, Page } from "../demo";

const minute = 60_000;

const files: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: FolderIcon,
    children: [
      {
        id: "src/api",
        label: "api",
        icon: FolderIcon,
        children: [
          { id: "src/api/client.ts", label: "client.ts", icon: FileCodeIcon, aside: "12" },
          { id: "src/api/events.ts", label: "events.ts", icon: FileCodeIcon, aside: "3" },
        ],
      },
      {
        id: "src/pages",
        label: "pages",
        icon: FolderIcon,
        children: [
          { id: "src/pages/issues.tsx", label: "issues.tsx", icon: FileCodeIcon },
          { id: "src/pages/settings.tsx", label: "settings.tsx", icon: FileCodeIcon },
        ],
      },
      { id: "src/main.tsx", label: "main.tsx", icon: FileCodeIcon },
    ],
  },
  { id: "package.json", label: "package.json", icon: FileJsonIcon },
  { id: "dist", label: "dist (yüklenmedi)", text: "dist", icon: FolderIcon, disabled: true },
];

const isEmail = (t: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);

/** RelativeTime, FilterChip, TagInput, Stepper and TreeView. */
export function BasicsPage() {
  const [filters, setFilters] = useState<string[]>(["open"]);
  const [level, setLevel] = useState("all");
  const [mine, setMine] = useState(false);
  const [tags, setTags] = useState(["ödeme", "mobil"]);
  const [emails, setEmails] = useState(["ayse.yilmaz@kentos.gov.tr"]);
  const [step, setStep] = useState(1);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<string | null>("src/api/client.ts");
  const [now] = useState(() => Date.now());

  return (
    <Page
      title="Temel parçalar"
      description="Listelerde, süzgeç çubuklarında ve sihirbazlarda tekrar tekrar kullanılan küçük bileşenler: kendini güncelleyen göreli zaman, süzgeç çipleri, etiket alanı, adım göstergesi ve ağaç görünümü."
    >
      <Demo
        title="Göreli zaman"
        description="“3 dk önce” gibi yazar ve kendini günceller; tüm örnekler tek bir saati paylaşır (15 saniyede bir, sekme görünürken). Üzerine gelince tam tarih ve saat görünür. live={false} ilk çizimdeki hâlinde dondurur."
        className="grid gap-2 text-sm"
        code={`<RelativeTime date={issue.lastSeen} />
<RelativeTime date={deploy.at} tooltip={false} />`}
      >
        {[
          ["Son olay", now - 20_000],
          ["İlk görülme", now - 7 * minute],
          ["Son yayın", now - 5 * 60 * minute],
          ["Atanma", now - 3 * 24 * 60 * minute],
          ["Oluşturulma", now - 80 * 24 * 60 * minute],
          ["Planlı bakım", now + 2 * 60 * minute],
        ].map(([label, at]) => (
          <div key={label} className="flex items-baseline justify-between gap-6">
            <span className="text-muted-foreground">{label}</span>
            <RelativeTime date={at as number} />
          </div>
        ))}
      </Demo>

      <Demo
        title="Süzgeç çipleri"
        description="Listenin üstündeki aç–kapa süzgeçler. type=&quot;multiple&quot; bağımsız süzgeçler, type=&quot;single&quot; seçeneklerden biri için. Grup tek sekme durağıdır, ok tuşlarıyla gezilir. Tek başına FilterChip bir aç–kapa düğmesidir; menu ile açılır menü tetikleyicisi olur."
        className="grid gap-4"
        code={`<FilterChipGroup type="multiple" value={filters} onValueChange={setFilters} aria-label="Durum">
  <FilterChipItem value="open" count={42}>Açık</FilterChipItem>
  <FilterChipItem value="regressed" icon={BugIcon} count={3}>Geri dönen</FilterChipItem>
</FilterChipGroup>

<FilterChip selected={mine} onClick={() => setMine(!mine)} icon={UserIcon}>Bana atanan</FilterChip>
<FilterChip menu selected>Platform: Android</FilterChip>`}
      >
        <FilterChipGroup type="multiple" value={filters} onValueChange={setFilters} aria-label="Durum">
          <FilterChipItem value="open" count={42}>
            Açık
          </FilterChipItem>
          <FilterChipItem value="regressed" icon={BugIcon} count={3}>
            Geri dönen
          </FilterChipItem>
          <FilterChipItem value="ignored" count={118}>
            Yok sayılan
          </FilterChipItem>
          <FilterChipItem value="resolved">Çözülen</FilterChipItem>
        </FilterChipGroup>
        <FilterChipGroup
          type="single"
          value={level}
          onValueChange={(v) => v && setLevel(v)}
          aria-label="Seviye"
        >
          <FilterChipItem value="all">Tümü</FilterChipItem>
          <FilterChipItem value="error">Hata</FilterChipItem>
          <FilterChipItem value="warning">Uyarı</FilterChipItem>
          <FilterChipItem value="info">Bilgi</FilterChipItem>
        </FilterChipGroup>
        <div className="flex flex-wrap gap-2">
          <FilterChip selected={mine} onClick={() => setMine(!mine)} icon={UserIcon}>
            Bana atanan
          </FilterChip>
          <FilterChip menu icon={SmartphoneIcon}>
            Platform
          </FilterChip>
          <FilterChip menu selected>
            Sürüm: 1.4.2
          </FilterChip>
          <FilterChip disabled>Devre dışı</FilterChip>
        </div>
      </Demo>

      <Demo
        title="Etiket alanı"
        description="Serbest metinden etiketler: Enter ya da virgül ekler, virgül veya satırla ayrılmış bir liste yapıştırınca her biri eklenir. Boş alanda Backspace son etiketi seçer, ikinci Backspace siler. Aynı etiket (büyük–küçük harf farkı gözetmeden) ikinci kez eklenmez. validate bir hata cümlesi döndürürse etiket eklenmez. Bilinen bir listeden seçim için MultiSelect kullanın."
        className="grid w-full max-w-lg gap-4"
        code={`<TagInput value={tags} onValueChange={setTags} placeholder="Etiket ekleyin" max={8} />

<TagInput
  value={emails}
  onValueChange={setEmails}
  placeholder="E-posta adresleri"
  validate={(t) => (isEmail(t) ? undefined : \`“\${t}” geçerli bir e-posta adresi değil.\`)}
/>`}
      >
        <TagInput
          value={tags}
          onValueChange={setTags}
          placeholder="Etiket ekleyin"
          max={8}
          aria-label="Etiketler"
        />
        <TagInput
          value={emails}
          onValueChange={setEmails}
          placeholder="E-posta adresleri"
          aria-label="Bildirim alıcıları"
          validate={(t) => (isEmail(t) ? undefined : `“${t}” geçerli bir e-posta adresi değil.`)}
        />
      </Demo>

      <Demo
        title="Adımlar"
        description="Çok adımlı akışlar: kurulum sihirbazı, içe aktarma. current'tan önceki adımlar tamamlanmış sayılır; state ile tek tek değiştirilebilir (hata). Telefonda yatay adımların yalnızca daireleri kalır, şu anki adımın başlığı altta yazar. Dikey adımlar şu anki adımın altında içerik gösterebilir."
        className="grid w-full gap-8"
        code={`<Stepper current={step}>
  <Step title="Proje" description="Ad ve platform" />
  <Step title="SDK" description="Paketi kurun" state={failed ? "error" : undefined} />
  <Step title="İlk olay" />
  <Step title="Bildirimler" />
</Stepper>

<Stepper orientation="vertical" current={step}>
  <Step title="SDK'yı kurun">…</Step>
</Stepper>`}
      >
        <Stepper current={step} label="Proje kurulumu">
          <Step title="Proje" description="Ad ve platform" />
          <Step title="SDK" description="Paketi kurun" state={failed && step === 1 ? "error" : undefined} />
          <Step title="İlk olay" description="Bağlantıyı doğrulayın" />
          <Step title="Bildirimler" />
        </Stepper>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Geri
          </Button>
          <Button size="sm" disabled={step === 4} onClick={() => setStep((s) => s + 1)}>
            İleri
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setFailed((f) => !f)}>
            {failed ? "Hatayı kaldır" : "SDK adımında hata"}
          </Button>
        </div>
        <Stepper orientation="vertical" current={step} label="Proje kurulumu (dikey)" className="max-w-md">
          <Step title="Proje oluşturun" description="Ad, platform ve ekip">
            <p className="text-muted-foreground">e-Belediye · .NET · Bilgi İşlem</p>
          </Step>
          <Step title="SDK'yı kurun" description="Sentry .NET SDK'sını ekleyin">
            <code className="block rounded-md bg-(--surface-muted) px-3 py-2 font-mono text-xs">
              dotnet add package Sentry.AspNetCore
            </code>
          </Step>
          <Step title="İlk olayı gönderin" description="Bağlantıyı doğrulayın">
            <p className="text-muted-foreground">
              Uygulamada bir hata oluşturun; birkaç saniye içinde burada görünür.
            </p>
          </Step>
          <Step title="Bildirimleri açın">
            <p className="text-muted-foreground">Yeni hatalar için e-posta ve Slack.</p>
          </Step>
        </Stepper>
      </Demo>

      <Demo
        title="Ağaç görünümü"
        description="Açılır dallar: kaynak dosyalar, ekipler, iç içe kategoriler. Tek sekme durağıdır: yukarı–aşağı oklar görünen öğelerde gezer, sağ ok dalı açar ya da içine girer, sol ok kapatır ya da üst öğeye çıkar, Home/End uçlara gider, * kardeş dalların hepsini açar, bir harf yazmak o harfle başlayan öğeye atlar, Enter seçer."
        className="grid w-full items-start gap-3 sm:grid-cols-[minmax(0,18rem)_1fr]"
        code={`<TreeView
  label="Kaynak dosyalar"
  nodes={[{ id: "src", label: "src", icon: FolderIcon, children: [
    { id: "src/main.tsx", label: "main.tsx", icon: FileCodeIcon, aside: "12" },
  ] }]}
  defaultExpanded={["src"]}
  selected={selected}
  onSelect={(node) => setSelected(node.id)}
/>`}
      >
        <div className="card p-1.5">
          <TreeView
            label="Kaynak dosyalar"
            nodes={files}
            defaultExpanded={["src", "src/api"]}
            selected={selected}
            onSelect={(node) => setSelected(node.id)}
          />
        </div>
        <div className="flex items-start gap-2 text-sm">
          <span className="text-muted-foreground">Seçili:</span>
          {selected ? (
            <Badge variant="secondary" shape="square" className="font-mono">
              {selected}
            </Badge>
          ) : (
            "—"
          )}
        </div>
      </Demo>
    </Page>
  );
}
