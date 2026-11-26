import { ButtonGroup, SplitButton } from "@kentos/components/common/button-group";
import { Button } from "@kentos/components/ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileIcon,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  SettingsIcon,
  Trash2Icon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Demo, Page } from "../demo";

/** Buttons: variants, sizes and icons. */
export function ButtonsPage() {
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(100);
  const run = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1800);
  };
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
        title="Yükleniyor durumu"
        description="loading düğmeyi kilitler, simgenin yerine dönen bir gösterge koyar ve aria-busy ekler. Düğmede simge varsa gösterge onun yerine geçer; loadingText verilirse metin de değişir."
        code={`<Button loading={saving} onClick={save}>Kaydet</Button>
<Button loading={saving} loadingText="Kaydediliyor…"><SaveIcon />Kaydet</Button>
<Button variant="outline" loading>Yenile</Button>
<Button disabled>Kaydet</Button>`}
      >
        <Button loading={saving} onClick={run}>
          Kaydet
        </Button>
        <Button loading={saving} loadingText="Kaydediliyor…" onClick={run}>
          <SaveIcon />
          Kaydet
        </Button>
        <Button variant="outline" size="sm" loading={saving} onClick={run}>
          <RefreshCwIcon />
          Yenile
        </Button>
        <Button disabled>Devre dışı</Button>
        <Button asChild variant="link">
          <a href="#/forms">Bağlantı olarak</a>
        </Button>
      </Demo>
      <Demo
        title="Düğme grubu"
        description="Birlikte çalışan düğmeler tek bir kontrol gibi çizilir: kenarlıklar birleşir, yalnız dış köşeler yuvarlak kalır. Dikey de dizilebilir."
        code={`<ButtonGroup>
  <Button variant="outline" size="icon-sm" aria-label="Uzaklaş"><ZoomOutIcon /></Button>
  <Button variant="outline" size="sm" className="tabular">%{zoom}</Button>
  <Button variant="outline" size="icon-sm" aria-label="Yakınlaş"><ZoomInIcon /></Button>
</ButtonGroup>
<ButtonGroup orientation="vertical">…</ButtonGroup>`}
      >
        <ButtonGroup>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Uzaklaş"
            disabled={zoom <= 50}
            onClick={() => setZoom((z) => z - 25)}
          >
            <ZoomOutIcon />
          </Button>
          <Button variant="outline" size="sm" className="w-16 tabular" onClick={() => setZoom(100)}>
            %{zoom}
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Yakınlaş"
            disabled={zoom >= 200}
            onClick={() => setZoom((z) => z + 25)}
          >
            <ZoomInIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="sm">
            <ChevronLeftIcon />
            Önceki
          </Button>
          <Button variant="outline" size="sm">
            Sonraki
            <ChevronRightIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical">
          <Button variant="outline" size="icon-sm" aria-label="Yukarı taşı">
            <ArrowUpIcon />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Aşağı taşı">
            <ArrowDownIcon />
          </Button>
        </ButtonGroup>
      </Demo>
      <Demo
        title="Bölünmüş düğme"
        description="Ana eylem solda, seçenekleri sağdaki okla açılan menüde. Menü masaüstünde açılır liste, telefonda alttan açılan sayfadır."
        code={`<SplitButton
  label="Kaydet"
  icon={SaveIcon}
  onClick={save}
  loading={saving}
  entries={[
    { label: "Kaydet ve yeni ekle", icon: PlusIcon, onSelect: saveAndNew },
    { label: "Taslak olarak kaydet", icon: FileIcon, onSelect: saveDraft },
    { type: "separator" },
    { label: "Değişiklikleri at", icon: Trash2Icon, variant: "destructive", onSelect: discard },
  ]}
/>`}
      >
        <SplitButton
          label="Kaydet"
          icon={SaveIcon}
          onClick={() => toast.success("Kaydedildi")}
          entries={[
            {
              label: "Kaydet ve yeni ekle",
              icon: PlusIcon,
              onSelect: () => toast("Kaydedildi, yeni kayıt açıldı"),
            },
            { label: "Taslak olarak kaydet", icon: FileIcon, onSelect: () => toast("Taslak kaydedildi") },
            { type: "separator" },
            {
              label: "Değişiklikleri at",
              icon: Trash2Icon,
              variant: "destructive",
              onSelect: () => toast("Değişiklikler atıldı"),
            },
          ]}
        />
        <SplitButton
          variant="outline"
          size="sm"
          label="Dışa aktar"
          icon={DownloadIcon}
          onClick={() => toast("CSV indiriliyor")}
          menuLabel="Biçim seç"
          entries={[
            { label: "CSV", onSelect: () => toast("CSV indiriliyor") },
            { label: "JSON", onSelect: () => toast("JSON indiriliyor") },
            { label: "Excel", onSelect: () => toast("Excel indiriliyor") },
          ]}
        />
        <SplitButton
          label="Yayınla"
          loading={saving}
          loadingText="Yayınlanıyor…"
          onClick={run}
          entries={[{ label: "Yayını zamanla", onSelect: () => toast("Zamanlama açıldı") }]}
        />
      </Demo>
    </Page>
  );
}
