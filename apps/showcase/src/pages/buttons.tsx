import { Button } from "@kentos/components/ui/button";
import { CheckIcon, DownloadIcon, Loader2Icon, PlusIcon, SettingsIcon, Trash2Icon } from "lucide-react";
import { Demo, Page } from "../demo";

/** Buttons: variants, sizes and icons. */
export function ButtonsPage() {
  return (
    <Page
      title="Düğmeler"
      description={
        <>
          Bir sayfada tek bir birincil düğme olur; diğer eylemler <code className="font-mono">outline</code>{" "}
          ya da <code className="font-mono">ghost</code> kullanır. Düğme metni eylemi söyler ("Kaydet",
          "Hatayı çöz"); "Tamam" ya da "Gönder" gibi belirsiz metinlerden kaçının. Yükseklikler yoğunluk
          seçimine uyar; dokunmatik ekranlarda en az 36-44 piksel kalır.
        </>
      }
    >
      <Demo
        title="Varyantlar"
        description="default birincil eylemdir; destructive geri alınamaz işlemler (silme) içindir."
        code={`<Button>Kaydet</Button>
<Button variant="secondary">İkincil</Button>
<Button variant="outline">Vazgeç</Button>
<Button variant="ghost">Daha fazla</Button>
<Button variant="destructive">Sil</Button>
<Button variant="link">Belgeleri aç</Button>`}
      >
        <Button>Kaydet</Button>
        <Button variant="secondary">İkincil</Button>
        <Button variant="outline">Vazgeç</Button>
        <Button variant="ghost">Daha fazla</Button>
        <Button variant="destructive">Sil</Button>
        <Button variant="link">Belgeleri aç</Button>
      </Demo>
      <Demo
        title="Boyutlar"
        description="sm araç çubukları ve tablolar, lg öne çıkan eylemler içindir."
        code={`<Button size="xs">Çok küçük</Button>
<Button size="sm">Küçük</Button>
<Button>Varsayılan</Button>
<Button size="lg">Büyük</Button>`}
      >
        <Button size="xs">Çok küçük</Button>
        <Button size="sm">Küçük</Button>
        <Button>Varsayılan</Button>
        <Button size="lg">Büyük</Button>
      </Demo>
      <Demo
        title="Simgeli düğmeler"
        description="Simgeler lucide-react'tan gelir ve boyutu düğmeye göre ayarlanır. Yalnız simge olan düğmelerde aria-label zorunludur."
        code={`<Button><PlusIcon />Proje oluştur</Button>
<Button variant="outline" size="sm"><DownloadIcon />CSV</Button>
<Button variant="ghost" size="icon" aria-label="Ayarlar"><SettingsIcon /></Button>
<Button variant="outline" size="icon-sm" aria-label="Sil"><Trash2Icon /></Button>`}
      >
        <Button>
          <PlusIcon />
          Proje oluştur
        </Button>
        <Button variant="outline" size="sm">
          <DownloadIcon />
          CSV
        </Button>
        <Button variant="ghost" size="icon" aria-label="Ayarlar">
          <SettingsIcon />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Sil">
          <Trash2Icon />
        </Button>
        <Button variant="secondary" size="icon-lg" aria-label="Onayla">
          <CheckIcon />
        </Button>
      </Demo>
      <Demo
        title="Durumlar"
        description="İşlem sürerken düğmeyi devre dışı bırakın ve ne olduğunu metinde söyleyin."
        code={`<Button disabled>Kaydet</Button>
<Button disabled><Loader2Icon className="animate-spin" />Kaydediliyor…</Button>
<Button asChild><a href="#/forms">Bağlantı olarak</a></Button>`}
      >
        <Button disabled>Kaydet</Button>
        <Button disabled>
          <Loader2Icon className="animate-spin" />
          Kaydediliyor…
        </Button>
        <Button asChild>
          <a href="#/forms">Bağlantı olarak</a>
        </Button>
      </Demo>
    </Page>
  );
}
