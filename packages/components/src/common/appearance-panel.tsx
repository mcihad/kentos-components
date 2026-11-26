import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import type { ReactNode } from "react";
import { type Accent, type FontChoice, type MonoChoice, useAppearance } from "../lib/theme";
import { cn } from "../lib/utils";
import { Segmented } from "./segmented";

const fonts: { value: FontChoice; label: string; hint: string; family: string }[] = [
  { value: "jakarta", label: "Plus Jakarta Sans", hint: "Varsayılan", family: "var(--font-stack-jakarta)" },
  { value: "inter", label: "Inter", hint: "Yoğun tablolar için", family: "var(--font-stack-inter)" },
  { value: "plex", label: "IBM Plex Sans", hint: "Resmî, belge gibi", family: "var(--font-stack-plex)" },
];

const monos: { value: MonoChoice; label: string; family: string }[] = [
  { value: "jetbrains", label: "JetBrains Mono", family: "var(--font-stack-mono-jetbrains)" },
  { value: "fira", label: "Fira Code", family: "var(--font-stack-mono-fira)" },
  { value: "plex", label: "IBM Plex Mono", family: "var(--font-stack-mono-plex)" },
  { value: "system", label: "Sistem", family: "var(--font-stack-mono-system)" },
];

const accents: { value: Accent; label: string; color: string }[] = [
  { value: "navy", label: "Lacivert", color: "var(--navy-800)" },
  { value: "teal", label: "Petrol", color: "var(--teal-600)" },
  { value: "violet", label: "Mor", color: "var(--violet-700)" },
  { value: "green", label: "Yeşil", color: "var(--green-700)" },
  { value: "amber", label: "Kehribar", color: "var(--amber-600)" },
  { value: "neutral", label: "Nötr", color: "var(--neutral-700)" },
];

// A choice drawn as a card: a label around a visually hidden native radio.
const choiceClass =
  "relative cursor-pointer rounded-md border transition-colors duration-(--duration-fast) has-[:focus-visible]:shadow-(--focus-shadow)";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-2.5">
      <h3 className="font-semibold text-2xs text-muted-foreground uppercase tracking-(--tracking-caps)">
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * The theme editor's controls: every choice switches one scope class of the
 * KentOS design system on <html> (mode, typeface, code typeface, density,
 * corners, accent,
 * cards) and is kept in this browser. Put it in a sheet, a dialog or a page.
 */
export function AppearancePanel({ className }: { className?: string }) {
  const { appearance: a, setAppearance } = useAppearance();
  return (
    <div className={cn("grid content-start gap-6", className)}>
      <Group title="Tema">
        <Segmented
          label="Tema"
          value={a.mode}
          onChange={(mode) => setAppearance({ mode })}
          options={[
            { value: "light", label: "Açık", icon: SunIcon },
            { value: "dark", label: "Koyu", icon: MoonIcon },
            { value: "system", label: "Sistem", icon: MonitorIcon },
          ]}
        />
      </Group>
      <Group title="Yazı tipi">
        <fieldset className="grid min-w-0 gap-1.5">
          <legend className="sr-only">Yazı tipi</legend>
          {fonts.map((f) => {
            const on = a.font === f.value;
            return (
              <label
                key={f.value}
                className={cn(
                  choiceClass,
                  "flex items-center gap-3 px-3 py-2.5",
                  on ? "border-(--border-brand) bg-selected" : "hover:bg-(--surface-hover)",
                )}
              >
                <input
                  type="radio"
                  name="appearance-font"
                  value={f.value}
                  checked={on}
                  onChange={() => setAppearance({ font: f.value })}
                  className="sr-only"
                />
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span
                    className="truncate font-medium text-md"
                    style={{ fontFamily: `${f.family}, sans-serif` }}
                  >
                    {f.label}
                  </span>
                  <span className="text-muted-foreground text-sm">{f.hint}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="font-semibold text-strong text-xl tracking-[-0.02em]"
                  style={{ fontFamily: `${f.family}, sans-serif` }}
                >
                  Ağ
                </span>
              </label>
            );
          })}
        </fieldset>
      </Group>
      <Group title="Kod yazı tipi">
        <fieldset className="grid min-w-0 grid-cols-2 gap-1.5">
          <legend className="sr-only">Kod yazı tipi</legend>
          {monos.map((m) => {
            const on = a.mono === m.value;
            return (
              <label
                key={m.value}
                className={cn(
                  choiceClass,
                  "grid gap-1 px-3 py-2.5",
                  on ? "border-(--border-brand) bg-selected" : "hover:bg-(--surface-hover)",
                )}
              >
                <input
                  type="radio"
                  name="appearance-mono"
                  value={m.value}
                  checked={on}
                  onChange={() => setAppearance({ mono: m.value })}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="truncate text-strong text-sm"
                  style={{ fontFamily: `${m.family}, monospace` }}
                >
                  0O 1lI {"{}"}
                </span>
                <span className="truncate text-muted-foreground text-xs">{m.label}</span>
              </label>
            );
          })}
        </fieldset>
      </Group>
      <Group title="Yoğunluk">
        <Segmented
          label="Yoğunluk"
          value={a.density}
          onChange={(density) => setAppearance({ density })}
          options={[
            { value: "compact", label: "Sıkı" },
            { value: "standard", label: "Standart" },
            { value: "roomy", label: "Geniş" },
          ]}
        />
      </Group>
      <Group title="Köşeler">
        <Segmented
          label="Köşeler"
          value={a.radius}
          onChange={(radius) => setAppearance({ radius })}
          options={[
            { value: "square", label: "Köşeli" },
            { value: "tight", label: "Hafif" },
            { value: "moderate", label: "Orta" },
            { value: "soft", label: "Yuvarlak" },
          ]}
        />
      </Group>
      <Group title="Ana renk">
        <fieldset className="grid min-w-0 grid-cols-3 gap-1.5">
          <legend className="sr-only">Ana renk</legend>
          {accents.map((c) => {
            const on = a.accent === c.value;
            return (
              <label
                key={c.value}
                className={cn(
                  choiceClass,
                  "grid justify-items-center gap-1.5 px-1.5 py-2.5",
                  on ? "border-(--border-brand) bg-selected" : "hover:bg-(--surface-hover)",
                )}
              >
                <input
                  type="radio"
                  name="appearance-accent"
                  value={c.value}
                  checked={on}
                  onChange={() => setAppearance({ accent: c.value })}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="size-[22px] rounded-full"
                  style={{
                    background: c.color,
                    boxShadow: on ? `0 0 0 2px var(--surface-card), 0 0 0 4px ${c.color}` : undefined,
                  }}
                />
                <span className="font-medium text-xs">{c.label}</span>
              </label>
            );
          })}
        </fieldset>
        <p className="text-muted-foreground text-sm">
          Düğmeler, sekmeler, bağlantılar ve kenar çubuğu bu renge geçer.
        </p>
      </Group>
      <Group title="Kartlar">
        <Segmented
          label="Kartlar"
          value={a.elevation}
          onChange={(elevation) => setAppearance({ elevation })}
          options={[
            { value: "flat", label: "Düz" },
            { value: "bordered", label: "Kenarlıklı" },
            { value: "raised", label: "Gölgeli" },
          ]}
        />
      </Group>
    </div>
  );
}
