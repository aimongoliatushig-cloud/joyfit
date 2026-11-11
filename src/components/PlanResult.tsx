"use client";

import { useState } from "react";
import { Apple, Coffee, Lightbulb, Moon, ShoppingBasket, Sun, Utensils, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CalorieSummary } from "@/components/CalorieSummary";
import { formatNumber as fmt } from "@/lib/nutrition";
import type { Meal, PlanResponse } from "@/lib/planSchema";

function slotIcon(slot: string): LucideIcon {
  const s = slot.toLowerCase();
  if (s.includes("өглөө")) return Coffee;
  if (s.includes("үд")) return Sun;
  if (s.includes("орой")) return Moon;
  if (s.includes("зууш")) return Apple;
  return Utensils;
}

function MealCard({ meal }: { meal: Meal }) {
  const Icon = slotIcon(meal.slot);
  return (
    <Card className="break-inside-avoid p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-muted">
              {meal.slot} · {meal.time}
            </p>
            <span className="shrink-0 rounded-full bg-surface2 px-2.5 py-0.5 text-sm font-bold tabular-nums">
              {fmt(meal.kcal)} kcal
            </span>
          </div>
          <h4 className="mt-0.5 text-base font-bold leading-snug">{meal.dish}</h4>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm">
        {meal.ingredients.map((ing, k) => (
          <li key={k} className="flex justify-between gap-3 border-b border-dashed border-border pb-1.5 last:border-0 last:pb-0">
            <span>{ing.food}</span>
            <span className="shrink-0 text-muted">{ing.amount}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-500" aria-hidden />Уураг {meal.proteinG} г
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" aria-hidden />Нүүрс ус {meal.carbsG} г
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-500" aria-hidden />Өөх тос {meal.fatG} г
        </span>
      </div>
    </Card>
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

      <CalorieSummary targets={targets} summary={plan.summary} />

      {multiDay && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 print:hidden" role="tablist" aria-label="Өдрүүд">
          {plan.days.map((d, i) => (
            <button
              key={d.day}
              role="tab"
              aria-selected={i === activeDay}
              onClick={() => setActiveDay(i)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
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
        const pct = Math.min(100, Math.round((total / targets.kcal) * 100));
        return (
          <section key={d.day} className={i === activeDay ? "block" : "hidden print:block"} aria-label={`${d.day}-р өдөр`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold">{d.day}-р өдрийн цэс</h3>
              <div className="flex min-w-[220px] items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface2">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {fmt(total)} / {fmt(targets.kcal)} kcal
                </span>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {d.meals.map((m, j) => (
                <MealCard key={j} meal={m} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="break-inside-avoid">
          <h3 className="flex items-center gap-2 text-lg font-extrabold">
            <ShoppingBasket className="h-5 w-5 text-primary" aria-hidden />
            Худалдан авах жагсаалт
          </h3>
          <div className="mt-4 space-y-4">
            {plan.shoppingList.map((g) => (
              <div key={g.category}>
                <p className="text-sm font-semibold text-muted">{g.category}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {g.items.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-bg px-2.5 py-0.5 text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="break-inside-avoid">
          <h3 className="flex items-center gap-2 text-lg font-extrabold">
            <Lightbulb className="h-5 w-5 text-primary" aria-hidden />
            Зөвлөгөө
          </h3>
          <ul className="mt-4 space-y-3">
            {plan.tips.map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
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
