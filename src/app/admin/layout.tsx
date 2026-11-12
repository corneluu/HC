import "../globals.css";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import { cspMeta } from "@/lib/csp";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = { title: "Admin | Corul „Harmonia Christi”", robots: { index: false, follow: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

// Providers brings the same light/dark theme and toasts as the public site.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {cspMeta ? <meta httpEquiv="Content-Security-Policy" content={cspMeta} /> : null}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
