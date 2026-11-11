import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Админы тохиргоо (API key, AI model, админ нууц үг).
 * `data/settings.json` файлд хадгална. Энэ хавтас .gitignore-д орсон тул
 * key хэзээ ч GitHub руу явахгүй.
 */

export const MODEL_OPTIONS = [
  { id: "claude-opus-5-5", label: "Claude Opus 5.5 — хамгийн сайн чанар (санал болгох)" },
  { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 — хурдан, хямд" },
  { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 — хамгийн хямд" },
] as const;

export type ModelId = (typeof MODEL_OPTIONS)[number]["id"];
export const DEFAULT_MODEL: ModelId = "claude-opus-5-5";

interface StoredSettings {
  apiKey?: string;
  model?: ModelId;
  adminHash?: string;
  adminSalt?: string;
  sessionSecret?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "settings.json");

async function read(): Promise<StoredSettings> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as StoredSettings;
  } catch {
    return {};
  }
}

async function write(next: StoredSettings): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
}

function isModelId(v: unknown): v is ModelId {
  return MODEL_OPTIONS.some((m) => m.id === v);
}

/** AI дуудахад хэрэглэх key: тохиргоонд байвал түүнийг, үгүй бол .env.local-ийнхыг. */
export async function getAiConfig(): Promise<{ apiKey: string | null; model: ModelId; keySource: "settings" | "env" | "none" }> {
  const s = await read();
  const envModel = process.env.CLAUDE_MODEL;
  const model = s.model ?? (isModelId(envModel) ? envModel : DEFAULT_MODEL);
  if (s.apiKey) return { apiKey: s.apiKey, model, keySource: "settings" };
  if (process.env.ANTHROPIC_API_KEY) return { apiKey: process.env.ANTHROPIC_API_KEY, model, keySource: "env" };
  return { apiKey: null, model, keySource: "none" };
}

export function maskKey(key: string): string {
  if (key.length <= 12) return "••••";
  return `${key.slice(0, 7)}••••••${key.slice(-4)}`;
}

/** Browser руу илгээж болох (нууц биш) төлөв. */
export async function getPublicSettings() {
  const s = await read();
  const ai = await getAiConfig();
  return {
    hasAdmin: Boolean(s.adminHash),
    keySource: ai.keySource,
    maskedKey: ai.apiKey ? maskKey(ai.apiKey) : null,
    model: ai.model,
    models: MODEL_OPTIONS,
  };
}

export async function saveAiSettings(input: { apiKey?: string; model?: string; clearKey?: boolean }) {
  const s = await read();
  if (input.clearKey) delete s.apiKey;
  else if (input.apiKey) s.apiKey = input.apiKey.trim();
  if (input.model && isModelId(input.model)) s.model = input.model;
  await write(s);
}

// ---- Админ нууц үг ба сесс ----

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 32).toString("hex");
}

export async function hasAdmin(): Promise<boolean> {
  return Boolean((await read()).adminHash);
}

export async function setAdminPassword(password: string): Promise<void> {
  const s = await read();
  s.adminSalt = crypto.randomBytes(16).toString("hex");
  s.adminHash = hashPassword(password, s.adminSalt);
  s.sessionSecret = crypto.randomBytes(32).toString("hex"); // хуучин сессүүдийг хүчингүй болгоно
  await write(s);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const s = await read();
  if (!s.adminHash || !s.adminSalt) return false;
  const a = Buffer.from(hashPassword(password, s.adminSalt), "hex");
  const b = Buffer.from(s.adminHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const SESSION_COOKIE = "joyfit_admin";
const SESSION_HOURS = 12;

export async function createSessionToken(): Promise<string> {
  const s = await read();
  if (!s.sessionSecret) throw new Error("Админ тохируулагдаагүй байна");
  const expires = Date.now() + SESSION_HOURS * 3600_000;
  const sig = crypto.createHmac("sha256", s.sessionSecret).update(String(expires)).digest("hex");
  return `${expires}.${sig}`;
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const s = await read();
  if (!s.sessionSecret) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  const expected = crypto.createHmac("sha256", s.sessionSecret).update(expires).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const SESSION_MAX_AGE = SESSION_HOURS * 3600;
