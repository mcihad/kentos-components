import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@kentos/components/common/drawer";
import { Field } from "@kentos/components/common/field";
import { Badge } from "@kentos/components/ui/badge";
import { Button } from "@kentos/components/ui/button";
import { Checkbox } from "@kentos/components/ui/checkbox";
import { Input } from "@kentos/components/ui/input";
import { Label } from "@kentos/components/ui/label";
import { Textarea } from "@kentos/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Demo, Page } from "../demo";

const logLines = [
  "09:41:02 INFO  ingest: 128 olay kabul edildi (e-belediye)",
  "09:41:03 WARN  ratelimit: kent-kart dakikalık sınırın %85'inde",
  "09:41:05 INFO  grouping: 3 yeni hata, 41 mevcut hataya eklendi",
  "09:41:07 ERROR symbolicate: android@5.12.0 için sembol dosyası yok",
  "09:41:09 INFO  alerts: 2 kural tetiklendi, Telegram'a gönderildi",
  "09:41:12 INFO  ingest: 96 olay kabul edildi (su-faturasi)",
];

function IssueDetails() {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
      <dt className="text-muted-foreground">Durum</dt>
      <dd>
        <Badge variant="danger" dot>
          Çözülmedi
        </Badge>
      </dd>
      <dt className="text-muted-foreground">Proje</dt>
      <dd>Kent kart · Android</dd>
      <dt className="text-muted-foreground">İlk görülme</dt>
      <dd>3 gün önce</dd>
      <dt className="text-muted-foreground">Son görülme</dt>
      <dd>4 dakika önce</dd>
      <dt className="text-muted-foreground">Olay</dt>
      <dd className="tabular">1.204</dd>
      <dt className="text-muted-foreground">Etkilenen müşteri</dt>
      <dd>Nilüfer Belediyesi, Osmangazi Belediyesi ve 4 kurum daha</dd>
      <dt className="text-muted-foreground">Kalıp</dt>
      <dd className="font-mono text-xs leading-relaxed">
        java.lang.NullPointerException: Attempt to invoke virtual method 'String Card.getId()' on a null
        object reference
      </dd>
    </dl>
  );
}

