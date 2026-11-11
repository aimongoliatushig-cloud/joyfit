"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/ThemeProvider";

export function Header() {
  const { theme, toggle, mounted } = useTheme();
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
      pathname === href ? "bg-primary/10 text-primary" : "text-muted hover:text-text"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur print:hidden">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={36} height={36} className="rounded-xl" />
          <span className="text-lg font-extrabold tracking-wider text-primary">JOYFIT</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/" className={linkClass("/")}>
            Хооллолт
          </Link>
          <Link href="/settings" className={linkClass("/settings")}>
            Тохиргоо
          </Link>
          {mounted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              aria-label={theme === "light" ? "Харанхуй горим" : "Гэрэлтэй горим"}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
