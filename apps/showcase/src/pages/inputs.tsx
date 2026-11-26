import { Field } from "@kentos/components/common/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  NumberInput,
  PasswordInput,
  SearchInput,
} from "@kentos/components/common/input-group";
import { OtpInput } from "@kentos/components/common/otp-input";
import { Textarea } from "@kentos/components/ui/textarea";
import { AtSignIcon, CopyIcon, GlobeIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Demo, Page } from "../demo";

const districts = ["Seyhan", "Çukurova", "Yüreğir", "Sarıçam", "Karaisalı", "Ceyhan", "Kozan", "İmamoğlu"];

/** Inputs with addons and the ready-made search, password, number, textarea and code fields. */
export function InputsPage() {
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState<number | null>(1250.5);
  const [days, setDays] = useState<number | null>(30);
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const [invite, setInvite] = useState("");
  const [checked, setChecked] = useState<"idle" | "ok" | "bad">("idle");
  const matches = districts.filter((d) => d.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")));

  return (
    <Page
      title="Girdiler"
      description={
        <>
          Simgeli, ön ekli ya da içinde düğme olan alanlar <code className="font-mono">InputGroup</code> ile
          kurulur: kenarlık, odak halkası ve hatalı durum grubun üstündedir, içteki alan çıplak kalır. Arama,
          parola, sayı ve tek kullanımlık kod için hazır bileşenler vardır.
        </>
      }
    >
      <Demo
        title="Ekli alanlar"
        description="Başa ya da sona simge, metin veya küçük düğmeler eklenir. Alan hatalıysa (aria-invalid) bütün grup kırmızı çerçeve alır."
        className="grid w-full max-w-xl gap-4"
        code={`<InputGroup>
  <InputGroupAddon><GlobeIcon /></InputGroupAddon>
  <InputGroupInput placeholder="alt-alan" />
  <InputGroupAddon align="end">.kentos.dev</InputGroupAddon>
</InputGroup>

<InputGroup>
  <InputGroupAddon><MailIcon /></InputGroupAddon>
  <InputGroupInput type="email" aria-invalid />
</InputGroup>

<InputGroup>
  <InputGroupInput readOnly value={url} className="font-mono" />
  <InputGroupAddon align="end">
    <InputGroupButton aria-label="Kopyala" onClick={copy}><CopyIcon /></InputGroupButton>
  </InputGroupAddon>
</InputGroup>`}
      >
        <Field label="Adres" htmlFor="ig-host">
          <InputGroup>
            <InputGroupAddon>
              <GlobeIcon />
            </InputGroupAddon>
            <InputGroupInput id="ig-host" placeholder="alt-alan" />
            <InputGroupAddon align="end">.kentos.dev</InputGroupAddon>
          </InputGroup>
        </Field>
        <Field label="E-posta" htmlFor="ig-mail" error="Geçerli bir e-posta adresi yazın.">
          <InputGroup>
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput id="ig-mail" type="email" defaultValue="ayse@" aria-invalid />
          </InputGroup>
        </Field>
        <Field label="Kullanıcı adı" htmlFor="ig-user" hint="Bahsetmelerde @ ile birlikte görünür.">
          <InputGroup>
            <InputGroupAddon>
              <AtSignIcon />
            </InputGroupAddon>
            <InputGroupInput id="ig-user" placeholder="ayse.yilmaz" />
          </InputGroup>
        </Field>
        <Field label="Paylaşım bağlantısı" htmlFor="ig-link">
          <InputGroup>
            <InputGroupInput
              id="ig-link"
              readOnly
              value="https://izci.kentos.dev/s/7f3a9c"
              className="font-mono"
            />
            <InputGroupAddon align="end">
              <InputGroupButton
                aria-label="Bağlantıyı kopyala"
                onClick={() => toast.success("Bağlantı kopyalandı")}
              >
                <CopyIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field label="Devre dışı" htmlFor="ig-off">
          <InputGroup>
            <InputGroupAddon>
              <GlobeIcon />
            </InputGroupAddon>
            <InputGroupInput id="ig-off" disabled defaultValue="adana" />
            <InputGroupAddon align="end">.kentos.dev</InputGroupAddon>
          </InputGroup>
        </Field>
      </Demo>

      <Demo
        title="Arama alanı"
        description="Yazı varken temizle düğmesi çıkar; Escape de temizler. Boşken kısayol ipucu gösterilebilir (telefonda gizlenir)."
        className="grid w-full max-w-xl gap-3"
        code={`<SearchInput
  value={query}
  onValueChange={setQuery}
  placeholder="İlçe ara"
  shortcut="/"
  aria-label="İlçe ara"
/>`}
      >
        <SearchInput
          value={query}
          onValueChange={setQuery}
          placeholder="İlçe ara"
          shortcut="/"
          aria-label="İlçe ara"
        />
        <p className="text-muted-foreground text-sm">
          {matches.length ? matches.join(", ") : "Bu aramayla eşleşen ilçe yok."}
        </p>
      </Demo>

      <Demo
        title="Parola alanı"
        description="Göz düğmesi parolayı gösterir ya da gizler; düğme aria-pressed ile durumunu bildirir."
        className="grid w-full max-w-xl gap-4"
        code={`<Field label="Parola" htmlFor="password">
  <PasswordInput id="password" autoComplete="current-password" />
</Field>`}
      >
        <Field label="Parola" htmlFor="pw-current">
          <PasswordInput id="pw-current" autoComplete="current-password" defaultValue="örnek-parola" />
        </Field>
        <Field label="Yeni parola" htmlFor="pw-new" hint="En az 12 karakter.">
          <PasswordInput id="pw-new" autoComplete="new-password" />
        </Field>
      </Demo>

      <Demo
        title="Sayı alanı"
        description="− / + düğmeleri, ok tuşları (Shift ile ×10), Türkçe ondalık virgül ve alan bırakılınca min/max sınırına çekme. Boş değer null'dur."
        className="grid w-full max-w-xl gap-4 sm:grid-cols-2"
        code={`<NumberInput value={amount} onValueChange={setAmount} min={0} step={50} prefix="₺" />
<NumberInput value={days} onValueChange={setDays} min={1} max={90} suffix="gün" />`}
      >
        <Field label="Tutar" htmlFor="num-amount" hint={amount === null ? "Boş" : `Değer: ${amount}`}>
          <NumberInput
            id="num-amount"
            value={amount}
            onValueChange={setAmount}
            min={0}
            step={50}
            prefix="₺"
          />
        </Field>
        <Field label="Saklama süresi" htmlFor="num-days" hint="1 ile 90 gün arası.">
          <NumberInput id="num-days" value={days} onValueChange={setDays} min={1} max={90} suffix="gün" />
        </Field>
      </Demo>

      <Demo
        title="Uzayan metin alanı"
        description="Textarea yazdıkça uzar; minRows başlangıç, maxRows en çok yüksekliktir (sonrası kaydırılır). showCount altına karakter sayacı koyar; sınıra yaklaşınca uyarı rengine döner."
        className="grid w-full max-w-xl gap-4"
        code={`<Textarea minRows={2} maxRows={6} placeholder="Notunuzu yazın" />
<Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} showCount />`}
      >
        <Field label="Not" htmlFor="ta-grow" hint="2 satırdan başlar, 6 satırdan sonra kayar.">
          <Textarea id="ta-grow" minRows={2} maxRows={6} placeholder="Müşteriyle ilgili notlar" />
        </Field>
        <Field label="Kısa açıklama" htmlFor="ta-count">
          <Textarea
            id="ta-count"
            minRows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={140}
            showCount
            placeholder="En çok 140 karakter"
          />
        </Field>
      </Demo>

      <Demo
        title="Tek kullanımlık kod"
        description="Kutular aslında tek bir alandır: yazmak, kodun tamamını yapıştırmak, telefonun SMS'ten otomatik doldurması ve geri silme olağan alandaki gibi çalışır. Son karakter girilince onComplete çağrılır."
        className="grid gap-5"
        code={`<OtpInput
  value={code}
  onValueChange={setCode}
  onComplete={verify}
  groupSize={3}
  aria-label="Doğrulama kodu"
/>
<OtpInput length={8} mode="alphanumeric" value={invite} onValueChange={setInvite} groupSize={4} />`}
      >
        <Field
          label="Doğrulama kodu"
          htmlFor="otp-2fa"
          hint={checked === "ok" ? "Kod doğrulandı." : "Doğru kod: 123456"}
          error={checked === "bad" ? "Kod hatalı. Uygulamadaki güncel kodu yazın." : undefined}
        >
          <OtpInput
            id="otp-2fa"
            value={code}
            onValueChange={(v) => {
              setCode(v);
              setChecked("idle");
            }}
            onComplete={(v) => setChecked(v === "123456" ? "ok" : "bad")}
            groupSize={3}
            aria-invalid={checked === "bad" || undefined}
          />
        </Field>
        <Field label="Davet kodu" htmlFor="otp-invite" hint="Harf ve rakam; küçük harfler büyütülür.">
          <OtpInput
            id="otp-invite"
            length={8}
            mode="alphanumeric"
            value={invite}
            onValueChange={setInvite}
            groupSize={4}
          />
        </Field>
        <Field label="Devre dışı" htmlFor="otp-off">
          <OtpInput id="otp-off" length={4} value="42" onValueChange={() => {}} disabled />
        </Field>
      </Demo>
    </Page>
  );
}
