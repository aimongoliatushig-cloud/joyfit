"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, Target, User, Utensils, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ChoiceCards, Field, Segmented } from "@/components/ui/Field";
import { GOAL_LABELS, type Profile } from "@/lib/nutrition";

/**
 * 3 алхамтай маягт. Загвар: 21st.dev «Multi-Step Setup Wizard» (olewandowski1),
 * shadcn-гүйгээр энэ төслийн Tailwind token-д дасгасан.
 */

interface Props {
  loading: boolean;
  onSubmit: (profile: Profile) => void;
}

type NumField = "age" | "heightCm" | "weightKg";

const LIMITS: Record<NumField, { min: number; max: number; label: string; unit: string; placeholder: string; required: string }> = {
  age: { min: 14, max: 90, label: "Нас", unit: "", placeholder: "жишээ нь 30", required: "Насаа оруулна уу." },
  heightCm: { min: 120, max: 230, label: "Өндөр", unit: "см", placeholder: "жишээ нь 165", required: "Өндрөө оруулна уу." },
  weightKg: { min: 35, max: 250, label: "Жин", unit: "кг", placeholder: "жишээ нь 72", required: "Жингээ оруулна уу." },
};

const STEPS: { title: string; short: string; icon: LucideIcon }[] = [
  { title: "Таны биеийн мэдээлэл", short: "Мэдээлэл", icon: User },
  { title: "Зорилго ба хөдөлгөөн", short: "Зорилго", icon: Target },
  { title: "Хоолны сонголт", short: "Хоол", icon: Utensils },
];

const GOAL_HINTS: Record<Profile["goal"], string> = {
  lose: "Өдөрт ~400–500 kcal бага",
  maintain: "Зарцуулсантайгаа тэнцүү",
  gain: "Өдөрт ~300 kcal илүү",
};

const ACTIVITY_OPTIONS: { value: Profile["activity"]; label: string; hint: string }[] = [
  { value: "sedentary", label: "Бага", hint: "Ихэвчлэн сууж ажилладаг" },
  { value: "light", label: "Сул", hint: "7 хоногт 1–3 удаа дасгал" },
  { value: "moderate", label: "Дунд", hint: "7 хоногт 3–5 удаа дасгал" },
  { value: "active", label: "Өндөр", hint: "Бараг өдөр бүр хүнд дасгал" },
];

