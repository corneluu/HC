import type { MetadataRoute } from "next";
import { LOCALES, PAGES } from "@/i18n/config";
import { SITE_URL, pagePath } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    PAGES.map((page) => ({
      url: `${SITE_URL}${pagePath(locale, page)}`,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${pagePath(l, page)}`])),
      },
    })),
  );
}
