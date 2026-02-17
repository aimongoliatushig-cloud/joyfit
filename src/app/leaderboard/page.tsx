import { dictionary } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LeaderboardPage() {
  const t = dictionary;

  return (
    <div className="min-h-screen">
      {/* Top gradient strip */}
      <div className="absolute left-0 right-0 top-0 h-32 -z-10 bg-gradient-to-b from-primary/15 to-transparent dark:from-primary/25" />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-text">
          {t.common.leaderboard}
        </h1>
        <p className="mt-2 text-muted">
          Compete and climb the ranks.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card hover>
            <Badge variant="primary" className="mb-2">#1</Badge>
            <h3 className="font-bold text-text">Sample User</h3>
            <p className="text-sm text-muted">1,250 pts</p>
          </Card>
          <Card hover>
            <Badge variant="neutral" className="mb-2">#2</Badge>
            <h3 className="font-bold text-text">Sample User</h3>
            <p className="text-sm text-muted">1,100 pts</p>
          </Card>
          <Card hover>
            <Badge variant="neutral" className="mb-2">#3</Badge>
            <h3 className="font-bold text-text">Sample User</h3>
            <p className="text-sm text-muted">980 pts</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
