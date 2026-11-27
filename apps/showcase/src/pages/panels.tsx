import { RelativeTime } from "@kentos/components/common/relative-time";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@kentos/components/common/resizable";
import { VirtualList, type VirtualListHandle } from "@kentos/components/common/virtual-list";
import { Badge } from "@kentos/components/ui/badge";
import { Button } from "@kentos/components/ui/button";
import { BugIcon, FolderIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Demo, Page } from "../demo";

type Issue = {
  id: number;
  title: string;
  culprit: string;
  events: number;
  at: number;
  level: "error" | "warning";
};

const titles = [
  "NullReferenceException: Object reference not set to an instance of an object",
  "TimeoutException: Ödeme sağlayıcısı yanıt vermedi",
  "TypeError: Cannot read properties of undefined (reading 'tutar')",
  "SqlException: Deadlock victim",
  "HttpRequestException: 502 Bad Gateway",
  "ChunkLoadError: Loading chunk 41 failed",
];
const culprits = [
  "OdemeServisi.TahsilEtAsync",
  "SepetController.Getir",
  "src/pages/odeme.tsx",
  "AboneRepository.Kaydet",
];

const now = Date.now();
function makeIssues(from: number, count: number): Issue[] {
  return Array.from({ length: count }, (_, k) => {
    const i = from + k;
    return {
      id: i + 1,
      title: titles[(i * 5) % titles.length],
      culprit: culprits[i % culprits.length],
      events: ((i * 7919) % 4000) + 1,
      at: now - i * 97_000,
      level: i % 3 === 0 ? "warning" : "error",
    };
  });
}

function IssueRow({
  issue,
  selected,
  onSelect,
}: {
  issue: Issue;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex w-full items-start gap-3 px-3 py-2.5 text-left outline-none hover:bg-(--surface-hover) focus-visible:shadow-[inset_var(--focus-shadow)] aria-pressed:bg-(--surface-brand-subtle)"
    >
      <BugIcon
        aria-hidden
        className={
          issue.level === "error"
            ? "mt-0.5 size-4 shrink-0 text-(--status-danger-fg)"
            : "mt-0.5 size-4 shrink-0 text-(--status-warning-fg)"
        }
      />
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="truncate font-medium text-sm text-strong">{issue.title}</span>
        <span className="truncate font-mono text-muted-foreground text-xs">{issue.culprit}</span>
      </span>
      <span className="grid shrink-0 justify-items-end gap-0.5 text-xs">
        <span className="tabular font-medium">{issue.events.toLocaleString("tr")}</span>
        <RelativeTime date={issue.at} tooltip={false} className="text-muted-foreground" />
      </span>
    </button>
  );
}

