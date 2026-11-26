import { type DataColumn, DataTable, type SortState } from "@kentos/components/common/data-table";
import { Pagination } from "@kentos/components/common/pagination";
import { EmptyState } from "@kentos/components/common/states";
import { formatNumber, formatRelative } from "@kentos/components/lib/format";
import { Badge } from "@kentos/components/ui/badge";
import { Button } from "@kentos/components/ui/button";
import { Input } from "@kentos/components/ui/input";
import { SearchIcon, SearchXIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Demo, Page } from "../demo";

type Project = {
  id: string;
  name: string;
  platform: string;
  events: number;
  errors: number;
  lastEvent: Date;
  owner: string;
};

const platforms = [".NET", "JavaScript", "Android", "iOS", "Go", "Python"];
const names = [
  "e-Belediye",
  "Su faturası",
  "Kent kart",
  "Ruhsat başvuru",
  "Mezarlık bilgi",
  "Zabıta mobil",
  "İmar durumu",
  "Çağrı merkezi",
  "Otopark",
  "Encümen",
  "Emlak vergisi",
  "Nikâh randevu",
];
const owners = ["Ayşe Yılmaz", "Mehmet Kaya", "Zeynep Demir", "Can Öztürk"];
const now = new Date("2026-11-26T09:00:00Z");

// A stable fake data set: 60 projects.
const all: Project[] = Array.from({ length: 60 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `${names[i % names.length]}${i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ""}`,
  platform: platforms[(i * 7) % platforms.length] ?? ".NET",
  events: ((i * 7919) % 48000) + 120,
  errors: (i * 37) % 53,
  lastEvent: new Date(now.getTime() - ((i * 977) % 7200) * 60_000),
  owner: owners[i % owners.length] ?? "",
}));

const columns: DataColumn<Project>[] = [
  { id: "name", header: "Proje", value: (p) => p.name, sortable: true, hideable: false, mobile: "title" },
  { id: "platform", header: "Platform", value: (p) => p.platform, sortable: true },
  {
    id: "errors",
    header: "Açık hata",
    value: (p) => p.errors,
    sortable: true,
    align: "end",
    cell: (p) =>
      p.errors > 30 ? (
        <Badge variant="danger" size="sm">
          {p.errors}
        </Badge>
      ) : (
        formatNumber(p.errors)
      ),
  },
  {
    id: "events",
    header: "Olay (24 sa)",
    value: (p) => p.events,
    sortable: true,
    align: "end",
    cell: (p) => formatNumber(p.events),
  },
  {
    id: "lastEvent",
    header: "Son olay",
    value: (p) => p.lastEvent,
    sortable: true,
    align: "end",
    cell: (p) => formatRelative(p.lastEvent, now.getTime()),
  },
  { id: "owner", header: "Sorumlu", value: (p) => p.owner, sortable: true, hidden: true },
];

// A fake server: sorts and pages after a short delay, like an API would.
function fetchPage(page: number, size: number, sort: SortState): Promise<{ rows: Project[]; total: number }> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const col = columns.find((c) => c.id === sort?.id);
      const rows = [...all];
      if (sort && col?.value) {
        const get = col.value;
        rows.sort((a, b) => {
          const x = get(a);
          const y = get(b);
          const r =
            x instanceof Date && y instanceof Date
              ? x.getTime() - y.getTime()
              : typeof x === "number" && typeof y === "number"
                ? x - y
                : String(x).localeCompare(String(y), "tr", { numeric: true });
          return sort.desc ? -r : r;
        });
      }
      resolve({ rows: rows.slice((page - 1) * size, page * size), total: rows.length });
    }, 650);
  });
}

