import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  getAiConfig,
  getPublicSettings,
  hasAdmin,
  isValidSession,
  saveAiSettings,
  setAdminPassword,
  verifyAdminPassword,
} from "@/server/settings";
import { testApiKey } from "@/server/generatePlan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin() {
  return isValidSession(cookies().get(SESSION_COOKIE)?.value);
}



function setSessionCookie(res: NextResponse, token: string, https: boolean) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: https,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Төлөв: админ үүссэн эсэх, нэвтэрсэн эсэх, (нэвтэрсэн бол) key-ийн далдалсан хувилбар. */
export async function GET() {
  const admin = await isAdmin();
  const pub = await getPublicSettings();
  return NextResponse.json({
    hasAdmin: pub.hasAdmin,
    loggedIn: admin,
    ...(admin ? { keySource: pub.keySource, maskedKey: pub.maskedKey, model: pub.model, models: pub.models } : {}),
  });
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("setup"), password: z.string().min(6).max(100) }),
  z.object({ action: z.literal("login"), password: z.string().min(1).max(100) }),
  z.object({ action: z.literal("logout") }),
  z.object({ action: z.literal("save"), apiKey: z.string().max(300).optional(), model: z.string().optional() }),
  z.object({ action: z.literal("clearKey") }),
  z.object({ action: z.literal("test"), apiKey: z.string().max(300).optional(), model: z.string().optional() }),
  z.object({ action: z.literal("changePassword"), password: z.string().min(6).max(100) }),
]);

export async function POST(request: Request) {
  const https = new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Буруу хүсэлт. Нууц үг дор хаяж 6 тэмдэгт байх ёстой." }, { status: 400 });
  }
  const input = parsed.data;

  switch (input.action) {
    case "setup": {
      if (await hasAdmin()) return NextResponse.json({ error: "Админ аль хэдийн тохируулагдсан." }, { status: 409 });
      await setAdminPassword(input.password);
      const res = NextResponse.json({ ok: true });
      setSessionCookie(res, await createSessionToken(), https);
      return res;
    }
    case "login": {
      if (!(await verifyAdminPassword(input.password))) {
        await new Promise((r) => setTimeout(r, 600)); // таах оролдлогыг удаашруулна
        return NextResponse.json({ error: "Нууц үг буруу байна." }, { status: 401 });
      }
      const res = NextResponse.json({ ok: true });
      setSessionCookie(res, await createSessionToken(), https);
      return res;
    }
    case "logout": {
      const res = NextResponse.json({ ok: true });
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
  }

  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Эхлээд админаар нэвтэрнэ үү." }, { status: 401 });
  }

  switch (input.action) {
    case "save": {
      const key = input.apiKey?.trim();
      if (key && !key.startsWith("sk-ant-")) {
        return NextResponse.json({ error: "Claude API key «sk-ant-» гэж эхэлдэг. Зөв хуулсан эсэхээ шалгана уу." }, { status: 400 });
      }
      await saveAiSettings({ apiKey: key || undefined, model: input.model });
      return NextResponse.json({ ok: true });
    }
    case "clearKey": {
      await saveAiSettings({ clearKey: true });
      return NextResponse.json({ ok: true });
    }
    case "test": {
      const current = await getAiConfig();
      const key = input.apiKey?.trim() || current.apiKey;
      if (!key) return NextResponse.json({ ok: false, message: "Шалгах key алга." });
      return NextResponse.json(await testApiKey(key, input.model || current.model));
    }
    case "changePassword": {
      await setAdminPassword(input.password);
      const res = NextResponse.json({ ok: true });
      setSessionCookie(res, await createSessionToken(), https);
      return res;
    }
  }
}
