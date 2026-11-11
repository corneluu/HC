/* eslint-disable @next/next/no-img-element -- pre-sized WebP logo in a static export */
import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import type { Dict } from "@/i18n";
import { href } from "@/i18n";
import type { Locale, Page } from "@/i18n/config";
import { asset, formatDate } from "@/lib/site";
import { seed } from "@/data/seed";
import { localized } from "@/lib/localized";
import { CONCERT_VIDEO_5_ANI, CONTACT, ITALY_POSTS, MUSIC_ALBUMS, SPOTIFY_ARTIST_ID } from "@/data/music";
import { Photo } from "@/components/Photo";
import { Words } from "@/components/Words";
import { VoicePicker } from "@/components/VoicePicker";
import { JoinForm } from "@/components/JoinForm";
import { Button } from "@/components/ui/button";
import { Albums, ConductorBio, ConductorPhoto, CouncilGrid, DonationPanel, EventsTimeline, Figures, FoundingNote, NextConcertLine, VideoFacade, VideoGrid } from "@/components/live";

type ViewProps = { locale: Locale; t: Dict };

const altOf = (src: string, locale: string) => localized(seed.photos.find((p) => p.src === `concert-5-ani/${src}`)?.alt, locale);

function PageHead({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="frame pt-[clamp(2.5rem,6vw,6rem)]">
      <h1 className="title-page"><Words text={title} /></h1>
      {lead ? <p className="lead mt-6" data-reveal>{lead}</p> : null}
      {children}
    </div>
  );
}

function ParallaxPhoto({ src, alt, sizes, priority }: { src: string; alt: string; sizes?: string; priority?: boolean }) {
  return (
    <div data-parallax className="size-full">
      <Photo src={src} alt={alt} sizes={sizes} priority={priority} className="size-full object-cover" />
    </div>
  );
}

const pill = "h-12 rounded-full px-6 text-base font-semibold";

