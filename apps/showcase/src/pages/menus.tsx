import { ActionContextMenu, ActionMenu, type MenuEntry } from "@kentos/components/common/action-menu";
import { Badge } from "@kentos/components/ui/badge";
import { Button } from "@kentos/components/ui/button";
import {
  ArchiveIcon,
  BellOffIcon,
  CheckIcon,
  CopyIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  FlagIcon,
  FolderInputIcon,
  LinkIcon,
  MousePointerClickIcon,
  PencilIcon,
  PinIcon,
  Share2Icon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Demo, Page } from "../demo";

const issues = [
  { id: "KALEM-1B", title: "NullReferenceException", project: "Kent kart", level: "Hata" },
  { id: "KALEM-2C", title: "TimeoutException: ödeme sağlayıcısı", project: "Su faturası", level: "Uyarı" },
  { id: "KALEM-3F", title: "Rapor oluşturulamadı", project: "e-Belediye", level: "Hata" },
];

function useEntries(subject: string): MenuEntry[] {
  const [pinned, setPinned] = useState(false);
  const [muted, setMuted] = useState(true);
  const [priority, setPriority] = useState("high");
  const say = (text: string) => () => toast(`${subject}: ${text}`);
  return [
    { type: "label", label: subject },
    { label: "Aç", icon: ExternalLinkIcon, shortcut: "↵", onSelect: say("açıldı") },
    { label: "Yeniden adlandır", icon: PencilIcon, shortcut: "E", onSelect: say("yeniden adlandır") },
    { label: "Bağlantıyı kopyala", icon: LinkIcon, shortcut: "⌘C", onSelect: say("bağlantı kopyalandı") },
    {
      type: "submenu",
      label: "Taşı",
      icon: FolderInputIcon,
      items: [
        { label: "Kent kart", onSelect: say("Kent kart'a taşındı") },
        { label: "Su faturası", onSelect: say("Su faturası'na taşındı") },
        { label: "e-Belediye", onSelect: say("e-Belediye'ye taşındı") },
      ],
    },
    {
      label: "Bana ata",
      icon: UserPlusIcon,
      description: "Ayşe Yılmaz olarak",
      onSelect: say("size atandı"),
    },
    { type: "separator" },
    { type: "checkbox", label: "Sabitle", icon: PinIcon, checked: pinned, onCheckedChange: setPinned },
    {
      type: "checkbox",
      label: "Bildirimleri sustur",
      icon: BellOffIcon,
      checked: muted,
      onCheckedChange: setMuted,
    },
    {
      type: "radio",
      label: "Öncelik",
      value: priority,
      onValueChange: setPriority,
      options: [
        { value: "high", label: "Yüksek", icon: FlagIcon },
        { value: "medium", label: "Orta" },
        { value: "low", label: "Düşük" },
      ],
    },
    { type: "separator" },
    { label: "Arşivle", icon: ArchiveIcon, onSelect: say("arşivlendi") },
    {
      label: "Sil",
      icon: Trash2Icon,
      variant: "destructive",
      description: "Geri alınamaz",
      shortcut: "⌫",
      onSelect: say("silme onayı istenir"),
    },
  ];
}

