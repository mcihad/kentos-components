import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "../lib/utils";

/*
 * A slider on Radix: one thumb per value (two for a range), arrow keys,
 * Page Up/Down, Home/End and touch. The track is a large touch target on
 * phones. Optional marks label points under the track; formatValue shows a
 * bubble with the value above a thumb while it is dragged or focused.
 *
 *   <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} max={100} thumbLabels={["Ses"]} />
 *   <Slider value={range} onValueChange={setRange} min={0} max={500} step={10} formatValue={(v) => `₺${v}`} />
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  marks,
  formatValue,
  thumbLabels,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Labelled points under the track, e.g. [{ value: 0, label: "0" }, { value: 50, label: "50" }]. */
  marks?: readonly { value: number; label?: React.ReactNode }[];
  /** Shows the value above the thumb while it is dragged or focused, formatted. */
  formatValue?: (value: number) => React.ReactNode;
  /** Accessible names of the thumbs ("En az", "En çok"). */
  thumbLabels?: readonly string[];
}) {
  const values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min]),
    [value, defaultValue, min],
  );
  const percent = (v: number) => ((v - min) / (max - min || 1)) * 100;

  return (
    <div data-slot="slider-field" className={cn("grid w-full gap-1.5", className)}>
      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        className="relative flex w-full touch-none select-none items-center py-2.5 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:px-2.5 data-[orientation=vertical]:py-0 data-[disabled]:opacity-50 md:py-1.5"
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-(--surface-active) data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className="absolute bg-(--brand-bg) data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          />
        </SliderPrimitive.Track>
        {values.map((v, i) => (
          <SliderPrimitive.Thumb
            // biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positions, not items.
            key={i}
            data-slot="slider-thumb"
            aria-label={thumbLabels?.[i]}
            className="group/thumb relative block size-5 shrink-0 rounded-full border-2 border-(--brand-bg) bg-(--surface-card) shadow-(--shadow-sm) outline-none transition-[box-shadow,transform] duration-(--duration-fast) after:absolute after:-inset-2.5 after:content-[''] hover:scale-110 focus-visible:shadow-(--focus-shadow) active:scale-110 data-[disabled]:pointer-events-none md:size-4"
          >
            {formatValue ? (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-(--text-strong) px-1.5 py-0.5 font-medium text-(--surface-card) text-xs tabular opacity-0 shadow-(--shadow-md) transition-[opacity,transform] duration-(--duration-fast) group-focus-visible/thumb:translate-y-0 group-focus-visible/thumb:opacity-100 group-active/thumb:translate-y-0 group-active/thumb:opacity-100"
              >
                {formatValue(v)}
              </span>
            ) : null}
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
      {marks?.length ? (
        <div aria-hidden data-slot="slider-marks" className="relative h-4 text-muted-foreground text-xs tabular">
          {marks.map((m) => (
            <span
              key={m.value}
              className="absolute top-0 whitespace-nowrap"
              // Edge labels stay inside the track; the rest centre on their point.
              style={{
                left: `${percent(m.value)}%`,
                transform: `translateX(${percent(m.value) <= 0 ? 0 : percent(m.value) >= 100 ? -100 : -50}%)`,
              }}
            >
              {m.label ?? m.value}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { Slider };
