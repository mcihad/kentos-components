import { dialogs } from "@kentos/components/common/dialog-host";
import {
  BusyDialog,
  ConfirmDialog,
  CountdownDialog,
  type DialogTone,
  InputDialog,
  LoadingDialog,
  MessageDialog,
  ProgressDialog,
  type ProgressStep,
} from "@kentos/components/common/dialogs";
import { Spinner } from "@kentos/components/common/spinner";
import { Button } from "@kentos/components/ui/button";
import { Progress } from "@kentos/components/ui/progress";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Demo, Page } from "../demo";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const messages: Record<
  Exclude<DialogTone, "neutral">,
  { title: string; description: string; label: string }
> = {
  info: {
    label: "Bilgi",
    title: "Bakım penceresi",
    description:
      "Pazar 02.00–02.30 arasında olay alımı kısa süre duraklayacak. Gelen olaylar kuyrukta bekler.",
  },
  success: {
    label: "Başarı",
    title: "Proje oluşturuldu",
    description: "DSN panoya kopyalandı. SDK'yı yapılandırıp ilk hatayı gönderin.",
  },
  warning: {
    label: "Uyarı",
    title: "Kotanın %90'ı doldu",
    description: "Kota dolunca yeni olaylar ay sonuna kadar reddedilir. Örneklemeyi açmayı düşünün.",
  },
  danger: {
    label: "Hata",
    title: "Kaynak eşlemeleri yüklenemedi",
    description:
      "Sürüm bulunamadı (v2.4.1). CLI ile yeniden yükleyin; yığın izleri o zamana kadar küçültülmüş görünür.",
  },
};

const importSteps = [
  "Dosya okunuyor",
  "Olaylar doğrulanıyor",
  "Hatalar gruplanıyor",
  "Dizinler güncelleniyor",
];

function useProgressRun(active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    setValue(0);
    const timer = window.setInterval(() => setValue((v) => Math.min(100, v + 4 + Math.random() * 6)), 220);
    return () => window.clearInterval(timer);
  }, [active]);
  return value;
}

