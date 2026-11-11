export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Public origin plus base path, no trailing slash. Used for canonical URLs, Open Graph and the sitemap. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || `https://corneluu.github.io${BASE_PATH}`).replace(/\/$/, "");

export const pagePath = (locale: string, page: string) => (page ? `/${locale}/${page}/` : `/${locale}/`);

export const asset = (path: string) => `${BASE_PATH}${path}`;

/** Dates in the data are calendar dates; format them without any time zone shift. */
export function formatDate(date: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}
