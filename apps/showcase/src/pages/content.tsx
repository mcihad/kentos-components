import { DescriptionItem, DescriptionList } from "@kentos/components/common/description-list";
import { Timeline, TimelineItem } from "@kentos/components/common/timeline";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@kentos/components/ui/accordion";
import { Badge } from "@kentos/components/ui/badge";
import { Button } from "@kentos/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kentos/components/ui/card";
import {
  BellIcon,
  BugIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  GitCommitHorizontalIcon,
  KeyRoundIcon,
  MoreHorizontalIcon,
  RocketIcon,
  ShieldIcon,
  UserPlusIcon,
} from "lucide-react";
import { Demo, Page } from "../demo";

/** Card, Accordion, DescriptionList and Timeline. */
export function ContentPage() {
  return (
    <Page
      title="İçerik düzeni"
      description={
        <>
          Sayfa içeriğini düzenleyen yapı taşları: kart, açılır bölümler, etiket–değer listeleri ve zaman
          çizelgesi. Kart iç boşluğu yoğunluk ayarına uyar (<code className="font-mono">--card-p</code>).
        </>
      }
    >
      <Demo
        title="Kart"
        description="Başlık, açıklama, sağ üstte eylem, içerik ve alt bilgi. divider başlığın altına ya da alt bilginin üstüne çizgi koyar; flush içeriğin yan boşluğunu kaldırır (tablolar için)."
        className="grid w-full items-start gap-4 lg:grid-cols-2"
        code={`<Card>
  <CardHeader>
    <CardTitle>Son 24 saat</CardTitle>
    <CardDescription>e-Belediye projesindeki yeni hatalar</CardDescription>
    <CardAction><Button variant="ghost" size="icon-sm" aria-label="Diğer"><MoreHorizontalIcon /></Button></CardAction>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter divider><Button variant="outline" size="sm">Tümünü gör</Button></CardFooter>
</Card>

<Card asChild interactive><a href="…">…</a></Card>
<Card tone="muted">…</Card>
<Card tone="brand">…</Card>`}
      >
        <Card>
          <CardHeader>
            <CardTitle>Son 24 saat</CardTitle>
            <CardDescription>e-Belediye projesindeki yeni hatalar</CardDescription>
            <CardAction>
              <Button variant="ghost" size="icon-sm" aria-label="Diğer">
                <MoreHorizontalIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-3xl text-strong tabular">128</p>
            <p className="text-muted-foreground text-sm">dünden 14 fazla</p>
          </CardContent>
          <CardFooter divider>
            <Button variant="outline" size="sm">
              Tümünü gör
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader divider>
            <CardTitle>Ekip</CardTitle>
            <CardDescription>Projeye erişimi olan kişiler</CardDescription>
            <CardAction>
              <Button size="sm" variant="outline">
                <UserPlusIcon />
                Davet et
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent flush className="py-0">
            <ul className="divide-y text-sm">
              {[
                ["Ayşe Yılmaz", "Yönetici"],
                ["Mehmet Kaya", "Geliştirici"],
                ["Zeynep Demir", "İzleyici"],
              ].map(([name, role]) => (
                <li key={name} className="flex items-center justify-between px-(--card-p) py-2.5">
                  <span>{name}</span>
                  <span className="text-muted-foreground">{role}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card asChild interactive>
          <a href="#/content">
            <CardHeader>
              <CardTitle>Kurulum rehberi</CardTitle>
              <CardDescription>SDK'yı beş dakikada bağlayın. Kartın tamamı bir bağlantıdır.</CardDescription>
              <CardAction>
                <ExternalLinkIcon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
          </a>
        </Card>
        <div className="grid gap-4">
          <Card tone="muted">
            <CardHeader>
              <CardTitle>Sessiz kart</CardTitle>
              <CardDescription>İkincil bilgiler ve yan paneller için.</CardDescription>
            </CardHeader>
          </Card>
          <Card tone="brand">
            <CardHeader>
              <CardTitle>Vurgulu kart</CardTitle>
              <CardDescription>Öneriler ve duyurular için; vurgu rengini alır.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Demo>

      <Demo
        title="Açılır bölümler"
        description='type="single" bir bölümü açık tutar (collapsible kapatmaya izin verir), type="multiple" birden çoğunu. plain çizgilerle ayırır, contained tek kartta toplar, separated her bölümü ayrı kart yapar.'
        className="grid w-full max-w-2xl gap-8"
        code={`<Accordion type="single" collapsible variant="contained" defaultValue="keys">
  <AccordionItem value="keys">
    <AccordionTrigger icon={KeyRoundIcon} description="DSN ve ingest anahtarları" aside={<Badge>2</Badge>}>
      Anahtarlar
    </AccordionTrigger>
    <AccordionContent>…</AccordionContent>
  </AccordionItem>
</Accordion>`}
      >
        <Accordion type="single" collapsible variant="contained" defaultValue="keys">
          <AccordionItem value="keys">
            <AccordionTrigger
              icon={KeyRoundIcon}
              description="DSN ve ingest anahtarları"
              aside={<Badge variant="secondary">2</Badge>}
            >
              Anahtarlar
            </AccordionTrigger>
            <AccordionContent>
              Her proje için en az bir anahtar vardır. Anahtarı yenilediğinizde eski anahtar 24 saat daha
              çalışır, böylece uygulamaları kesintisiz güncelleyebilirsiniz.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="alerts">
            <AccordionTrigger icon={BellIcon} description="E-posta, Telegram ve web kancaları">
              Uyarılar
            </AccordionTrigger>
            <AccordionContent>
              Yeni bir hata ya da gerilemede seçtiğiniz kanallara bildirim gider. Sessize alınan hatalar
              bildirim üretmez.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="privacy">
            <AccordionTrigger icon={ShieldIcon} description="IP adresi, çerezler ve kişisel veriler">
              Gizlilik
            </AccordionTrigger>
            <AccordionContent>
              IP adresleri varsayılan olarak anonimleştirilir. Kişisel veri silme talepleri ayarlardaki
              gizlilik bölümünden yürütülür.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="multiple" variant="plain">
          {[
            [
              "Sentry SDK'ları değiştirmeden çalışır mı?",
              "Evet. DSN'i izci adresiyle değiştirmeniz yeterli.",
            ],
            ["Veriler nerede saklanır?", "Kurumunuzun sunucusundaki PostgreSQL veritabanında."],
            ["Kaç kullanıcı ekleyebilirim?", "Sınır yok; roller proje bazında verilir."],
          ].map(([q, a]) => (
            <AccordionItem key={q} value={q ?? ""}>
              <AccordionTrigger>{q}</AccordionTrigger>
              <AccordionContent>{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Accordion type="single" collapsible variant="separated">
          <AccordionItem value="a">
            <AccordionTrigger description="3 kural">Sahiplik kuralları</AccordionTrigger>
            <AccordionContent>Dosya yoluna ya da etikete göre hataları ekiplere atar.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger description="Kapalı">Gelen filtreler</AccordionTrigger>
            <AccordionContent>Tarayıcı eklentilerinden ve botlardan gelen olayları eler.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Demo>

      <Demo
        title="Etiket–değer listesi"
        description="rows etiket ve değer sütunu (telefonda alt alta), inline değeri sağa yaslar (dar yan paneller), grid etiketi değerin üstüne koyar. Boş değerler tire gösterir."
        className="grid w-full items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]"
        code={`<DescriptionList layout="rows" divided>
  <DescriptionItem label="Proje">e-Belediye</DescriptionItem>
  <DescriptionItem label="DSN" mono>https://…</DescriptionItem>
  <DescriptionItem label="Sorumlu" hint="Atamayı ayarlardan değiştirin.">Ayşe Yılmaz</DescriptionItem>
  <DescriptionItem label="Açıklama" />
</DescriptionList>

<DescriptionList layout="inline">…</DescriptionList>
<DescriptionList layout="grid" columns={4}>…</DescriptionList>`}
      >
        <div className="grid gap-8">
          <DescriptionList layout="rows" divided>
            <DescriptionItem label="Proje">e-Belediye</DescriptionItem>
            <DescriptionItem label="Platform">.NET 8</DescriptionItem>
            <DescriptionItem label="DSN" mono>
              https://7f3a9c@izci.kentos.dev/12
            </DescriptionItem>
            <DescriptionItem label="Sorumlu" hint="Atamayı proje ayarlarından değiştirin.">
              Ayşe Yılmaz
            </DescriptionItem>
            <DescriptionItem label="Açıklama" />
          </DescriptionList>
          <DescriptionList layout="grid" columns={4}>
            <DescriptionItem label="Olay">
              <span className="font-semibold text-2xl tabular">12.480</span>
            </DescriptionItem>
            <DescriptionItem label="Hata">
              <span className="font-semibold text-2xl tabular">128</span>
            </DescriptionItem>
            <DescriptionItem label="Kullanıcı">
              <span className="font-semibold text-2xl tabular">2.311</span>
            </DescriptionItem>
            <DescriptionItem label="Çökmesiz oturum">
              <span className="font-semibold text-2xl tabular">%99,2</span>
            </DescriptionItem>
          </DescriptionList>
        </div>
        <Card>
          <CardContent>
            <DescriptionList layout="inline">
              <DescriptionItem label="İlk görülme">3 gün önce</DescriptionItem>
              <DescriptionItem label="Son görülme">12 dk önce</DescriptionItem>
              <DescriptionItem label="Sürüm" mono>
                1.4.2
              </DescriptionItem>
              <DescriptionItem label="Ortam">production</DescriptionItem>
              <DescriptionItem label="Etkilenen">
                <Badge variant="warning">48 kullanıcı</Badge>
              </DescriptionItem>
            </DescriptionList>
          </CardContent>
        </Card>
      </Demo>

      <Demo
        title="Zaman çizelgesi"
        description="Olaylar sırayla bir çizgi üzerinde. İşaret nokta ya da simgeli dairedir; tone rengi seçer, pending henüz olmamış adımı kesikli gösterir. compact küçük noktalarla sık bir liste verir."
        className="grid w-full items-start gap-8 md:grid-cols-2"
        code={`<Timeline>
  <TimelineItem icon={BugIcon} tone="danger" title="Hata ilk kez görüldü" time="3 gün önce" dateTime="2026-11-23T09:12">
    TimeoutException, OdemeServisi.Tahsil
  </TimelineItem>
  <TimelineItem icon={CheckCircle2Icon} tone="success" title="Çözüldü olarak işaretlendi" time="1 saat önce" />
  <TimelineItem tone="muted" pending title="Sürümde doğrulanacak" />
</Timeline>
<Timeline compact>…</Timeline>`}
      >
        <Timeline>
          <TimelineItem
            icon={BugIcon}
            tone="danger"
            title="Hata ilk kez görüldü"
            time="3 gün önce"
            dateTime="2026-11-23T09:12"
          >
            <code className="font-mono text-xs">TimeoutException</code> OdemeServisi.Tahsil içinde
          </TimelineItem>
          <TimelineItem icon={UserPlusIcon} tone="brand" title="Mehmet Kaya'ya atandı" time="2 gün önce">
            Ayşe Yılmaz atadı.
          </TimelineItem>
          <TimelineItem icon={GitCommitHorizontalIcon} title="Düzeltme commit'i bağlandı" time="5 saat önce">
            <code className="font-mono text-xs">a1b2c3d</code> Zaman aşımı 30 saniyeye çıkarıldı
          </TimelineItem>
          <TimelineItem icon={RocketIcon} tone="success" title="1.4.3 yayınlandı" time="1 saat önce" />
          <TimelineItem icon={CheckCircle2Icon} tone="muted" pending title="Sürümde doğrulanacak">
            24 saat yeni olay gelmezse hata kapanır.
          </TimelineItem>
        </Timeline>
        <Timeline compact>
          <TimelineItem tone="success" title="Yedekleme tamamlandı" time="03.00" />
          <TimelineItem tone="warning" title="Disk kullanımı %85" time="02.41" />
          <TimelineItem title="Bakım penceresi başladı" time="02.00" />
          <TimelineItem tone="danger" title="Veritabanı bağlantısı koptu" time="01.12">
            12 saniye sonra yeniden bağlandı.
          </TimelineItem>
          <TimelineItem tone="muted" title="Gece işleri başladı" time="00.00" />
        </Timeline>
      </Demo>
    </Page>
  );
}
