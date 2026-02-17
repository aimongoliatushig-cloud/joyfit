/**
 * In-memory fallback when PostgreSQL is unavailable.
 * Data is lost on server restart.
 */

import { hashPin } from "@/lib/crypto";

function getWeekKey(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
}

interface MockUser {
  id: string;
  phone: string;
  pinHash: string;
  inviterRef: string | null;
  createdAt: Date;
}

interface MockProfile {
  id: string;
  userId: string;
  startWeightKg: number;
  targetWeightKg: number;
  heightCm: number | null;
  gender: string | null;
  birthYear: number | null;
  workSituation: string | null;
  motivation: string | null;
  weeklyCheckinDay: string | null;
  planChoice: string;
  createdAt: Date;
}

interface MockWeighIn {
  id: string;
  userId: string;
  weightKg: number;
  imageUrl: string | null;
  weekKey: string;
  createdAt: Date;
}

const users: MockUser[] = [];
const profiles: MockProfile[] = [];
const weighIns: MockWeighIn[] = [];

export function mockFindUserByPhone(phone: string): MockUser | null {
  const normalized = phone.replace(/\D/g, "");
  const p = normalized.length === 8 ? normalized : normalized.startsWith("976") ? normalized.slice(3) : normalized;
  return users.find((u) => u.phone === p) ?? null;
}

export async function mockVerifyUserPin(phone: string, pin: string): Promise<{ id: string } | null> {
  const user = mockFindUserByPhone(phone);
  if (!user) return null;
  const pinHash = await hashPin(pin);
  if (user.pinHash !== pinHash) return null;
  return { id: user.id };
}

export function mockCreateUserWithProfileAndBaselineWeighIn(data: {
  phone: string;
  pinHash: string;
  inviterRef?: string;
  startWeightKg: number;
  targetWeightKg: number;
  heightCm?: number;
  gender?: string;
  birthYear?: number;
  workSituation?: string;
  motivation?: string;
  weeklyCheckinDay?: string;
  planChoice: "1m" | "3m";
}) {
  const digits = data.phone.replace(/\D/g, "");
  const phone = digits.length === 8 ? digits : digits.startsWith("976") ? digits.slice(3) : digits;
  const existing = users.find((u) => u.phone === phone);
  if (existing) throw new Error("PHONE_EXISTS");

  const userId = crypto.randomUUID();
  const now = new Date();
  const weekKey = getWeekKey();

  users.push({
    id: userId,
    phone,
    pinHash: data.pinHash,
    inviterRef: data.inviterRef?.trim() || null,
    createdAt: now,
  });

  profiles.push({
    id: crypto.randomUUID(),
    userId,
    startWeightKg: data.startWeightKg,
    targetWeightKg: data.targetWeightKg,
    heightCm: data.heightCm ?? null,
    gender: data.gender ?? null,
    birthYear: data.birthYear ?? null,
    workSituation: data.workSituation ?? null,
    motivation: data.motivation ?? null,
    weeklyCheckinDay: data.weeklyCheckinDay ?? null,
    planChoice: data.planChoice === "1m" ? "one_month" : "three_months",
    createdAt: now,
  });

  weighIns.push({
    id: crypto.randomUUID(),
    userId,
    weightKg: data.startWeightKg,
    imageUrl: null,
    weekKey,
    createdAt: now,
  });

  return { id: userId, phone, pinHash: data.pinHash, inviterRef: data.inviterRef?.trim() || null, createdAt: now.toISOString() };
}

export function mockGetUserById(id: string): MockUser | null {
  return users.find((u) => u.id === id) ?? null;
}
