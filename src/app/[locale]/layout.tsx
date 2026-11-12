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
import { Curtain } from "@/components/Curtain";
import { cspMeta } from "@/lib/csp";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1e6" },
    { media: "(prefers-color-scheme: dark)", color: "#07130f" },
  ],
};

export const metadata: Metadata = { metadataBase: new URL(`${SITE_URL}/`) };

/* Static string, runs before paint. "js": reveals may hide content, scripting works.
   "lite": the device says it is small (2 GB or less, 2 cores or fewer, data saver, 2G) or was measured slow earlier this visit. */
const HEAD_SCRIPT = "(function(){var d=document.documentElement,n=navigator,c=n.connection||{};d.classList.add('js');try{if(sessionStorage.getItem('lite')==='1'||(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2)||c.saveData||/(^|-)2g$/.test(c.effectiveType||''))d.classList.add('lite')}catch(e){}})()";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale as Locale);
  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {cspMeta ? <meta httpEquiv="Content-Security-Policy" content={cspMeta} /> : null}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        <Providers>
          <a href="#continut" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-yellow focus:p-3 focus:text-on-yellow">
            {t.nav.skip}
          </a>
          <Header locale={locale} t={t.nav} siteName={t.site.name} joinLabel={t.home.ctaJoin} />
          <main id="continut">{children}</main>
          <Footer locale={locale} t={t} />
          <MotionRoot />
          <Curtain />
        </Providers>
      </body>
    </html>
  );
}
