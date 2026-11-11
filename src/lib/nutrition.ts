import { z } from "zod";

/** Хэрэглэгчийн бөглөх маягтын өгөгдөл. Сервер дээр дахин шалгана. */
export const profileSchema = z.object({
  sex: z.enum(["male", "female"]),
  age: z.number().int().min(14).max(90),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(250),
  activity: z.enum(["sedentary", "light", "moderate", "active"]),
  goal: z.enum(["lose", "maintain", "gain"]),
  mealsPerDay: z.union([z.literal(3), z.literal(4), z.literal(5)]),
  days: z.union([z.literal(1), z.literal(3), z.literal(7)]),
  avoid: z.string().max(300).default(""),
  likes: z.string().max(300).default(""),
});

export type Profile = z.infer<typeof profileSchema>;

export const ACTIVITY_LABELS: Record<Profile["activity"], string> = {
  sedentary: "Бага хөдөлгөөнтэй (ихэвчлэн сууж ажилладаг)",
  light: "Сул идэвхтэй (долоо хоногт 1–3 удаа дасгал)",
  moderate: "Дунд идэвхтэй (долоо хоногт 3–5 удаа дасгал)",
  active: "Өндөр идэвхтэй (бараг өдөр бүр хүнд дасгал)",
};

export const GOAL_LABELS: Record<Profile["goal"], string> = {
  lose: "Жин хасах",
  maintain: "Жингээ барих",
  gain: "Жин нэмэх (булчин)",
};

const ACTIVITY_FACTOR: Record<Profile["activity"], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const PROTEIN_PER_KG: Record<Profile["goal"], number> = {
  lose: 1.6,
  maintain: 1.4,
  gain: 1.8,
};

export interface Targets {
  bmi: number;
  bmr: number;
  tdee: number;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

/**
 * Өдрийн илчлэгийн зорилтыг Mifflin–St Jeor томьёогоор тооцоолно.
 * AI биш, код тооцоолдог тул тоо нь тогтвортой, шалгаж болохуйц.
 */
export function calculateTargets(p: Profile): Targets {
  const bmr =
    10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === "male" ? 5 : -161);
  const tdee = bmr * ACTIVITY_FACTOR[p.activity];

  let kcal = tdee;
  if (p.goal === "lose") kcal = tdee - Math.min(500, tdee * 0.2);
  if (p.goal === "gain") kcal = tdee + 300;

  const floor = p.sex === "male" ? 1500 : 1200;
  kcal = Math.max(floor, Math.round(kcal / 10) * 10);

  const proteinG = Math.round(p.weightKg * PROTEIN_PER_KG[p.goal]);
  const fatG = Math.round((kcal * 0.28) / 9);
  const carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));

  const bmi = p.weightKg / Math.pow(p.heightCm / 100, 2);

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    kcal,
    proteinG,
    fatG,
    carbsG,
  };
}

/** Тоог мянгатын тусгаарлагчтай харуулна (kcal, грамм). Мөнгө биш. */
export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("mn-MN");
}

export function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return "Жин дутуу";
  if (bmi < 25) return "Хэвийн";
  if (bmi < 30) return "Илүүдэл жин";
  return "Таргалалт";
}
