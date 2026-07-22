import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Fraunces, Inter, Noto_Sans_Devanagari } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const ui = Inter({ subsets: ["latin"], variable: "--font-ui" });
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600"],
  variable: "--font-devanagari",
  preload: false,
});

export const metadata: Metadata = {
  title: "IndiaSocialBench | Does your model understand India?",
  description:
    "A benchmark for emotional and cultural intelligence of language models in Indian conversations in English, Hinglish, and Hindi.",
  openGraph: {
    title: "IndiaSocialBench | Does your model understand India?",
    description:
      "LLMs scored on indirect refusals, family negotiation, honor and shame, grief etiquette, and code-mixed emotion in English, Hinglish, and Hindi. Every score links to its transcript.",
    siteName: "IndiaSocialBench",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "IndiaSocialBench | Does your model understand India?",
    description:
      "The emotional & cultural intelligence leaderboard for Indian conversations.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable} ${devanagari.variable}`}>
      <body>
        <nav className="nav" aria-label="Primary navigation">
          <div className="nav-inner">
            <Link href="/" className="brand">
              <span className="brand-prefix">India</span>SocialBench
            </Link>
            <Link className="link" href="/">
              Leaderboard
            </Link>
            <Link className="link" href="/scenarios/">
              Scenarios
            </Link>
            <Link className="link" href="/methodology/">
              Methodology
            </Link>
            <span className="spacer" />
            <Link className="link" href="/about/">
              About
            </Link>
          </div>
        </nav>
        <main className="container">{children}</main>
        <footer>
          <div className="container">
            IndiaSocialBench is an open benchmark for the emotional and cultural intelligence of
            language models in Indian conversations. Built by Naresh Silla.
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
