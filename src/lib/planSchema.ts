import { z } from "zod";

/**
 * AI-аас буцах хооллолтын төлөвлөгөөний бүтэц.
 * Claude structured outputs энэ схемийн дагуу JSON буцаадаг.
 */
export const mealSchema = z.object({
  slot: z.string().describe("Хоолны цаг: Өглөөний цай, Үдийн хоол, Зууш, Оройн хоол"),
  time: z.string().describe("Санал болгох цаг, жишээ нь 08:00"),
  dish: z.string().describe("Хоолны нэр"),
  ingredients: z
    .array(z.object({ food: z.string(), amount: z.string().describe("Грамм эсвэл ширхэг") }))
    .describe("Орц ба хэмжээ"),
  kcal: z.number().int(),
  proteinG: z.number().int(),
  carbsG: z.number().int(),
  fatG: z.number().int(),
});

export const planSchema = z.object({
  summary: z.string().describe("2-3 өгүүлбэр: энэ төлөвлөгөөний гол санаа"),
  days: z.array(
    z.object({
      day: z.number().int(),
      meals: z.array(mealSchema),
    }),
  ),
  shoppingList: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
    }),
  ),
  tips: z.array(z.string()),
});

export type Meal = z.infer<typeof mealSchema>;
export type MealPlan = z.infer<typeof planSchema>;

/** Сервер нүүр хуудас руу буцаах бүтэн хариу. */
export interface PlanResponse {
  source: "ai" | "demo";
  model?: string;
  targets: import("./nutrition").Targets;
  plan: MealPlan;
}
