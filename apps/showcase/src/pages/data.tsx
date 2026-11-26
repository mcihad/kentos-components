import { Sparkline } from "@kentos/components/charts/sparkline";
import { type BarLayer, type Point, StackedBars } from "@kentos/components/charts/stacked-bars";
import { CopyButton, SecretValue } from "@kentos/components/common/copy-button";
import { StatStrip } from "@kentos/components/common/stat-strip";
import { tdClass, thClass, theadClass, trClass } from "@kentos/components/common/table";
import { UserAvatar } from "@kentos/components/common/user-avatar";
import {
  formatBytes,
  formatCompact,
  formatDuration,
  formatNumber,
  formatPercent,
  formatRelative,
} from "@kentos/components/lib/format";
import { Avatar, AvatarFallback } from "@kentos/components/ui/avatar";
import { Badge } from "@kentos/components/ui/badge";
import { Demo, Page } from "../demo";

const hour = 3_600_000;
const start = Date.UTC(2026, 10, 25, 0);
function series(seed: number, scale: number): Point[] {
  return Array.from({ length: 24 }, (_, i) => ({
    t: new Date(start + i * hour),
    v: Math.max(0, Math.round((Math.sin((i + seed) / 3) + 1.2) * scale + ((i * seed) % 7))),
  }));
}
const layers: BarLayer[] = [
  { key: "accepted", label: "Kabul edilen", color: "var(--primary)", points: series(1, 40) },
  { key: "limited", label: "Reddedilen", color: "var(--status-warning-border)", points: series(4, 8) },
];

const rows = [
  { id: "KALEM-1A", title: "NullReferenceException", events: 1204, users: 88, status: "Açık" },
  { id: "KALEM-2C", title: "TimeoutException: ödeme sağlayıcısı", events: 342, users: 51, status: "Açık" },
  { id: "KALEM-3F", title: "Rapor oluşturulamadı", events: 12, users: 3, status: "Çözüldü" },
];

/** Numbers, tables, charts, avatars and copyable values. */
export function DataPage() {
  return (
    <Page
      title="Veri gösterimi"
      description="Sayılar tabular-nums ile hizalanır ve Türkçe biçimlenir (12.345, 1,2 B). Büyük sayıları formatCompact ile kısaltın; tam değeri title ya da ipucunda verin."
    >
      <Demo
        title="Sayı kartları"
        className="block"
        code={`<StatStrip stats={[
  { label: "Kabul edilen olay", value: formatCompact(48210), note: "kotanın %48'i" },
  { label: "Açık hata", value: "128" },
]} />`}
      >
        <StatStrip
          stats={[
            { label: "Kabul edilen olay", value: formatCompact(48_210), note: "Kasım 2026, kotanın %48'i" },
            { label: "Sınıra takılan", value: formatCompact(1_204) },
            { label: "Açık hata", value: "128", note: "son 14 gün" },
            { label: "Etkilenen kullanıcı", value: formatCompact(12_580) },
          ]}
        />
      </Demo>
      <Demo
        title="Tablo"
        description="table.ts tasarım sisteminin tablo sınıflarını verir: renkli başlık satırı, yoğunluğa uyan satır yüksekliği, sakin üzerine gelme."
        className="block p-0"
        code={`import { tdClass, thClass, theadClass, trClass } from "@kentos/components/common/table";

<table className="w-full text-sm">
  <thead className={theadClass}><tr><th className={thClass}>Hata</th></tr></thead>
  <tbody className="divide-y"><tr className={trClass}><td className={tdClass}>…</td></tr></tbody>
</table>`}
      >
        <table className="w-full text-sm">
          <thead className={theadClass}>
            <tr>
              <th className={thClass}>Hata</th>
              <th className={`${thClass} text-right`}>Olay</th>
              <th className={`${thClass} text-right`}>Kullanıcı</th>
              <th className={thClass}>Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id} className={trClass}>
                <td className={tdClass}>
                  <span className="font-mono text-muted-foreground text-xs">{r.id}</span> {r.title}
                </td>
                <td className={`${tdClass} text-right tabular`}>{formatNumber(r.events)}</td>
                <td className={`${tdClass} text-right tabular`}>{formatNumber(r.users)}</td>
                <td className={tdClass}>
                  <Badge variant={r.status === "Açık" ? "secondary" : "outline"}>{r.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Demo>
      <Demo
        title="Yığılmış çubuk grafik"
        description="Zaman serileri için; üzerine gelince kova ayrıntısı görünür. step kova genişliğidir (ms)."
        className="block"
        code={`<StackedBars height={180} step={3_600_000} layers={[
  { key: "accepted", label: "Kabul edilen", color: "var(--primary)", points },
]} />`}
      >
        <StackedBars height={180} step={hour} layers={layers} />
      </Demo>
      <Demo
        title="Mini grafik"
        description="Liste satırlarında eğilim göstermek için; boş kovalar silik çizgi olarak kalır."
        code={`<Sparkline points={points} label="Son 24 saatte 1.204 olay" />`}
      >
        <Sparkline points={series(2, 10)} />
        <Sparkline points={series(5, 3)} className="h-8 w-40 text-primary" />
      </Demo>
      <Demo
        title="Avatar"
        code={`<UserAvatar name="Ayşe Yılmaz" className="size-8" />
<UserAvatar name="Mehmet Kaya" src="/avatar.png" />`}
      >
        <UserAvatar name="Ayşe Yılmaz" className="size-8" />
        <UserAvatar name="Mehmet Kaya" className="size-8" />
        <UserAvatar name="İzci" />
        <Avatar>
          <AvatarFallback>KS</AvatarFallback>
        </Avatar>
      </Demo>
      <Demo
        title="Kopyalanabilir değerler"
        description="Anahtar, DSN ve kimlikler için; kopyalanınca bildirim gösterir."
        className="grid w-full max-w-lg gap-3"
        code={`<SecretValue value="izk_live_8f2a…" />
<CopyButton value="KALEM-1A" label="Kısa kimliği kopyala" />`}
      >
        <SecretValue value="https://izk_8f2a1c@izci.kentos.com.tr/42" />
        <span className="flex items-center gap-1 text-sm">
          KALEM-1A <CopyButton value="KALEM-1A" label="Kısa kimliği kopyala" />
        </span>
      </Demo>
      <Demo
        title="Biçimlendirme yardımcıları"
        description="lib/format Türkçe sayı, süre ve tarih biçimleri verir."
        className="grid w-full gap-1 font-mono text-sm"
        code={`formatNumber(12345)      // 12.345
formatCompact(1234567)   // 1,2 Mn
formatPercent(0.125)     // %12,5
formatBytes(1468006)     // 1,4 MB
formatDuration(192000)   // 3 dk 12 sn
formatRelative(date)     // 5 dk önce`}
      >
        <span>formatNumber(12345) → {formatNumber(12_345)}</span>
        <span>formatCompact(1234567) → {formatCompact(1_234_567)}</span>
        <span>formatPercent(0.125) → {formatPercent(0.125)}</span>
        <span>formatBytes(1468006) → {formatBytes(1_468_006)}</span>
        <span>formatDuration(192000) → {formatDuration(192_000)}</span>
        <span>formatRelative(5 dk önce) → {formatRelative(new Date(Date.now() - 300_000))}</span>
      </Demo>
    </Page>
  );
}
