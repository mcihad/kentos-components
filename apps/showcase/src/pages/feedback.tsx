import { EmptyState, ErrorState } from "@kentos/components/common/states";
import { Alert, AlertDescription, AlertTitle } from "@kentos/components/ui/alert";
import { Badge } from "@kentos/components/ui/badge";
import { Button } from "@kentos/components/ui/button";
import { Skeleton } from "@kentos/components/ui/skeleton";
import { AlertTriangleIcon, InfoIcon, SearchXIcon } from "lucide-react";
import { toast } from "sonner";
import { Demo, Page } from "../demo";

/** Alerts, badges, skeletons, toasts, empty and error states. */
export function FeedbackPage() {
  return (
    <Page
      title="Geri bildirim"
      description="Kullanıcıya olanı anlatan bileşenler. Hata mesajları özür dilemez ve belirsiz değildir: ne olduğunu ve nasıl düzeltileceğini söyler. Boş bir ekran bir sonraki adıma davettir."
    >
      <Demo
        title="Uyarı kutuları"
        className="grid w-full gap-3"
        code={`<Alert>
  <InfoIcon />
  <AlertTitle>Kurallar yalnız yeni olaylara uygulanır</AlertTitle>
  <AlertDescription>Mevcut hatalar parmak izlerini korur.</AlertDescription>
</Alert>
<Alert variant="destructive">
  <AlertTriangleIcon />
  <AlertTitle>Bağlantı kurulamadı</AlertTitle>
  <AlertDescription>GitHub erişim anahtarının süresi dolmuş.</AlertDescription>
</Alert>`}
      >
        <Alert>
          <InfoIcon />
          <AlertTitle>Kurallar yalnız yeni olaylara uygulanır</AlertTitle>
          <AlertDescription>
            Mevcut hatalar parmak izlerini korur; isterseniz onları birleştirin.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTriangleIcon />
          <AlertTitle>Bağlantı kurulamadı</AlertTitle>
          <AlertDescription>
            GitHub erişim anahtarının süresi dolmuş. Yeni bir anahtar ekleyin.
          </AlertDescription>
        </Alert>
      </Demo>
      <Demo
        title="Rozetler"
        code={`<Badge>Yeni</Badge>
<Badge variant="secondary">production</Badge>
<Badge variant="outline">v2.4.0</Badge>
<Badge variant="destructive">Kritik</Badge>`}
      >
        <Badge>Yeni</Badge>
        <Badge variant="secondary">production</Badge>
        <Badge variant="outline">v2.4.0</Badge>
        <Badge variant="destructive">Kritik</Badge>
      </Demo>
      <Demo
        title="Bildirimler (toast)"
        description="Toaster uygulamanın kökünde bir kez yer alır; toast() her yerden çağrılır. Eylemin adını tekrarlayın: “Kaydet” → “Kaydedildi”."
        code={`// Uygulama kökünde bir kez
<Toaster position="bottom-right" />

import { toast } from "sonner";
toast.success("Proje ayarları kaydedildi");
toast.error("Bağlantı kurulamadı. Yeniden deneyin.");`}
      >
        <Button variant="outline" onClick={() => toast.success("Proje ayarları kaydedildi")}>
          Başarılı
        </Button>
        <Button variant="outline" onClick={() => toast.error("Bağlantı kurulamadı. Yeniden deneyin.")}>
          Hata
        </Button>
        <Button variant="outline" onClick={() => toast.warning("Kotanın %80'i doldu")}>
          Uyarı
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("KALEM-1B ayrıldı", {
              description: "Olaylar birkaç dakikada taşınır.",
              action: { label: "Aç", onClick: () => {} },
            })
          }
        >
          Eylemli
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
