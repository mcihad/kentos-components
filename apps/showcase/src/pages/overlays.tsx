import { Kbd } from "@kentos/components/common/kbd";
import { Button } from "@kentos/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@kentos/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kentos/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@kentos/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@kentos/components/ui/hover-card";
import { Input } from "@kentos/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@kentos/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@kentos/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kentos/components/ui/tooltip";
import { BugIcon, ChevronDownIcon, FolderIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";
import { Demo, Page } from "../demo";

/** Dialogs, sheets, popovers, menus, tooltips and the command palette. */
export function OverlaysPage() {
  const [palette, setPalette] = useState(false);
  return (
    <Page
      title="Katmanlar"
      description="Sayfanın üstünde açılan bileşenler. Hepsi odağı içinde tutar, Escape ile kapanır ve ekran okuyuculara başlığını söyler; diyalog ve yan panellerde DialogTitle/SheetTitle zorunludur (görünmesi istenmiyorsa sr-only)."
    >
      <Demo
        title="Diyalog"
        description="Onay ve kısa formlar için. Silme gibi geri alınamaz işlemlerde onayı yazdırın ve düğmeyi destructive yapın."
        code={`<Dialog>
  <DialogTrigger asChild><Button variant="destructive">Projeyi sil</Button></DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Kalem silinsin mi?</DialogTitle>
      <DialogDescription>Bu işlem geri alınamaz.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="ghost">Vazgeç</Button>
      <Button variant="destructive">Kalıcı olarak sil</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Projeyi sil</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Kalem silinsin mi?</DialogTitle>
              <DialogDescription>
                Bu işlem geri alınamaz. Onaylamak için projenin kısa adını yazın:{" "}
                <code className="font-mono">kalem</code>
              </DialogDescription>
            </DialogHeader>
            <Input className="font-mono text-sm" aria-label="Projenin kısa adı" />
            <DialogFooter>
              <Button variant="ghost">Vazgeç</Button>
              <Button variant="destructive">Kalıcı olarak sil</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Demo>
      <Demo
        title="Yan panel"
        description="Bağlamı kaybetmeden ayrıntı ya da ayar göstermek için; mobilde menü için soldan açılır."
        code={`<Sheet>
  <SheetTrigger asChild><Button variant="outline">Ayrıntılar</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>KALEM-1A</SheetTitle>
      <SheetDescription>NullReferenceException</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Ayrıntılar</Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>KALEM-1A</SheetTitle>
              <SheetDescription>NullReferenceException · OrderService.CreateOrder</SheetDescription>
            </SheetHeader>
            <p className="px-4 text-muted-foreground text-sm">Panel içeriği burada kayar.</p>
          </SheetContent>
        </Sheet>
      </Demo>
      <Demo
        title="Açılır pencere ve menü"
        code={`<Popover>
  <PopoverTrigger asChild><Button variant="outline">Filtre</Button></PopoverTrigger>
  <PopoverContent>…</PopoverContent>
</Popover>

<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="outline">İşlemler <ChevronDownIcon /></Button></DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuLabel>Hata</DropdownMenuLabel>
    <DropdownMenuItem>Çöz</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Sil</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Filtre</Button>
          </PopoverTrigger>
          <PopoverContent className="grid gap-2">
            <p className="font-medium text-sm">Ortam</p>
            <Input placeholder="production" />
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              İşlemler
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Hata</DropdownMenuLabel>
            <DropdownMenuItem>Çöz</DropdownMenuItem>
            <DropdownMenuItem>Yoksay</DropdownMenuItem>
            <DropdownMenuItem>Bana ata</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Sil</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Demo>
      <Demo
        title="İpucu ve önizleme kartı"
        description="İpucu (Tooltip) kısa açıklama içindir ve TooltipProvider gerektirir; HoverCard bir bağlantının önizlemesini gösterir."
        code={`<TooltipProvider>…</TooltipProvider> // uygulama kökünde

<Tooltip>
  <TooltipTrigger asChild><Button size="icon" variant="ghost" aria-label="Ayarlar"><SettingsIcon /></Button></TooltipTrigger>
  <TooltipContent>Ayarlar</TooltipContent>
</Tooltip>`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Ayarlar">
              <SettingsIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ayarlar</TooltipContent>
        </Tooltip>
        <HoverCard>
          <HoverCardTrigger asChild>
            <a href="#/overlays" className="text-link underline-offset-4 hover:underline">
              KALEM-1A
            </a>
          </HoverCardTrigger>
          <HoverCardContent className="grid gap-1 text-sm">
            <p className="font-semibold">NullReferenceException</p>
            <p className="text-muted-foreground">1.204 olay · son 2 sa önce</p>
          </HoverCardContent>
        </HoverCard>
      </Demo>
      <Demo
        title="Komut paleti"
        description="Klavyeyle her yere gitmek için; genellikle ⌘K ile açılır."
        code={`<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Hata, proje ya da sayfa ara" />
  <CommandList>
    <CommandEmpty>Sonuç yok.</CommandEmpty>
    <CommandGroup heading="Sayfalar">
      <CommandItem><BugIcon />Hatalar<CommandShortcut>G H</CommandShortcut></CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>`}
      >
        <Button variant="outline" onClick={() => setPalette(true)}>
          Komut paletini aç <Kbd>⌘K</Kbd>
        </Button>
        <CommandDialog open={palette} onOpenChange={setPalette}>
          <CommandInput placeholder="Hata, proje ya da sayfa ara" />
          <CommandList>
            <CommandEmpty>Sonuç yok.</CommandEmpty>
            <CommandGroup heading="Sayfalar">
              <CommandItem onSelect={() => setPalette(false)}>
                <BugIcon />
                Hatalar
                <CommandShortcut>G H</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setPalette(false)}>
                <FolderIcon />
                Projeler
                <CommandShortcut>G P</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </Demo>
    </Page>
  );
}
