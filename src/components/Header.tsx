"use client";
/* eslint-disable @next/next/no-img-element -- pre-sized WebP logo in a static export */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Drawer } from "vaul";
import { useTheme } from "next-themes";
import { ArrowRight, CalendarDays, ChevronDown, Ellipsis, Home, Images, Mic, Moon, Music, Sun } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Dict } from "@/i18n";
import { href } from "@/i18n";
import { LOCALES, type Page } from "@/i18n/config";
import { asset } from "@/lib/site";

const PRIMARY: Exclude<Page, "">[] = ["despre", "evenimente", "muzica", "galerie"];
const MORE: Exclude<Page, "">[] = ["italia-2026", "inctc-2026", "aniversari", "sustine", "contact"];
const SHEET: Exclude<Page, "">[] = ["despre", "italia-2026", "inctc-2026", "aniversari", "sustine", "contact", "confidentialitate"];
const LANGUAGE_NAMES: Record<string, string> = { ro: "Română", en: "English", it: "Italiano", de: "Deutsch" };
const noSubscribe = () => () => {};

type Nav = Dict["nav"];

function ThemeToggle({ t }: { t: Nav }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? t.themeLight : t.themeDark}
      className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-muted"
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

function localeHref(pathname: string, locale: string) {
  const rest = pathname.split("/").slice(2).join("/");
  return asset(`/${locale}/${rest}`);
}

function LanguageMenu({ locale, pathname, label }: { locale: string; pathname: string; label: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={`${label}: ${LANGUAGE_NAMES[locale]}`} className="inline-flex h-11 shrink-0 items-center gap-1 rounded-lg px-2.5 text-[0.9375rem] font-semibold uppercase hover:bg-muted">
        {locale} <ChevronDown className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40 p-1.5">
        {LOCALES.map((l) => (
          <DropdownMenuItem key={l} asChild className="rounded-md px-3 py-2.5 text-base">
            {/* A plain link: changing language reloads the document so <html lang> follows. */}
            <a href={localeHref(pathname, l)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} className={l === locale ? "font-bold" : ""}>
              {LANGUAGE_NAMES[l]}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Hides the bar while reading down, brings it back on the way up. */
function useHideOnScroll() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = scrollY;
      el.dataset.scrolled = String(y > 8);
      if (Math.abs(y - last) < 6) return;
      el.dataset.hidden = String(y > last && y > 140);
      last = y;
    };
    const onScroll = () => { frame ||= requestAnimationFrame(update); };
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);
  return ref;
}

export function Header({ locale, t, siteName, joinLabel }: { locale: string; t: Nav; siteName: string; joinLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useHideOnScroll();
  const page = pathname.split("/")[2] ?? "";
  const current = (p: Page) => (page === p ? ("page" as const) : undefined);
  const linkClass = "rounded-lg px-3 py-2 font-medium hover:bg-muted aria-[current=page]:bg-green aria-[current=page]:text-on-green";

  const tabs = [
    { page: "" as Page, label: t.tabHome, Icon: Home },
    { page: "evenimente" as Page, label: t.tabEvents, Icon: CalendarDays },
    { page: "muzica" as Page, label: t.tabMusic, Icon: Music },
    { page: "galerie" as Page, label: t.tabGallery, Icon: Images },
  ];
  const inSheet = page === "alatura-te" || (SHEET as string[]).includes(page);

  return (
    <>
      <header ref={ref} className="site-header">
        <div className="frame flex items-center justify-between gap-2 py-2.5">
          <Link href={href(locale, "")} className="flex min-w-0 items-center gap-2.5 font-heading text-lg font-semibold leading-none">
            <span className="tile-logo size-11 shrink-0 rounded-lg">
              <img src={asset("/brand/kite-96.webp")} alt="" width={68} height={96} className="h-8 w-auto" />
            </span>
            <span className="hidden whitespace-nowrap min-[400px]:block lg:hidden xl:block">Harmonia Christi</span>
            <span className="sr-only min-[400px]:hidden lg:block xl:hidden">{siteName}</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label={t.menu}>
            {PRIMARY.map((p) => (
              <Link key={p} href={href(locale, p)} aria-current={current(p)} className={linkClass}>{t[p]}</Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger className={`${linkClass} inline-flex items-center gap-1`}>
                {t.more} <ChevronDown className="size-4" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52 p-1.5">
                {MORE.map((p) => (
                  <DropdownMenuItem key={p} asChild className="rounded-md px-3 py-2.5 text-base">
                    <Link href={href(locale, p)}>{t[p]}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex shrink-0 items-center gap-0.5">
            <LanguageMenu locale={locale} pathname={pathname} label={t.language} />
            <ThemeToggle t={t} />
            <Link href={href(locale, "alatura-te")} className="btn btn-primary go ml-2 hidden lg:inline-flex">
              {joinLabel} <ArrowRight className="arrow size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <Link href={href(locale, "alatura-te")} className="fab">
        <Mic className="size-5 shrink-0" aria-hidden /> {joinLabel}
      </Link>

      <nav className="tabbar" aria-label={t.menu}>
        {tabs.map(({ page: p, label, Icon }) => (
          <Link key={p} href={href(locale, p)} aria-current={current(p)} className="tab">
            <Icon className="size-[1.375rem]" aria-hidden />
            <span>{label}</span>
          </Link>
        ))}
        <Drawer.Root open={open} onOpenChange={setOpen}>
          <Drawer.Trigger className="tab" aria-current={inSheet ? "page" : undefined}>
            <Ellipsis className="size-[1.375rem]" aria-hidden />
            <span>{t.tabMore}</span>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/55" />
            <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88svh] flex-col rounded-t-2xl bg-background outline-none">
              <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-border" />
              <div className="overflow-y-auto px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-3">
                <Drawer.Title className="eyebrow"><span className="romb" aria-hidden />{t.moreTitle}</Drawer.Title>
                <Drawer.Description className="sr-only">{siteName}</Drawer.Description>
                <nav className="mt-3 grid" aria-label={t.moreTitle}>
                  {SHEET.map((p) => (
                    <Link key={p} href={href(locale, p)} onClick={() => setOpen(false)} aria-current={current(p)} className="go flex min-h-13 items-center justify-between gap-3 border-b border-border py-3 font-heading text-[1.375rem] font-medium leading-tight aria-[current=page]:text-green-text">
                      {t[p]} <ArrowRight className="arrow size-5 shrink-0" aria-hidden />
                    </Link>
                  ))}
                </nav>
                <Link href={href(locale, "alatura-te")} onClick={() => setOpen(false)} className="btn btn-primary go mt-5 w-full">
                  {joinLabel} <ArrowRight className="arrow size-4" aria-hidden />
                </Link>
                <div role="group" aria-label={t.language} className="mt-5 grid grid-cols-4 gap-2">
                  {LOCALES.map((l) => (
                    <a key={l} href={localeHref(pathname, l)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} aria-label={LANGUAGE_NAMES[l]}
                      className={`grid min-h-11 place-items-center rounded-lg border-2 text-[0.9375rem] font-semibold uppercase ${l === locale ? "border-green bg-green text-on-green" : "border-border"}`}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </nav>
    </>
  );
}
