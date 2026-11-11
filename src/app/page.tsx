"use client";

import { useRef, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { PlanForm } from "@/components/PlanForm";
import { PlanResult } from "@/components/PlanResult";
import type { Profile } from "@/lib/nutrition";
import type { PlanResponse } from "@/lib/planSchema";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PlanResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function generate(profile: Profile) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json().catch(() => ({ error: "Серверээс буруу хариу ирлээ." }));
      if (!res.ok) throw new Error(data.error ?? "Алдаа гарлаа.");
      setResult(data as PlanResponse);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setError(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "Сервертэй холбогдож чадсангүй.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="print:hidden">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" aria-hidden />
          AI хоол зүйч
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Хувийн хооллолтын төлөвлөгөө</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted">
          Мэдээллээ оруулаад товч дарахад таны илчлэгийн хэрэгцээг тооцоолж, AI өдөр бүрийн цэс, худалдан авах
          жагсаалт гаргана.
        </p>
      </div>

      <PlanForm loading={loading} onSubmit={generate} />

      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 print:hidden" aria-live="polite">
          <LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
          <span>AI цэс бэлдэж байна. 30 секундээс 2 минут орчим хүлээнэ үү…</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </div>
      )}

      {result && !loading && (
        <div ref={resultRef} className="scroll-mt-20">
          <PlanResult data={result} />
        </div>
      )}
    </div>
  );
}
