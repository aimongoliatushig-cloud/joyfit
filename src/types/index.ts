export interface User {
  id: string;
  phone: string;
  pinHash: string;
  inviterRef?: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  startWeightKg: number;
  targetWeightKg: number;
  heightCm?: number;
  gender?: "male" | "female" | "other";
  birthYear?: number;
  workSituation?: "office" | "active" | "student" | "home" | "other";
  motivation?: "health" | "confidence" | "event" | "performance" | "other";
  weeklyCheckinDay?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  planChoice: "1m" | "3m";
}

export interface WeighInEntry {
  id: string;
  userId: string;
  weightKg: number;
  imageUrl?: string;
  createdAt: string;
  weekKey: string;
}
