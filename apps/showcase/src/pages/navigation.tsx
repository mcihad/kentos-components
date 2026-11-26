import { Kbd } from "@kentos/components/common/kbd";
import { Button } from "@kentos/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@kentos/components/ui/collapsible";
import { ScrollArea } from "@kentos/components/ui/scroll-area";
import { Separator } from "@kentos/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kentos/components/ui/tabs";
import { ChevronsUpDownIcon } from "lucide-react";
import { Demo, Page } from "../demo";

/** Tabs, collapsibles, scroll areas, separators and keys. */
export function NavigationPage() {
  return (
    <Page
      title="Gezinme ve düzen"
      description="Bir sayfanın bölümlerini düzenleyen bileşenler. Bölüm sekmeleri adres çubuğunda tutulmalıdır (ör. ?tab=uyeler) ki bağlantı paylaşılabilsin."
    >
      <Demo
        title="Sekmeler"
        description="default varyantı kutulu, line varyantı alt çizgili sekmelerdir."
        className="grid w-full gap-6"
        code={`<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">Genel</TabsTrigger>
    <TabsTrigger value="members">Üyeler</TabsTrigger>
  </TabsList>
  <TabsContent value="general">…</TabsContent>
</Tabs>

<TabsList variant="line">…</TabsList>`}
      >
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">Genel</TabsTrigger>
            <TabsTrigger value="members">Üyeler</TabsTrigger>
            <TabsTrigger value="usage">Kullanım</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="pt-3 text-sm">
            Organizasyon adı, saat dilimi ve güvenlik ayarları.
          </TabsContent>
          <TabsContent value="members" className="pt-3 text-sm">
            Üyeler ve davetler.
          </TabsContent>
          <TabsContent value="usage" className="pt-3 text-sm">
            Aylık olay kullanımı.
          </TabsContent>
        </Tabs>
        <Tabs defaultValue="event">
          <TabsList variant="line">
            <TabsTrigger value="event">Olay</TabsTrigger>
            <TabsTrigger value="events">Tüm olaylar</TabsTrigger>
            <TabsTrigger value="activity">Etkinlik</TabsTrigger>
          </TabsList>
        </Tabs>
      </Demo>
      <Demo
        title="Açılır bölüm"
        className="w-full max-w-md"
        code={`<Collapsible>
  <CollapsibleTrigger asChild><Button variant="ghost" size="sm">Gelişmiş ayarlar <ChevronsUpDownIcon /></Button></CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`}
      >
        <Collapsible className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              Gelişmiş ayarlar
              <ChevronsUpDownIcon />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 rounded-md border px-3 py-2 text-sm">
            Hız sınırı, kayıt dışı ortamlar ve saklama süresi.
          </CollapsibleContent>
        </Collapsible>
      </Demo>
      <Demo
        title="Kaydırma alanı ve ayraç"
        className="grid w-full gap-4 sm:grid-cols-2"
        code={`<ScrollArea className="h-40 rounded-md border">…</ScrollArea>
<Separator />
<Separator orientation="vertical" />`}
      >
        <ScrollArea className="h-40 rounded-md border">
          <ul className="divide-y text-sm">
            {Array.from({ length: 20 }, (_, i) => `2.${20 - i}.0`).map((v) => (
              <li key={v} className="px-3 py-2">
                Sürüm {v}
              </li>
            ))}
          </ul>
        </ScrollArea>
        <div className="grid content-start gap-3 text-sm">
          <p>Üst bölüm</p>
          <Separator />
          <div className="flex h-5 items-center gap-3">
            <span>Bir</span>
            <Separator orientation="vertical" />
            <span>İki</span>
            <Separator orientation="vertical" />
            <span>Üç</span>
          </div>
        </div>
      </Demo>
      <Demo title="Kısayol tuşları" code={`<Kbd>⌘K</Kbd> <Kbd>G</Kbd> <Kbd>H</Kbd>`}>
        <span className="text-sm">
          Komut paleti <Kbd>⌘K</Kbd>, hatalara git <Kbd>G</Kbd> <Kbd>H</Kbd>, çöz <Kbd>R</Kbd>
        </span>
      </Demo>
    </Page>
  );
}