/** Dropdown, context and phone menus from one description. */
export function MenusPage() {
  const entries = useEntries("e-Belediye");
  const areaEntries = useEntries("Seçili alan");
  const rowEntries = [
    { label: "Aç", icon: ExternalLinkIcon, onSelect: () => toast("Açıldı") },
    { label: "Kopyala", icon: CopyIcon, shortcut: "⌘C", onSelect: () => toast("Kopyalandı") },
    { label: "Paylaş", icon: Share2Icon, onSelect: () => toast("Paylaşıldı") },
    { type: "separator" },
    { label: "Çözüldü işaretle", icon: CheckIcon, onSelect: () => toast("Çözüldü") },
  ] satisfies MenuEntry[];
  return (
    <Page
      title="Menüler"
      description="Açılır menü, sağ tık menüsü ve telefonda alttan açılan menü aynı tanımdan çizilir. Öğeler simge, açıklama ve kısayol taşır; onay kutuları, tekli seçimler, alt menüler ve tehlikeli işlemler desteklenir. Telefonda kısayollar gizlenir, alt menüler başlıklı gruplara, seçimler onay işaretine dönüşür."
    >
      <Demo
        title="Açılır menü"
        description="Bir düğmenin menüsü. Masaüstünde düğmeye hizalı açılır; klavyeyle oklar, Enter ve harflerle gezilir. Onay kutusu ve seçimler menüyü kapatmadan değişir."
        code={`const entries: MenuEntry[] = [
  { label: "Yeniden adlandır", icon: PencilIcon, shortcut: "E", onSelect: rename },
  { type: "submenu", label: "Taşı", icon: FolderInputIcon, items: [{ label: "Kent kart", onSelect: … }] },
  { type: "checkbox", label: "Sabitle", icon: PinIcon, checked: pinned, onCheckedChange: setPinned },
  { type: "radio", label: "Öncelik", value: priority, onValueChange: setPriority, options: [...] },
  { type: "separator" },
  { label: "Sil", icon: Trash2Icon, variant: "destructive", description: "Geri alınamaz", onSelect: remove },
];

<ActionMenu entries={entries} title="e-Belediye">
  <Button variant="outline" size="icon" aria-label="İşlemler"><EllipsisIcon /></Button>
</ActionMenu>`}
      >
        <ActionMenu entries={entries} title="e-Belediye" description="Proje işlemleri">
          <Button variant="outline">
            İşlemler
            <EllipsisIcon />
          </Button>
        </ActionMenu>
        <ActionMenu entries={entries} title="e-Belediye" description="Proje işlemleri" mobile>
          <Button variant="outline">Telefon görünümünde aç</Button>
        </ActionMenu>
      </Demo>

      <Demo
        title="Sağ tık menüsü"
        description="Bir alanın menüsü: masaüstünde sağ tık ya da menü tuşu, telefonda uzun basma. Uzun basınca hafif titreşim olur ve parmak kalkınca alttaki öğe ayrıca tıklanmış sayılmaz."
        className="block"
        code={`<ActionContextMenu entries={entries} title="KALEM-1B">
  <IssueRow … />
</ActionContextMenu>`}
      >
        <ActionContextMenu entries={areaEntries} title="Seçili alan" description="Sağ tık menüsü">
          <div className="grid h-36 place-items-center rounded-lg border-2 border-(--border-default) border-dashed text-muted-foreground text-sm">
            <span className="flex items-center gap-2">
              <MousePointerClickIcon className="size-4" />
              Sağ tıklayın (telefonda uzun basın)
            </span>
          </div>
        </ActionContextMenu>
      </Demo>

      <Demo
        title="Satırlarda"
        description="Liste ve tablolarda her satır kendi menüsünü taşıyabilir; sağ tık ve satır sonundaki “daha fazla” düğmesi aynı öğeleri açar."
        className="block p-0 md:p-0"
        code={`{issues.map((i) => (
  <ActionContextMenu key={i.id} entries={entriesFor(i)} title={i.id}>
    <div className="flex items-center gap-3 px-4 py-3">
      …
      <ActionMenu entries={entriesFor(i)} title={i.id}>
        <Button variant="ghost" size="icon-sm" aria-label={\`\${i.id} işlemleri\`}><EllipsisIcon /></Button>
      </ActionMenu>
    </div>
  </ActionContextMenu>
))}`}
      >
        <ul className="divide-y">
          {issues.map((i) => (
            <li key={i.id}>
              <ActionContextMenu entries={rowEntries} title={i.id} description={i.title}>
                <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-(--table-row-hover)">
                  <span className="font-medium font-mono text-sm">{i.id}</span>
                  <span className="min-w-0 flex-1 truncate">{i.title}</span>
                  <Badge
                    variant={i.level === "Hata" ? "danger" : "warning"}
                    size="sm"
                    className="max-sm:hidden"
                  >
                    {i.level}
                  </Badge>
                  <span className="text-muted-foreground text-sm max-md:hidden">{i.project}</span>
                  <ActionMenu entries={rowEntries} title={i.id} description={i.title}>
                    <Button variant="ghost" size="icon-sm" aria-label={`${i.id} işlemleri`}>
                      <EllipsisIcon />
                    </Button>
                  </ActionMenu>
                </div>
              </ActionContextMenu>
            </li>
          ))}
        </ul>
      </Demo>
    </Page>
  );
}
