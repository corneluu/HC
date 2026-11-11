import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import type { Dict } from "@/i18n";
import { href } from "@/i18n";
import type { Page } from "@/i18n/config";
import { CONTACT } from "@/data/music";

const LINKS: Exclude<Page, "">[] = ["despre", "evenimente", "italia-2026", "inctc-2026", "aniversari", "muzica", "galerie", "alatura-te", "sustine", "contact", "confidentialitate"];
const SOCIAL = [["Facebook", CONTACT.facebook], ["Instagram", CONTACT.instagram], ["TikTok", CONTACT.tiktok], ["YouTube", CONTACT.youtube]];

export function Footer({ locale, t }: { locale: string; t: Dict }) {
  const link = "inline-block py-1.5 underline-offset-4 hover:underline";
  return (
    <footer className="section bg-deep text-on-green">
      <div className="frame pb-8 pt-[clamp(2.5rem,6vw,5rem)]">
        <div className="footer-call mb-[clamp(2.5rem,6vw,5rem)] grid gap-6 border-b border-on-green/25 pb-[clamp(2.5rem,6vw,5rem)] md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow"><span className="romb" aria-hidden />{t.footer.line}</p>
            <p className="title-hero mt-4 max-w-[14ch] font-heading font-semibold text-yellow">{t.footer.callTitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={href(locale, "alatura-te")} className="btn btn-primary go">{t.home.ctaJoin} <ArrowRight className="arrow size-4" aria-hidden /></Link>
            <a href={CONTACT.phoneHref} className="btn btn-line"><Phone className="size-4 shrink-0" aria-hidden /> {CONTACT.phoneDisplay}</a>
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          <p className="font-heading text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)] font-semibold leading-none tracking-[-0.03em] sm:col-span-2 lg:col-span-1">Harmonia Christi</p>
          <nav aria-label={t.footer.pages}>
            <h2 className="eyebrow"><span className="romb" aria-hidden />{t.footer.pages}</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4">
              {LINKS.map((p) => (
                <li key={p} className="min-w-0"><Link className={link} href={href(locale, p)}>{t.nav[p]}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="eyebrow"><span className="romb" aria-hidden />{t.footer.follow}</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4">
              {SOCIAL.map(([name, url]) => (
                <li key={name}><a className={link} href={url} rel="noopener" target="_blank">{name}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-on-green/25 pt-5 text-[0.9375rem]">
          <a className="underline underline-offset-4" href="https://corneluu.github.io/corneluu/" rel="noopener" target="_blank">{t.footer.credit}</a>
          <span>{t.footer.photos}</span>
          <Link className="underline-offset-4 hover:underline" href="/admin/" prefetch={false} rel="nofollow">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
