import Link from "next/link";
import type { Dict } from "@/i18n";
import { href } from "@/i18n";
import type { Page } from "@/i18n/config";
import { CONTACT } from "@/data/music";

const LINKS: Exclude<Page, "">[] = ["despre", "evenimente", "italia-2026", "inctc-2026", "aniversari", "muzica", "galerie", "alatura-te", "sustine", "contact", "confidentialitate"];
const SOCIAL = [["Facebook", CONTACT.facebook], ["Instagram", CONTACT.instagram], ["TikTok", CONTACT.tiktok], ["YouTube", CONTACT.youtube]];

export function Footer({ locale, t }: { locale: string; t: Dict }) {
  return (
    <footer className="section bg-green text-on-green">
      <div className="frame pb-8 pt-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <p className="lead font-heading font-medium">{t.footer.line}</p>
          <nav aria-label={t.footer.pages}>
            <h2 className="text-xl">{t.footer.pages}</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
              {LINKS.map((p) => (
                <li key={p}><Link className="inline-block py-1 underline-offset-4 hover:underline" href={href(locale, p)}>{t.nav[p]}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-xl">{t.footer.follow}</h2>
            <ul className="mt-3 space-y-1">
              {SOCIAL.map(([name, url]) => (
                <li key={name}><a className="inline-block py-1 underline-offset-4 hover:underline" href={url} rel="noopener" target="_blank">{name}</a></li>
              ))}
              <li><a className="inline-block py-1 font-semibold underline-offset-4 hover:underline" href={CONTACT.phoneHref}>{t.footer.call}: {CONTACT.phoneDisplay}</a></li>
            </ul>
          </div>
        </div>
        <p aria-hidden className="mt-12 font-heading text-[clamp(3rem,12.6vw,12.5rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-yellow">Harmonia Christi</p>
        <div className="mt-6 flex flex-wrap justify-between gap-x-6 gap-y-1">
          <a className="underline underline-offset-4" href="https://corneluu.github.io/corneluu/" rel="noopener" target="_blank">{t.footer.credit}</a>
          <span>{t.footer.photos}</span>
          <Link className="underline-offset-4 hover:underline" href="/admin/" prefetch={false} rel="nofollow">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
