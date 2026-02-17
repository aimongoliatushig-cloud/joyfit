import { cookies } from "next/headers";

const SESSION_COOKIE = "joyfit_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setSession(userId: string): void {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export function getSessionUserId(): string | null {
  const cookieStore = cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  return value ?? null;
}

export function clearSession(): void {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
}
