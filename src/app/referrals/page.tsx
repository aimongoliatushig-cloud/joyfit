import { dictionary } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ReferralsPage() {
  const t = dictionary;

  return (
    <div className="min-h-screen">
      {/* Top gradient strip */}
      <div className="absolute left-0 right-0 top-0 h-32 -z-10 bg-gradient-to-b from-primary/15 to-transparent dark:from-primary/25" />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-text">
          {t.common.referrals}
        </h1>
        <p className="mt-2 text-muted">
          Invite friends and earn rewards.
        </p>
        <Card className="mt-8 max-w-md">
          <label className="block text-sm font-medium text-text">
            {t.onboarding.inviter}
          </label>
          <Input
            type="text"
            placeholder={t.onboarding.phone}
            className="mt-2"
          />
          <Button variant="primary" className="mt-4">
            {t.common.submit}
          </Button>
        </Card>
      </main>
    </div>
  );
}
