import "../globals.css";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { getDict } from "@/i18n";
import { isLocale, LOCALES, type Locale } from "@/i18n/config";
import { SITE_URL } from "@/lib/site";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MotionRoot } from "@/components/MotionRoot";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1c18" },
  ],
};

export const metadata: Metadata = { metadataBase: new URL(`${SITE_URL}/`) };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale as Locale);
  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* Static string: reveal animations only hide content once scripting is known to work. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <Providers>
          <a href="#continut" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-yellow focus:p-3 focus:text-on-yellow">
            {t.nav.skip}
          </a>
          <Header locale={locale} t={t.nav} siteName={t.site.name} />
          <main id="continut">{children}</main>
          <Footer locale={locale} t={t} />
          <MotionRoot />
        </Providers>
      </body>
    </html>
  );
}
