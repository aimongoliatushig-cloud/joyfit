import { dictionary } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function PricingPage() {
  const t = dictionary;

  return (
    <div className="min-h-screen">
      {/* Top gradient strip */}
      <div className="absolute left-0 right-0 top-0 h-32 -z-10 bg-gradient-to-b from-primary/15 to-transparent dark:from-primary/25" />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-text">
          {t.common.pricing}
        </h1>
        <p className="mt-2 text-muted">
          Choose the plan that fits you.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card hover>
            <Badge variant="neutral" className="mb-4">Basic</Badge>
            <h3 className="text-xl font-bold text-text">Starter</h3>
            <p className="mt-2 text-3xl font-extrabold text-primary">Free</p>
            <p className="mt-2 text-sm text-muted">
              Get started with core features.
            </p>
            <Button variant="secondary" className="mt-6 w-full">
              {t.common.submit}
            </Button>
          </Card>
          <Card hover className="ring-2 ring-primary">
            <Badge variant="primary" className="mb-4">Popular</Badge>
            <h3 className="text-xl font-bold text-text">Pro</h3>
            <p className="mt-2 text-3xl font-extrabold text-primary">$9/mo</p>
            <p className="mt-2 text-sm text-muted">
              Full access to all features.
            </p>
            <Button variant="primary" className="mt-6 w-full">
              {t.common.submit}
            </Button>
          </Card>
          <Card hover>
            <Badge variant="neutral" className="mb-4">Enterprise</Badge>
            <h3 className="text-xl font-bold text-text">Team</h3>
            <p className="mt-2 text-3xl font-extrabold text-primary">Custom</p>
            <p className="mt-2 text-sm text-muted">
              For teams and organizations.
            </p>
            <Button variant="secondary" className="mt-6 w-full">
              {t.common.submit}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
