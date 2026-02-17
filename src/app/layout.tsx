import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { getSessionUserId } from "@/server/db/session";

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Joyfit",
  description: "Joyfit Web App",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUserId = getSessionUserId();
  return (
    <html lang="mn" suppressHydrationWarning>
      <body className={`${nunito.className} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('joyfit-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=t||(d?'dark':'light');document.documentElement.classList.toggle('dark',r==='dark');})();`,
          }}
        />
        <ThemeProvider>
          <Header sessionUserId={sessionUserId} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
