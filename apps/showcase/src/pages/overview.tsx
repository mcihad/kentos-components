import { StatStrip } from "@kentos/components/common/stat-strip";
import { Badge } from "@kentos/components/ui/badge";
import { Page } from "../demo";

const sections = [
  {
    href: "#/tokens",
    title: "Renkler ve tokenlar",
    text: "Palet, anlamsal yüzey ve metin renkleri, durum renkleri, yazı ölçeği, köşe ve gölgeler.",
  },
  {
    href: "#/theming",
    title: "Görünüm ve temalar",
    text: "Açık/koyu tema, yazı tipi, yoğunluk, köşeler, ana renk ve kart görünümü.",
  },
  { href: "#/buttons", title: "Düğmeler", text: "Altı varyant, sekiz boyut, simgeli ve simgesiz kullanım." },
  {
    href: "#/forms",
    title: "Form elemanları",
    text: "Metin alanları, seçim kutuları, anahtarlar, radyo grupları, alan etiketi ve ipuçları.",
  },
  {
    href: "#/feedback",
    title: "Geri bildirim",
    text: "Uyarılar, rozetler, iskeletler, bildirimler, boş ve hata durumları.",
  },
  {
    href: "#/overlays",
    title: "Katmanlar",
    text: "Diyalog, yan panel, açılır pencere, menü, ipucu kartı ve komut paleti.",
  },
  {
    href: "#/navigation",
    title: "Gezinme ve düzen",
    text: "Sekmeler, segment seçici, açılır bölümler, kaydırma alanı, ayraç ve kısayol tuşları.",
  },
  {
    href: "#/data",
    title: "Veri gösterimi",
    text: "Sayı kartları, tablolar, çubuk grafik, mini grafik, avatar ve kopyalanabilir değerler.",
  },
  {
    href: "#/patterns",
    title: "Sayfa kalıpları",
    text: "Bileşenlerin bir araya geldiği liste, ayar ve boş sayfa örnekleri.",
  },
];

/** What the kit is and how it is used. */
export function OverviewPage() {
  return (
    <Page
      title="KentOS Bileşenleri"
      description={
        <>
          KentOS uygulamalarının ortak tasarım sistemi: renk ve ölçü tokenları, kullanıcının seçebildiği
          temalar ve Radix üzerine kurulu, Tailwind CSS v4 ile biçimlenen React bileşenleri. İzci'nin arayüzü
          bu setle yapılır; diğer KentOS uygulamaları da aynı paketi kullanır.
        </>
      }
    >
      <StatStrip
        stats={[
          { label: "Temel bileşen", value: "25", note: "shadcn/Radix tabanlı" },
          { label: "Ortak bileşen", value: "9", note: "alan, sayı kartı, boş durum…" },
          { label: "Tema seçeneği", value: "6", note: "mod, yazı, yoğunluk, köşe, renk, kart" },
          { label: "Renk paleti", value: "8", note: "OKLCH ile eşit adımlı" },
        ]}
      />
      <section className="grid gap-3">
        <h2 className="font-semibold text-lg">Kurulum</h2>
        <div className="card grid gap-3 p-5 text-sm leading-relaxed">
          <p>
            Paket, KentOS projelerinin yanındaki <code className="font-mono">kentos-components</code>{" "}
            deposundadır. Uygulamanın <code className="font-mono">package.json</code> dosyasına ekleyin ve ana
            CSS dosyasında stilleri içe aktarın:
          </p>
          <pre className="overflow-x-auto rounded-md bg-sunken p-3 font-mono">
            {`"@kentos/components": "file:../../kentos-components/packages/components"

/* src/index.css */
@import "@kentos/components/styles/index.css";`}
          </pre>
          <p>
            Bileşenler alt yollardan alınır, örneğin{" "}
            <code className="font-mono">import {"{ Button }"} from "@kentos/components/ui/button"</code>.
            Ayrıntılar deponun <code className="font-mono">docs/</code> klasöründe ve yapay zekâ ajanları için{" "}
            <code className="font-mono">AGENTS.md</code> dosyasındadır.
          </p>
        </div>
      </section>
      <section className="grid gap-3">
        <h2 className="font-semibold text-lg">Bölümler</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                className="card grid h-full gap-1 p-4 transition-colors hover:bg-(--surface-hover)"
              >
                <span className="font-semibold">{s.title}</span>
                <span className="text-muted-foreground text-sm leading-relaxed">{s.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-3">
        <h2 className="font-semibold text-lg">İlkeler</h2>
        <ul className="grid gap-2 text-sm leading-relaxed">
          <li>
            <Badge variant="secondary">Türkçe</Badge> Arayüz metinleri Türkçedir; kod, tip ve yorumlar
            İngilizce.
          </li>
          <li>
            <Badge variant="secondary">Token</Badge> Bileşenler ham palet yerine anlamsal tokenları okur (
            <code className="font-mono">--surface-card</code>, <code className="font-mono">--text-muted</code>
            …); böylece tema seçimleri her yere yansır.
          </li>
          <li>
            <Badge variant="secondary">Erişilebilirlik</Badge> Radix temelleri klavye ve ekran okuyucu desteği
            getirir; metinler en az 12 piksel ve 4,5:1 karşıtlıktadır.
          </li>
          <li>
            <Badge variant="secondary">Yoğunluk</Badge> Kontrol yükseklikleri, satır aralıkları ve boşluklar
            yoğunluk seçimine göre değişir; sabit piksel yerine tokenları kullanın.
          </li>
        </ul>
      </section>
    </Page>
  );
}
