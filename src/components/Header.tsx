"use client";
/* eslint-disable @next/next/no-img-element -- pre-sized WebP logo in a static export */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Drawer } from "vaul";
import { useTheme } from "next-themes";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/i18n";
import { href } from "@/i18n";
import { LOCALES, type Page } from "@/i18n/config";
import { asset } from "@/lib/site";

const PRIMARY: Exclude<Page, "">[] = ["despre", "evenimente", "muzica", "galerie"];
const MORE: Exclude<Page, "">[] = ["italia-2026", "inctc-2026", "aniversari", "sustine", "contact"];
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
      className="grid size-11 place-items-center rounded-full hover:bg-muted"
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

function localeHref(pathname: string, locale: string) {
  const rest = pathname.split("/").slice(2).join("/");
  return asset(`/${locale}/${rest}`);
}

function Languages({ locale, pathname, label }: { locale: string; pathname: string; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex items-center text-[0.9375rem] font-medium">
      {LOCALES.map((l) => (
        <a
          key={l}
          href={localeHref(pathname, l)}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          className={`grid h-11 min-w-9 place-items-center rounded-full px-1 uppercase hover:bg-muted ${l === locale ? "font-bold text-green-text underline underline-offset-4" : ""}`}
        >
          {l}
        </a>
      ))}
    </div>
  );
}

export function Header({ locale, t, siteName }: { locale: string; t: Nav; siteName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = (page: Page) => (pathname.split("/")[2] === page ? ("page" as const) : undefined);
  const linkClass = "rounded-full px-3 py-2 font-medium hover:bg-muted aria-[current=page]:underline aria-[current=page]:underline-offset-4 aria-[current=page]:decoration-2";

  return (
    <header className="frame flex items-center justify-between gap-3 py-3">
      <Link href={href(locale, "")} className="flex items-center gap-2.5 font-heading text-lg font-semibold leading-none">
        <span className="tile-logo size-11 shrink-0 rounded-full">
          <img src={asset("/brand/kite-96.webp")} alt="" width={68} height={96} className="h-8 w-auto" />
        </span>
        <span className="hidden min-[420px]:block">Harmonia Christi</span>
        <span className="sr-only min-[420px]:hidden">{siteName}</span>
      </Link>

      <nav className="hidden items-center gap-1 lg:flex" aria-label={t.menu}>
        {PRIMARY.map((p) => (
          <Link key={p} href={href(locale, p)} aria-current={current(p)} className={linkClass}>{t[p]}</Link>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger className={`${linkClass} inline-flex items-center gap-1`}>
            {t.more} <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52 p-1.5">
            {MORE.map((p) => (
              <DropdownMenuItem key={p} asChild className="rounded-lg px-3 py-2.5 text-base">
                <Link href={href(locale, p)}>{t[p]}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <div className="flex items-center gap-1">
        <div className="hidden lg:block"><Languages locale={locale} pathname={pathname} label={t.language} /></div>
        <ThemeToggle t={t} />
        <Button asChild className="hidden h-11 rounded-full px-5 text-base font-semibold sm:inline-flex">
          <Link href={href(locale, "alatura-te")}>{t["alatura-te"]}</Link>
        </Button>
        <Drawer.Root open={open} onOpenChange={setOpen} direction="right">
          <Drawer.Trigger aria-label={t.menu} className="grid size-11 place-items-center rounded-full hover:bg-muted lg:hidden">
            <Menu className="size-6" />
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50" />
            <Drawer.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,88vw)] flex-col overflow-y-auto bg-background p-5 outline-none">
              <div className="flex items-center justify-between">
                <Drawer.Title className="font-heading text-xl font-semibold">{t.menu}</Drawer.Title>
                <Drawer.Close aria-label={t.closeMenu} className="grid size-11 place-items-center rounded-full hover:bg-muted"><X className="size-6" /></Drawer.Close>
              </div>
              <Drawer.Description className="sr-only">{siteName}</Drawer.Description>
              <nav className="mt-3 flex flex-col font-heading text-2xl font-medium" aria-label={t.menu}>
                {(["", ...PRIMARY, ...MORE, "alatura-te"] as const).map((p) => (
                  <Link key={p} href={href(locale, p)} onClick={() => setOpen(false)} aria-current={current(p)} className="rounded-lg py-2 hover:text-green-text aria-[current=page]:underline aria-[current=page]:underline-offset-4">
                    {p === "" ? t.home : t[p]}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto pt-6"><Languages locale={locale} pathname={pathname} label={t.language} /></div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </header>
  );
}
