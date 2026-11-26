import { Field } from "@kentos/components/common/field";
import { Segmented } from "@kentos/components/common/segmented";
import { Checkbox } from "@kentos/components/ui/checkbox";
import { Input } from "@kentos/components/ui/input";
import { Label } from "@kentos/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@kentos/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@kentos/components/ui/select";
import { Switch } from "@kentos/components/ui/switch";
import { Textarea } from "@kentos/components/ui/textarea";
import { Toggle } from "@kentos/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@kentos/components/ui/toggle-group";
import { BoldIcon, ItalicIcon, ListIcon, TableIcon, UnderlineIcon } from "lucide-react";
import { useState } from "react";
import { Demo, Page } from "../demo";

/** Form controls and the Field wrapper. */
export function FormsPage() {
  const [view, setView] = useState<"list" | "table">("list");
  const [notify, setNotify] = useState(true);
  return (
    <Page
      title="Form elemanları"
      description={
        <>
          Her kontrol bir etiketle gelir; <code className="font-mono">Field</code> etiketi, kontrolü ve
          altındaki ipucunu ya da hata mesajını bir arada tutar. Hata mesajları ne olduğunu ve nasıl
          düzeltileceğini söyler. Form genişliği okunur kalması için{" "}
          <code className="font-mono">max-w-2xl</code> civarında tutulur.
        </>
      }
    >
      <Demo
        title="Metin alanları ve Field"
        className="grid w-full max-w-xl gap-4"
        code={`<Field label="Proje adı" htmlFor="name" hint="Hata kısa kimlikleri bu adla başlar.">
  <Input id="name" placeholder="Kalem" />
</Field>
<Field label="E-posta" htmlFor="email" error="Geçerli bir e-posta adresi yazın.">
  <Input id="email" type="email" aria-invalid />
</Field>
<Field label="Notlar" htmlFor="notes">
  <Textarea id="notes" />
</Field>`}
      >
        <Field label="Proje adı" htmlFor="f-name" hint="Hata kısa kimlikleri bu adla başlar.">
          <Input id="f-name" placeholder="Kalem" />
        </Field>
        <Field label="E-posta" htmlFor="f-email" error="Geçerli bir e-posta adresi yazın.">
          <Input id="f-email" type="email" defaultValue="ayse@" aria-invalid />
        </Field>
        <Field label="Notlar" htmlFor="f-notes">
          <Textarea id="f-notes" placeholder="Müşteriyle ilgili notlar" />
        </Field>
        <Field label="Devre dışı" htmlFor="f-off">
          <Input id="f-off" disabled defaultValue="Değiştirilemez" />
        </Field>
      </Demo>
      <Demo
        title="Seçim kutusu"
        className="grid w-full max-w-xl gap-4"
        code={`<Select defaultValue="production">
  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="production">production</SelectItem>
    <SelectItem value="staging">staging</SelectItem>
  </SelectContent>
</Select>`}
      >
        <Field label="Ortam">
          <Select defaultValue="production">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="production">production</SelectItem>
              <SelectItem value="staging">staging</SelectItem>
              <SelectItem value="development">development</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Demo>
      <Demo
        title="Onay kutusu, anahtar ve radyo grubu"
        description="Hemen etkili olan ayarlarda anahtar (Switch), formla kaydedilenlerde onay kutusu kullanın."
        className="grid gap-5"
        code={`<div className="flex items-center gap-2.5">
  <Checkbox id="mail" defaultChecked />
  <Label htmlFor="mail">Bağlantıyı e-postayla da gönder</Label>
</div>
<div className="flex items-center gap-2.5">
  <Switch id="notify" checked={notify} onCheckedChange={setNotify} />
  <Label htmlFor="notify">Bildirimleri aç</Label>
</div>
<RadioGroup defaultValue="full">
  <div className="flex items-center gap-2.5">
    <RadioGroupItem value="full" id="ip-full" />
    <Label htmlFor="ip-full">Tam adres</Label>
  </div>
</RadioGroup>`}
      >
        <div className="flex items-center gap-2.5">
          <Checkbox id="f-mail" defaultChecked />
          <Label htmlFor="f-mail" className="font-normal">
            Bağlantıyı e-postayla da gönder
          </Label>
        </div>
        <div className="flex items-center gap-2.5">
          <Switch id="f-notify" checked={notify} onCheckedChange={setNotify} />
          <Label htmlFor="f-notify" className="font-normal">
            Bildirimleri aç ({notify ? "açık" : "kapalı"})
          </Label>
        </div>
        <RadioGroup defaultValue="full" className="gap-2.5">
          {[
            ["full", "Tam adres"],
            ["anon", "Anonimleştirilmiş"],
            ["none", "Saklanmasın"],
          ].map(([v, l]) => (
            <div key={v} className="flex items-center gap-2.5">
              <RadioGroupItem value={v ?? ""} id={`f-ip-${v}`} />
              <Label htmlFor={`f-ip-${v}`} className="font-normal">
                {l}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Demo>
      <Demo
        title="Segment seçici"
        description="Segmented, birkaç seçenekten birini seçen yerel radyo düğmeleridir; klavyeyle ok tuşlarıyla gezilir."
        code={`<Segmented
  label="Görünüm"
  value={view}
  onChange={setView}
  options={[
    { value: "list", label: "Liste", icon: ListIcon },
    { value: "table", label: "Tablo", icon: TableIcon },
  ]}
/>`}
      >
        <Segmented
          label="Görünüm"
          value={view}
          onChange={setView}
          options={[
            { value: "list", label: "Liste", icon: ListIcon },
            { value: "table", label: "Tablo", icon: TableIcon },
          ]}
        />
      </Demo>
      <Demo
        title="Geçiş düğmeleri"
        code={`<Toggle aria-label="Kalın"><BoldIcon /></Toggle>
<ToggleGroup type="multiple" variant="outline">
  <ToggleGroupItem value="i" aria-label="İtalik"><ItalicIcon /></ToggleGroupItem>
  <ToggleGroupItem value="u" aria-label="Altı çizili"><UnderlineIcon /></ToggleGroupItem>
</ToggleGroup>`}
      >
        <Toggle aria-label="Kalın">
          <BoldIcon />
        </Toggle>
        <ToggleGroup type="multiple" variant="outline">
          <ToggleGroupItem value="i" aria-label="İtalik">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="u" aria-label="Altı çizili">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" variant="outline" defaultValue="person">
          <ToggleGroupItem value="person" className="px-4">
            Kişi
          </ToggleGroupItem>
          <ToggleGroupItem value="customer" className="px-4">
            Müşteri
          </ToggleGroupItem>
        </ToggleGroup>
      </Demo>
    </Page>
  );
}
