import { Demo, Page, Swatch } from "../demo";

const ramps = ["navy", "teal", "neutral", "green", "amber", "red", "violet"];
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const surfaces = [
  ["--surface-page", "Sayfa zemini"],
  ["--surface-card", "Kart"],
  ["--surface-muted", "Sessiz yüzey"],
  ["--surface-sunken", "Gömülü (kod, alt bilgi)"],
  ["--surface-hover", "Üzerine gelinen satır"],
  ["--surface-selected", "Seçili"],
  ["--brand-bg", "Ana renk"],
];
const texts = [
  ["--text-strong", "Başlık"],
  ["--text-body", "Gövde metni"],
  ["--text-muted", "İkincil metin"],
  ["--text-subtle", "Silik metin"],
  ["--text-link", "Bağlantı"],
  ["--text-brand", "Marka metni"],
];
const statuses = ["success", "warning", "danger", "info", "neutral"];
const statusNames: Record<string, string> = {
  success: "Başarılı",
  warning: "Uyarı",
  danger: "Tehlike",
  info: "Bilgi",
  neutral: "Nötr",
};
// Full class names, so that Tailwind finds them in the source.
const scale = [
  ["2xs", "text-2xs"],
  ["xs", "text-xs"],
  ["sm", "text-sm"],
  ["md", "text-md"],
  ["base", "text-base"],
  ["lg", "text-lg"],
  ["xl", "text-xl"],
  ["2xl", "text-2xl"],
  ["3xl", "text-3xl"],
];
const radii = [
  ["xs", "rounded-xs shadow-xs"],
  ["sm", "rounded-sm shadow-sm"],
  ["md", "rounded-md shadow-md"],
  ["lg", "rounded-lg shadow-lg"],
  ["xl", "rounded-xl shadow-xl"],
  ["2xl", "rounded-2xl shadow-xl"],
];

/** The design tokens: palette, semantic colours, type scale, radii, shadows. */
export function TokensPage() {
  return (
    <Page
      title="Renkler ve tokenlar"
      description={
        <>
          Tokenlar üç katmandır: <b className="text-foreground">palet</b> (ham renk ölçekleri, bileşenler
          doğrudan kullanmaz), <b className="text-foreground">anlamsal tokenlar</b> (yüzey, metin, kenarlık,
          durum) ve tema seçimleriyle değişen <b className="text-foreground">kapsamlar</b>. Bileşen yazarken
          her zaman anlamsal tokenı kullanın: <code className="font-mono">bg-(--surface-card)</code>,{" "}
          <code className="font-mono">text-muted-foreground</code>.
        </>
      }
    >
      <Demo
        title="Palet"
        description="OKLCH ile eşit algısal adımlarla üretilmiş, sRGB olarak yazılmış renk ölçekleri. Lacivert KentOS'un marka rengidir."
        className="grid gap-4"
        code={`/* Paleti doğrudan değil, anlamsal tokenlar üzerinden kullanın. */
.ozel { background: var(--navy-800); } /* yalnız token tanımlarken */`}
      >
        {ramps.map((r) => (
          <div key={r} className="grid w-full grid-cols-[5rem_1fr] items-center gap-3">
            <code className="text-sm">{r}</code>
            <div className="grid grid-cols-11 gap-1">
              {steps.map((s) => (
                <div
                  key={s}
                  title={`--${r}-${s}`}
                  className="h-9 rounded"
                  style={{ background: `var(--${r}-${s})` }}
                />
              ))}
            </div>
          </div>
        ))}
      </Demo>
      <Demo
        title="Yüzeyler"
        description="Sayfa gri, kartlar beyazdır (koyu temada katmanlı lacivert). Seçili ve üzerine gelinen durumlar kendi tokenlarıyla gelir."
        className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7"
        code={`<div className="card p-4">Kart</div>
<div className="bg-(--surface-muted) p-4">Sessiz yüzey</div>
<div className="bg-sunken p-4">Gömülü</div>`}
      >
        {surfaces.map(([v, label]) => (
          <div key={v} className="grid gap-1">
            <Swatch name={v ?? ""} value={`var(${v})`} />
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </Demo>
      <Demo
        title="Metin"
        description="Okunması gereken hiçbir metin 12 pikselin altında değildir; gövde metni 15 pikseldir (text-md)."
        className="grid gap-2"
        code={`<h2 className="text-strong">Başlık</h2>
<p className="text-foreground">Gövde metni</p>
<p className="text-muted-foreground">İkincil metin</p>
<a className="text-link hover:text-link-hover">Bağlantı</a>`}
      >
        {texts.map(([v, label]) => (
          <p
            key={v}
            className="flex w-full items-baseline justify-between gap-4"
            style={{ color: `var(${v})` }}
          >
            <span className="text-lg">{label}: Ağaç gölgesinde çalışan İzci</span>
            <code className="text-2xs text-muted-foreground">{v}</code>
          </p>
        ))}
      </Demo>
      <Demo
        title="Durum renkleri"
        description="Her durumun zemin, metin ve kenarlık tokenı vardır; uyarı kutuları ve rozetler bunları kullanır."
        className="grid w-full gap-2 sm:grid-cols-5"
        code={`<div className="rounded-md border border-status-warning-border bg-status-warning-bg px-3 py-2 text-status-warning-fg">
  Kota %80 doldu.
</div>`}
      >
        {statuses.map((s) => (
          <div
            key={s}
            className="rounded-md border px-3 py-2 text-sm"
            style={{
              background: `var(--status-${s}-bg)`,
              color: `var(--status-${s}-fg)`,
              borderColor: `var(--status-${s}-border)`,
            }}
          >
            {statusNames[s]}
          </div>
        ))}
      </Demo>
      <Demo
        title="Yazı ölçeği"
        description="Varsayılan yazı tipi Plus Jakarta Sans; kod ve tanımlayıcılar JetBrains Mono. text-base 16 pikseldir çünkü iOS daha küçük form alanlarında yakınlaştırır."
        className="grid gap-2"
        code={`<p className="text-2xs">12 px</p> … <p className="text-3xl">30 px</p>
<code className="font-mono">KALEM-1A</code>`}
      >
        {scale.map(([name, cls]) => (
          <p key={name} className={`${cls} w-full`}>
            <code className="mr-3 inline-block w-12 text-2xs text-muted-foreground">{name}</code>
            Sivas Belediyesi ödeme hatası
          </p>
        ))}
        <p className="w-full font-mono text-sm">
          <code className="mr-3 inline-block w-12 font-sans text-2xs text-muted-foreground">mono</code>
          KALEM-1A · NullReferenceException · 0x7ffe
        </p>
      </Demo>
      <Demo
        title="Köşeler ve gölgeler"
        description="Köşe yarıçapları köşe seçimine, gölgeler kart seçimine göre değişir."
        className="grid grid-cols-3 gap-4 sm:grid-cols-6"
        code={`<div className="rounded-lg shadow-md">…</div>`}
      >
        {radii.map(([r, cls]) => (
          <div key={r} className="grid gap-1.5 text-center">
            <div className={`${cls} h-14 border bg-card`} />
            <code className="text-2xs text-muted-foreground">rounded-{r}</code>
          </div>
        ))}
      </Demo>
    </Page>
  );
}
