import Link from "next/link";
import { ArrowRight, ArrowUpRight, HeartHandshake, Mic, Music, PartyPopper, Phone, Users } from "lucide-react";
import type { Dict } from "@/i18n";
import { href } from "@/i18n";
import type { Locale, Page } from "@/i18n/config";
import { formatDate } from "@/lib/site";
import { seed } from "@/data/seed";
import { localized } from "@/lib/localized";
import { CONCERT_VIDEO_5_ANI, CONTACT, ITALY_POSTS, MUSIC_ALBUMS } from "@/data/music";
import { Photo } from "@/components/Photo";
import { Words } from "@/components/Words";
import { VoicePicker } from "@/components/VoicePicker";
import { JoinForm } from "@/components/JoinForm";
import { AlbumCover, Albums, ConductorBio, ConductorPhoto, CouncilGrid, DonationPanel, EventsTimeline, Figures, FoundingNote, NextTicket, VideoFacade, VideoGrid } from "@/components/live";

type ViewProps = { locale: Locale; t: Dict };

const fullKey = (src: string) => (src.includes("/") ? src : `concert-5-ani/${src}`);
const altOf = (src: string, locale: string) => localized(seed.photos.find((p) => p.src === fullKey(src))?.alt, locale);

const Romb = () => <span className="romb" aria-hidden />;

