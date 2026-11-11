import { ro, type Dict } from "./ro";
import { en } from "./en";
import { it } from "./it";
import { de } from "./de";
import type { Locale, Page } from "./config";

const dictionaries: Record<Locale, Dict> = { ro, en, it, de };
export const getDict = (locale: Locale): Dict => dictionaries[locale];

export type { Dict };

/** Internal link; next/link adds the base path. */
export const href = (locale: string, page: Page) => (page ? `/${locale}/${page}/` : `/${locale}/`);