/** ResizablePanelGroup and VirtualList. */
export function PanelsPage() {
  const [selected, setSelected] = useState(1);
  const [issues, setIssues] = useState(() => makeIssues(0, 200));
  const [loading, setLoading] = useState(false);
  const list = useRef<VirtualListHandle>(null);
  const big = useRef(makeIssues(0, 10_000));
  const current = issues.find((i) => i.id === selected) ?? issues[0];

  const loadMore = useCallback(() => {
    if (issues.length >= 1000) return;
    setLoading(true);
    window.setTimeout(() => {
      setIssues((prev) => [...prev, ...makeIssues(prev.length, 100)]);
      setLoading(false);
    }, 900);
  }, [issues.length]);

  return (
    <Page
      title="Paneller ve uzun listeler"
      description="Yan yana, sürüklenerek boyutlandırılan paneller (liste ve ayrıntısı) ve yalnızca görünen satırları çizen uzun listeler."
    >
      <Demo
        title="Boyutlandırılabilir paneller"
        description="Paneller arasındaki çizgi sürüklenir ya da odaklanıp ok tuşlarıyla taşınır (Shift ile büyük adım); Home/End sınırlara gider, Enter daraltılabilir komşuyu kapatıp açar, çift tıklama varsayılana döner. minSize, maxSize ve collapsible panel başına ayarlanır; storageKey boyutları tarayıcıda hatırlar. Telefonda paneller alt alta dizilir."
        className="block w-full"
        code={`<ResizablePanelGroup direction="horizontal" storageKey="issues-split" className="h-[28rem]">
  <ResizablePanel defaultSize={22} minSize={14} collapsible>…projeler…</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={38} minSize={25}>…hatalar…</ResizablePanel>
  <ResizableHandle withGrip />
  <ResizablePanel minSize={25}>…ayrıntı…</ResizablePanel>
</ResizablePanelGroup>`}
      >
        <ResizablePanelGroup
          direction="horizontal"
          storageKey="kentos-showcase-split"
          className="h-[28rem] overflow-hidden rounded-lg border max-md:h-auto"
        >
          <ResizablePanel defaultSize={22} minSize={14} collapsible className="bg-(--surface-muted)/50">
            <div className="grid grid-cols-[minmax(0,1fr)] gap-0.5 p-2 text-sm">
              <p className="px-2 py-1.5 font-semibold text-muted-foreground text-xs">Projeler</p>
              {["e-Belediye", "Mobil uygulama", "Ödeme ağ geçidi", "Abone portalı"].map((p, i) => (
                <span
                  key={p}
                  className={
                    i === 0
                      ? "flex items-center gap-2 rounded-md bg-(--surface-brand-subtle) px-2 py-1.5 font-medium text-(--text-brand)"
                      : "flex items-center gap-2 rounded-md px-2 py-1.5"
                  }
                >
                  <FolderIcon aria-hidden className="size-4 shrink-0" />
                  <span className="min-w-0 truncate">{p}</span>
                </span>
              ))}
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={38} minSize={25} className="max-md:max-h-80 max-md:border-y">
            <ul className="divide-y">
              {issues.slice(0, 30).map((issue) => (
                <li key={issue.id}>
                  <IssueRow
                    issue={issue}
                    selected={issue.id === selected}
                    onSelect={() => setSelected(issue.id)}
                  />
                </li>
              ))}
            </ul>
          </ResizablePanel>
          <ResizableHandle withGrip />
          <ResizablePanel minSize={25}>
            <div className="grid gap-3 p-4">
              <Badge variant={current.level === "error" ? "danger" : "warning"} className="w-fit">
                {current.level === "error" ? "Hata" : "Uyarı"}
              </Badge>
              <h3 className="font-semibold text-strong text-base leading-snug">{current.title}</h3>
              <p className="font-mono text-muted-foreground text-sm">{current.culprit}</p>
              <p className="text-sm">
                <span className="tabular font-medium">{current.events.toLocaleString("tr")}</span> olay · son{" "}
                <RelativeTime date={current.at} />
              </p>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Demo>

      <Demo
        title="Sanal liste"
        description="Binlerce satır; yalnızca görünenler ve birkaç komşusu çizilir. Satır yüksekliği serbesttir, çizildikten sonra ölçülür. Sona yaklaşınca onEndReached çağrılır (sonraki sayfa); loading son satırın altında bir yükleniyor satırı gösterir. listRef ile bir satıra kaydırılır."
        className="grid w-full gap-6 lg:grid-cols-2"
        code={`<VirtualList
  items={issues}
  getKey={(i) => i.id}
  estimateSize={58}
  height="24rem"
  divided
  label="Hatalar"
  renderItem={(issue) => <IssueRow issue={issue} />}
  onEndReached={fetchNextPage}
  loading={isFetchingNextPage}
/>`}
      >
        <div className="grid gap-2">
          <p className="text-muted-foreground text-sm">
            Sayfa sayfa yükleme: <span className="tabular font-medium text-foreground">{issues.length}</span>{" "}
            / 1.000
          </p>
          <VirtualList
            items={issues}
            getKey={(i) => i.id}
            estimateSize={58}
            height="24rem"
            divided
            label="Hatalar (sayfalı)"
            className="rounded-lg border"
            renderItem={(issue) => <IssueRow issue={issue} />}
            onEndReached={loadMore}
            loading={loading}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">10.000 satır</p>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={() => list.current?.scrollToIndex(0, "start")}>
                Başa
              </Button>
              <Button variant="outline" size="sm" onClick={() => list.current?.scrollToIndex(4999, "center")}>
                5.000. satır
              </Button>
              <Button variant="outline" size="sm" onClick={() => list.current?.scrollToIndex(9999, "end")}>
                Sona
              </Button>
            </div>
          </div>
          <VirtualList
            listRef={list}
            items={big.current}
            getKey={(i) => i.id}
            estimateSize={58}
            height="24rem"
            divided
            label="Hatalar (10.000)"
            className="rounded-lg border"
            renderItem={(issue, index) => (
              <div className="flex items-center">
                <span className="w-14 shrink-0 pl-3 text-right text-subtle text-xs tabular">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <IssueRow issue={issue} />
                </div>
              </div>
            )}
          />
        </div>
      </Demo>
    </Page>
  );
}
