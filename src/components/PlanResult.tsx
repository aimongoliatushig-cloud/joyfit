"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { bmiLabel } from "@/lib/nutrition";
import type { PlanResponse } from "@/lib/planSchema";

const fmt = (n: number) => n.toLocaleString("mn-MN");

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-text">{value}</p>
      {sub && <p className="text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function PlanResult({ data }: { data: PlanResponse }) {
  const { targets, plan } = data;
  const [activeDay, setActiveDay] = useState(0);
  const multiDay = plan.days.length > 1;

  return (
    <div className="space-y-6">
      {data.source === "demo" && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 print:hidden">
          <p className="font-semibold">Жишээ горим: AI холбогдоогүй байна</p>
          <p className="text-sm">
            Доорх цэс бэлэн загвараас гарсан. Жинхэнэ хувийн цэс авахын тулд админ{" "}
            <a href="/settings" className="font-semibold underline">
              Тохиргоо
            </a>{" "}
            хэсэгт Claude API key оруулна уу.
          </p>
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">Таны өдрийн зорилт</h2>
            <p className="mt-1 max-w-2xl text-muted">{plan.summary}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => window.print()} className="print:hidden">
            Хэвлэх / PDF
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Илчлэг" value={`${fmt(targets.kcal)} kcal`} sub={`Зарцуулалт ≈ ${fmt(targets.tdee)}`} />
          <Stat label="Уураг" value={`${targets.proteinG} г`} />
          <Stat label="Нүүрс ус / Өөх тос" value={`${targets.carbsG} / ${targets.fatG} г`} />
          <Stat label="BMI" value={String(targets.bmi)} sub={bmiLabel(targets.bmi)} />
        </div>
      </Card>

      {multiDay && (
        <div className="flex flex-wrap gap-2 print:hidden" role="tablist" aria-label="Өдрүүд">
          {plan.days.map((d, i) => (
            <button
              key={d.day}
              role="tab"
              aria-selected={i === activeDay}
              onClick={() => setActiveDay(i)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                i === activeDay ? "bg-primary text-white" : "bg-surface2 text-text hover:bg-border"
              }`}
            >
              {d.day}-р өдөр
            </button>
          ))}
        </div>
      )}

      {plan.days.map((d, i) => {
        const total = d.meals.reduce((s, m) => s + m.kcal, 0);
        return (
          <section key={d.day} className={i === activeDay ? "block" : "hidden print:block"}>
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-lg font-extrabold">{d.day}-р өдөр</h3>
              <Badge variant="primary">Нийт {fmt(total)} kcal</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {d.meals.map((m, j) => (
                <Card key={j} className="break-inside-avoid p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {m.slot} · {m.time}
                      </p>
                      <h4 className="text-base font-bold">{m.dish}</h4>
                    </div>
                    <span className="shrink-0 font-extrabold tabular-nums">{fmt(m.kcal)} kcal</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {m.ingredients.map((ing, k) => (
                      <li key={k} className="flex justify-between gap-3 border-b border-dashed border-border pb-1 last:border-0">
                        <span>{ing.food}</span>
                        <span className="text-muted">{ing.amount}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-muted">
                    Уураг {m.proteinG} г · Нүүрс ус {m.carbsG} г · Өөх тос {m.fatG} г
                  </p>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="break-inside-avoid">
          <h3 className="text-lg font-extrabold">Худалдан авах жагсаалт</h3>
          <div className="mt-3 space-y-3">
            {plan.shoppingList.map((g) => (
              <div key={g.category}>
                <p className="text-sm font-semibold text-muted">{g.category}</p>
                <p>{g.items.join(", ")}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="break-inside-avoid">
          <h3 className="text-lg font-extrabold">Зөвлөгөө</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {plan.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </Card>
      </div>

      {data.source === "ai" && (
        <p className="text-center text-sm text-muted">AI-аар гаргасан ({data.model}). Тоо баримт ойролцоо утгатай.</p>
      )}
    </div>
  );
}