function PageHead({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="frame pt-[clamp(1.75rem,5vw,4.5rem)]">
      {eyebrow !== title ? <p className="eyebrow"><Romb />{eyebrow}</p> : null}
      <h1 className="title-page mt-3 max-w-[18ch]">{title}</h1>
      {lead ? <p className="lead mt-5">{lead}</p> : null}
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

type HubProps = {
  locale: Locale; page: Exclude<Page, "">; area: string; title: string; blurb: string;
  tone?: string; photo?: string; icon?: React.ReactNode; big?: boolean; wide?: boolean;
};

/** One page, one card. Photo cards carry their label on a solid band so the text is readable on any picture. */
function HubCard({ locale, page, area, title, blurb, tone = "tile-deep", photo, icon, big, wide }: HubProps) {
  return (
    <Link href={href(locale, page)} style={{ gridArea: area }} data-reveal className={`tile hub-card go zoom ${photo ? "tile-deep" : tone} ${big ? "hub-big" : ""} ${wide ? "hub-wide" : ""}`}>
      {photo ? (
        <span className="relative block min-h-20 flex-1 overflow-hidden">
          <Photo src={fullKey(photo)} alt="" sizes={big ? "(min-width: 900px) 50vw, 100vw" : "(min-width: 900px) 25vw, 50vw"} className="absolute inset-0 size-full object-cover" />
        </span>
      ) : (
        <span className="flex-1 p-[clamp(0.75rem,0.5rem+1.2vw,1.5rem)] pb-0">{icon}</span>
      )}
      <span className="hub-text">
        <span className="hub-title">{title} <ArrowRight className="arrow mb-[0.1em] size-[0.8em]" aria-hidden /></span>
        <span className="hub-blurb">{blurb}</span>
      </span>
    </Link>
  );
}

const POLAROIDS = ["italia-2026/grup-lac", "voci-si-band", "italia-2026/esarfe-galbene", "baieti-cantand", "italia-2026/supa", "alelia-dirijat"];
const hubIcon = "size-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)]";

function Home({ locale, t }: ViewProps) {
  const h = t.home;
  const n = t.nav;
  return (
    <>
      <section className="frame pt-[clamp(1.5rem,4vw,3.5rem)]">
        <p className="eyebrow"><Romb />{t.site.identity.charAt(0).toUpperCase() + t.site.identity.slice(1)}, {t.site.city}</p>
        <h1 className="title-hero mt-4 max-w-[13ch]">{h.h1}</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <p className="lead">{h.sub}</p>
          <div className="flex flex-wrap gap-2">
            <Link href={href(locale, "alatura-te")} className="btn btn-primary go">{h.ctaJoin} <ArrowRight className="arrow size-4" aria-hidden /></Link>
            <Link href={href(locale, "evenimente")} className="btn btn-line">{h.ctaEvents}</Link>
          </div>
        </div>
        <div className="tile mt-8 aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
          <ParallaxPhoto src="concert-5-ani/grup-scena" alt={altOf("grup-scena", locale)} sizes="(min-width: 1400px) 1320px, 100vw" priority />
        </div>
      </section>

      <section className="frame mt-[clamp(2rem,5vw,4rem)]">
        <NextTicket locale={locale} t={t} />
      </section>

      <section className="frame section" aria-labelledby="pagini">
        <h2 id="pagini" className="title-section mb-6 max-w-[16ch]"><Words text={h.hubTitle} /></h2>
        <div className="hub">
          <HubCard locale={locale} page="evenimente" area="ev" title={n.evenimente} blurb={h.hub.evenimente} photo="grup-aplauze" big wide />
          <HubCard locale={locale} page="despre" area="de" title={n.despre} blurb={h.hub.despre} photo="baieti-grup" />
          <HubCard locale={locale} page="muzica" area="mu" title={n.muzica} blurb={h.hub.muzica} tone="tile-green" icon={<Music className={hubIcon} aria-hidden />} />
          <HubCard locale={locale} page="galerie" area="ga" title={n.galerie} blurb={h.hub.galerie} photo="italia-2026/esarfe-galbene" wide />
          <HubCard locale={locale} page="italia-2026" area="it" title={n["italia-2026"]} blurb={h.hub["italia-2026"]} photo="italia-2026/grup-lac" />
          <HubCard locale={locale} page="inctc-2026" area="in" title={n["inctc-2026"]} blurb={h.hub["inctc-2026"]} tone="tile-deep" icon={<Users className={hubIcon} aria-hidden />} />
          <HubCard locale={locale} page="aniversari" area="an" title={n.aniversari} blurb={h.hub.aniversari} tone="tile-paper" icon={<PartyPopper className={hubIcon} aria-hidden />} />
          <HubCard locale={locale} page="alatura-te" area="al" title={h.ctaJoin} blurb={h.hub["alatura-te"]} tone="tile-yellow" icon={<Mic className={hubIcon} aria-hidden />} big wide />
          <HubCard locale={locale} page="sustine" area="su" title={n.sustine} blurb={h.hub.sustine} tone="tile-surface" icon={<HeartHandshake className={hubIcon} aria-hidden />} />
          <HubCard locale={locale} page="contact" area="co" title={n.contact} blurb={h.hub.contact} tone="tile-green" icon={<Phone className={hubIcon} aria-hidden />} />
        </div>
      </section>

      <section className="frame section" aria-labelledby="cifre">
        <div className="tile tile-deep pad">
          <h2 id="cifre" className="title-section mb-[clamp(1.75rem,4vw,3rem)] max-w-[16ch]"><Words text={h.figuresTitle} /></h2>
          <Figures t={t} />
        </div>
      </section>

      <section className="section cv" aria-labelledby="poze">
        <div className="frame flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h2 id="poze" className="title-section"><Words text={h.photosTitle} /></h2>
          <Link href={href(locale, "galerie")} className="go inline-flex items-center gap-1.5 font-semibold underline decoration-2 underline-offset-4">{h.photosCta} <ArrowRight className="arrow size-4" aria-hidden /></Link>
        </div>
        <div className="pile mt-2">
          {POLAROIDS.map((src) => (
            <Link key={src} href={href(locale, "galerie")} className="polaroid" aria-label={altOf(src, locale)}>
              <span className="block aspect-square overflow-hidden rounded-[2px]">
                <Photo src={fullKey(src)} alt="" sizes="(min-width: 640px) 17rem, 44vw" className="size-full object-cover" />
              </span>
              <span className="mt-2 block text-center font-heading text-[0.9375rem] font-medium leading-tight">{src.startsWith("italia") ? n["italia-2026"] : t.anniversaries.fiveTitle}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="frame section cv" aria-labelledby="muzica">
        <div className="mosaic">
          <div className="col-span-12 flex flex-col justify-between gap-5 lg:col-span-4 lg:py-2">
            <div>
              <h2 id="muzica" className="title-section"><Words text={h.musicTitle} /></h2>
              <p className="lead mt-4">{h.musicLead}</p>
            </div>
            <p><Link href={href(locale, "muzica")} className="btn btn-line go">{h.musicCta} <ArrowRight className="arrow size-4" aria-hidden /></Link></p>
          </div>
          {MUSIC_ALBUMS.map((album, i) => (
            <div key={album.title} className="col-span-12 grid sm:col-span-6 lg:col-span-4" data-reveal style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}>
              <AlbumCover spotifyId={album.spotifyAlbumId} title={album.title} lang={i ? "en" : "ro"} meta={`${album.tracks} ${t.music.tracks} · ${album.released.slice(0, 4)}`} action={t.music.openPlayer} tone={i ? "deep" : "green"} />
            </div>
          ))}
        </div>
      </section>

      <section className="frame section cv" aria-labelledby="vino">
        <div className="mosaic">
          <div className="tile tile-green pad col-span-12 lg:col-span-7">
            <h2 id="vino" className="title-page"><Words text={h.joinTitle} /></h2>
            <p className="lead mb-8 mt-4">{h.joinLead}</p>
            <VoicePicker locale={locale} t={h} />
          </div>
          <div className="tile col-span-12 aspect-[4/3] lg:col-span-5 lg:aspect-auto">
            <ParallaxPhoto src="concert-5-ani/baieti-cantand" alt={altOf("baieti-cantand", locale)} sizes="(min-width: 1024px) 40vw, 100vw" />
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
      <PageHead eyebrow={t.nav.despre} title={a.h1} lead={a.lead} />
      <section className="frame section" aria-labelledby="poveste">
        <div className="mosaic">
          <div className="tile col-span-12 aspect-[16/10] lg:col-span-8 lg:aspect-[16/9]">
            <ParallaxPhoto src="concert-5-ani/grup-aplauze" alt={a.singersCaption} sizes="(min-width: 1024px) 66vw, 100vw" priority />
          </div>
          <div className="tile tile-green pad col-span-12 flex flex-col justify-end lg:col-span-4">
            <p className="font-heading text-[clamp(2.75rem,1.5rem+6vw,6rem)] font-semibold leading-[0.9] tracking-[-0.04em]">{a.singersNumber}</p>
            <p className="title-card mt-2 font-heading font-medium">{a.singersLabel}</p>
            <p className="mt-2">{a.singersCaption}</p>
          </div>
          <div className="tile tile-paper pad col-span-12 lg:col-span-7" data-reveal>
            <h2 id="poveste" className="title-section mb-5">{a.storyTitle}</h2>
            <div className="prose-body">{a.story.map((p) => <p key={p}>{p}</p>)}</div>
            <FoundingNote locale={locale} label={a.storyTitle} />
          </div>
          <div className="tile tile-deep pad col-span-12 lg:col-span-5" data-reveal>
            <h2 className="title-section mb-5">{a.missionTitle}</h2>
            <p>{a.mission}</p>
            <h3 className="title-card mb-2 mt-8">{a.belongsTitle}</h3>
            <p>{a.belongs}</p>
          </div>
        </div>
      </section>

      <section className="frame section cv" aria-labelledby="dirijor">
        <div className="mosaic">
          <figure className="col-span-12 md:col-span-5">
            <div className="tile aspect-square" data-reveal><ConductorPhoto alt={a.conductorCaption} /></div>
            <figcaption className="mt-2 text-[0.9375rem]">{a.conductorCaption}</figcaption>
          </figure>
          <div className="tile tile-paper pad col-span-12 self-start md:col-span-7">
            <p className="eyebrow"><Romb />{a.conductorTitle}</p>
            <h2 id="dirijor" className="title-section mt-3">{seed.settings.conductor_name}</h2>
            <p className="mb-5 mt-1 font-medium text-green-text">{a.conductorRole}</p>
            <ConductorBio locale={locale} />
          </div>
        </div>
      </section>

      <section className="frame section cv" aria-labelledby="consiliu">
        <h2 id="consiliu" className="title-section"><Words text={a.councilTitle} /></h2>
        <p className="lead mb-8 mt-5 max-w-[52ch]" data-reveal>{a.councilLead}</p>
        <CouncilGrid locale={locale} t={t} />
      </section>
    </>
  );
}

function Evenimente({ locale, t }: ViewProps) {
  return (
    <>
      <PageHead eyebrow={t.nav.evenimente} title={t.events.h1} lead={t.events.lead} />
      <div className="frame"><EventsTimeline locale={locale} t={t} /></div>
    </>
  );
}

function Italia({ locale, t }: ViewProps) {
  const i = t.italy;
  return (
    <>
      <PageHead eyebrow={t.home.tours} title={i.h1} lead={i.lead} />
      <div className="frame mt-8">
        <div className="tile aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
          <Photo src="italia-2026/grup-lac" alt={altOf("italia-2026/grup-lac", locale)} sizes="(min-width: 1400px) 1320px, 100vw" priority className="size-full object-cover object-[50%_80%]" />
        </div>
      </div>
      <section className="frame section" aria-labelledby="jurnal">
        <div className="mosaic">
          <div className="tile tile-paper pad col-span-12 lg:col-span-7" data-reveal>
            <h2 className="title-section mb-5">{i.bodyTitle}</h2>
            <div className="prose-body">{i.body.map((p) => <p key={p}>{p}</p>)}</div>
          </div>
          <div className="tile tile-deep pad col-span-12 lg:col-span-5" data-reveal>
            <h2 id="jurnal" className="title-card mb-5">{i.postsTitle}</h2>
            <ol className="grid gap-4">
              {ITALY_POSTS.map((p) => (
                <li key={p.url}>
                  <time dateTime={p.date} className="block text-[0.9375rem]" suppressHydrationWarning>{formatDate(p.date, locale, { day: "numeric", month: "long" })}</time>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-heading text-[clamp(1.1875rem,1.05rem+0.6vw,1.5rem)] font-medium leading-tight underline underline-offset-4" lang="ro" aria-label={`${i.openPost}: ${p.text}`}>{p.text}</a>
                </li>
              ))}
            </ol>
            <p className="mt-7"><a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">{i.more}</a></p>
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
      <PageHead eyebrow={c.sub} title={c.h1} lead={c.lead} />
      <section className="frame section" aria-labelledby="pe-scurt">
        <div className="mosaic">
          <div className="tile tile-green pad col-span-12 lg:col-span-5">
            <h2 id="pe-scurt" className="title-section mb-7">{c.factsTitle}</h2>
            <dl className="grid gap-5">
              {c.facts.map((f) => (
                <div key={f.k}>
                  <dt className="eyebrow"><Romb />{f.k}</dt>
                  <dd className="title-card mt-1.5 font-heading font-semibold">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="tile tile-paper pad col-span-12 flex flex-col justify-between gap-8 lg:col-span-7">
            <div>
              <h2 className="title-section mb-5">{c.storyTitle}</h2>
              <div className="prose-body">{c.story.map((p) => <p key={p}>{p}</p>)}</div>
            </div>
            <p><a href="https://corneluu.github.io/inctc/" target="_blank" rel="noopener noreferrer" className="btn btn-green">{c.link} <ArrowUpRight className="size-4 shrink-0" aria-hidden /></a></p>
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
      <PageHead eyebrow={t.nav.aniversari} title={a.h1} lead={a.lead} />
      <section className="frame section" aria-labelledby="sase">
        <div className="mosaic">
          <div className="tile tile-green pad col-span-12 lg:col-span-6">
            <p aria-hidden className="big-number text-yellow">6</p>
            <h2 id="sase" className="title-section mb-4 mt-5">{a.sixTitle}</h2>
            <p>{a.six}</p>
            <Link href={href(locale, "evenimente")} className="btn btn-primary go mt-6">{a.sixCta} <ArrowRight className="arrow size-4" aria-hidden /></Link>
          </div>
          <div className="tile tile-paper pad col-span-12 lg:col-span-6">
            <p aria-hidden className="big-number text-green-text">5</p>
            <h2 className="title-section mb-4 mt-5">{a.fiveTitle}</h2>
            <p>{a.five}</p>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <VideoFacade youtubeId={CONCERT_VIDEO_5_ANI} title={a.fiveVideo} watch={t.common.watch} tone="deep" fill />
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
  const link = "underline decoration-2 underline-offset-4";
  return (
    <>
      <PageHead eyebrow={t.nav.muzica} title={m.h1} lead={m.lead} />
      <section className="frame section" aria-labelledby="albume">
        <h2 id="albume" className="title-section mb-2">{m.albumsTitle}</h2>
        <p className="mb-6 text-[0.9375rem]">{m.playerNote}</p>
        <div className="grid gap-[clamp(0.5rem,1vw,0.875rem)] md:grid-cols-2">
          {MUSIC_ALBUMS.map((album, i) => (
            <article key={album.title} data-reveal style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}>
              <AlbumCover
                spotifyId={album.spotifyAlbumId} title={album.title} lang={i ? "en" : "ro"} action={m.openPlayer} tone={i ? "deep" : "green"}
                meta={`${album.tracks} ${m.tracks} · ${m.released} ${formatDate(album.released, locale, { day: "numeric", month: "long", year: "numeric" })}`}
              />
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-semibold">
                {album.spotifyAlbumId ? <li><a className={link} target="_blank" rel="noopener noreferrer" href={`https://open.spotify.com/album/${album.spotifyAlbumId}`}>Spotify</a></li> : null}
                <li><a className={link} target="_blank" rel="noopener noreferrer" href={album.apple}>Apple Music</a></li>
                <li><a className={link} target="_blank" rel="noopener noreferrer" href={album.deezer}>Deezer</a></li>
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="frame section cv" aria-labelledby="video">
        <h2 id="video" className="title-section mb-2">{m.videosTitle}</h2>
        <p className="mb-6 text-[0.9375rem]">{t.common.videoNote}</p>
        <VideoGrid locale={locale} t={t} />
        <p className="mt-6"><a href={CONTACT.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-line">{m.channel} <ArrowUpRight className="size-4 shrink-0" aria-hidden /></a></p>
      </section>
    </>
  );
}

function Galerie({ locale, t }: ViewProps) {
  return (
    <>
      <PageHead eyebrow={t.nav.galerie} title={t.gallery.h1} lead={t.gallery.lead} />
      <div className="frame"><Albums locale={locale} t={t} /></div>
    </>
  );
}

function Alatura({ locale, t }: ViewProps) {
  const j = t.join;
  return (
    <>
      <PageHead eyebrow={t.nav["alatura-te"]} title={j.h1} lead={j.lead} />
      <section className="frame mt-8">
        <div className="mosaic">
          <div className="col-span-12 lg:col-span-7"><div className="tile tile-paper pad"><JoinForm locale={locale} t={j} voices={t.home.voices} /></div></div>
          <aside className="col-span-12 flex flex-col gap-[clamp(0.5rem,1vw,0.875rem)] lg:col-span-5">
            <div className="tile aspect-[4/3]"><Photo src="concert-5-ani/voci-si-band" alt={altOf("voci-si-band", locale)} sizes="(min-width: 1024px) 40vw, 100vw" className="size-full object-cover" /></div>
            <div className="tile tile-deep pad">
              <p className="lead">{j.side}</p>
              <p className="mt-6 font-medium">{j.sideCall}</p>
              <a href={CONTACT.phoneHref} className="btn btn-primary mt-3"><Phone className="size-4 shrink-0" aria-hidden /> {CONTACT.phoneDisplay}</a>
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
      <PageHead eyebrow={t.nav.sustine} title={s.h1} lead={s.lead} />
      <section className="frame section">
        <div className="mosaic">
          <DonationPanel locale={locale} t={t} />
          <div className="tile tile-paper pad col-span-12 lg:col-span-5">
            <h2 className="title-section mb-4">{s.otherTitle}</h2>
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
      <PageHead eyebrow={t.nav.contact} title={c.h1} lead={c.lead} />
      <section className="frame section">
        <div className="mosaic">
          <a href={CONTACT.phoneHref} className="tile tile-green pad col-span-12 flex min-h-64 flex-col justify-between gap-8 lg:col-span-7">
            <span className="grid size-14 place-items-center rounded-full bg-yellow text-on-yellow"><Phone className="size-6" aria-hidden /></span>
            <span>
              <span className="block font-medium">{c.phoneLabel}</span>
              <span className="mt-1 block font-heading text-[clamp(1.75rem,1rem+4.6vw,4.5rem)] font-semibold leading-none tracking-[-0.03em]">{CONTACT.phoneDisplay}</span>
            </span>
          </a>
          <div className="tile tile-paper pad col-span-12 lg:col-span-5">
            <h2 className="title-section mb-4">{c.socialTitle}</h2>
            <ul className="grid">
              {social.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="go flex min-h-13 items-center justify-between gap-3 border-b border-border py-3 font-heading text-[1.375rem] font-medium leading-tight">
                    {name} <ArrowUpRight className="arrow size-5 shrink-0" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6">{c.place}</p>
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
      <PageHead eyebrow={p.updated} title={p.h1} lead={p.lead} />
      <div className="frame mt-10 grid gap-3">
        {p.sections.map((s) => (
          <section key={s.h} className="tile tile-paper pad">
            <h2 className="title-card mb-3">{s.h}</h2>
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
