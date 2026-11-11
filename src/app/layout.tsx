import type { Metadata } from "next";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Joyfit — AI хооллолтын төлөвлөгөө",
  description: "Өөрийн мэдээллээ оруулаад AI-аар хувийн хооллолтын төлөвлөгөө гаргана.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('joyfit-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=t||(d?'dark':'light');document.documentElement.classList.toggle('dark',r==='dark');}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