function Home({ locale, t }: ViewProps) {
  const band = ["voci-si-band", "baieti-grup", "alelia-dirijat", "grup-scena", "baieti-cantand", "alelia-cor", "voci-si-band-2", "grup-aplauze"];
  return (
    <>
      <section className="frame pt-3">
        <div className="mosaic">
          <div className="col-span-12 flex items-end pb-6 pt-8 lg:col-span-8 lg:pt-14">
            <h1 className="text-[clamp(3.25rem,8vw,8.25rem)] leading-[0.93]"><Words text={t.home.h1} /></h1>
          </div>
          <div className="tile tile-logo col-span-7 aspect-square sm:col-span-5 lg:col-span-4 lg:row-span-1 lg:aspect-auto lg:min-h-[23rem]">
            <img src={asset("/brand/logo-960.webp")} srcSet={`${asset("/brand/logo-480.webp")} 480w, ${asset("/brand/logo-960.webp")} 960w`} sizes="(min-width: 1024px) 28vw, 50vw" width={960} height={960} alt={t.site.name} fetchPriority="high" className="h-full max-h-[26rem] w-auto object-contain p-[5%]" />
          </div>
          <div className="tile tile-yellow col-span-5 flex flex-col justify-end p-4 sm:col-span-7 sm:p-6 lg:hidden">
            <p className="font-heading text-[clamp(1.125rem,3.6vw,1.75rem)] font-semibold leading-tight">{t.site.identity}, {t.site.city}</p>
          </div>
          <div className="tile tile-yellow col-span-12 flex flex-col justify-between gap-8 p-6 sm:p-8 lg:col-span-5">
            <p className="lead">{t.home.sub}</p>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button asChild className={`${pill} bg-on-yellow text-white hover:bg-on-yellow/85`}><Link href={href(locale, "evenimente")}>{t.home.ctaEvents}</Link></Button>
                <Button asChild variant="outline" className={`${pill} border-on-yellow bg-transparent text-on-yellow hover:bg-on-yellow/10 hover:text-on-yellow dark:border-on-yellow dark:bg-transparent dark:hover:bg-on-yellow/10`}><Link href={href(locale, "alatura-te")}>{t.home.ctaJoin}</Link></Button>
              </div>
              <NextConcertLine locale={locale} t={t} />
            </div>
          </div>
          <div className="tile col-span-12 aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[21rem]">
            <ParallaxPhoto src="concert-5-ani/grup-scena" alt={altOf("grup-scena", locale)} sizes="(min-width: 1024px) 60vw, 100vw" priority />
          </div>
        </div>
      </section>

      <section className="marquee mt-[clamp(0.5rem,1vw,0.875rem)]" aria-label={t.home.marqueeLabel}>
        <div className="marquee-track">
          {[...band, ...band].map((src, i) => (
            <div key={i} className="tile h-[clamp(9rem,20vw,17rem)] w-[clamp(13rem,30vw,26rem)] shrink-0" aria-hidden={i >= band.length || undefined}>
              <Photo src={`concert-5-ani/${src}`} alt={i < band.length ? altOf(src, locale) : ""} sizes="30vw" className="size-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="frame section" aria-labelledby="cifre">
        <h2 id="cifre" className="title-section mb-14 max-w-[16ch]"><Words text={t.home.figuresTitle} /></h2>
        <Figures t={t} />
      </section>

      <section className="frame section" aria-labelledby="vino">
        <div className="mosaic">
          <div className="tile tile-yellow col-span-12 p-6 sm:p-10 lg:col-span-7">
            <h2 id="vino" className="text-[clamp(3rem,7vw,6.5rem)]"><Words text={t.home.joinTitle} /></h2>
            <p className="lead mb-10 mt-5">{t.home.joinLead}</p>
            <VoicePicker locale={locale} t={t.home} />
          </div>
          <div className="tile col-span-12 aspect-[4/3] lg:col-span-5 lg:aspect-auto">
            <ParallaxPhoto src="concert-5-ani/baieti-grup" alt={altOf("baieti-grup", locale)} sizes="(min-width: 1024px) 90vw, 100vw" />
          </div>
        </div>
      </section>
    </>
  );
}

function Despre({ locale, t }: ViewProps) {
  const a = t.about;
  return (
    <>
      <PageHead title={a.h1} lead={a.lead} />
      <section className="frame section" aria-labelledby="poveste">
        <div className="mosaic">
          <div className="tile col-span-12 aspect-[16/9] lg:col-span-8">
            <ParallaxPhoto src="concert-5-ani/grup-aplauze" alt={a.singersCaption} sizes="(min-width: 1024px) 66vw, 100vw" />
          </div>
          <div className="tile tile-yellow col-span-12 flex flex-col justify-end p-6 sm:p-8 lg:col-span-4">
            <p className="font-heading text-[clamp(4rem,9vw,8.5rem)] font-semibold leading-[0.9] tracking-[-0.04em]">{a.singersNumber}</p>
            <p className="font-heading text-3xl font-medium">{a.singersLabel}</p>
            <p className="mt-2">{a.singersCaption}</p>
          </div>
          <div className="tile tile-surface col-span-12 p-6 sm:p-10 lg:col-span-7">
            <h2 id="poveste" className="title-section mb-6">{a.storyTitle}</h2>
            <div className="prose-body">{a.story.map((p) => <p key={p}>{p}</p>)}</div>
            <FoundingNote locale={locale} label={a.storyTitle} />
          </div>
          <div className="tile tile-green col-span-12 p-6 sm:p-10 lg:col-span-5">
            <h2 className="title-section mb-6">{a.missionTitle}</h2>
            <p>{a.mission}</p>
            <h3 className="mb-2 mt-8 text-3xl">{a.belongsTitle}</h3>
            <p>{a.belongs}</p>
          </div>
        </div>
      </section>

      <section className="frame section" aria-labelledby="dirijor">
        <div className="mosaic items-stretch">
          <div className="col-span-12 md:col-span-7 md:pr-10">
            <h2 id="dirijor" className="title-section"><Words text={a.conductorTitle} /></h2>
            <p className="mt-6 font-heading text-3xl font-medium">{seed.settings.conductor_name}</p>
            <p className="mb-5 text-green-text">{a.conductorRole}</p>
            <ConductorBio locale={locale} />
          </div>
          <figure className="col-span-12 md:col-span-5">
            <div className="tile aspect-square"><ConductorPhoto alt={a.conductorCaption} /></div>
            <figcaption className="mt-2 text-base">{a.conductorCaption}</figcaption>
          </figure>
        </div>
      </section>

      <section className="frame section" aria-labelledby="consiliu">
        <h2 id="consiliu" className="title-section"><Words text={a.councilTitle} /></h2>
        <p className="lead mb-10 mt-6 max-w-[52ch]" data-reveal>{a.councilLead}</p>
        <CouncilGrid locale={locale} t={t} />
      </section>
    </>
  );
}

function Evenimente({ locale, t }: ViewProps) {
  return (
    <>
      <PageHead title={t.events.h1} lead={t.events.lead} />
      <div className="frame"><EventsTimeline locale={locale} t={t} /></div>
    </>
  );
}

function Italia({ locale, t }: ViewProps) {
  const i = t.italy;
  return (
    <>
      <PageHead title={i.h1} lead={i.lead} />
      <section className="frame section" aria-labelledby="jurnal">
        <div className="mosaic">
          <div className="tile tile-surface col-span-12 p-6 sm:p-10 lg:col-span-7">
            <h2 className="title-section mb-6">{i.bodyTitle}</h2>
            <div className="prose-body">{i.body.map((p) => <p key={p}>{p}</p>)}</div>
          </div>
          <div className="tile tile-green col-span-12 p-6 sm:p-10 lg:col-span-5">
            <h2 id="jurnal" className="mb-6 text-[clamp(1.75rem,3vw,2.75rem)]">{i.postsTitle}</h2>
            <ol className="space-y-5">
              {ITALY_POSTS.map((p) => (
                <li key={p.url}>
                  <time dateTime={p.date} className="block" suppressHydrationWarning>{formatDate(p.date, locale, { day: "numeric", month: "long" })}</time>
                  <a href={p.url} target="_blank" rel="noopener" className="font-heading text-2xl font-medium underline underline-offset-4" lang="ro" aria-label={`${i.openPost}: ${p.text}`}>{p.text}</a>
                </li>
              ))}
            </ol>
            <p className="mt-8"><a href={CONTACT.instagram} target="_blank" rel="noopener" className="font-semibold underline underline-offset-4">{i.more}</a></p>
          </div>
        </div>
      </section>
      <section className="frame section"><Albums locale={locale} t={t} slug="italia-2026" /></section>
    </>
  );
}

function Inctc({ t }: ViewProps) {
  const c = t.inctc;
  return (
    <>
      <PageHead title={c.h1} lead={c.lead}><p className="mt-3 font-heading text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-tight">{c.sub}</p></PageHead>
      <section className="frame section" aria-labelledby="pe-scurt">
        <div className="mosaic">
          <div className="tile tile-yellow col-span-12 p-6 sm:p-10 lg:col-span-5">
            <h2 id="pe-scurt" className="title-section mb-8">{c.factsTitle}</h2>
            <dl className="space-y-5">
              {c.facts.map((f) => (
                <div key={f.k}>
                  <dt className="font-medium">{f.k}</dt>
                  <dd className="font-heading text-2xl font-semibold leading-tight">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="tile tile-surface col-span-12 flex flex-col justify-between gap-8 p-6 sm:p-10 lg:col-span-7">
            <div>
              <h2 className="title-section mb-6">{c.storyTitle}</h2>
              <div className="prose-body">{c.story.map((p) => <p key={p}>{p}</p>)}</div>
            </div>
            <p>
              <Button asChild className={pill}><a href="https://corneluu.github.io/inctc/" target="_blank" rel="noopener">{c.link} <ArrowUpRight className="size-4" /></a></Button>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Aniversari({ locale, t }: ViewProps) {
  const a = t.anniversaries;
  return (
    <>
      <PageHead title={a.h1} lead={a.lead} />
      <section className="frame section" aria-labelledby="sase">
        <div className="mosaic">
          <div className="tile tile-yellow col-span-12 p-6 sm:p-10 lg:col-span-6">
            <p aria-hidden className="font-heading text-[clamp(7rem,16vw,15rem)] font-semibold leading-[0.8] tracking-[-0.05em]">6</p>
            <h2 id="sase" className="title-section mb-5 mt-6">{a.sixTitle}</h2>
            <p>{a.six}</p>
            <Button asChild className={`${pill} mt-6 bg-on-yellow text-white hover:bg-on-yellow/85`}><Link href={href(locale, "evenimente")}>{a.sixCta}</Link></Button>
          </div>
          <div className="tile tile-surface col-span-12 p-6 sm:p-10 lg:col-span-6">
            <p aria-hidden className="font-heading text-[clamp(7rem,16vw,15rem)] font-semibold leading-[0.8] tracking-[-0.05em] text-green-text">5</p>
            <h2 className="title-section mb-5 mt-6">{a.fiveTitle}</h2>
            <p>{a.five}</p>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <VideoFacade youtubeId={CONCERT_VIDEO_5_ANI} title={a.fiveVideo} watch={t.common.watch} tone="green" fill />
          </div>
          <div className="tile col-span-12 aspect-video lg:col-span-7">
            <ParallaxPhoto src="concert-5-ani/alelia-cor" alt={altOf("alelia-cor", locale)} sizes="(min-width: 1024px) 58vw, 100vw" />
          </div>
        </div>
      </section>
      <section className="frame section"><Albums locale={locale} t={t} slug="concert-5-ani" /></section>
    </>
  );
}

function Muzica({ locale, t }: ViewProps) {
  const m = t.music;
  return (
    <>
      <PageHead title={m.h1} lead={m.lead} />
      <section className="frame section" aria-labelledby="albume">
        <h2 id="albume" className="title-section mb-8">{m.albumsTitle}</h2>
        <div className="mosaic">
          {MUSIC_ALBUMS.map((album, i) => (
            <article key={album.title} data-reveal className={`tile col-span-12 flex flex-col justify-between gap-10 p-6 sm:p-10 ${i ? "tile-green lg:col-span-5" : "tile-yellow lg:col-span-7"}`}>
              <div>
                <h3 lang={i ? "en" : "ro"} className="text-[clamp(2.5rem,5.4vw,5rem)]">{album.title}</h3>
                <p className="mt-3" suppressHydrationWarning>{album.tracks} {m.tracks} · {m.released} {formatDate(album.released, locale, { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
                {album.spotifyAlbumId ? <li><a className="underline underline-offset-4" target="_blank" rel="noopener" href={`https://open.spotify.com/album/${album.spotifyAlbumId}`}>{m.spotify}</a></li> : null}
                <li><a className="underline underline-offset-4" target="_blank" rel="noopener" href={album.apple}>Apple Music</a></li>
                <li><a className="underline underline-offset-4" target="_blank" rel="noopener" href={album.deezer}>Deezer</a></li>
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="frame section" aria-labelledby="spotify">
        <h2 id="spotify" className="title-section mb-8">{m.artistTitle}</h2>
        <div className="mosaic">
          <iframe title={MUSIC_ALBUMS[0].title} src={`https://open.spotify.com/embed/album/${MUSIC_ALBUMS[0].spotifyAlbumId}`} loading="lazy" allow="encrypted-media" className="tile col-span-12 h-[352px] w-full lg:col-span-7" />
          <iframe title="Corul Harmonia Christi, Spotify" src={`https://open.spotify.com/embed/artist/${SPOTIFY_ARTIST_ID}`} loading="lazy" allow="encrypted-media" className="tile col-span-12 h-[352px] w-full lg:col-span-5" />
        </div>
      </section>
      <section className="frame section" aria-labelledby="video">
        <h2 id="video" className="title-section mb-3">{m.videosTitle}</h2>
        <p className="mb-8 text-base">{t.common.videoNote}</p>
        <VideoGrid locale={locale} t={t} />
        <p className="mt-8"><a href={CONTACT.youtube} target="_blank" rel="noopener" className="font-semibold underline underline-offset-4">{m.channel}</a></p>
      </section>
    </>
  );
}

function Galerie({ locale, t }: ViewProps) {
  return (
    <>
      <PageHead title={t.gallery.h1} lead={t.gallery.lead} />
      <div className="frame"><Albums locale={locale} t={t} /></div>
    </>
  );
}

function Alatura({ locale, t }: ViewProps) {
  const j = t.join;
  return (
    <>
      <PageHead title={j.h1} lead={j.lead} />
      <section className="frame mt-12">
        <div className="mosaic">
          <div className="col-span-12 lg:col-span-7"><div className="tile tile-surface p-5 sm:p-10"><JoinForm locale={locale} t={j} voices={t.home.voices} /></div></div>
          <aside className="col-span-12 flex flex-col gap-[clamp(0.5rem,1vw,0.875rem)] lg:col-span-5">
            <div className="tile aspect-[4/3]"><Photo src="concert-5-ani/voci-si-band" alt={altOf("voci-si-band", locale)} sizes="(min-width: 1024px) 40vw, 100vw" className="size-full object-cover" /></div>
            <div className="tile tile-green p-6 sm:p-8">
              <p className="lead">{j.side}</p>
              <p className="mt-6 font-medium">{j.sideCall}</p>
              <a href={CONTACT.phoneHref} className="font-heading text-3xl font-semibold underline underline-offset-4">{CONTACT.phoneDisplay}</a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Sustine({ locale, t }: ViewProps) {
  const s = t.support;
  return (
    <>
      <PageHead title={s.h1} lead={s.lead} />
      <section className="frame section">
        <div className="mosaic">
          <DonationPanel locale={locale} t={t} />
          <div className="tile tile-surface col-span-12 p-6 sm:p-10 lg:col-span-5">
            <h2 className="title-section mb-5">{s.otherTitle}</h2>
            <p>{s.other}</p>
          </div>
        </div>
      </section>
    </>
  );
}

function Contact({ t }: ViewProps) {
  const c = t.contact;
  const social = [["Facebook", CONTACT.facebook], ["Instagram", CONTACT.instagram], ["TikTok", CONTACT.tiktok], ["YouTube", CONTACT.youtube]];
  return (
    <>
      <PageHead title={c.h1} lead={c.lead} />
      <section className="frame section">
        <div className="mosaic">
          <a href={CONTACT.phoneHref} className="tile tile-yellow lift col-span-12 flex min-h-72 flex-col justify-between gap-8 p-6 sm:p-10 lg:col-span-7">
            <Phone className="size-9" aria-hidden />
            <span>
              <span className="block font-medium">{c.phoneLabel}</span>
              <span className="font-heading text-[clamp(2.75rem,7vw,6.5rem)] font-semibold leading-none tracking-[-0.03em]">{CONTACT.phoneDisplay}</span>
            </span>
          </a>
          <div className="tile tile-green col-span-12 p-6 sm:p-10 lg:col-span-5">
            <h2 className="title-section mb-6">{c.socialTitle}</h2>
            <ul className="space-y-2 font-heading text-3xl font-medium">
              {social.map(([name, url]) => <li key={name}><a href={url} target="_blank" rel="noopener" className="underline-offset-4 hover:underline">{name}</a></li>)}
            </ul>
            <p className="mt-8">{c.place}</p>
          </div>
        </div>
      </section>
    </>
  );
}

function Confidentialitate({ t }: ViewProps) {
  const p = t.privacy;
  return (
    <>
      <PageHead title={p.h1} lead={p.lead}><p className="mt-4 text-base">{p.updated}</p></PageHead>
      <div className="frame mt-14 space-y-10">
        {p.sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-3 text-[clamp(1.75rem,3vw,2.5rem)]">{s.h}</h2>
            <div className="prose-body">{s.p.map((x) => <p key={x}>{x}</p>)}</div>
          </section>
        ))}
      </div>
    </>
  );
}

export const VIEWS: Record<Page, (props: ViewProps) => React.ReactNode> = {
  "": Home, despre: Despre, evenimente: Evenimente, "italia-2026": Italia, "inctc-2026": Inctc, aniversari: Aniversari,
  muzica: Muzica, galerie: Galerie, "alatura-te": Alatura, sustine: Sustine, contact: Contact, confidentialitate: Confidentialitate,
};