function ServerTable({ mobile }: { mobile?: boolean }) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState<SortState>({ id: "events", desc: true });
  const [data, setData] = useState<{ rows: Project[]; total: number } | null>(null);
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    let live = true;
    setBusy(true);
    void fetchPage(page, size, sort).then((d) => {
      if (!live) return;
      setData(d);
      setBusy(false);
    });
    return () => {
      live = false;
    };
  }, [page, size, sort]);
  return (
    <DataTable
      caption="Projeler (sunucu)"
      columns={columns}
      rows={data?.rows ?? []}
      getRowId={(p) => p.id}
      manual
      sort={sort}
      onSortChange={(s) => {
        setSort(s);
        setPage(1);
      }}
      loading={!data}
      refreshing={busy && !!data}
      pagination={{
        page,
        onPageChange: setPage,
        pageSize: size,
        pageSizes: [10, 20, 50],
        onPageSizeChange: (s) => {
          setSize(s);
          setPage(1);
        },
        total: data?.total ?? 0,
      }}
      itemLabel="proje"
      mobile={mobile}
      className="w-full"
    />
  );
}

function CursorExample() {
  const [page, setPage] = useState(1);
  return (
    <Pagination page={page} onPageChange={setPage} pageSize={50} hasNextPage={page < 4} className="w-full" />
  );
}

