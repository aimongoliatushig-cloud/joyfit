"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Field, Segmented, selectClass } from "@/components/ui/Field";
import { ACTIVITY_LABELS, GOAL_LABELS, type Profile } from "@/lib/nutrition";

interface Props {
  loading: boolean;
  onSubmit: (profile: Profile) => void;
}

type NumField = "age" | "heightCm" | "weightKg";

const LIMITS: Record<NumField, { min: number; max: number; label: string; required: string }> = {
  age: { min: 14, max: 90, label: "Нас", required: "Насаа оруулна уу." },
  heightCm: { min: 120, max: 230, label: "Өндөр", required: "Өндрөө оруулна уу." },
  weightKg: { min: 35, max: 250, label: "Жин", required: "Жингээ оруулна уу." },
};

export function PlanForm({ loading, onSubmit }: Props) {
  const [sex, setSex] = useState<Profile["sex"]>("female");
  const [nums, setNums] = useState<Record<NumField, string>>({ age: "", heightCm: "", weightKg: "" });
  const [activity, setActivity] = useState<Profile["activity"]>("light");
  const [goal, setGoal] = useState<Profile["goal"]>("lose");
  const [mealsPerDay, setMealsPerDay] = useState<Profile["mealsPerDay"]>(3);
  const [days, setDays] = useState<Profile["days"]>(3);
  const [avoid, setAvoid] = useState("");
  const [likes, setLikes] = useState("");
  const [errors, setErrors] = useState<Partial<Record<NumField, string>>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<NumField, string>> = {};
    const values = {} as Record<NumField, number>;
    for (const key of Object.keys(LIMITS) as NumField[]) {
      const { min, max, required } = LIMITS[key];
      const v = Number(nums[key].replace(",", "."));
      if (!nums[key].trim()) next[key] = required;
      else if (!Number.isFinite(v) || v < min || v > max) next[key] = `${min}–${max} хооронд байх ёстой.`;
      values[key] = key === "age" ? Math.round(v) : v;
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    onSubmit({ sex, ...values, activity, goal, mealsPerDay, days, avoid, likes });
  }

  const numInput = (key: NumField, unit: string, placeholder: string) => (
    <Field label={`${LIMITS[key].label} (${unit})`} htmlFor={key} error={errors[key]}>
      <Input
        id={key}
        inputMode="decimal"
        placeholder={placeholder}
        value={nums[key]}
        aria-invalid={Boolean(errors[key])}
        onChange={(e) => setNums((s) => ({ ...s, [key]: e.target.value }))}
      />
    </Field>
  );

  return (
    <Card className="print:hidden">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
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
          {numInput("age", "нас", "жишээ нь 30")}
          {numInput("heightCm", "см", "жишээ нь 165")}
          {numInput("weightKg", "кг", "жишээ нь 72")}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Зорилго">
            <Segmented
              name="Зорилго"
              value={goal}
              onChange={setGoal}
              options={(Object.keys(GOAL_LABELS) as Profile["goal"][]).map((g) => ({ value: g, label: GOAL_LABELS[g] }))}
            />
          </Field>
          <Field label="Хөдөлгөөний идэвх" htmlFor="activity">
            <select
              id="activity"
              className={selectClass}
              value={activity}
              onChange={(e) => setActivity(e.target.value as Profile["activity"])}
            >
              {(Object.keys(ACTIVITY_LABELS) as Profile["activity"][]).map((a) => (
                <option key={a} value={a}>
                  {ACTIVITY_LABELS[a]}
                </option>
              ))}
            </select>
          </Field>
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
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Идэхгүй хүнс, харшил" htmlFor="avoid" hint="Заавал биш. Жишээ нь: гахайн мах, сүү, самар">
            <Input id="avoid" value={avoid} maxLength={300} onChange={(e) => setAvoid(e.target.value)} />
          </Field>
          <Field label="Дуртай хоол" htmlFor="likes" hint="Заавал биш. Жишээ нь: бууз, загас, тараг">
            <Input id="likes" value={likes} maxLength={300} onChange={(e) => setLikes(e.target.value)} />
          </Field>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Энэ төлөвлөгөө эмчийн зөвлөгөөг орлохгүй. Эрүүл мэндийн асуудалтай бол эмчтэйгээ зөвлөлдөнө үү.
          </p>
          <Button type="submit" size="lg" disabled={loading} className="shrink-0">
            {loading ? "Төлөвлөгөө гаргаж байна…" : "Төлөвлөгөө гаргах"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
