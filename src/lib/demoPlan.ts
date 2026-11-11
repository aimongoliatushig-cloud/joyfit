import type { Profile, Targets } from "./nutrition";
import type { Meal, MealPlan } from "./planSchema";

/**
 * API key тохируулаагүй үед жишээ төлөвлөгөө гаргана.
 * Зорилго: суулгалт зөв болсныг шалгах. Хоолнуудыг илчлэгийн зорилтод тааруулж томруулна/жижигрүүлнэ.
 */

interface Template {
  dish: string;
  ingredients: [string, number, string][]; // [хүнс, хэмжээ, нэгж]
  kcal: number;
  p: number;
  c: number;
  f: number;
}

const BREAKFAST: Template[] = [
  { dish: "Овъёосны будаа, сүү, алим", ingredients: [["Овъёос", 60, "г"], ["Сүү", 200, "мл"], ["Алим", 1, "ш"]], kcal: 420, p: 16, c: 66, f: 10 },
  { dish: "Чанасан өндөг, хар талх, улаан лооль", ingredients: [["Өндөг", 2, "ш"], ["Хар талх", 60, "г"], ["Улаан лооль", 100, "г"]], kcal: 380, p: 20, c: 34, f: 16 },
  { dish: "Тараг, ааруул, банана", ingredients: [["Тараг", 250, "г"], ["Ааруул", 20, "г"], ["Банана", 1, "ш"]], kcal: 400, p: 20, c: 52, f: 11 },
];
const LUNCH: Template[] = [
  { dish: "Үхрийн махтай будаатай хуурга", ingredients: [["Үхрийн мах (өөхгүй)", 130, "г"], ["Будаа", 70, "г"], ["Лууван, сонгино, байцаа", 150, "г"]], kcal: 620, p: 38, c: 66, f: 20 },
  { dish: "Тахианы цээж, төмс, ногооны салат", ingredients: [["Тахианы цээж", 150, "г"], ["Төмс", 200, "г"], ["Өргөст хэмх, байцаа", 150, "г"]], kcal: 560, p: 42, c: 50, f: 16 },
  { dish: "Ногоотой гурилтай шөл (хонины мах)", ingredients: [["Хонины мах", 100, "г"], ["Гурил", 70, "г"], ["Төмс, лууван", 150, "г"]], kcal: 640, p: 32, c: 70, f: 24 },
];
const SNACK: Template[] = [
  { dish: "Тараг, самар", ingredients: [["Тараг", 150, "г"], ["Самар", 15, "г"]], kcal: 200, p: 9, c: 12, f: 12 },
  { dish: "Алим, ааруул", ingredients: [["Алим", 1, "ш"], ["Ааруул", 25, "г"]], kcal: 180, p: 8, c: 28, f: 4 },
];
const DINNER: Template[] = [
  { dish: "Загас, шарсан ногоо", ingredients: [["Загас", 150, "г"], ["Байцаа, лууван, чинжүү", 200, "г"], ["Ургамлын тос", 10, "г"]], kcal: 420, p: 34, c: 18, f: 22 },
  { dish: "Үхрийн махтай ногооны шөл", ingredients: [["Үхрийн мах", 100, "г"], ["Төмс, лууван, байцаа", 250, "г"]], kcal: 400, p: 30, c: 32, f: 15 },
  { dish: "Өндөгтэй ногооны хуурга, хар талх", ingredients: [["Өндөг", 2, "ш"], ["Хүнсний ногоо", 200, "г"], ["Хар талх", 40, "г"]], kcal: 390, p: 20, c: 36, f: 18 },
];

const SLOTS: Record<Profile["mealsPerDay"], { slot: string; time: string; pool: Template[]; share: number }[]> = {
  3: [
    { slot: "Өглөөний цай", time: "08:00", pool: BREAKFAST, share: 0.3 },
    { slot: "Үдийн хоол", time: "13:00", pool: LUNCH, share: 0.4 },
    { slot: "Оройн хоол", time: "19:00", pool: DINNER, share: 0.3 },
  ],
  4: [
    { slot: "Өглөөний цай", time: "08:00", pool: BREAKFAST, share: 0.25 },
    { slot: "Үдийн хоол", time: "13:00", pool: LUNCH, share: 0.35 },
    { slot: "Зууш", time: "16:00", pool: SNACK, share: 0.1 },
    { slot: "Оройн хоол", time: "19:00", pool: DINNER, share: 0.3 },
  ],
  5: [
    { slot: "Өглөөний цай", time: "08:00", pool: BREAKFAST, share: 0.25 },
    { slot: "Зууш", time: "10:30", pool: SNACK, share: 0.1 },
    { slot: "Үдийн хоол", time: "13:00", pool: LUNCH, share: 0.3 },
    { slot: "Зууш", time: "16:00", pool: SNACK, share: 0.1 },
    { slot: "Оройн хоол", time: "19:00", pool: DINNER, share: 0.25 },
  ],
};

function scaleMeal(t: Template, targetKcal: number, slot: string, time: string): Meal {
  const k = targetKcal / t.kcal;
  return {
    slot,
    time,
    dish: t.dish,
    ingredients: t.ingredients.map(([food, amount, unit]) => ({
      food,
      amount: unit === "ш" ? `${Math.max(1, Math.round(amount * k))} ш` : `${Math.round((amount * k) / 5) * 5} ${unit}`,
    })),
    kcal: Math.round(t.kcal * k),
    proteinG: Math.round(t.p * k),
    carbsG: Math.round(t.c * k),
    fatG: Math.round(t.f * k),
  };
}

export function buildDemoPlan(p: Profile, t: Targets): MealPlan {
  const slots = SLOTS[p.mealsPerDay];
  const days = Array.from({ length: p.days }, (_, d) => ({
    day: d + 1,
    meals: slots.map((s, i) => scaleMeal(s.pool[(d + i) % s.pool.length], t.kcal * s.share, s.slot, s.time)),
  }));

  return {
    summary:
      "Энэ бол ЖИШЭЭ төлөвлөгөө — AI ашиглаагүй. Суулгалт зөв ажиллаж байгааг харуулна. Жинхэнэ, хувь хүнд тохирсон цэс гаргахын тулд админ «Тохиргоо» хэсэгт Claude API key оруулна уу.",
    days,
    shoppingList: [
      { category: "Мах, загас", items: ["Үхрийн мах", "Тахианы цээж", "Хонины мах", "Загас"] },
      { category: "Сүүн бүтээгдэхүүн, өндөг", items: ["Сүү", "Тараг", "Ааруул", "Өндөг"] },
      { category: "Ногоо, жимс", items: ["Төмс", "Лууван", "Байцаа", "Сонгино", "Өргөст хэмх", "Улаан лооль", "Алим", "Банана"] },
      { category: "Үр тариа", items: ["Овъёос", "Будаа", "Гурил", "Хар талх"] },
    ],
    tips: [
      "Өдөрт 2–2.5 литр ус уу.",
      "Хоолоо удаан, сайн зажилж идээрэй.",
      "Оройн хоолоо унтахаас 3 цагийн өмнө идээрэй.",
    ],
  };
}
