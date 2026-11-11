"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Field, selectClass } from "@/components/ui/Field";

interface Status {
  hasAdmin: boolean;
  loggedIn: boolean;
  keySource?: "settings" | "env" | "none";
  maskedKey?: string | null;
  model?: string;
  models?: readonly { id: string; label: string }[];
}

type Notice = { kind: "ok" | "error"; text: string } | null;

async function call(body: object) {
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function NoticeBox({ notice }: { notice: Notice }) {
  if (!notice) return null;
  const cls =
    notice.kind === "ok"
      ? "border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100"
      : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200";
  return (
    <div role={notice.kind === "error" ? "alert" : "status"} className={`rounded-xl border p-3 text-sm ${cls}`}>
      {notice.text}
    </div>
  );
}

export default function SettingsPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loadError, setLoadError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      setStatus(await res.json());
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Тохиргоо</h1>
        <p className="mt-1 text-muted">Зөвхөн админд. Claude API key болон AI model-ийг энд тохируулна.</p>
      </div>

      {loadError && <NoticeBox notice={{ kind: "error", text: "Тохиргоог ачаалж чадсангүй. Хуудсаа дахин ачаална уу." }} />}
      {!status && !loadError && <p className="text-muted">Ачаалж байна…</p>}

      {status && !status.hasAdmin && <SetupAdmin onDone={refresh} />}
      {status && status.hasAdmin && !status.loggedIn && <Login onDone={refresh} />}
      {status && status.loggedIn && <AiSettings status={status} onChange={refresh} />}
    </div>
  );
}

function SetupAdmin({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) return setNotice({ kind: "error", text: "Нууц үг дор хаяж 6 тэмдэгт байна." });
    if (pw !== pw2) return setNotice({ kind: "error", text: "Хоёр нууц үг таарахгүй байна." });
    setBusy(true);
    const { ok, data } = await call({ action: "setup", password: pw });
    setBusy(false);
    if (!ok) return setNotice({ kind: "error", text: data.error ?? "Алдаа гарлаа." });
    onDone();
  }

  return (
    <Card>
      <h2 className="flex items-center gap-2 text-lg font-extrabold"><ShieldCheck className="h-5 w-5 text-primary" aria-hidden />Админ нууц үг үүсгэх</h2>
      <p className="mt-1 text-sm text-muted">
        Анх удаа нээж байна. Тохиргоог зөвхөн та өөрчлөх боломжтой байхын тулд нууц үг үүсгэнэ үү. Мартвал{" "}
        <code className="rounded bg-surface2 px-1">data/settings.json</code> файлыг устгаад шинээр үүсгэнэ.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <Field label="Нууц үг" htmlFor="pw" hint="Дор хаяж 6 тэмдэгт">
          <Input id="pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <Field label="Нууц үгээ давтах" htmlFor="pw2">
          <Input id="pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </Field>
        <NoticeBox notice={notice} />
        <Button type="submit" disabled={busy}>
          {busy ? "Хадгалж байна…" : "Нууц үг үүсгэх"}
        </Button>
      </form>
    </Card>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { ok, data } = await call({ action: "login", password: pw });
    setBusy(false);
    if (!ok) return setNotice({ kind: "error", text: data.error ?? "Алдаа гарлаа." });
    onDone();
  }

  return (
    <Card>
      <h2 className="flex items-center gap-2 text-lg font-extrabold"><ShieldCheck className="h-5 w-5 text-primary" aria-hidden />Админаар нэвтрэх</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <Field label="Нууц үг" htmlFor="login-pw">
          <Input id="login-pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <NoticeBox notice={notice} />
        <Button type="submit" disabled={busy || !pw}>
          {busy ? "Шалгаж байна…" : "Нэвтрэх"}
        </Button>
      </form>
    </Card>
  );
}

