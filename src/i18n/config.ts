export const LOCALES = ["ro", "en", "it", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ro";
export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

export const PAGES = [
  "", "despre", "evenimente", "italia-2026", "inctc-2026", "aniversari",
  "muzica", "galerie", "alatura-te", "sustine", "contact", "confidentialitate",
] as const;
export type Page = (typeof PAGES)[number];
