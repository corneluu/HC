import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/i18n";
import { isLocale, LOCALES, PAGES, type Locale, type Page } from "@/i18n/config";
import { pagePath } from "@/lib/site";
import { VIEWS } from "@/views";

export const dynamicParams = false;

export const generateStaticParams = () =>
  LOCALES.flatMap((locale) => PAGES.map((page) => ({ locale, slug: page ? [page] : [] })));

type Props = { params: Promise<{ locale: string; slug?: string[] }> };

function resolve(locale: string, slug: string[] = []): { locale: Locale; page: Page } | null {
  const page = (slug[0] ?? "") as Page;
  if (!isLocale(locale) || slug.length > 1 || !PAGES.includes(page)) return null;
  return { locale, page };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const found = resolve(l, slug);
  if (!found) return {};
  const { locale, page } = found;
  const t = getDict(locale);
  const m = t.meta[page === "" ? "home" : page];
  const title = page === "" ? m.title : `${m.title} | ${t.site.name}`;
  const path = pagePath(locale, page);
  return {
    title,
    description: m.description,
    alternates: {
      canonical: path,
      languages: { ...Object.fromEntries(LOCALES.map((x) => [x, pagePath(x, page)])), "x-default": pagePath("ro", page) },
    },
    openGraph: {
      title, description: m.description, url: path, siteName: t.site.name, locale, type: "website",
      images: [{ url: "brand/og.jpg", width: 1200, height: 630, alt: t.site.name }],
    },
    twitter: { card: "summary_large_image", title, description: m.description, images: ["brand/og.jpg"] },
  };
}

export default async function Page({ params }: Props) {
  const { locale: l, slug } = await params;
  const found = resolve(l, slug);
  if (!found) notFound();
  const View = VIEWS[found.page];
  // data-page lets CSS hide the floating "join" calls on the join page itself.
  return <div data-page={found.page || "home"}><View locale={found.locale} t={getDict(found.locale)} /></div>;
}
