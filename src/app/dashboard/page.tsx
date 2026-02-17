import { dictionary } from "@/lib/i18n";

const t = dictionary;

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <div className="absolute left-0 right-0 top-0 h-32 -z-10 bg-gradient-to-b from-primary/15 to-transparent dark:from-primary/25" />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-text">
          {t.common.dashboard}
        </h1>
        <p className="mt-2 text-muted">
          Тавтай морил. Энд таны хяналтын самбар байх болно.
        </p>
      </main>
    </div>
  );
}
