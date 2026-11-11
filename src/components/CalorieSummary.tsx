"use client";

import { useEffect, useState } from "react";
import { Beef, Droplet, Flame, Printer, Wheat, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { bmiLabel, formatNumber as fmt, type Targets } from "@/lib/nutrition";

/**
 * Өдрийн зорилтын карт. Загвар: 21st.dev «Tracker Card» (kavikatiyar),
 * framer-motion-гүйгээр CSS transition-оор дасгасан.
 */



function useCountUp(target: number, ms = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setValue(target);
    let frame = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return value;
}

function MacroBar({ icon: Icon, label, grams, kcalPerGram, total, color }: {
  icon: LucideIcon;
  label: string;
  grams: number;
  kcalPerGram: number;
  total: number;
  color: string;
}) {
  const [width, setWidth] = useState(0);
  const pct = Math.round(((grams * kcalPerGram) / total) * 100);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-semibold">
          <Icon className="h-4 w-4 text-muted" aria-hidden />
          {label}
        </span>
        <span className="tabular-nums">
          <span className="font-bold">{grams} г</span> <span className="text-muted">· {pct}%</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface2">
        <div className={`h-full rounded-full transition-[width] duration-1000 ease-out ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function CalorieSummary({ targets, summary }: { targets: Targets; summary: string }) {
  const kcal = useCountUp(targets.kcal);

  return (
    <Card className="break-inside-avoid">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Flame className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-extrabold">Өдрийн зорилт</h2>
            <p className="text-sm text-muted">Таны мэдээллээр тооцоолсон</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.print()} className="shrink-0 print:hidden">
          <Printer className="mr-1.5 inline h-4 w-4 align-[-2px]" aria-hidden />
          Хэвлэх / PDF
        </Button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div>
          <p className="flex items-end gap-2">
            <span className="text-6xl font-extrabold tracking-tight tabular-nums">{fmt(kcal)}</span>
            <span className="mb-2 font-semibold text-muted">kcal / өдөр</span>
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-surface2 p-3">
              <dt className="text-muted">Өдрийн зарцуулалт</dt>
              <dd className="font-bold tabular-nums">≈ {fmt(targets.tdee)} kcal</dd>
            </div>
            <div className="rounded-xl bg-surface2 p-3">
              <dt className="text-muted">BMI</dt>
              <dd className="font-bold">
                {targets.bmi} · {bmiLabel(targets.bmi)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4">
          <MacroBar icon={Beef} label="Уураг" grams={targets.proteinG} kcalPerGram={4} total={targets.kcal} color="bg-rose-500" />
          <MacroBar icon={Wheat} label="Нүүрс ус" grams={targets.carbsG} kcalPerGram={4} total={targets.kcal} color="bg-amber-500" />
          <MacroBar icon={Droplet} label="Өөх тос" grams={targets.fatG} kcalPerGram={9} total={targets.kcal} color="bg-sky-500" />
        </div>
      </div>

      <p className="mt-6 border-t border-border pt-4 text-muted">{summary}</p>
    </Card>
  );
}