function AiSettings({ status, onChange }: { status: Status; onChange: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(status.model ?? "");
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState<"" | "test" | "save" | "clear">("");

  async function test() {
    setBusy("test");
    const { data } = await call({ action: "test", apiKey: apiKey || undefined, model });
    setBusy("");
    setNotice(data.ok ? { kind: "ok", text: "Key зөв ажиллаж байна ✓" } : { kind: "error", text: data.message ?? "Шалгаж чадсангүй." });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save");
    const { ok, data } = await call({ action: "save", apiKey: apiKey || undefined, model });
    setBusy("");
    if (!ok) return setNotice({ kind: "error", text: data.error ?? "Хадгалж чадсангүй." });
    setApiKey("");
    setNotice({ kind: "ok", text: "Хадгаллаа. Одооноос AI энэ тохиргоогоор ажиллана." });
    onChange();
  }

  async function clearKey() {
    if (!window.confirm("Хадгалсан API key-г устгах уу? Устгавал апп жишээ горимд шилжинэ.")) return;
    setBusy("clear");
    await call({ action: "clearKey" });
    setBusy("");
    setNotice({ kind: "ok", text: "Key устгагдлаа." });
    onChange();
  }

  async function logout() {
    await call({ action: "logout" });
    onChange();
  }

  const sourceText =
    status.keySource === "settings"
      ? `Холбогдсон: ${status.maskedKey}`
      : status.keySource === "env"
        ? `.env.local файлаас уншиж байна: ${status.maskedKey}`
        : "Key оруулаагүй — апп жишээ горимд ажиллаж байна.";

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold"><KeyRound className="h-5 w-5 text-primary" aria-hidden />Claude API key</h2>
            <p className={`mt-1 text-sm ${status.keySource === "none" ? "text-amber-700 dark:text-amber-300" : "text-muted"}`}>
              {sourceText}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="mr-1.5 inline h-4 w-4 align-[-2px]" aria-hidden />
            Гарах
          </Button>
        </div>

        <form onSubmit={save} className="mt-5 space-y-4">
          <Field
            label={status.keySource === "none" ? "API key" : "Шинэ API key (солих бол)"}
            htmlFor="apikey"
            hint="console.anthropic.com → API Keys → Create Key. «sk-ant-» гэж эхэлнэ."
          >
            <Input
              id="apikey"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </Field>

          <Field label="AI model" htmlFor="model" hint="Чанар сайн байх тусам үнэ өндөр. Ихэнх тохиолдолд эхнийх нь тохиромжтой.">
            <select id="model" className={selectClass} value={model} onChange={(e) => setModel(e.target.value)}>
              {status.models?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          <NoticeBox notice={notice} />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy !== ""}>
              {busy === "save" ? "Хадгалж байна…" : "Хадгалах"}
            </Button>
            <Button type="button" variant="secondary" onClick={test} disabled={busy !== "" || (status.keySource === "none" && !apiKey)}>
              {busy === "test" ? "Шалгаж байна…" : "Key шалгах"}
            </Button>
            {status.keySource === "settings" && (
              <Button type="button" variant="ghost" onClick={clearKey} disabled={busy !== ""}>
                Key устгах
              </Button>
            )}
          </div>
        </form>
      </Card>

      <ChangePassword />
    </>
  );
}

function ChangePassword() {
  const [pw, setPw] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) return setNotice({ kind: "error", text: "Нууц үг дор хаяж 6 тэмдэгт байна." });
    const { ok, data } = await call({ action: "changePassword", password: pw });
    if (!ok) return setNotice({ kind: "error", text: data.error ?? "Алдаа гарлаа." });
    setPw("");
    setNotice({ kind: "ok", text: "Нууц үг солигдлоо." });
  }

  return (
    <Card>
      <h2 className="text-lg font-extrabold">Админ нууц үг солих</h2>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Шинэ нууц үг" htmlFor="newpw">
            <Input id="newpw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
          </Field>
        </div>
        <Button type="submit" variant="secondary">
          Солих
        </Button>
      </form>
      <div className="mt-3">
        <NoticeBox notice={notice} />
      </div>
    </Card>
  );
}
