# KentOS Bileşenleri

KentOS uygulamalarının ortak tasarım sistemi: renk ve ölçü tokenları, kullanıcının seçtiği temalar (açık/koyu, yazı tipi, yoğunluk, köşeler, ana renk, kart görünümü) ve Radix üzerine kurulu, Tailwind CSS v4 ile biçimlenen React bileşenleri. [İzci](../kentos-izci)'nin arayüzü bu setle yapılır.

| Klasör                | İçerik                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/components` | `@kentos/components` paketi: 25 temel bileşen (shadcn/ui), ortak bileşenler, grafikler, tema ve biçimlendirme yardımcıları, CSS tokenları ve yazı tipleri. |
| `apps/showcase`       | Vitrin sitesi: her bileşenin canlı örneği ve kodu, renk ve tokenlar, görünüm seçenekleri, sayfa kalıpları.                                                 |
| `docs`                | Ayrıntılı başvuru (İngilizce): entegrasyon, bileşenler, tokenlar, temalar, kalıplar, katkı.                                                                |
| `AGENTS.md`           | Yapay zekâ ajanları ve geliştiriciler için kurallar ve komutlar.                                                                                           |

## Vitrin

```bash
pnpm install
pnpm dev        # http://localhost:5320
```

## Bir uygulamada kullanma

Depo, uygulamanın deposunun yanında durur (`~/Projects/kentos-components`, `~/Projects/kentos-izci`):

```jsonc
// package.json
"@kentos/components": "file:../../kentos-components/packages/components"
```

```css
/* src/index.css */
@import "@kentos/components/styles/index.css";
```

```tsx
import { Button } from "@kentos/components/ui/button";

<Button>Kaydet</Button>;
```

Tema, yazı tipleri, `Toaster` ve ayrıntılar: [docs/integration.md](docs/integration.md).

## Komutlar

```bash
pnpm dev         # vitrin
pnpm check       # lint, tip denetimi, testler, vitrin derlemesi
```
