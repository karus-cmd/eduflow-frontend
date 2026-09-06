import type { Metadata } from "next";
import { Sora, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// SIGNAL type system — three voices.
// Body and mono stay in the IBM Plex family: humanist at reading sizes, and Plex
// Mono is a first-class voice here rather than a code-only face, because the
// flagship track is DSA and an instrument reads out in numbers.
const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Display voice — engineered and confident, carried only by the few words that
// hold a screen. Replaces Archivo under the Signal direction.
const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "STEIN-X — get interview ready",
  description:
    "Structured tracks for software-engineering interviews: DSA patterns and machine learning, with mentor support and timed mock rounds.",
};

// Applied before first paint so the chosen theme never flashes the other one.
// Dark is the default: this gets used at night, on a phone.
const THEME_INIT = `(function(){try{var s=localStorage.getItem('steinx-theme');var d=s?s==='dark':true;document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${mono.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