/** The data table and pagination. */
export function DataTablePage() {
  const [q, setQ] = useState("");
  const [state, setState] = useState<"loading" | "empty" | "error">("loading");
  const filtered = useMemo(
    () =>
      all.filter((p) =>
        `${p.name} ${p.platform} ${p.owner}`
          .toLocaleLowerCase("tr")
          .includes(q.trim().toLocaleLowerCase("tr")),
      ),
    [q],
  );
  return (
    <Page
      title="Veri tablosu"
      description="Kayıtları göstermek için sade bir tablo; hesap tablosu değil. Sıralanabilir sütunlar, sütun seçici, sayfalama, yükleniyor ve boş durumları, satıra tıklama. Sıralama ve sayfalama tarayıcıda ya da sunucuda (manual) yapılır; telefonda satırlar karta dönüşür."
    >
      <Demo
        title="Tarayıcıda sıralama ve sayfalama"
        description="Başlığa tıklamak artan, azalan ve varsayılan sıra arasında geçer. Sütunlar menüsünden sütun gizlenir (Sorumlu varsayılan olarak gizli); seçim tarayıcıda hatırlanır. Arama, satırı süzer; sayfa kendiliğinden ilk sayfaya döner."
        className="block p-0 md:p-0"
        code={`const columns: DataColumn<Project>[] = [
  { id: "name", header: "Proje", value: (p) => p.name, sortable: true, hideable: false, mobile: "title" },
  { id: "errors", header: "Açık hata", value: (p) => p.errors, sortable: true, align: "end",
    cell: (p) => p.errors > 30 ? <Badge variant="danger" size="sm">{p.errors}</Badge> : formatNumber(p.errors) },
  { id: "lastEvent", header: "Son olay", value: (p) => p.lastEvent, sortable: true, align: "end",
    cell: (p) => formatRelative(p.lastEvent) },
  { id: "owner", header: "Sorumlu", value: (p) => p.owner, hidden: true },
];

<DataTable
  caption="Projeler"
  columns={columns}
  rows={filtered}
  getRowId={(p) => p.id}
  defaultSort={{ id: "errors", desc: true }}
  pageSize={10}
  pageSizes={[10, 20, 50]}
  itemLabel="proje"
  columnsStorageKey="projects-columns"
  toolbar={<Input placeholder="Proje ara" … />}
  onRowClick={(p) => open(p)}
/>`}
      >
        <DataTable
          caption="Projeler"
          columns={columns}
          rows={filtered}
          getRowId={(p) => p.id}
          defaultSort={{ id: "errors", desc: true }}
          pageSize={10}
          pageSizes={[10, 20, 50]}
          itemLabel="proje"
          columnsStorageKey="kentos-showcase-table-columns"
          onRowClick={(p) => toast(p.name)}
          className="rounded-none border-0"
          toolbar={
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Proje, platform ya da sorumlu"
                aria-label="Projelerde ara"
                className="h-(--control-h-sm) pl-8"
              />
            </div>
          }
          empty={
            <EmptyState icon={SearchXIcon} title="Eşleşen proje yok" className="py-12">
              Başka bir ad ya da platform deneyin.
            </EmptyState>
          }
        />
      </Demo>

      <Demo
        title="Sunucu tarafında sıralama ve sayfalama"
        description="manual ile tablo veriyi kendisi sıralamaz ve bölmez: kullanıcının seçtiği sırayı onSortChange, sayfayı pagination ile bildirir; uygulama isteği gönderir. İlk yüklemede iskelet satırlar, sonraki isteklerde satırlar soluklaşır ve denetimler bekler (refreshing). Bu örnekteki sahte sunucu 650 ms gecikmeyle yanıt verir."
        className="block p-0 md:p-0"
        code={`const [page, setPage] = useState(1);
const [sort, setSort] = useState<SortState>({ id: "events", desc: true });
const q = useQuery(listProjects, { page, pageSize: 10, sort });

<DataTable
  columns={columns}
  rows={q.data?.rows ?? []}
  getRowId={(p) => p.id}
  manual
  sort={sort}
  onSortChange={(s) => { setSort(s); setPage(1); }}
  loading={q.isPending}
  refreshing={q.isFetching && !q.isPending}
  pagination={{ page, onPageChange: setPage, pageSize: 10, total: q.data?.total ?? 0 }}
/>`}
      >
        <ServerTable />
      </Demo>

      <Demo
        title="Sayfalama"
        description="Toplam biliniyorsa sayfa numaraları, ilk/son düğmeleri ve “21–40 / 245” özeti gösterilir; telefonda numaralar “2 / 13” olur. Toplam bilinmiyorsa (sayfa belirteçli API'ler) yalnızca önceki ve sonraki vardır: hasNextPage."
        className="grid w-full gap-5"
        code={`<Pagination page={page} onPageChange={setPage} pageSize={20} total={245} itemLabel="hata" />
<Pagination page={page} onPageChange={setPage} pageSize={50} hasNextPage={!!data.nextPageToken} />`}
      >
        <NumberedExample />
        <CursorExample />
      </Demo>

      <Demo
        title="Durumlar"
        description="loading ilk yüklemede iskelet satırlar gösterir; empty satır yokken, error yükleme başarısız olunca tablonun yerine geçer."
        className="grid w-full gap-4"
        code={`<DataTable loading={q.isPending} error={q.error ? <ErrorState … /> : undefined} empty={<EmptyState … />} … />`}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={state === "loading" ? "secondary" : "ghost"}
            onClick={() => setState("loading")}
          >
            Yükleniyor
          </Button>
          <Button
            size="sm"
            variant={state === "empty" ? "secondary" : "ghost"}
            onClick={() => setState("empty")}
          >
            Boş
          </Button>
          <Button
            size="sm"
            variant={state === "error" ? "secondary" : "ghost"}
            onClick={() => setState("error")}
          >
            Hata
          </Button>
        </div>
        <DataTable
          columns={columns.slice(0, 4)}
          rows={[]}
          getRowId={(p) => p.id}
          loading={state === "loading"}
          error={
            state === "error" ? (
              <p className="text-(--status-danger-fg) text-sm">
                Projeler yüklenemedi. Bağlantınızı denetleyip yeniden deneyin.
              </p>
            ) : undefined
          }
          className="w-full"
        />
      </Demo>

      <Demo
        title="Telefon görünümü"
        description="Telefonda her satır bir karttır: başlık sütunu (mobile: &quot;title&quot;) üstte, diğerleri etiketleriyle altında; sıralama listenin üstündeki seçime taşınır. Bu örnek geniş ekranda da telefon düzenini göstermek için mobile ile zorlanmıştır."
        className="justify-center bg-sunken p-4 md:p-8"
        code={`<DataTable mobile … />   // normalde ekran genişliğine göre kendiliğinden`}
      >
        <div className="w-full max-w-[390px]">
          <ServerTable mobile />
        </div>
      </Demo>
    </Page>
  );
}

function NumberedExample() {
  const [page, setPage] = useState(7);
  const [size, setSize] = useState(20);
  return (
    <Pagination
      page={page}
      onPageChange={setPage}
      pageSize={size}
      pageSizes={[20, 50, 100]}
      onPageSizeChange={(s) => {
        setSize(s);
        setPage(1);
      }}
      total={245}
      itemLabel="hata"
      className="w-full"
    />
  );
}
