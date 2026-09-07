import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono, Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Chrome Machine theme fonts (see design/README handoff). Variable names kept as
// `--font-geist-*`/`--font-display` on purpose — several CSS modules (login, landing, student
// dashboard) reference those names directly, not just through the Tailwind font-sans/font-heading
// abstraction, so keeping the names lets the whole app pick up the new faces with no other edits.
const body = IBM_Plex_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Display voice — precision-engineering grotesque, replaces Bricolage Grotesque under the
// Chrome Machine reskin.
const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Sora — used only by the checkout plan cards (see plan-cards.module.css); a one-off editorial
// voice for that section, not a site-wide replacement for --font-display.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600"],
});

// Plus Jakarta Sans — used only by the course detail page's warm-paper editorial layout (see
// course-detail-view.module.css); a one-off voice for that page, not a site-wide replacement.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "STEIN-X",
  description: "STEIN-X — enrollment CRM, LMS & commission ledger",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${mono.variable} ${display.variable} ${sora.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
