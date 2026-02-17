import { hashPin } from "@/lib/crypto";
import { prisma } from "./prisma";
import type { Gender, Motivation, PlanChoice, WeeklyCheckinDay, WorkSituation } from "@prisma/client";

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 8) return digits;
  if (digits.length === 11 && digits.startsWith("976")) return digits.slice(3);
  return digits;
}

/** ISO week key: YYYY-Www */
export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
}

function mapPlanChoice(choice: "1m" | "3m"): PlanChoice {
  return choice === "1m" ? "one_month" : "three_months";
}

function mapPlanChoiceFromDb(choice: PlanChoice): "1m" | "3m" {
  return choice === "one_month" ? "1m" : "3m";
}

export async function findUserByPhone(phone: string) {
  const normalized = normalizePhone(phone);
  return prisma.user.findUnique({
    where: { phone: normalized },
  });
}

export async function verifyUserPin(phone: string, pin: string): Promise<{ id: string } | null> {
  const user = await findUserByPhone(phone);
  if (!user) return null;
  const pinHash = await hashPin(pin);
  if (user.pinHash !== pinHash) return null;
  return { id: user.id };
}

export async function createUserWithProfileAndBaselineWeighIn(data: {
  phone: string;
  pinHash: string;
  inviterRef?: string;
  startWeightKg: number;
  targetWeightKg: number;
  heightCm?: number;
  gender?: "male" | "female" | "other";
  birthYear?: number;
  workSituation?: "office" | "active" | "student" | "home" | "other";
  motivation?: "health" | "confidence" | "event" | "performance" | "other";
  weeklyCheckinDay?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  planChoice: "1m" | "3m";
}) {
  const phone = normalizePhone(data.phone);
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) throw new Error("PHONE_EXISTS");

  const weekKey = getWeekKey();

  const user = await prisma.user.create({
    data: {
      phone,
      pinHash: data.pinHash,
      inviterRef: data.inviterRef?.trim() || null,
      profile: {
        create: {
          startWeightKg: data.startWeightKg,
          targetWeightKg: data.targetWeightKg,
          heightCm: data.heightCm ?? null,
          gender: (data.gender as Gender) ?? null,
          birthYear: data.birthYear ?? null,
          workSituation: (data.workSituation as WorkSituation) ?? null,
          motivation: (data.motivation as Motivation) ?? null,
          weeklyCheckinDay: (data.weeklyCheckinDay as WeeklyCheckinDay) ?? null,
          planChoice: mapPlanChoice(data.planChoice),
        },
      },
      weighIns: {
        create: {
          weightKg: data.startWeightKg,
          weekKey,
        },
      },
    },
    include: { profile: true },
  });

  return user;
}

export async function getUserProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });
  if (!profile) return null;
  return {
    ...profile,
    planChoice: mapPlanChoiceFromDb(profile.planChoice),
  };
}

export async function createWeighInEntry(data: {
  userId: string;
  weightKg: number;
  imageUrl?: string;
  weekKey: string;
}) {
  return prisma.weighIn.create({
    data: {
      userId: data.userId,
      weightKg: data.weightKg,
      imageUrl: data.imageUrl ?? null,
      weekKey: data.weekKey,
    },
  });
}

export async function listWeighInsForUser(userId: string) {
  return prisma.weighIn.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}
