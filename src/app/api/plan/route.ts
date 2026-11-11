import { NextResponse } from "next/server";
import { calculateTargets, profileSchema } from "@/lib/nutrition";
import { buildDemoPlan } from "@/lib/demoPlan";
import type { PlanResponse } from "@/lib/planSchema";
import { getAiConfig } from "@/server/settings";
import { generatePlanWithClaude, PlanError } from "@/server/generatePlan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Мэдээлэл дутуу эсвэл буруу байна. Маягтаа шалгана уу." }, { status: 400 });
  }

  const profile = parsed.data;
  const targets = calculateTargets(profile);
  const { apiKey, model } = await getAiConfig();

  if (!apiKey) {
    const res: PlanResponse = { source: "demo", targets, plan: buildDemoPlan(profile, targets) };
    return NextResponse.json(res);
  }

  try {
    const plan = await generatePlanWithClaude(profile, targets, apiKey, model);
    const res: PlanResponse = { source: "ai", model, targets, plan };
    return NextResponse.json(res);
  } catch (err) {
    if (err instanceof PlanError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[plan] unexpected error", err);
    return NextResponse.json({ error: "Тодорхойгүй алдаа гарлаа. Дахин оролдоно уу." }, { status: 500 });
  }
}
