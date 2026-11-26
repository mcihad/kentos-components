import { Calendar } from "@kentos/components/common/calendar";
import { DatePicker, DateRangePicker } from "@kentos/components/common/date-picker";
import { Field } from "@kentos/components/common/field";
import {
  addDays,
  type DateRange,
  daysInRange,
  formatDay,
  formatRange,
  today,
} from "@kentos/components/lib/date";
import { useState } from "react";
import { Demo, Page } from "../demo";

const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

/** Calendar, DatePicker and DateRangePicker. */
export function DatesPage() {
  const [day, setDay] = useState<Date | null>(today());
  const [range, setRange] = useState<DateRange>({ from: addDays(today(), -9), to: addDays(today(), -3) });
  const [due, setDue] = useState<Date | null>(null);
  const [meeting, setMeeting] = useState<Date | null>(addDays(today(), 3));
  const [period, setPeriod] = useState<DateRange>({ from: addDays(today(), -6), to: today() });
  const [report, setReport] = useState<DateRange>({ from: null, to: null });

  return (
    <Page
      title="Tarihler"
      description={
        <>
          Takvim Türkçedir ve haftalar pazartesi başlar. Günler klavyeyle seçilir: oklar gün ve hafta, Page
          Up/Down ay (Shift ile yıl), Home/End haftanın başı ve sonu. Başlıktaki ay adına tıklayınca ay ve yıl
          seçilir. Tarih alanları masaüstünde açılır panel, telefonda alttan açılan sayfadır.
        </>
      }
    >
      <Demo
        title="Takvim"
        description="Tek gün ya da aralık seçer. Bugün renkli ve noktalıdır; min/max dışındaki ve isDisabled ile kapatılan günler seçilemez."
        className="items-start gap-6"
        code={`<Calendar value={day} onValueChange={setDay} />
<Calendar mode="range" value={range} onValueChange={setRange} />`}
      >
        <div className="card">
          <Calendar value={day} onValueChange={setDay} />
          <p className="border-t px-4 py-2.5 text-muted-foreground text-sm">
            {day ? formatDay(day) : "Gün seçilmedi"}
          </p>
        </div>
        <div className="card">
          <Calendar mode="range" value={range} onValueChange={setRange} />
          <p className="border-t px-4 py-2.5 text-muted-foreground text-sm">
            {range.from && range.to
              ? `${formatRange(range.from, range.to)} (${daysInRange(range.from, range.to)} gün)`
              : range.from
                ? "Bitiş gününü seçin"
                : "Aralık seçilmedi"}
          </p>
        </div>
      </Demo>

      <Demo
        title="Tarih seçici"
        description='Alan seçili günü "26 Kas 2026" biçiminde yazar. Altta "Bugün" kısayolu vardır; clearable seçimi silen × ekler.'
        className="grid w-full max-w-xl gap-4"
        code={`<DatePicker value={due} onValueChange={setDue} clearable />
<DatePicker
  value={meeting}
  onValueChange={setMeeting}
  min={today()}
  max={addDays(today(), 60)}
  isDisabled={isWeekend}
/>`}
      >
        <Field label="Son tarih" htmlFor="dp-due" hint={due ? `Değer: ${due.toDateString()}` : "Seçim yok"}>
          <DatePicker id="dp-due" value={due} onValueChange={setDue} clearable />
        </Field>
        <Field label="Toplantı günü" htmlFor="dp-meeting" hint="Önümüzdeki 60 gün, hafta içi.">
          <DatePicker
            id="dp-meeting"
            value={meeting}
            onValueChange={setMeeting}
            min={today()}
            max={addDays(today(), 60)}
            isDisabled={isWeekend}
          />
        </Field>
        <Field label="Hatalı" htmlFor="dp-bad" error="Bir tarih seçin.">
          <DatePicker id="dp-bad" value={null} onValueChange={() => {}} aria-invalid />
        </Field>
        <Field label="Devre dışı" htmlFor="dp-off">
          <DatePicker id="dp-off" value={today()} onValueChange={() => {}} disabled />
        </Field>
      </Demo>

      <Demo
        title="Tarih aralığı seçici"
        description="Solda hazır aralıklar (telefonda kaydırılabilir çipler), yanında iki ay. Hazır aralık ya da bitiş günü seçilince aralık uygulanır. maxDays aralığın uzunluğunu sınırlar."
        className="grid w-full max-w-xl gap-4"
        code={`<DateRangePicker value={period} onValueChange={setPeriod} />
<DateRangePicker
  value={report}
  onValueChange={setReport}
  max={today()}
  maxDays={31}
  clearable
  presets={[
    { label: "Son 7 gün", range: () => ({ from: addDays(today(), -6), to: today() }) },
    { label: "Son 14 gün", range: () => ({ from: addDays(today(), -13), to: today() }) },
  ]}
/>`}
      >
        <Field label="Dönem" htmlFor="drp-period">
          <DateRangePicker id="drp-period" value={period} onValueChange={setPeriod} />
        </Field>
        <Field label="Rapor aralığı" htmlFor="drp-report" hint="En çok 31 gün, bugüne kadar.">
          <DateRangePicker
            id="drp-report"
            value={report}
            onValueChange={setReport}
            max={today()}
            maxDays={31}
            clearable
            presets={[
              { label: "Son 7 gün", range: () => ({ from: addDays(today(), -6), to: today() }) },
              { label: "Son 14 gün", range: () => ({ from: addDays(today(), -13), to: today() }) },
              { label: "Son 30 gün", range: () => ({ from: addDays(today(), -29), to: today() }) },
            ]}
          />
        </Field>
      </Demo>
    </Page>
  );
}
