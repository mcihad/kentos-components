import { CheckboxCard, RadioCard, RadioCardGroup, SwitchCard } from "@kentos/components/common/choice-card";
import { Combobox, type ComboboxOption, MultiSelect } from "@kentos/components/common/combobox";
import { Field } from "@kentos/components/common/field";
import { Badge } from "@kentos/components/ui/badge";
import { Slider } from "@kentos/components/ui/slider";
import {
  BellIcon,
  BuildingIcon,
  ClockIcon,
  DatabaseIcon,
  MailIcon,
  MessageCircleIcon,
  ServerIcon,
  SmartphoneIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Demo, Page } from "../demo";

const districts: ComboboxOption[] = [
  { value: "seyhan", label: "Seyhan", group: "Adana", keywords: ["01"] },
  { value: "cukurova", label: "Çukurova", group: "Adana" },
  { value: "yuregir", label: "Yüreğir", group: "Adana" },
  { value: "cankaya", label: "Çankaya", group: "Ankara", keywords: ["06"] },
  { value: "kecioren", label: "Keçiören", group: "Ankara" },
  { value: "yenimahalle", label: "Yenimahalle", group: "Ankara" },
  { value: "kadikoy", label: "Kadıköy", group: "İstanbul", keywords: ["34"] },
  { value: "uskudar", label: "Üsküdar", group: "İstanbul" },
  { value: "sisli", label: "Şişli", group: "İstanbul" },
  { value: "besiktas", label: "Beşiktaş", group: "İstanbul", disabled: true },
  { value: "konak", label: "Konak", group: "İzmir", keywords: ["35"] },
  { value: "bornova", label: "Bornova", group: "İzmir" },
];

const people: ComboboxOption[] = [
  { value: "ayse", label: "Ayşe Yılmaz", description: "ayse@kentos.dev", icon: UserIcon },
  { value: "mehmet", label: "Mehmet Kaya", description: "mehmet@kentos.dev", icon: UserIcon },
  { value: "zeynep", label: "Zeynep Demir", description: "zeynep@kentos.dev", icon: UserIcon },
  { value: "ali", label: "Ali Çelik", description: "ali@kentos.dev", icon: UserIcon },
  { value: "elif", label: "Elif Şahin", description: "elif@kentos.dev", icon: UserIcon },
];

const tags: ComboboxOption[] = [
  "ödeme",
  "giriş",
  "e-belediye",
  "kent-kart",
  "su-faturası",
  "mobil",
  "performans",
  "güvenlik",
  "rapor",
].map((t) => ({ value: t, label: t }));

const municipalities = [
  "Adana Büyükşehir",
  "Ankara Büyükşehir",
  "Antalya Büyükşehir",
  "Bursa Büyükşehir",
  "İstanbul Büyükşehir",
  "İzmir Büyükşehir",
  "Kayseri Büyükşehir",
  "Konya Büyükşehir",
  "Mersin Büyükşehir",
  "Sivas Belediyesi",
  "Tokat Belediyesi",
];

/** Pretends to be a server search: answers 400 ms later. */
function useServerSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const q = query.toLocaleLowerCase("tr");
      setOptions(
        municipalities
          .filter((m) => m.toLocaleLowerCase("tr").includes(q))
          .map((m) => ({ value: m, label: m, icon: BuildingIcon })),
      );
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);
  return { setQuery, loading, options };
}