export function PlanForm({ loading, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [sex, setSex] = useState<Profile["sex"]>("female");
  const [nums, setNums] = useState<Record<NumField, string>>({ age: "", heightCm: "", weightKg: "" });
  const [activity, setActivity] = useState<Profile["activity"]>("light");
  const [goal, setGoal] = useState<Profile["goal"]>("lose");
  const [mealsPerDay, setMealsPerDay] = useState<Profile["mealsPerDay"]>(3);
  const [days, setDays] = useState<Profile["days"]>(3);
  const [avoid, setAvoid] = useState("");
  const [likes, setLikes] = useState("");
  const [errors, setErrors] = useState<Partial<Record<NumField, string>>>({});

  const formRef = useRef<HTMLFormElement>(null);
  const firstRender = useRef(true);

  // Алхам солигдоход form-ын эхлэл рүү гүйлгэнэ (утсан дээр алхмын заагч харагдахгүй үлдэхгүй).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = formRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  /** 1-р алхмын тоонуудыг шалгаад, зөв бол утгыг буцаана. */
  function validateNumbers(): Record<NumField, number> | null {
    const next: Partial<Record<NumField, string>> = {};
    const values = {} as Record<NumField, number>;
    for (const key of Object.keys(LIMITS) as NumField[]) {
      const { min, max, required } = LIMITS[key];
      const raw = nums[key].replace(",", ".").trim();
      const v = Number(raw);
      if (!raw) next[key] = required;
      else if (!Number.isFinite(v) || v < min || v > max) next[key] = `${min}–${max} хооронд байх ёстой.`;
      values[key] = key === "age" ? Math.round(v) : v;
    }
    setErrors(next);
    return Object.keys(next).length ? null : values;
  }

  function goTo(target: number) {
    if (target > 0 && !validateNumbers()) {
      setStep(0);
      return;
    }
    setStep(target);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLast) return goTo(step + 1);
    const values = validateNumbers();
    if (!values) return setStep(0);
    onSubmit({ sex, ...values, activity, goal, mealsPerDay, days, avoid, likes });
  }

  return (
    <Card className="p-0 print:hidden">
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="scroll-mt-20">
        {/* Алхмын заагч */}
        <div className="space-y-4 border-b border-border p-5 sm:p-6">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <ol className="grid grid-cols-3 gap-2">
            {STEPS.map((s, i) => {
              const active = i === step;
              const done = i < step;
              const Icon = done ? Check : s.icon;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active ? "step" : undefined}
                    className="group flex w-full flex-col items-center gap-1.5 rounded-xl py-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
                        active
                          ? "border-primary bg-primary text-white"
                          : done
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-bg text-muted group-hover:border-primary/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className={`text-xs font-semibold sm:text-sm ${active ? "text-text" : "text-muted"}`}>
                      <span className="sm:hidden">{s.short}</span>
                      <span className="hidden sm:inline">{s.title}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="min-h-[300px] p-5 sm:p-6">
          {step === 0 && (
            <div className="space-y-5">
              <StepHeading title="Таны биеийн мэдээлэл" text="Илчлэгийн хэрэгцээг тооцоолоход хэрэгтэй." />
              <Field label="Хүйс">
                <Segmented
                  name="Хүйс"
                  value={sex}
                  onChange={setSex}
                  options={[
                    { value: "female", label: "Эмэгтэй" },
                    { value: "male", label: "Эрэгтэй" },
                  ]}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                {(Object.keys(LIMITS) as NumField[]).map((key) => {
                  const l = LIMITS[key];
                  return (
                    <Field key={key} label={l.unit ? `${l.label} (${l.unit})` : l.label} htmlFor={key} error={errors[key]}>
                      <Input
                        id={key}
                        inputMode="decimal"
                        placeholder={l.placeholder}
                        value={nums[key]}
                        aria-invalid={Boolean(errors[key])}
                        onChange={(e) => setNums((s) => ({ ...s, [key]: e.target.value }))}
                      />
                    </Field>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <StepHeading title="Зорилго ба хөдөлгөөн" text="Юунд хүрэхийг хүсэж байна вэ?" />
              <Field label="Зорилго">
                <ChoiceCards
                  name="Зорилго"
                  value={goal}
                  onChange={setGoal}
                  columns={3}
                  options={(Object.keys(GOAL_LABELS) as Profile["goal"][]).map((g) => ({
                    value: g,
                    label: GOAL_LABELS[g],
                    hint: GOAL_HINTS[g],
                  }))}
                />
              </Field>
              <Field label="Хөдөлгөөний идэвх">
                <ChoiceCards name="Хөдөлгөөний идэвх" value={activity} onChange={setActivity} columns={4} options={ACTIVITY_OPTIONS} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <StepHeading title="Хоолны сонголт" text="Цэсийг таны амьдралд тааруулна." />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Өдөрт хэдэн удаа хооллох вэ">
                  <Segmented
                    name="Хооллох тоо"
                    value={mealsPerDay}
                    onChange={setMealsPerDay}
                    options={[
                      { value: 3, label: "3 удаа" },
                      { value: 4, label: "4 удаа" },
                      { value: 5, label: "5 удаа" },
                    ]}
                  />
                </Field>
                <Field label="Хэдэн өдрийн цэс" hint="7 өдрийнх 1–2 минут орчим болно.">
                  <Segmented
                    name="Өдрийн тоо"
                    value={days}
                    onChange={setDays}
                    options={[
                      { value: 1, label: "1 өдөр" },
                      { value: 3, label: "3 өдөр" },
                      { value: 7, label: "7 өдөр" },
                    ]}
                  />
                </Field>
                <Field label="Идэхгүй хүнс, харшил" htmlFor="avoid" hint="Заавал биш. Жишээ нь: гахайн мах, сүү, самар">
                  <Input id="avoid" value={avoid} maxLength={300} onChange={(e) => setAvoid(e.target.value)} />
                </Field>
                <Field label="Дуртай хоол" htmlFor="likes" hint="Заавал биш. Жишээ нь: бууз, загас, тараг">
                  <Input id="likes" value={likes} maxLength={300} onChange={(e) => setLikes(e.target.value)} />
                </Field>
              </div>
              <p className="rounded-xl bg-surface2 p-3 text-sm text-muted">
                Энэ төлөвлөгөө эмчийн зөвлөгөөг орлохгүй. Эрүүл мэндийн асуудалтай бол эмчтэйгээ зөвлөлдөнө үү.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border p-5 sm:p-6">
          <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || loading}>
            <ArrowLeft className="mr-1.5 inline h-4 w-4 align-[-2px]" aria-hidden />
            Буцах
          </Button>
          <Button type="submit" size={isLast ? "lg" : "md"} disabled={loading}>
            {isLast ? (
              <>
                <Sparkles className="mr-2 inline h-5 w-5 align-[-3px]" aria-hidden />
                {loading ? "Гаргаж байна…" : "Төлөвлөгөө гаргах"}
              </>
            ) : (
              <>
                Үргэлжлүүлэх
                <ArrowRight className="ml-1.5 inline h-4 w-4 align-[-2px]" aria-hidden />
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function StepHeading({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-xl font-extrabold">{title}</h2>
      <p className="text-muted">{text}</p>
    </div>
  );
}
