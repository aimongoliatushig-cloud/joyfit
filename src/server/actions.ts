"use server";

import { redirect } from "next/navigation";
import { hashPin } from "@/lib/crypto";
import {
  createUserWithProfileAndBaselineWeighIn,
  findUserByPhone,
  verifyUserPin,
} from "@/server/db/adapter";
import { setSession, clearSession } from "@/server/db/session";

export async function checkPhoneExists(phone: string): Promise<boolean> {
  const user = await findUserByPhone(phone);
  return user !== null;
}

export async function completeOnboarding(data: {
  phone: string;
  pin: string;
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
}): Promise<{ success: true } | { error: string }> {
  try {
    const pinHash = await hashPin(data.pin);
    const user = await createUserWithProfileAndBaselineWeighIn({
      ...data,
      pinHash,
    });
    setSession(user.id);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "PHONE_EXISTS") {
      return { error: "PHONE_EXISTS" };
    }
    return { error: "GENERIC" };
  }
}

export async function login(phone: string, pin: string): Promise<{ success: true } | { error: string }> {
  const result = await verifyUserPin(phone, pin);
  if (!result) {
    return { error: "INVALID" };
  }
  setSession(result.id);
  return { success: true };
}

export async function logout(): Promise<void> {
  clearSession();
  redirect("/");
}
