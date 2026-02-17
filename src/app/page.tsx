import Link from "next/link";
import { dictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const t = dictionary;

const FEATURES = [
  {
    icon: "🍎",
    title: t.home.feature1Title,
    desc: t.home.feature1Desc,
  },
  {
    icon: "📊",
    title: t.home.feature2Title,
    desc: t.home.feature2Desc,
  },
  {
    icon: "👥",
    title: t.home.feature3Title,
    desc: t.home.feature3Desc,
  },
  {
    icon: "🏆",
    title: t.home.feature4Title,
    desc: t.home.feature4Desc,
  },
];

const STEPS = [
  { title: t.home.step1Title, desc: t.home.step1Desc },
  { title: t.home.step2Title, desc: t.home.step2Desc },
  { title: t.home.step3Title, desc: t.home.step3Desc },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-bg to-primary/10 dark:from-primary/10 dark:via-bg dark:to-primary/15" />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight text-text sm:text-5xl">
              {t.home.heroTitle1}{" "}
              <span className="text-primary">{t.home.heroTitle2}</span>
            </h1>
            <p className="mt-4 text-lg font-semibold text-text">
              {t.home.heroTagline}
            </p>
            <p className="mt-4 text-muted">
              {t.home.heroDesc}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/onboarding">
                <Button variant="primary" size="lg">
                  {t.home.ctaStart} →
                </Button>
              </Link>
              <a href="#why">
                <Button variant="secondary" size="lg">
                  ▶ {t.home.ctaHow}
                </Button>
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <Card className="border-primary/20">
              <p className="text-sm text-muted">{t.home.progressTitle}</p>
              <p className="mt-1 text-2xl font-extrabold text-text">{t.home.progressCurrent}</p>
              <p className="mt-1 text-sm text-primary">{t.home.progressStart}</p>
              <p className="text-sm text-primary">{t.home.progressGoal}</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface2">
                <div className="h-full w-[65%] rounded-full bg-primary" />
              </div>
              <p className="mt-2 text-sm text-muted">{t.home.progressPercent}</p>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-semibold text-text">{t.home.weekTitle}</p>
                  <p className="text-xl font-bold text-text">{t.home.weekRank}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-primary text-white border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{t.home.nextCheckin}</p>
                  <p className="mt-1 text-xl font-bold">{t.home.nextCheckinTime}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl">✓</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Joyfit */}
      <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-text">
          {t.home.whyTitle} <span className="text-primary">{t.home.whyTitleBrand}</span> {t.home.whyTitleEnd}
        </h2>
        <p className="mt-2 text-center text-muted">{t.home.whySubtitle}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Card key={f.title} hover className="border-primary/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-2xl">
                {f.icon}
              </div>
              <h3 className="mt-4 font-bold text-text">{f.title}</h3>
              <p className="mt-2 text-muted">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How to start */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-text">{t.home.howTitle}</h2>
        <p className="mt-2 text-center text-muted">{t.home.howSubtitle}</p>
        <div className="mt-12 flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-center">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start">
              <div className="flex flex-col items-center text-center sm:max-w-[200px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-bold text-text">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="ml-4 mt-7 hidden h-0.5 w-12 flex-shrink-0 bg-primary/30 sm:block lg:ml-6 lg:w-20" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-text">{t.home.resultsTitle}</h2>
        <p className="mt-2 text-center text-muted">{t.home.resultsSubtitle}</p>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-2">
              <div className="bg-surface2 p-6 text-center">
                <p className="text-sm text-muted">{t.home.before}</p>
                <p className="mt-2 text-4xl font-extrabold text-text">85</p>
                <p className="text-sm text-muted">{t.home.kg}</p>
              </div>
              <div className="bg-primary p-6 text-center text-white">
                <p className="text-sm opacity-90">{t.home.after}</p>
                <p className="mt-2 text-4xl font-extrabold">73</p>
                <p className="text-sm opacity-90">{t.home.kg}</p>
              </div>
            </div>
          </Card>
          <div className="space-y-4">
            <Card className="bg-primary text-white border-primary">
              <p className="text-3xl font-extrabold">4-5 {t.home.kg}</p>
              <p className="mt-1 text-sm opacity-90">{t.home.avgPerMonth}</p>
              <p className="mt-2 text-sm opacity-80">{t.home.avgSpeed}</p>
            </Card>
            <Card className="bg-primary text-white border-primary">
              <p className="text-3xl font-extrabold">≥12 {t.home.kg}</p>
              <p className="mt-1 text-sm opacity-90">{t.home.in3Months}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-text">{t.common.pricing}</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:max-w-4xl lg:mx-auto">
          <Card className="relative">
            <div className="mb-4 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              🎁 {t.home.planInviteDiscount}
            </div>
            <h3 className="text-xl font-bold text-text">{t.home.plan1Title}</h3>
            <p className="mt-2">
              <span className="text-muted line-through">{t.home.plan1Original}₮</span>{" "}
              <span className="text-2xl font-extrabold text-primary">{t.home.plan1Price}₮</span>
            </p>
            <p className="text-sm text-muted">{t.home.plan1PerMonth}</p>
            <ul className="mt-6 space-y-2">
              {[t.home.planFeature1, t.home.planFeature2, t.home.planFeature3, t.home.planFeature4].map((f) => (
                <li key={f} className="flex items-center gap-2 text-text">
                  <span className="text-primary">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/onboarding" className="mt-6 block">
              <Button variant="primary" className="w-full">{t.home.ctaStart}</Button>
            </Link>
          </Card>
          <div className="relative rounded-2xl border-2 border-primary bg-primary p-6 shadow-card">
            <div className="absolute -right-2 -top-2 rounded-lg bg-amber-400 px-3 py-1 text-sm font-bold text-amber-900">
              ✨ {t.home.plan3Badge}
            </div>
            <p className="mb-1 text-sm text-white/90">{t.home.plan3Discount}</p>
            <h3 className="text-xl font-bold text-white">{t.home.plan3Title}</h3>
            <p className="mt-2 text-3xl font-extrabold text-white">{t.home.plan3Price}₮</p>
            <p className="text-sm text-white/90">{t.home.plan3PerMonth}</p>
            <ul className="mt-6 space-y-2">
              {[t.home.planFeature1, t.home.planFeature2, t.home.planFeature3, t.home.planFeature4, t.home.planFeature5, t.home.planFeature6].map((f) => (
                <li key={f} className="flex items-center gap-2 text-white">
                  <span className="text-white/90">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/onboarding" className="mt-6 block">
              <Button variant="secondary" className="w-full border-white/30 bg-white/20 text-white hover:bg-white/30">
                {t.home.ctaStart}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted sm:px-6 lg:px-8">
          © Joyfit. Эрүүл, жаргалтай амьдрал.
        </div>
      </footer>
    </div>
  );
}
