"use client";

import Image from "next/image";
import Link from "next/link";
import { dictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/ThemeProvider";
import { logout } from "@/server/actions";

const t = dictionary;

export function Header({ sessionUserId }: { sessionUserId: string | null }) {
  const { theme, toggle, mounted } = useTheme();

  function handleLogout() {
    logout();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Joyfit"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <span className="font-extrabold text-xl tracking-wider text-primary">
            JOYFIT
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-muted hover:text-text transition-colors font-medium"
          >
            {t.common.dashboard}
          </Link>
          <Link
            href="/leaderboard"
            className="text-muted hover:text-text transition-colors font-medium"
          >
            {t.common.leaderboard}
          </Link>
          <Link
            href="/referrals"
            className="text-muted hover:text-text transition-colors font-medium"
          >
            {t.common.referrals}
          </Link>
          <Link
            href="/pricing"
            className="text-muted hover:text-text transition-colors font-medium"
          >
            {t.common.pricing}
          </Link>
          {sessionUserId ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              {t.common.logout}
            </Button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-muted hover:text-text transition-colors font-medium"
              >
                {t.common.login}
              </Link>
              <Link
                href="/onboarding"
                className="font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                {t.common.register}
              </Link>
            </>
          )}

          {mounted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
