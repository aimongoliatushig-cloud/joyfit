"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dictionary } from "@/lib/i18n";
import { login } from "@/server/actions";
import { isValidPhone } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const t = dictionary;

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phone.trim() || !isValidPhone(phone)) {
      setError(t.errors.phoneInvalid);
      return;
    }
    if (!pin.trim()) {
      setError(t.errors.pinRequired);
      return;
    }
    setLoading(true);
    try {
      const result = await login(phone, pin);
      if ("success" in result && result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(t.errors.loginFailed);
      }
    } catch {
      setError(t.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="absolute left-0 right-0 top-0 h-40 -z-10 bg-gradient-to-b from-primary/15 to-transparent dark:from-primary/25" />

      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Card className="w-full">
          <h1 className="text-2xl font-extrabold text-text">{t.login.title}</h1>
          <p className="mt-1 text-muted">{t.login.subtitle}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text">
                {t.login.phone}
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder={t.onboarding.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-text">
                {t.login.pin}
              </label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                placeholder="4-6 орон"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={6}
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "..." : t.login.submit}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {t.login.noAccount}{" "}
            <Link href="/onboarding" className="text-primary hover:underline">
              {t.login.registerLink}
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
