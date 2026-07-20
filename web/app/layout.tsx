import type { Metadata } from "next";
import { Fraunces, Inter, Noto_Sans_Devanagari } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const ui = Inter({ subsets: ["latin"], variable: "--font-ui" });
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600"],
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  title: "BhavBench — Does your model understand India?",
  description:
    "A benchmark for emotional and cultural intelligence of language models in Indian conversations — English, Hinglish, and Hindi.",
  openGraph: {
    title: "BhavBench — Does your model understand India?",
    description:
      "LLMs scored on indirect refusals, family negotiation, honor & shame, grief etiquette, and code-mixed emotion — in English, Hinglish, and Hindi. Every score clicks down to the transcript.",
    siteName: "BhavBench",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BhavBench — Does your model understand India?",
    description:
      "The emotional & cultural intelligence leaderboard for Indian conversations.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable} ${devanagari.variable}`}>
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/" className="brand">
              <span className="hindi">भाव</span>Bench
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
            BhavBench — an open benchmark for the emotional &amp; cultural intelligence of language
            models in Indian conversations. Built by Naresh Silla.
          </div>
        </footer>
      </body>
    </html>
  );
}