/** Message, confirm, input, busy, progress, loading and countdown dialogs. */
export function DialogsPage() {
  const [message, setMessage] = useState<Exclude<DialogTone, "neutral"> | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [remove, setRemove] = useState(false);
  const [rename, setRename] = useState(false);
  const [name, setName] = useState("Kritik hatalar");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [countdown, setCountdown] = useState(false);
  const busyTimer = useRef(0);

  const value = useProgressRun(progress);
  const done = value >= 100;
  const steps: ProgressStep[] = importSteps.map((label, i) => {
    const at = (i / importSteps.length) * 100;
    const next = ((i + 1) / importSteps.length) * 100;
    return { label, state: value >= next ? "done" : value >= at ? "active" : "pending" };
  });

  useEffect(() => {
    if (!loading) return;
    setLoaded(false);
    const t = window.setTimeout(() => setLoaded(true), 1400);
    return () => window.clearTimeout(t);
  }, [loading]);

  return (
    <Page
      title="Diyaloglar"
      description="Kullanıcıdan karar, onay ya da bilgi isteyen pencereler ve uzun işleri gösteren engelleyici pencereler. Karar isteyenler dışarı tıklamayla kapanmaz; Esc her zaman güvenli seçeneği (vazgeç) seçer. Tümü telefonda da tam genişlikte, düğmeleri alt alta gösterir."
    >
      <Demo
        title="Mesaj (alert dialog)"
        description="Tek düğmeyle onaylanan bir bilgi. Ton simgeyi ve rengi belirler; danger tonunda düğme kırmızıdır. Sayfada kalabilecek mesajlar için diyalog yerine Alert kullanın."
        code={`<MessageDialog
  open={open}
  onOpenChange={setOpen}
  tone="warning"            // info | success | warning | danger | neutral
  title="Kotanın %90'ı doldu"
  description="Kota dolunca yeni olaylar ay sonuna kadar reddedilir."
  okLabel="Anladım"
/>`}
      >
        {(Object.keys(messages) as (keyof typeof messages)[]).map((tone) => (
          <Button key={tone} variant="outline" onClick={() => setMessage(tone)}>
            {messages[tone].label}
          </Button>
        ))}
        <MessageDialog
          open={message !== null}
          onOpenChange={(o) => !o && setMessage(null)}
          tone={message ?? "info"}
          title={message ? messages[message].title : ""}
          description={message ? messages[message].description : undefined}
          okLabel={message === "warning" ? "Anladım" : "Tamam"}
        />
      </Demo>

      <Demo
        title="Onay"
        description="İşlemden önce sorar. onConfirm bir promise döndürürse pencere açık kalır, düğmede dönen gösterge ve “Siliniyor…” görünür; hata olursa mesaj pencerede kalır. Geri alınamaz silmelerde confirmText ile adı yazdırın."
        code={`<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Hata çözüldü olarak işaretlensin mi?"
  description="Aynı hata yeniden gelirse otomatik olarak açılır."
  confirmLabel="Çözüldü işaretle"
  onConfirm={() => resolve.mutateAsync({ id })}
/>

<ConfirmDialog
  tone="danger"
  title="e-belediye projesi silinsin mi?"
  description="Bütün olaylar, hatalar ve anahtarlar kalıcı olarak silinir."
  confirmText="e-belediye"
  confirmLabel="Projeyi sil"
  pendingLabel="Siliniyor…"
  onConfirm={() => remove.mutateAsync({ id })}
  …
/>`}
      >
        <Button variant="outline" onClick={() => setConfirm(true)}>
          Onay iste
        </Button>
        <Button variant="destructive" onClick={() => setRemove(true)}>
          Projeyi sil
        </Button>
        <ConfirmDialog
          open={confirm}
          onOpenChange={setConfirm}
          title="Hata çözüldü olarak işaretlensin mi?"
          description="Aynı hata yeniden gelirse otomatik olarak açılır ve size bildirilir."
          confirmLabel="Çözüldü işaretle"
          pendingLabel="İşaretleniyor…"
          onConfirm={async () => {
            await wait(1200);
            toast.success("Hata çözüldü olarak işaretlendi");
          }}
        />
        <ConfirmDialog
          open={remove}
          onOpenChange={setRemove}
          tone="danger"
          title="e-belediye projesi silinsin mi?"
          description="Bütün olaylar, hatalar, anahtarlar ve kaynak eşlemeleri kalıcı olarak silinir. Bu işlem geri alınamaz."
          confirmText="e-belediye"
          confirmLabel="Projeyi sil"
          pendingLabel="Siliniyor…"
          onConfirm={async () => {
            await wait(1400);
            if (Math.random() < 0.5)
              throw new Error("Proje şu anda içe aktarma yapıyor. Bitince yeniden deneyin.");
            toast.success("Proje silindi");
          }}
        />
      </Demo>

      <Demo
        title="Girdi"
        description="Tek bir değer ister: ad, not, e-posta. validate bir hata cümlesi döndürür; boş değer zorunluysa kendiliğinden engellenir. multiline ile çok satırlı olur, maxLength sayaç gösterir."
        code={`<InputDialog
  open={open}
  onOpenChange={setOpen}
  title="Panoyu yeniden adlandır"
  label="Pano adı"
  defaultValue={dashboard.name}
  maxLength={60}
  validate={(v) => (v.length < 3 ? "Ad en az 3 karakter olmalı." : undefined)}
  onSubmit={(name) => save.mutateAsync({ id, name })}
/>`}
      >
        <Button variant="outline" onClick={() => setRename(true)}>
          Yeniden adlandır
        </Button>
        <span className="text-muted-foreground text-sm">
          Pano adı: <strong className="text-foreground">{name}</strong>
        </span>
        <InputDialog
          open={rename}
          onOpenChange={setRename}
          title="Panoyu yeniden adlandır"
          description="Ad, panoyu paylaştığınız herkes için değişir."
          label="Pano adı"
          defaultValue={name}
          maxLength={60}
          validate={(v) => (v.length < 3 ? "Ad en az 3 karakter olmalı." : undefined)}
          pendingLabel="Kaydediliyor…"
          onSubmit={async (v) => {
            await wait(800);
            setName(v);
            toast.success("Pano adı kaydedildi");
          }}
        />
      </Demo>

      <Demo
        title="Meşgul"
        description="Süresi bilinmeyen bir iş sürerken ekranı kilitler. onCancel verilmezse kapatılamaz; verilirse Esc ve düğme işi iptal eder."
        code={`<BusyDialog
  open={exporting}
  title="Rapor hazırlanıyor…"
  description="Büyük raporlar bir dakika kadar sürebilir."
  onCancel={() => controller.abort()}
/>`}
      >
        <Button
          variant="outline"
          onClick={() => {
            setBusy(true);
            busyTimer.current = window.setTimeout(() => {
              setBusy(false);
              toast.success("Rapor hazır");
            }, 2500);
          }}
        >
          Rapor hazırla
        </Button>
        <BusyDialog
          open={busy}
          title="Rapor hazırlanıyor…"
          description="Büyük raporlar bir dakika kadar sürebilir."
          onCancel={() => {
            window.clearTimeout(busyTimer.current);
            setBusy(false);
            toast("Rapor iptal edildi");
          }}
        />
      </Demo>

      <Demo
        title="İlerleme"
        description="Ölçülebilir işler: yüzde, durum satırı ve isteğe bağlı adım listesi. Bitince yeşile döner ve Kapat düğmesi çıkar; o zamana kadar yalnızca iptal edilebilir."
        code={`<ProgressDialog
  open={open}
  onOpenChange={setOpen}
  title="Olaylar içe aktarılıyor"
  value={imported}
  max={total}
  status={\`\${imported} / \${total} olay\`}
  steps={[{ label: "Dosya okunuyor", state: "done" }, { label: "Olaylar doğrulanıyor", state: "active" }, …]}
  done={imported === total}
  doneTitle="İçe aktarma tamamlandı"
  onCancel={cancel}
/>`}
      >
        <Button variant="outline" onClick={() => setProgress(true)}>
          İçe aktar
        </Button>
        <div className="grid w-full max-w-xs gap-2">
          <Progress value={62} aria-label="Örnek ilerleme" />
          <Progress value={null} aria-label="Belirsiz ilerleme" />
        </div>
        <ProgressDialog
          open={progress}
          onOpenChange={setProgress}
          title="Olaylar içe aktarılıyor"
          description="sentry-export-2026-11.json · 3.000 olay"
          value={value}
          status={
            done ? "3.000 olay aktarıldı" : `${Math.round(value * 30).toLocaleString("tr-TR")} / 3.000 olay`
          }
          steps={steps}
          done={done}
          doneTitle="İçe aktarma tamamlandı"
          onCancel={() => {
            setProgress(false);
            toast("İçe aktarma iptal edildi");
          }}
        />
      </Demo>

      <Demo
        title="Yükleniyor"
        description="İçeriği sonradan gelen bir pencere: yüklenene kadar içeriğin yerinde iskelet satırları durur. Pencere hemen açılır, kullanıcı beklediğini bilir."
        code={`<LoadingDialog
  open={open}
  onOpenChange={setOpen}
  title="KALEM-1B · olay ayrıntısı"
  loading={event.isPending}
  footer={<Button onClick={() => setOpen(false)}>Kapat</Button>}
>
  <EventSummary event={event.data} />
</LoadingDialog>`}
      >
        <Button variant="outline" onClick={() => setLoading(true)}>
          Olay ayrıntısını aç
        </Button>
        <LoadingDialog
          open={loading}
          onOpenChange={setLoading}
          title="KALEM-1B · olay ayrıntısı"
          description="NullReferenceException · Kent kart"
          loading={!loaded}
          footer={<Button onClick={() => setLoading(false)}>Kapat</Button>}
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <dt className="text-muted-foreground">Sürüm</dt>
            <dd>android@5.12.0</dd>
            <dt className="text-muted-foreground">Ortam</dt>
            <dd>production</dd>
            <dt className="text-muted-foreground">Müşteri</dt>
            <dd>Nilüfer Belediyesi</dd>
            <dt className="text-muted-foreground">Görülme</dt>
            <dd>4 dakika önce</dd>
          </dl>
        </LoadingDialog>
      </Demo>

      <Demo
        title="Geri sayım"
        description="Süre dolunca bir şey kendiliğinden olur: oturum kapanır, yönlendirme yapılır. Halka bütün süre boyunca akıcı biçimde boşalır; Esc ve ana düğme kullanıcıyı korur."
        code={`<CountdownDialog
  open={idle}
  onOpenChange={setIdle}
  seconds={30}
  title="Oturumunuz kapanmak üzere"
  description={(s) => \`Hareketsiz kaldığınız için \${s} saniye sonra çıkış yapılacak.\`}
  confirmLabel="Oturumda kal"
  cancelLabel="Şimdi çıkış yap"
  onConfirm={refreshSession}
  onCancel={logout}
  onElapsed={logout}
/>`}
      >
        <Button variant="outline" onClick={() => setCountdown(true)}>
          Oturum zaman aşımı
        </Button>
        <CountdownDialog
          open={countdown}
          onOpenChange={setCountdown}
          seconds={15}
          title="Oturumunuz kapanmak üzere"
          description={(s) => `Hareketsiz kaldığınız için ${s} saniye sonra çıkış yapılacak.`}
          confirmLabel="Oturumda kal"
          cancelLabel="Şimdi çıkış yap"
          onConfirm={() => toast.success("Oturum uzatıldı")}
          onCancel={() => toast("Çıkış yapıldı")}
          onElapsed={() => toast.warning("Süre doldu, çıkış yapıldı")}
        />
      </Demo>

      <Demo
        title="Komutla açma"
        description="Olay işleyicilerinde yalnızca cevap gerekiyorsa durum tutmadan çağırın. Uygulama kökünde <DialogHost /> bir kez yer alır; işlevler Promise ya da kapatılabilir bir tutamaç döndürür."
        code={`// Kökte bir kez
<DialogHost />

import { dialogs } from "@kentos/components/common/dialog-host";

if (await dialogs.confirm({ tone: "danger", title: "Pano silinsin mi?", confirmLabel: "Sil",
                            onConfirm: () => remove.mutateAsync({ id }) })) navigate("/dashboards");

const name = await dialogs.prompt({ title: "Yeni etiket", label: "Etiket" });   // string | null
await dialogs.alert({ tone: "success", title: "Dışa aktarma tamamlandı" });

const job = dialogs.busy("Önbellek temizleniyor…");
try { await purge(); } finally { job.close(); }

const p = dialogs.progress({ title: "Yükleniyor", value: 0 });
p.update({ value: 50, status: "2 / 4 dosya" });
p.done({ doneTitle: "Yükleme tamamlandı" });

const how = await dialogs.countdown({ seconds: 10, title: "Yönlendiriliyorsunuz",
                                      confirmLabel: "Burada kal" });  // "confirm" | "cancel" | "elapsed"`}
      >
        <Button
          variant="outline"
          onClick={async () => {
            const ok = await dialogs.confirm({
              tone: "danger",
              title: "Pano silinsin mi?",
              description: "Pano ve bileşenleri silinir; kayıtlı aramalar kalır.",
              confirmLabel: "Sil",
              pendingLabel: "Siliniyor…",
              onConfirm: () => wait(900),
            });
            toast(ok ? "Pano silindi" : "Vazgeçildi");
          }}
        >
          confirm()
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const tag = await dialogs.prompt({
              title: "Yeni etiket",
              label: "Etiket",
              placeholder: "ör. ödeme",
            });
            if (tag) toast.success(`“${tag}” etiketi eklendi`);
          }}
        >
          prompt()
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            void dialogs.alert({
              tone: "success",
              title: "Dışa aktarma tamamlandı",
              description: "CSV dosyası indirildi.",
            })
          }
        >
          alert()
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const job = dialogs.busy({ title: "Önbellek temizleniyor…" });
            await wait(1200);
            job.update({ title: "Dizinler yeniden kuruluyor…" });
            await wait(1200);
            job.close();
            toast.success("Önbellek temizlendi");
          }}
        >
          busy()
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const p = dialogs.progress({
              title: "Kaynak eşlemeleri yükleniyor",
              value: 0,
              status: "0 / 4 dosya",
            });
            for (let i = 1; i <= 4; i++) {
              await wait(600);
              p.update({ value: i * 25, status: `${i} / 4 dosya` });
            }
            p.done({ doneTitle: "Yükleme tamamlandı" });
          }}
        >
          progress()
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const how = await dialogs.countdown({
              seconds: 8,
              tone: "info",
              title: "Hata sayfasına yönlendiriliyorsunuz",
              description: (s) => `${s} saniye içinde birleştirilen hataya geçilecek.`,
              confirmLabel: "Şimdi git",
              cancelLabel: "Burada kal",
            });
            toast(
              how === "cancel"
                ? "Sayfada kalındı"
                : how === "elapsed"
                  ? "Süre doldu, yönlendirildi"
                  : "Yönlendirildi",
            );
          }}
        >
          countdown()
        </Button>
        <span className="inline-flex items-center gap-2 text-muted-foreground text-sm">
          <Spinner /> Spinner
        </span>
      </Demo>
    </Page>
  );
}
