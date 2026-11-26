import { Segmented } from "@kentos/components/common/segmented";
import { EmptyState, ErrorState } from "@kentos/components/common/states";
import { Alert, AlertActions, AlertDescription, AlertDismiss, AlertTitle } from "@kentos/components/ui/alert";
import { Badge, BadgeAnchor } from "@kentos/components/ui/badge";
import { Button } from "@kentos/components/ui/button";
import { Skeleton } from "@kentos/components/ui/skeleton";
import {
  BellIcon,
  BugIcon,
  CircleCheckIcon,
  InfoIcon,
  MessageSquareIcon,
  OctagonXIcon,
  SearchXIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { Demo, Page, ToastToneContext } from "../demo";

const defaultChips = ["production", "seviye: hata", "son 24 saat", "Nilüfer Belediyesi"];

/** Alerts, badges, skeletons, toasts, empty and error states. */
export function FeedbackPage() {
  const [quota, setQuota] = useState(true);
  const [chips, setChips] = useState(defaultChips);
  const { tone, setTone } = useContext(ToastToneContext);
  return (
    <Page
      title="Geri bildirim"
      description="Kullanıcıya olanı anlatan bileşenler. Hata mesajları özür dilemez ve belirsiz değildir: ne olduğunu ve nasıl düzeltileceğini söyler. Boş bir ekran bir sonraki adıma davettir."
    >
      <Demo
        title="Uyarı kutuları"
        description="Sayfanın içinde kalan mesajlar. Varyant tonu belirler: bilgi, başarı, uyarı, hata. AlertActions düğmeleri açıklamanın altına, AlertDismiss kapatma düğmesini köşeye koyar."
        className="grid w-full gap-3"
        code={`<Alert variant="info">
  <InfoIcon />
  <AlertTitle>Kurallar yalnız yeni olaylara uygulanır</AlertTitle>
  <AlertDescription>Mevcut hatalar parmak izlerini korur.</AlertDescription>
</Alert>
<Alert variant="success">…</Alert>
<Alert variant="warning">
  <TriangleAlertIcon />
  <AlertTitle>Aylık kotanın %80'i doldu</AlertTitle>
  <AlertDescription>Kota dolunca yeni olaylar reddedilir.</AlertDescription>
  <AlertActions><Button size="sm" variant="outline">Kotayı artır</Button></AlertActions>
  <AlertDismiss onClick={hide} />
</Alert>
<Alert variant="destructive">…</Alert>
<Alert>…</Alert>`}
      >
        <Alert variant="info">
          <InfoIcon />
          <AlertTitle>Kurallar yalnız yeni olaylara uygulanır</AlertTitle>
          <AlertDescription>
            Mevcut hatalar parmak izlerini korur; isterseniz onları birleştirin.
          </AlertDescription>
        </Alert>
        <Alert variant="success">
          <CircleCheckIcon />
          <AlertTitle>SDK bağlandı</AlertTitle>
          <AlertDescription>İlk olay 2 dakika önce geldi. Hatalar artık burada görünecek.</AlertDescription>
        </Alert>
        {quota ? (
          <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertTitle>Aylık kotanın %80'i doldu</AlertTitle>
            <AlertDescription>Kota dolunca yeni olaylar ay sonuna kadar reddedilir.</AlertDescription>
            <AlertActions>
              <Button size="sm" variant="outline" onClick={() => toast("Kota ayarları")}>
                Kotayı artır
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast("Örnekleme ayarları")}>
                Örneklemeyi aç
              </Button>
            </AlertActions>
            <AlertDismiss onClick={() => setQuota(false)} />
          </Alert>
        ) : (
          <Button variant="outline" size="sm" className="justify-self-start" onClick={() => setQuota(true)}>
            Uyarıyı geri getir
          </Button>
        )}
        <Alert variant="destructive">
          <OctagonXIcon />
          <AlertTitle>Bağlantı kurulamadı</AlertTitle>
          <AlertDescription>
            GitHub erişim anahtarının süresi dolmuş. Yeni bir anahtar ekleyin.
          </AlertDescription>
        </Alert>
        <Alert>
          <SparklesIcon />
          <AlertTitle>Yapay zekâ analizi hazır</AlertTitle>
          <AlertDescription>
            Önerilen düzeltmeyi hata sayfasının Yapay zekâ sekmesinde görebilirsiniz.
          </AlertDescription>
        </Alert>
      </Demo>
      <Demo
        title="Rozetler"
        description="Durum, sayı ve etiketler. Yumuşak tonlar durum tokenlarını kullanır (her temada okunur); dolu varyantlar dikkat çekmesi gereken sayılar içindir. Nokta canlı durumlarda yanıp söner; onRemove süzgeç ve etiketleri kaldırılabilir yapar; BadgeAnchor bir simgenin köşesine sayı koyar."
        className="grid w-full gap-5"
        code={`<Badge variant="success" dot>Çözüldü</Badge>
<Badge variant="danger" dot pulse>Canlı</Badge>
<Badge variant="warning" icon={TriangleAlertIcon}>Gerileme</Badge>
<Badge variant="brand" size="sm">Yeni</Badge>
<Badge variant="outline" shape="square">v2.4.0</Badge>
<Badge variant="secondary" onRemove={() => remove("production")}>production</Badge>

<BadgeAnchor count={12} label="12 okunmamış bildirim">
  <Button variant="ghost" size="icon" aria-label="Bildirimler"><BellIcon /></Button>
</BadgeAnchor>`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Varsayılan</Badge>
          <Badge variant="destructive">Kritik</Badge>
          <Badge variant="secondary">İkincil</Badge>
          <Badge variant="outline">Çerçeveli</Badge>
          <Badge variant="ghost">Sessiz</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral" dot>
            Yoksayıldı
          </Badge>
          <Badge variant="brand" dot>
            Atandı
          </Badge>
          <Badge variant="info" icon={InfoIcon}>
            Bilgi
          </Badge>
          <Badge variant="success" dot>
            Çözüldü
          </Badge>
          <Badge variant="warning" icon={TriangleAlertIcon}>
            Gerileme
          </Badge>
          <Badge variant="danger" dot pulse>
            Canlı
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand" size="sm">
            Küçük
          </Badge>
          <Badge variant="brand">Orta</Badge>
          <Badge variant="brand" size="lg">
            Büyük
          </Badge>
          <Badge variant="outline" shape="square" className="font-mono">
            v2.4.0
          </Badge>
          <Badge variant="outline" shape="square" className="font-mono">
            android@5.12.0
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <Badge
              key={c}
              variant="secondary"
              size="lg"
              onRemove={() => setChips(chips.filter((x) => x !== c))}
            >
              {c}
            </Badge>
          ))}
          {chips.length === 0 ? (
            <Button variant="link" size="sm" onClick={() => setChips(defaultChips)}>
              Süzgeçleri geri getir
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <BadgeAnchor count={3} label="3 okunmamış bildirim">
            <Button variant="outline" size="icon" aria-label="Bildirimler">
              <BellIcon />
            </Button>
          </BadgeAnchor>
          <BadgeAnchor count={128} label="128 açık hata" variant="warning">
            <Button variant="outline" size="icon" aria-label="Hatalar">
              <BugIcon />
            </Button>
          </BadgeAnchor>
          <BadgeAnchor dot variant="brand" label="Yeni mesaj">
            <Button variant="outline" size="icon" aria-label="Mesajlar">
              <MessageSquareIcon />
            </Button>
          </BadgeAnchor>
        </div>
      </Demo>
      <Demo
        title="Bildirimler (toast)"
        description="Olanı doğrulayan ya da bir hatayı bildiren kısa mesajlar; sağ altta belirir, kendiliğinden kaybolur. Toaster uygulamanın kökünde bir kez yer alır, toast() her yerden çağrılır. Düz görünümde türü ikon belirtir; renkli (tinted) görünümde başarı, hata, uyarı ve bilgi kendi renk zeminiyle gelir. Eylemin adını tekrarlayın: “Kaydet” → “Kaydedildi”."
        code={`// Uygulama kökünde bir kez; tone="tinted" türleri renkli zeminde gösterir
<Toaster position="bottom-right" tone="tinted" />

// Yalnızca bir bildirimi renklendirmek için
import { tintedToastClassNames } from "@kentos/components/ui/sonner";
toast.error("Ödeme alınamadı", { classNames: tintedToastClassNames });

import { toast } from "sonner";
toast.success("Proje ayarları kaydedildi");
toast.error("Bağlantı kurulamadı", { description: "Ağ bağlantınızı denetleyip yeniden deneyin." });
toast.warning("Kotanın %80'i doldu");
toast.info("Yeni sürüm yayımlandı", { description: "v2.4.0 · 3 hata çözüldü" });
toast("KALEM-1B ayrıldı", { action: { label: "Geri al", onClick: undo } });

const id = toast.loading("Rapor hazırlanıyor…");
toast.success("Rapor hazır", { id });

toast.promise(save(), {
  loading: "Kaydediliyor…",
  success: "Kaydedildi",
  error: (e) => errorMessage(e),
});`}
      >
        <Segmented
          label="Bildirim görünümü"
          value={tone}
          onChange={setTone}
          options={[
            { value: "plain", label: "Düz" },
            { value: "tinted", label: "Renkli" },
          ]}
          className="w-full sm:w-auto"
        />
        <div className="hidden h-6 w-px bg-border sm:block" />
        <Button variant="outline" onClick={() => toast.success("Proje ayarları kaydedildi")}>
          Başarılı
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error("Bağlantı kurulamadı", { description: "Ağ bağlantınızı denetleyip yeniden deneyin." })
          }
        >
          Hata
        </Button>
        <Button variant="outline" onClick={() => toast.warning("Kotanın %80'i doldu")}>
          Uyarı
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.info("Yeni sürüm yayımlandı", { description: "v2.4.0 · 3 hata çözüldü" })}
        >
          Bilgi
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("KALEM-1B ayrıldı", {
              description: "Olaylar birkaç dakikada taşınır.",
              action: { label: "Geri al", onClick: () => toast.success("Ayırma geri alındı") },
              cancel: { label: "Kapat", onClick: () => {} },
            })
          }
        >
          Eylemli
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const id = toast.loading("Rapor hazırlanıyor…");
            window.setTimeout(
              () => toast.success("Rapor hazır", { id, description: "PDF indirildi." }),
              1800,
            );
          }}
        >
          Yükleniyor → başarılı
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.promise(
              new Promise((resolve, reject) =>
                window.setTimeout(() => (Math.random() > 0.4 ? resolve(null) : reject(new Error())), 1500),
              ),
              {
                loading: "Kaydediliyor…",
                success: "Kaydedildi",
                error: "Kaydedilemedi. Yeniden deneyin.",
              },
            )
          }
        >
          Promise
        </Button>
      </Demo>
      <Demo
        title="İskelet"
        description="Yüklenirken içeriğin şeklini gösterin; döner simge yerine iskelet kullanın."
        className="grid w-full max-w-md gap-2"
        code={`<Skeleton className="h-5 w-1/2" />
<Skeleton className="h-24 w-full" />`}
      >
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-24 w-full" />
      </Demo>
      <Demo
        title="Boş ve hata durumları"
        className="grid w-full gap-4 md:grid-cols-2"
        code={`<EmptyState icon={SearchXIcon} title="Eşleşen hata yok" action={<Button size="sm">Filtreleri temizle</Button>}>
  Aramayı genişletin ya da başka bir dönem seçin.
</EmptyState>
<ErrorState message="Sunucuya ulaşılamadı." onRetry={refetch} />`}
      >
        <EmptyState
          icon={SearchXIcon}
          title="Eşleşen hata yok"
          className="card"
          action={
            <Button size="sm" variant="outline">
              Filtreleri temizle
            </Button>
          }
        >
          Aramayı genişletin ya da başka bir dönem seçin.
        </EmptyState>
        <ErrorState
          message="Sunucuya ulaşılamadı."
          onRetry={() => toast("Yeniden deneniyor…")}
          className="card"
        />
      </Demo>
    </Page>
  );
}
