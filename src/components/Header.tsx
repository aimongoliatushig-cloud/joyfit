"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Salad, Settings, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const NAV = [
  { href: "/", label: "Хооллолт", icon: Salad },
  { href: "/settings", label: "Тохиргоо", icon: Settings },
];

export function Header() {
  const { theme, toggle, mounted } = useTheme();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur print:hidden">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Image src="/icon-64.png" alt="" width={36} height={36} className="rounded-xl bg-white" priority />
          <span className="text-lg font-extrabold tracking-wider text-primary">JOYFIT</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface2 hover:text-text"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{label}</span>
                <span className="sr-only sm:hidden">{label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "light" ? "Харанхуй горим" : "Гэрэлтэй горим"}
            className="grid h-9 w-9 place-items-center rounded-xl text-muted transition-colors hover:bg-surface2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {mounted && (theme === "light" ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />)}
          </button>
        </div>
      </nav>
    </header>
  );
}
