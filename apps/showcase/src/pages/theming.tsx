import { AppearancePanel } from "@kentos/components/common/appearance-panel";
import { useAppearance } from "@kentos/components/lib/theme";
import { Button } from "@kentos/components/ui/button";
import { Demo, Page } from "../demo";

/** The appearance choices and how applications wire them. */
export function ThemingPage() {
  const { appearance, resolved, resetAppearance } = useAppearance();
  return (
    <Page
      title="Görünüm ve temalar"
      description={
        <>
          Kullanıcı altı seçimle arayüzü kendine göre ayarlar. Her seçim{" "}
          <code className="font-mono">&lt;html&gt;</code> üzerinde bir sınıftır (
          <code className="font-mono">dark</code>, <code className="font-mono">font-inter</code>,{" "}
          <code className="font-mono">density-compact</code>, <code className="font-mono">radius-soft</code>,{" "}
          <code className="font-mono">accent-teal</code>, <code className="font-mono">elevation-raised</code>)
          ve tokenları değiştirir; bileşenlerde ek bir şey gerekmez.
        </>
      }
    >
      <Demo
        title="Görünüm paneli"
        description="AppearancePanel bütün seçimleri sunar; bir yan panele, diyaloğa ya da ayar sayfasına koyun."
        className="grid gap-6 lg:grid-cols-[22rem_1fr]"
        code={`import { AppearancePanel } from "@kentos/components/common/appearance-panel";

<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="right">
    <SheetTitle>Görünüm</SheetTitle>
    <AppearancePanel className="px-4 pb-6" />
  </SheetContent>
</Sheet>`}
      >
        <AppearancePanel className="card p-4" />
        <div className="grid content-start gap-3 text-sm">
          <p className="font-semibold">Geçerli seçimler</p>
          <pre className="rounded-md bg-sunken p-3 font-mono text-xs">
            {JSON.stringify({ ...appearance, resolved }, null, 2)}
          </pre>
          <div>
            <Button variant="outline" size="sm" onClick={resetAppearance}>
              Varsayılanlara dön
            </Button>
          </div>
        </div>
      </Demo>
      <Demo
        title="Uygulamaya bağlama"
        description="Seçimler localStorage'da saklanır. theme-init.js ilk boyamadan önce sınıfları uygular; böylece sayfa yanlış temada parlamaz. Anahtar her iki tarafta aynı olmalıdır."
        code={`<!-- index.html, <head> içinde -->
<script src="/theme-init.js" data-storage-key="benim-uygulamam-gorunum"></script>

// main.tsx, render etmeden önce
import { configureAppearance } from "@kentos/components/lib/theme";
configureAppearance({ storageKey: "benim-uygulamam-gorunum" });

// Herhangi bir bileşende
const { appearance, resolved, setAppearance } = useAppearance();
setAppearance({ mode: "dark", accent: "teal" });`}
      >
        <p className="text-muted-foreground text-sm">
          theme-init.js paketin <code className="font-mono">src/theme-init.js</code> dosyasıdır; uygulamanın{" "}
          <code className="font-mono">public/</code> klasörüne kopyalanır.
        </p>
      </Demo>
    </Page>
  );
}
