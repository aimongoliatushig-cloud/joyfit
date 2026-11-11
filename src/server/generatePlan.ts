import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { planSchema, type MealPlan } from "@/lib/planSchema";
import { ACTIVITY_LABELS, GOAL_LABELS, type Profile, type Targets } from "@/lib/nutrition";

/** Хэрэглэгчид ойлгомжтой мессежтэй алдаа. */
export class PlanError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

const SYSTEM_PROMPT = `Та Монголд амьдардаг хүмүүст зориулж өдөр тутмын хооллолтын төлөвлөгөө гаргадаг хоол зүйч.

Дүрэм:
- Бүх текстийг монгол кирилл үсгээр бич.
- Монголын дэлгүүр, захаас амархан олдох, үнэ боломжийн хүнс ашигла (үхрийн мах, хонины мах, тахиа, загас, өндөг, тараг, ааруул, сүү, будаа, гурил, овъёос, төмс, лууван, байцаа, сонгино, хүнсний ногоо, жимс гэх мэт). Монгол уламжлалт хоол (бууз, цуйван, гурилтай шөл, банштай цай) оруулж болно, гэхдээ илчлэгийн зорилтод тааруулж хэмжээг нь тохируул.
- Орц бүрт грамм эсвэл ширхгээр тодорхой хэмжээ заа.
- Өдөр бүрийн нийт илчлэг өгөгдсөн зорилтоос ±5%-иас хэтрэхгүй байх ёстой. Хоол бүрийн kcal, уураг, нүүрс ус, өөх тосны тоог бодитой тооцоол.
- Өдрүүдийн цэс давтагдахгүй, олон янз байх.
- Хэрэглэгчийн идэхгүй гэсэн хүнс, харшлыг хэзээ ч бүү оруул.
- Хоол бэлтгэх нь энгийн, 30 минутаас ихгүй байх.
- Худалдан авах жагсаалтыг ангиллаар (Мах, Сүүн бүтээгдэхүүн, Ногоо, Жимс, Үр тариа, Бусад) нэгтгэ.
- Зөвлөгөөг 3–5 богино, хэрэгжүүлэхүйц өгүүлбэрээр бич.`;

function buildUserPrompt(p: Profile, t: Targets): string {
  return `Хэрэглэгчийн мэдээлэл:
- Хүйс: ${p.sex === "male" ? "эрэгтэй" : "эмэгтэй"}, нас: ${p.age}
- Өндөр: ${p.heightCm} см, жин: ${p.weightKg} кг (BMI ${t.bmi})
- Идэвх: ${ACTIVITY_LABELS[p.activity]}
- Зорилго: ${GOAL_LABELS[p.goal]}
- Идэхгүй хүнс / харшил: ${p.avoid.trim() || "байхгүй"}
- Дуртай хоол: ${p.likes.trim() || "онцгой заагаагүй"}

Өдрийн зорилт (код тооцоолсон, яг үүнийг баримтал):
- Илчлэг: ${t.kcal} kcal
- Уураг: ${t.proteinG} г, нүүрс ус: ${t.carbsG} г, өөх тос: ${t.fatG} г

${p.days} өдрийн төлөвлөгөө гарга. Өдөрт ${p.mealsPerDay} удаа хооллоно${p.mealsPerDay > 3 ? " (зууш оруулна)" : ""}.`;
}

export async function generatePlanWithClaude(
  profile: Profile,
  targets: Targets,
  apiKey: string,
  model: string,
): Promise<MealPlan> {
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.parse({
      model,
      max_tokens: 16000,
      output_config: {
        effort: "low",
        format: zodOutputFormat(planSchema),
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(profile, targets) }],
    });

    if (response.stop_reason === "refusal") {
      throw new PlanError("AI энэ хүсэлтэд хариулахаас татгалзлаа. Мэдээллээ шалгаад дахин оролдоно уу.", 422);
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      throw new PlanError("AI-ийн хариу бүрэн гарсангүй. Өдрийн тоог багасгаад дахин оролдоно уу.", 502);
    }
    return response.parsed_output;
  } catch (err) {
    if (err instanceof PlanError) throw err;
    if (err instanceof Anthropic.AuthenticationError) {
      throw new PlanError("API key буруу эсвэл хүчингүй байна. Админ «Тохиргоо» хэсгээс key-ээ шалгана уу.", 401);
    }
    if (err instanceof Anthropic.PermissionDeniedError) {
      throw new PlanError("Энэ API key-д сонгосон model ашиглах эрх алга. «Тохиргоо»-оос өөр model сонгоно уу.", 403);
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new PlanError("Хэт олон хүсэлт ирлээ. Нэг минутын дараа дахин оролдоно уу.", 429);
    }
    if (err instanceof Anthropic.BadRequestError) {
      const msg = err.message.toLowerCase();
      if (msg.includes("credit") || msg.includes("billing")) {
        throw new PlanError("Anthropic данс дээр үлдэгдэл (credit) дууссан байна. console.anthropic.com дээр цэнэглэнэ үү.", 402);
      }
      throw new PlanError("AI руу илгээсэн хүсэлт буруу байна. Дахин оролдоно уу.", 400);
    }
    if (err instanceof Anthropic.APIConnectionError) {
      throw new PlanError("AI сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу.", 503);
    }
    if (err instanceof Anthropic.APIError) {
      throw new PlanError(`AI үйлчилгээ түр ажиллахгүй байна (${err.status}). Дараа дахин оролдоно уу.`, 502);
    }
    throw err;
  }
}

/** Тохиргооны хуудсанд key-г шалгах: model-ийн мэдээлэл авахад төлбөргүй. */
export async function testApiKey(apiKey: string, model: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const client = new Anthropic({ apiKey, maxRetries: 0 });
    await client.models.retrieve(model);
    return { ok: true };
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return { ok: false, message: "Key буруу байна." };
    if (err instanceof Anthropic.NotFoundError || err instanceof Anthropic.PermissionDeniedError)
      return { ok: false, message: "Key зөв боловч сонгосон model-д эрх алга." };
    if (err instanceof Anthropic.APIConnectionError) return { ok: false, message: "Интернэт холболтоо шалгана уу." };
    if (err instanceof Anthropic.APIError) return { ok: false, message: `Алдаа (${err.status}).` };
    return { ok: false, message: "Тодорхойгүй алдаа гарлаа." };
  }
}
