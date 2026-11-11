export type LText = { ro: string; en?: string; it?: string; de?: string };

/** Value for the locale, falling back to Romanian when missing or blank. */
export function localized(value: LText | null | undefined, locale: string): string {
  if (!value) return "";
  const own = value[locale as keyof LText]?.trim();
  return own || value.ro?.trim() || "";
}
