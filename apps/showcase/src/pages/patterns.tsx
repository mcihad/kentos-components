import { Field } from "@kentos/components/common/field";
import { StatStrip } from "@kentos/components/common/stat-strip";
import { EmptyState } from "@kentos/components/common/states";
import { Button } from "@kentos/components/ui/button";
import { Input } from "@kentos/components/ui/input";
import { Label } from "@kentos/components/ui/label";
import { Switch } from "@kentos/components/ui/switch";
import { FolderPlusIcon, PlusIcon } from "lucide-react";
import { Demo, Page } from "../demo";

/** How components combine into pages. */
export function PatternsPage() {
  return (
    <Page
      title="Sayfa kalıpları"
      description="KentOS sayfaları aynı iskeleti izler: başlık ve açıklama, birincil eylem sağ üstte, içerik gri sayfa üzerindeki beyaz kartlarda. Telefonda kartlar kenardan kenara uzar."
    >
      <Demo
        title="Liste sayfası"
        className="block bg-background"
        code={`<header className="flex items-start justify-between gap-3">
  <div>
    <h1 className="font-semibold text-xl">Projeler</h1>
    <p className="text-muted-foreground text-sm">3 proje</p>
  </div>
  <Button><PlusIcon />Proje oluştur</Button>
</header>
<StatStrip stats={…} />
<div className="card">…liste…</div>`}
      >
        <div className="grid gap-5">
          <header className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-semibold text-xl">Projeler</h1>
              <p className="text-muted-foreground text-sm">3 proje, son 14 gün</p>
            </div>
            <Button>
              <PlusIcon />
              Proje oluştur
            </Button>
          </header>
          <StatStrip
            stats={[
              { label: "Olay", value: "48 B" },
              { label: "Açık hata", value: "128" },
              { label: "Yeni hata", value: "9" },
            ]}
          />
          <ul className="card divide-y">
            {["Kalem API", "Kalem Web", "Mobil"].map((p) => (
              <li key={p} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium">{p}</span>
                <span className="text-muted-foreground">12 açık hata</span>
              </li>
            ))}
          </ul>
        </div>
      </Demo>
      <Demo
        title="Ayar formu"
        description="Alanlar tek sütunda, en fazla max-w-2xl genişlikte; kaydet düğmesi formun sonunda; tehlikeli işlemler ayrı, kırmızı kenarlıklı bir bölümde."
        className="block"
        code={`<form className="grid max-w-2xl gap-5">
  <Field label="Organizasyon adı" htmlFor="name"><Input id="name" /></Field>
  …
  <div><Button type="submit">Kaydet</Button></div>
</form>
<section className="rounded-lg border border-destructive/35 px-5 py-4">…</section>`}
      >
        <form className="grid max-w-2xl gap-5" onSubmit={(e) => e.preventDefault()}>
          <Field label="Organizasyon adı" htmlFor="p-name">
            <Input id="p-name" defaultValue="KentOS" />
          </Field>
          <Field label="Saklama süresi (gün)" htmlFor="p-days" hint="0: sunucunun süresi (90 gün).">
            <Input id="p-days" type="number" defaultValue={30} className="w-32" />
          </Field>
          <div className="flex items-start gap-3">
            <Switch id="p-2fa" className="mt-0.5" />
            <div className="grid gap-0.5">
              <Label htmlFor="p-2fa">İki adımlı doğrulama zorunlu</Label>
              <p className="text-muted-foreground text-sm">Açmamış üyeler organizasyona erişemez.</p>
            </div>
          </div>
          <div>
            <Button type="submit">Kaydet</Button>
          </div>
          <section className="rounded-lg border border-destructive/35 px-5 py-4">
            <h2 className="font-semibold text-md">Organizasyonu sil</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Bütün projeler ve olaylar kalıcı olarak silinir.
            </p>
            <Button type="button" variant="destructive" size="sm" className="mt-3">
              Organizasyonu sil
            </Button>
          </section>
        </form>
      </Demo>
      <Demo
        title="İlk kullanım"
        description="Boş bir sayfa ne yapılacağını söyler ve tek bir eylem sunar."
        className="block"
        code={`<EmptyState icon={FolderPlusIcon} title="Henüz proje yok" action={<Button>Proje oluştur</Button>}>
  İlk projenizi oluşturup uygulamanıza SDK'yı ekleyin.
</EmptyState>`}
      >
        <EmptyState
          icon={FolderPlusIcon}
          title="Henüz proje yok"
          className="card"
          action={
            <Button>
              <PlusIcon />
              Proje oluştur
            </Button>
          }
        >
          İlk projenizi oluşturup uygulamanıza SDK'yı ekleyin; hatalar birkaç saniye içinde burada görünür.
        </EmptyState>
      </Demo>
    </Page>
  );
}