/** Drawers from every edge, resizable and non-modal. */
export function DrawerPage() {
  const [inspector, setInspector] = useState(false);
  return (
    <Page
      title="Çekmece"
      description="Kenardan kayarak açılan panel: listenin yanında ayrıntı, süzgeç paneli, form ya da günlük. Telefonda yan çekmeceler alttan açılan, aşağı çekilerek kapanan bir sayfaya dönüşür. İsteğe bağlı olarak kullanıcı boyutunu değiştirebilir; masaüstünde kenardaki tutamaçla (ok tuşları da çalışır), alt çekmecede tutamacı yukarı çekerek."
    >
      <Demo
        title="Sağdan, boyutu ayarlanabilir"
        description="Kenardaki tutamacı sürükleyin ya da odaklayıp ok tuşlarını kullanın (Shift ile büyük adım, Home/End uçlar); çift tıklama varsayılan genişliğe döndürür. sizeStorageKey genişliği bu tarayıcıda hatırlar. Telefonda alttan açılır."
        code={`<Drawer>
  <DrawerTrigger asChild><Button variant="outline">Hata ayrıntısı</Button></DrawerTrigger>
  <DrawerContent side="right" size="md" resizable sizeStorageKey="issue-drawer">
    <DrawerHeader>
      <DrawerTitle>KALEM-1B</DrawerTitle>
      <DrawerDescription>NullPointerException · Kent kart</DrawerDescription>
    </DrawerHeader>
    <DrawerBody>…</DrawerBody>
    <DrawerFooter>
      <DrawerClose asChild><Button variant="outline">Kapat</Button></DrawerClose>
      <Button>Çözüldü işaretle</Button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`}
      >
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Hata ayrıntısı</Button>
          </DrawerTrigger>
          <DrawerContent side="right" size="md" resizable sizeStorageKey="kentos-showcase-drawer">
            <DrawerHeader>
              <DrawerTitle>KALEM-1B</DrawerTitle>
              <DrawerDescription>NullPointerException · Kent kart</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <IssueDetails />
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Kapat</Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button onClick={() => toast.success("Hata çözüldü olarak işaretlendi")}>
                  Çözüldü işaretle
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Demo>

      <Demo
        title="Soldan ve üstten"
        description="Soldan açılan çekmece telefonda da soldan kalabilir (mobileSide=&quot;same&quot;): menüler için. Üstten açılan çekmece kısa süzgeç ya da arama alanları içindir."
        code={`<DrawerContent side="left" size="sm" mobileSide="same">…</DrawerContent>
<DrawerContent side="top" size="auto">…</DrawerContent>`}
      >
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Soldan süzgeçler</Button>
          </DrawerTrigger>
          <DrawerContent side="left" size="sm" mobileSide="same">
            <DrawerHeader>
              <DrawerTitle>Süzgeçler</DrawerTitle>
              <DrawerDescription>Hata listesini daraltın.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody className="grid content-start gap-4">
              {["Çözülmedi", "Gerileme", "Bana atananlar", "Son 24 saat"].map((f, i) => (
                <div key={f} className="flex items-center gap-2.5">
                  <Checkbox id={`f-${i}`} defaultChecked={i < 2} />
                  <Label htmlFor={`f-${i}`} className="font-normal">
                    {f}
                  </Label>
                </div>
              ))}
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Uygula</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Üstten arama</Button>
          </DrawerTrigger>
          <DrawerContent side="top" size="auto">
            <DrawerHeader>
              <DrawerTitle>Hızlı arama</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <Input placeholder="Hata, proje ya da müşteri" autoFocus />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Demo>

      <Demo
        title="Alttan, büyütülebilir"
        description="Alt çekmecenin tutamacı yukarı çekilince büyür (ekranın %92'sine kadar), aşağı çekilince önce eski boyuna döner, sonra kapanır; hızlı bir aşağı fırlatma da kapatır. Günlük ve sonuç panelleri için."
        code={`<DrawerContent side="bottom" size="sm" resizable>
  <DrawerHeader><DrawerTitle>Canlı günlük</DrawerTitle></DrawerHeader>
  <DrawerBody>…</DrawerBody>
</DrawerContent>`}
      >
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Canlı günlük</Button>
          </DrawerTrigger>
          <DrawerContent side="bottom" size="sm" resizable>
            <DrawerHeader>
              <DrawerTitle>Canlı günlük</DrawerTitle>
              <DrawerDescription>Tutamacı yukarı çekerek büyütün.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody className="font-mono text-xs leading-relaxed">
              {[...logLines, ...logLines, ...logLines].map((l, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: log lines repeat.
                <p key={i} className={l.includes("ERROR") ? "text-destructive" : undefined}>
                  {l}
                </p>
              ))}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Demo>

      <Demo
        title="Modal olmayan inceleme paneli"
        description="modal={false} sayfayı karartmaz ve kilitlemez: panel açıkken arkadaki liste kullanılabilir. Dışarı tıklayınca kapanmaması için onInteractOutside engellenir; panel Esc ya da kapat düğmesiyle kapanır."
        code={`<Drawer modal={false} open={open} onOpenChange={setOpen}>
  <DrawerContent side="right" size="sm" resizable onInteractOutside={(e) => e.preventDefault()}>
    …
  </DrawerContent>
</Drawer>`}
      >
        <Button variant="outline" onClick={() => setInspector(!inspector)}>
          {inspector ? "Paneli kapat" : "İnceleme panelini aç"}
        </Button>
        <Drawer modal={false} open={inspector} onOpenChange={setInspector}>
          <DrawerContent
            side="right"
            size="sm"
            resizable
            onInteractOutside={(e) => e.preventDefault()}
            className="shadow-(--shadow-lg)"
          >
            <DrawerHeader>
              <DrawerTitle>Olay #8f2a1c</DrawerTitle>
              <DrawerDescription>Sayfa kullanılabilir durumda.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody className="grid content-start gap-4">
              <Field label="Not" htmlFor="ins-note">
                <Textarea id="ins-note" rows={4} placeholder="Bu olay için not" />
              </Field>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Demo>

      <Demo
        title="Telefon görünümü"
        description="Telefonda sağ ve sol çekmeceler alttan açılır (mobileSide), içerik kadar yükselir (mobileSize=&quot;auto&quot;) ve tutamaçtan aşağı çekilerek kapanır. Bu örnek geniş ekranda da telefon düzenini göstermek için mobile ile zorlanmıştır."
        code={`<DrawerContent side="right" mobileSide="bottom" mobileSize="auto">…</DrawerContent>`}
      >
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Telefonda ayrıntı</Button>
          </DrawerTrigger>
          <DrawerContent side="right" mobile resizable>
            <DrawerHeader>
              <DrawerTitle>KALEM-1B</DrawerTitle>
              <DrawerDescription>NullPointerException · Kent kart</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <IssueDetails />
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Kapat</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Demo>
    </Page>
  );
}
