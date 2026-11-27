import { CodeBlock } from "@kentos/components/common/code-block";
import { JsonViewer } from "@kentos/components/common/json-viewer";
import { type LogLevel, type LogLine, LogViewer } from "@kentos/components/common/log-viewer";
import { type StackException, StackTrace } from "@kentos/components/common/stack-trace";
import { Button } from "@kentos/components/ui/button";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Demo, Page } from "../demo";

const snippet = `using Sentry;

// Program.cs: send unhandled exceptions to izci
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseSentry(options =>
{
    options.Dsn = "https://anahtar@izci.kentos.gov.tr/42";
    options.TracesSampleRate = 0.2;
    options.Environment = "production";
});

var app = builder.Build();
app.MapGet("/", () => "Merhaba");
app.Run();`;

const payload = {
  event_id: "9f2c4e1a7b3d4c6e8a0b1c2d3e4f5a6b",
  level: "error",
  platform: "csharp",
  timestamp: "2026-11-27T09:42:18.512Z",
  release: "e-belediye@1.4.2",
  environment: "production",
  user: { id: "1842", email: "ayse.yilmaz@kentos.gov.tr", ip_address: "10.4.2.17" },
  request: {
    method: "POST",
    url: "https://e-belediye.kentos.gov.tr/api/odeme",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Linux; Android 15) Chrome/131.0",
    },
    data: { tutar: 1250.5, taksit: 3, kart: "[Filtered]" },
  },
  contexts: {
    os: { name: "Ubuntu", version: "24.04" },
    runtime: { name: ".NET", version: "9.0.1" },
  },
  tags: { modul: "odeme", sunucu: "app-03" },
  breadcrumbs: [
    { category: "http", message: "GET /api/sepet 200", level: "info" },
    { category: "db", message: "SELECT * FROM odemeler WHERE kullanici_id = @p0", level: "info" },
    { category: "http", message: "POST /api/odeme 500", level: "error" },
  ],
  extra: {
    note: "Ödeme sağlayıcısı zaman aşımına uğradı; yeniden deneme 3 kez başarısız oldu. Sağlayıcının durum sayfası olağan dışı bir şey bildirmiyor, bu yüzden sorun büyük olasılıkla ağ geçidindeki bağlantı havuzunun dolmasından kaynaklanıyor.",
    retries: 3,
    cached: false,
    traceId: null,
  },
};

const exceptions: StackException[] = [
  {
    type: "SocketException",
    module: "System.Net.Sockets",
    value: "Connection timed out (10.4.8.21:443)",
    frames: [
      { function: "Socket.Connect", filename: "Socket.cs", lineNo: 1203, package: "System.Net.Sockets" },
      {
        function: "HttpConnectionPool.ConnectAsync",
        filename: "HttpConnectionPool.cs",
        lineNo: 772,
        package: "System.Net.Http",
      },
    ],
  },
  {
    type: "PaymentGatewayException",
    module: "Kentos.Odeme",
    value: "Ödeme sağlayıcısına ulaşılamadı (3 deneme)",
    mechanism: { type: "AspNetCore", handled: false },
    frames: [
      {
        function: "Microsoft.AspNetCore.Server.Kestrel.Core.Internal.Http.HttpProtocol.ProcessRequests",
        filename: "HttpProtocol.cs",
        lineNo: 674,
        package: "Microsoft.AspNetCore.Server.Kestrel.Core",
      },
      {
        function: "Microsoft.AspNetCore.Routing.EndpointMiddleware.Invoke",
        filename: "EndpointMiddleware.cs",
        lineNo: 85,
        package: "Microsoft.AspNetCore.Routing",
      },
      {
        function: "Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.InvokeActionMethodAsync",
        filename: "ControllerActionInvoker.cs",
        lineNo: 412,
        package: "Microsoft.AspNetCore.Mvc.Core",
      },
      {
        function: "Kentos.Odeme.Api.OdemeController.Olustur",
        filename: "Api/OdemeController.cs",
        lineNo: 58,
        colNo: 13,
        inApp: true,
        context: {
          pre: [
            "    [HttpPost]",
            "    public async Task<IActionResult> Olustur(OdemeIstegi istek)",
            "    {",
            "        var sepet = await _sepetler.GetirAsync(istek.SepetId);",
          ],
          line: "        var sonuc = await _odeme.TahsilEtAsync(sepet, istek.Taksit);",
          post: ["        return Ok(sonuc);", "    }"],
        },
        vars: { istek: { SepetId: 88231, Taksit: 3 }, sepet: { Id: 88231, Tutar: 1250.5, Kalem: 4 } },
      },
      {
        function: "Kentos.Odeme.OdemeServisi.TahsilEtAsync",
        filename: "OdemeServisi.cs",
        lineNo: 112,
        colNo: 17,
        inApp: true,
        context: {
          pre: [
            "        for (var deneme = 1; deneme <= 3; deneme++)",
            "        {",
            "            try",
            "            {",
          ],
          line: '                return await _saglayici.CekAsync(sepet.Tutar, taksit, "TRY");',
          post: [
            "            }",
            "            catch (HttpRequestException) when (deneme < 3)",
            "            {",
          ],
        },
        vars: { deneme: 3, taksit: 3, tutar: 1250.5 },
      },
      {
        function: "System.Net.Http.HttpClient.SendAsync",
        filename: "HttpClient.cs",
        lineNo: 531,
        package: "System.Net.Http",
      },
      {
        function: "System.Net.Http.HttpConnectionPool.SendWithRetryAsync",
        filename: "HttpConnectionPool.cs",
        lineNo: 1102,
        package: "System.Net.Http",
      },
      {
        function: "System.Net.Http.HttpConnectionPool.GetHttp11ConnectionAsync",
        filename: "HttpConnectionPool.cs",
        lineNo: 498,
        package: "System.Net.Http",
      },
    ],
  },
];