/** Choice cards, Combobox, MultiSelect and Slider. */
export function ChoicesPage() {
  const [plan, setPlan] = useState("team");
  const [retention, setRetention] = useState("30");
  const [channels, setChannels] = useState({ mail: true, sms: false, push: true });
  const [weekly, setWeekly] = useState(true);
  const [digest, setDigest] = useState(false);
  const [district, setDistrict] = useState<string | null>("cankaya");
  const [owner, setOwner] = useState<string | null>(null);
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>(["ödeme", "mobil"]);
  const [team, setTeam] = useState<string[]>(["ayse", "mehmet", "zeynep", "ali", "elif"]);
  const [volume, setVolume] = useState(60);
  const [range, setRange] = useState([100, 350]);
  const [sample, setSample] = useState(25);
  const server = useServerSearch();

  return (
    <Page
      title="Seçim bileşenleri"
      description={
        <>
          Açıklama gerektiren seçenekler kart olarak sunulur; uzun listelerden seçim için aranabilir{" "}
          <code className="font-mono">Combobox</code> ve <code className="font-mono">MultiSelect</code>{" "}
          kullanılır. Bunlar masaüstünde açılır liste, telefonda alttan açılan sayfadır. Arama Türkçe
          karakterlere duyarlıdır: "cankaya" yazınca "Çankaya" bulunur.
        </>
      }
    >
      <Demo
        title="Radyo kartları"
        description="Birbirini dışlayan, her biri bir cümle açıklama isteyen seçenekler. Kartın tamamı tıklanır; ok tuşları kartlar arasında gezer."
        className="grid w-full gap-6"
        code={`<RadioCardGroup value={plan} onValueChange={setPlan} columns={3} aria-label="Plan">
  <RadioCard value="free" title="Ücretsiz" description="3 proje, 7 gün saklama" aside="₺0" />
  <RadioCard value="team" title="Ekip" description="Sınırsız proje, 90 gün saklama" aside="₺490/ay" />
  <RadioCard value="kurum" title="Kurum" description="Kendi sunucunuzda" aside="Teklif" />
</RadioCardGroup>`}
      >
        <RadioCardGroup value={plan} onValueChange={setPlan} columns={3} aria-label="Plan">
          <RadioCard value="free" title="Ücretsiz" description="3 proje, 7 gün saklama" aside="₺0" />
          <RadioCard
            value="team"
            title="Ekip"
            description="Sınırsız proje, 90 gün saklama"
            aside={<Badge variant="secondary">Önerilen</Badge>}
          />
          <RadioCard
            value="kurum"
            title="Kurum"
            description="Kendi sunucunuzda, sınırsız saklama"
            aside="Teklif"
          />
        </RadioCardGroup>
        <RadioCardGroup
          value={retention}
          onValueChange={setRetention}
          columns={2}
          aria-label="Saklama süresi"
        >
          <RadioCard value="30" icon={ClockIcon} title="30 gün" description="Çoğu proje için yeterli." />
          <RadioCard
            value="90"
            icon={DatabaseIcon}
            title="90 gün"
            description="Mevsimsel hataları görmek için."
          />
          <RadioCard
            value="365"
            icon={ServerIcon}
            title="1 yıl"
            description="Yalnız kurum planında."
            disabled
          />
        </RadioCardGroup>
      </Demo>

      <Demo
        title="Onay kutusu kartları"
        description="Birden çok seçilebilen seçenekler. Izgara içinde dizilir."
        className="grid w-full gap-2.5 sm:grid-cols-3"
        code={`<CheckboxCard
  icon={MailIcon}
  title="E-posta"
  description="Her yeni hata için"
  checked={channels.mail}
  onCheckedChange={(v) => setChannels({ ...channels, mail: v === true })}
/>`}
      >
        <CheckboxCard
          icon={MailIcon}
          title="E-posta"
          description="Her yeni hata için bir ileti."
          checked={channels.mail}
          onCheckedChange={(v) => setChannels({ ...channels, mail: v === true })}
        />
        <CheckboxCard
          icon={MessageCircleIcon}
          title="SMS"
          description="Yalnız kritik hatalarda."
          checked={channels.sms}
          onCheckedChange={(v) => setChannels({ ...channels, sms: v === true })}
        />
        <CheckboxCard
          icon={SmartphoneIcon}
          title="Mobil bildirim"
          description="Uygulama yüklü telefonlara."
          checked={channels.push}
          onCheckedChange={(v) => setChannels({ ...channels, push: v === true })}
        />
      </Demo>

      <Demo
        title="Anahtar kartları"
        description="Hemen etkili olan ayarlar için. Anahtar kartın sonunda durur."
        className="grid w-full max-w-xl gap-2.5"
        code={`<SwitchCard
  icon={BellIcon}
  title="Haftalık özet"
  description="Pazartesi sabahı, geçen haftanın hataları."
  checked={weekly}
  onCheckedChange={setWeekly}
/>`}
      >
        <SwitchCard
          icon={BellIcon}
          title="Haftalık özet"
          description="Pazartesi sabahı, geçen haftanın hataları."
          checked={weekly}
          onCheckedChange={setWeekly}
        />
        <SwitchCard
          title="Günlük özet"
          description="Her sabah 09.00'da e-posta."
          checked={digest}
          onCheckedChange={setDigest}
        />
        <SwitchCard title="Sesli uyarı" description="Kurum planında açılır." disabled />
      </Demo>

      <Demo
        title="Combobox"
        description="Tek seçim. Seçenekler gruplanabilir, açıklama ve simge alabilir; keywords ile kod gibi gizli sözcükler de aranır (ör. 06). clearable seçimi temizleyen × ekler."
        className="grid w-full max-w-xl gap-4"
        code={`<Combobox
  options={districts}   // { value, label, group?, keywords?, description?, icon?, disabled? }
  value={district}
  onValueChange={setDistrict}
  placeholder="İlçe seçin"
  searchPlaceholder="İlçe ya da plaka ara"
  clearable
/>

// Sunucu tarafı arama
<Combobox options={results} onSearchChange={setQuery} loading={isFetching} … />`}
      >
        <Field label="İlçe" htmlFor="cb-district" hint={district ? `Değer: ${district}` : "Seçim yok"}>
          <Combobox
            id="cb-district"
            options={districts}
            value={district}
            onValueChange={setDistrict}
            placeholder="İlçe seçin"
            searchPlaceholder="İlçe ya da plaka ara"
            clearable
          />
        </Field>
        <Field label="Sorumlu" htmlFor="cb-owner">
          <Combobox
            id="cb-owner"
            options={people}
            value={owner}
            onValueChange={setOwner}
            placeholder="Kişi seçin"
            searchPlaceholder="Ad ya da e-posta"
          />
        </Field>
        <Field
          label="Belediye (sunucudan)"
          htmlFor="cb-server"
          hint="Her aramada 400 ms bekleyen sahte bir sunucu."
        >
          <Combobox
            id="cb-server"
            options={server.options}
            onSearchChange={server.setQuery}
            loading={server.loading}
            value={municipality}
            onValueChange={setMunicipality}
            placeholder="Belediye seçin"
            clearable
          />
        </Field>
        <Field label="Hatalı ve devre dışı" htmlFor="cb-bad" error="Bir ilçe seçin.">
          <Combobox id="cb-bad" options={districts} value={null} onValueChange={() => {}} aria-invalid />
        </Field>
        <Combobox
          options={districts}
          value="seyhan"
          onValueChange={() => {}}
          disabled
          aria-label="Devre dışı ilçe"
        />
      </Demo>

      <Demo
        title="Çoklu seçim"
        description="Seçimler rozet olarak görünür; her rozetin kendi kaldır düğmesi vardır. maxBadges'ten fazlası +n olarak toplanır. Liste seçerken açık kalır."
        className="grid w-full max-w-xl gap-4"
        code={`<MultiSelect
  options={tags}
  value={picked}
  onValueChange={setPicked}
  placeholder="Etiket ekleyin"
/>
<MultiSelect options={people} value={team} onValueChange={setTeam} maxBadges={2} />`}
      >
        <Field label="Etiketler" htmlFor="ms-tags">
          <MultiSelect
            id="ms-tags"
            options={tags}
            value={picked}
            onValueChange={setPicked}
            placeholder="Etiket ekleyin"
          />
        </Field>
        <Field label="Ekip" htmlFor="ms-team" hint={`${team.length} kişi seçili`}>
          <MultiSelect
            id="ms-team"
            options={people}
            value={team}
            onValueChange={setTeam}
            placeholder="Kişi ekleyin"
            maxBadges={2}
          />
        </Field>
      </Demo>

      <Demo
        title="Kaydırıcı"
        description="Tek değer ya da iki tutamaçlı aralık. Ok tuşları adım adım, Page Up/Down on adım, Home/End uçlara gider. formatValue sürüklerken tutamacın üstünde değeri gösterir; marks altına etiket koyar."
        className="grid w-full max-w-xl gap-6"
        code={`<Slider value={[volume]} onValueChange={([v]) => setVolume(v)} thumbLabels={["Ses düzeyi"]} />
<Slider
  value={range}
  onValueChange={setRange}
  min={0}
  max={500}
  step={10}
  minStepsBetweenThumbs={5}
  formatValue={(v) => \`₺\${v}\`}
  thumbLabels={["En düşük", "En yüksek"]}
  marks={[{ value: 0, label: "₺0" }, { value: 250, label: "₺250" }, { value: 500, label: "₺500" }]}
/>`}
      >
        <div className="grid gap-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Ses düzeyi</span>
            <span className="text-muted-foreground tabular">%{volume}</span>
          </div>
          <Slider value={[volume]} onValueChange={([v]) => setVolume(v ?? 0)} thumbLabels={["Ses düzeyi"]} />
        </div>
        <div className="grid gap-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Fiyat aralığı</span>
            <span className="text-muted-foreground tabular">
              ₺{range[0]} – ₺{range[1]}
            </span>
          </div>
          <Slider
            value={range}
            onValueChange={setRange}
            min={0}
            max={500}
            step={10}
            minStepsBetweenThumbs={5}
            formatValue={(v) => `₺${v}`}
            thumbLabels={["En düşük", "En yüksek"]}
            marks={[
              { value: 0, label: "₺0" },
              { value: 250, label: "₺250" },
              { value: 500, label: "₺500" },
            ]}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Örnekleme oranı</span>
            <span className="text-muted-foreground tabular">%{sample}</span>
          </div>
          <Slider
            value={[sample]}
            onValueChange={([v]) => setSample(v ?? 0)}
            step={25}
            formatValue={(v) => `%${v}`}
            thumbLabels={["Örnekleme oranı"]}
            marks={[0, 25, 50, 75, 100].map((v) => ({ value: v, label: `%${v}` }))}
          />
        </div>
        <Slider defaultValue={[40]} disabled thumbLabels={["Devre dışı"]} />
      </Demo>
    </Page>
  );
}