const sources = ["api", "odeme", "kuyruk", "db", "auth"];
const messages: [LogLevel, string][] = [
  ["info", "GET /api/sepet 200 18ms"],
  ["debug", "cache hit sepet:88231"],
  ["info", "POST /api/odeme kabul edildi (sepet 88231, 3 taksit)"],
  ["warn", "ödeme sağlayıcısı yavaş yanıt verdi: 2.4s"],
  ["info", "kuyruk: 12 iş bekliyor, 4 işçi meşgul"],
  ["error", "HttpRequestException: Connection timed out (10.4.8.21:443) — deneme 2/3"],
  [
    "debug",
    "SELECT * FROM odemeler WHERE kullanici_id = @p0 AND durum IN ('bekliyor', 'islemde') ORDER BY olusturma DESC LIMIT 50",
  ],
  ["info", "oturum yenilendi: kullanıcı 1842"],
  ["fatal", "PaymentGatewayException: Ödeme sağlayıcısına ulaşılamadı (3 deneme)"],
];

function makeLine(i: number, at: number): LogLine {
  const [level, message] = messages[(i * 7 + (i >> 3)) % messages.length];
  return { id: i, time: at, level, source: sources[i % sources.length], message };
}

const start = Date.now() - 2_000 * 60_000;
const initialLines = Array.from({ length: 2000 }, (_, i) => makeLine(i, start + i * 60_000));

/** CodeBlock, JsonViewer, StackTrace and LogViewer. */
export function CodePage() {
  const [lines, setLines] = useState(initialLines);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => setLines((prev) => [...prev, makeLine(prev.length, Date.now())]), 700);
    return () => window.clearInterval(t);
  }, [live]);

  return (
    <Page
      title="Kod ve veri"
      description="Hata ayıklarken bakılan şeyler: kod parçaları, olay verisi, yığın izi ve günlükler. Kod renklendirmesi hafiftir (bir dilbilgisi kütüphanesi yüklenmez): yorum, metin, sayı, anahtar kelime ve tür adlarını ayırır. Renkler koyu temaya uyar."
    >
      <Demo
        title="Kod bloğu"
        description="Satır numarası (bir dosyanın ortasından başlayabilir), vurgulu satırlar, dosya adı başlığı, kopyalama ve satır kaydırma. Dil dosya adından anlaşılır; language ile verilebilir (js, ts, json, csharp, python, bash, go, sql, plain). Uzun bloklar maxHeight içinde kayar."
        className="grid w-full gap-4"
        code={`<CodeBlock code={snippet} filename="Program.cs" highlight={[5, 6, 7, 8, 9]} />
<CodeBlock code={'dotnet add package Sentry.AspNetCore'} language="bash" lineNumbers={false} />`}
      >
        <CodeBlock code={snippet} filename="Program.cs" highlight={[5, 6, 7, 8, 9]} />
        <CodeBlock code="dotnet add package Sentry.AspNetCore" language="bash" lineNumbers={false} />
      </Demo>

      <Demo
        title="JSON görüntüleyici"
        description="Olay verisi, istek bağlamı, yerel değişkenler. Nesne ve diziler açılıp kapanır; kapalıyken kaç anahtar ya da öğe içerdiği yazar. Uzun metinler kesilir, “Tamamını göster” ile açılır. Araç çubuğu her şeyi açar, kapatır ve JSON'u kopyalar."
        className="block w-full"
        code={`<JsonViewer value={event} label="Olay" defaultExpandDepth={1} />`}
      >
        <JsonViewer value={payload} label="Olay 9f2c4e1a" defaultExpandDepth={1} />
      </Demo>

      <Demo
        title="Yığın izi"
        description="Sentry olay verisindeki gibi istisnalar ve kareler (eskiden yeniye). Uygulama kareleri öne çıkar; art arda gelen kütüphane kareleri tek satıra katlanır. Bir kare açılınca kaynak kod (hatalı satır vurgulu) ve yerel değişkenler görünür. Varsayılan olarak en yeni kare üsttedir; ilk uygulama karesi açık başlar. Zincirli istisnalarda neden olan alttadır. “Ham” metin olarak gösterir."
        className="block w-full"
        code={`<StackTrace exceptions={event.exception.values} />`}
      >
        <StackTrace exceptions={exceptions} />
      </Demo>

      <Demo
        title="Günlük görüntüleyici"
        description="Binlerce satır; yalnızca görünenler çizilir. Seviye çipleri süzer, arama eşleşmeleri vurgular ve aralarında gezer (Enter, Shift+Enter). Alttayken yeni satırlar görünümü altta tutar; yukarı kaydırınca yeni satırları sayan bir düğme belirir."
        className="grid w-full gap-3"
        code={`<LogViewer lines={lines} height="28rem" />`}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLive((l) => !l)}>
            {live ? <PauseIcon /> : <PlayIcon />}
            {live ? "Akışı durdur" : "Canlı akış başlat"}
          </Button>
          <span className="text-muted-foreground text-sm tabular">
            {lines.length.toLocaleString("tr")} satır
          </span>
        </div>
        <LogViewer lines={lines} height="28rem" />
      </Demo>
    </Page>
  );
}
