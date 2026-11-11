"use client";
/* Everything on the public pages that reads site data: static from the seed, refreshed from Supabase. */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { ArrowLeft, ArrowRight, Calendar, MessageCircle, Play, X } from "lucide-react";
import { useSiteData, useToday } from "@/components/Providers";
import { isLite } from "@/components/Curtain";
import { Photo } from "@/components/Photo";
import type { Dict } from "@/i18n";
import { href } from "@/i18n";
import type { ChoirEvent } from "@/data/types";
import { countConcerts, splitEvents } from "@/lib/events";
import { buildIcs } from "@/lib/ics";
import { localized } from "@/lib/localized";
import { formatDate } from "@/lib/site";
import { TOTAL_TRACKS } from "@/data/music";

/* ---- Figures ---- */

function useCountUp(target: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(target);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || isLite()) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSeen(true);
        io.disconnect();
      } else {
        setValue(0); // off screen: start from zero so it counts up on arrival
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown: seen ? target : value };
}

function Figure({ target, label, note }: { target: number; label: string; note?: string }) {
  const { ref, shown } = useCountUp(target);
  return (
    <div ref={ref} className="min-w-0">
      <NumberFlow value={shown} className="big-number" />
      <p className="mt-2 hyphens-auto font-heading text-[clamp(0.9375rem,0.8rem+0.8vw,1.5rem)] font-medium leading-tight">{label}</p>
      {note ? <p className="mt-1 text-[0.9375rem] leading-snug opacity-85">{note}</p> : null}
    </div>
  );
}

export function Figures({ t }: { t: Dict }) {
  const { events, settings } = useSiteData();
  const today = useToday();
  const years = yearsTogether(settings.founding_date, settings.years_active, today);
  return (
    <div className="figures">
      <Figure target={years} label={t.home.years} />
      <Figure target={TOTAL_TRACKS} label={t.home.tracks} />
      <Figure target={countConcerts(events, today)} label={t.home.concerts} note={t.home.concertsNote} />
      <Figure target={settings.tours.length} label={t.home.tours} note={settings.tours.map((x) => x.name).join(", ")} />
    </div>
  );
}

function yearsTogether(founded: string, fallback: number, today: string) {
  if (!founded) return fallback;
  const [y, m = "01"] = founded.split("-");
  const [ty, tm] = today.split("-");
  return Number(ty) - Number(y) - (tm < m ? 1 : 0);
}

/* ---- Tickets ---- */

function Ticket({ event, locale, t, past, heading: Title = "h3" }: { event: ChoirEvent; locale: string; t: Dict; past: boolean; heading?: "h2" | "h3" | "h4" }) {
  const title = localized(event.title, locale);
  const place = localized(event.place, locale);
  const note = localized(event.note, locale);
  const full = { day: "numeric", month: "long", year: "numeric" } as const;
  const dateText = formatDate(event.date, locale, full) + (event.end_date ? ` – ${formatDate(event.end_date, locale, full)}` : "");
  const day = Number(event.date.slice(8));
  const lastDay = event.end_date && event.end_date.slice(0, 7) === event.date.slice(0, 7) ? Number(event.end_date.slice(8)) : null;

  function download() {
    const ics = buildIcs({ id: event.id, date: event.date, end_date: event.end_date, time: event.time, title, place, description: note });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const share = `https://wa.me/?text=${encodeURIComponent(`${t.common.shareText} ${title}, ${dateText}${event.time ? `, ${event.time}` : ""}, ${place}`)}`;

  return (
    <article className="ticket" data-past={past}>
      <time dateTime={event.date} className="ticket-stub" aria-label={dateText} suppressHydrationWarning>
        <span className="ticket-day" style={lastDay ? { fontSize: "clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)" } : undefined}>{lastDay ? `${day}–${lastDay}` : day}</span>
        <span className="font-heading text-[1.0625rem] font-semibold leading-tight" suppressHydrationWarning>
          {formatDate(event.date, locale, { month: "short" })} {event.date.slice(0, 4)}
        </span>
      </time>
      <span className="ticket-cut" aria-hidden />
      <div className="ticket-body">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.9375rem] font-semibold">
          <span>{event.kind === "festival" ? t.events.festival : t.events.concert}</span>
          {event.time ? <span>{t.common.at} {event.time}</span> : null}
          {event.status === "announced" && past ? <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">{t.common.announced}</span> : null}
        </p>
        <Title className={`mt-1.5 ${past ? "text-[clamp(1.1875rem,1.05rem+0.7vw,1.625rem)] leading-[1.12]" : "title-card"}`}>{title}</Title>
        <p className="mt-2">{place}</p>
        {note ? <p className="mt-1 text-[0.9375rem]">{note}</p> : null}
        {past ? null : (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={download} className="btn btn-dark"><Calendar className="size-4 shrink-0" aria-hidden /> {t.common.addToCalendar}</button>
            <a href={share} target="_blank" rel="noopener" className="btn btn-line"><MessageCircle className="size-4 shrink-0" aria-hidden /> {t.common.shareWhatsapp}</a>
          </div>
        )}
        {event.poster && /^https:\/\//.test(event.poster) ? <Photo src={event.poster} alt={title} className="mt-4 w-full max-w-xs rounded-lg" /> : null}
      </div>
    </article>
  );
}

/** Home page: the next concert as a ticket, or a quiet line when nothing is announced. */
export function NextTicket({ locale, t }: { locale: string; t: Dict }) {
  const { events } = useSiteData();
  const today = useToday();
  const next = splitEvents(events.filter((e) => e.kind === "concert"), today).upcoming[0];
  return (
    <div suppressHydrationWarning>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h2 className="eyebrow"><span className="romb" aria-hidden />{t.common.upcomingLine}</h2>
        <Link href={href(locale, "evenimente")} className="go inline-flex items-center gap-1.5 font-semibold underline decoration-2 underline-offset-4">
          {t.home.allEvents} <ArrowRight className="arrow size-4" aria-hidden />
        </Link>
      </div>
      {next ? <Ticket event={next} locale={locale} t={t} past={false} /> : <p className="tile tile-paper pad lead max-w-none">{t.events.noUpcoming}</p>}
    </div>
  );
}

export function EventsTimeline({ locale, t }: { locale: string; t: Dict }) {
  const { events } = useSiteData();
  const today = useToday();
  const { upcoming, past } = splitEvents(events, today);
  const announcedShown = past.some((e) => e.status === "announced");
  return (
    <>
      <section className="section" aria-labelledby="urmeaza">
        <h2 id="urmeaza" className="title-section mb-6">{t.events.upcoming}</h2>
        {upcoming.length ? (
          <ol className="grid gap-3">{upcoming.map((e) => <li key={e.id} data-reveal><Ticket event={e} locale={locale} t={t} past={false} /></li>)}</ol>
        ) : <p className="lead">{t.events.noUpcoming}</p>}
      </section>
      <section className="section" aria-labelledby="trecute">
        <h2 id="trecute" className="title-section mb-8">{t.events.past}</h2>
        <div className="grid gap-10">
          {[...new Set(past.map((e) => e.date.slice(0, 4)))].map((year) => (
            <div key={year} className="cv grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(7rem,12rem)_minmax(0,1fr)]">
              <h3 className="year-mark flex items-center gap-3 self-start md:sticky md:top-24"><span className="romb" aria-hidden style={{ width: "0.3em", height: "0.3em" }} />{year}</h3>
              <ol className="grid gap-2.5">
                {past.filter((e) => e.date.startsWith(year)).map((e) => <li key={e.id} data-reveal><Ticket event={e} locale={locale} t={t} past heading="h4" /></li>)}
              </ol>
            </div>
          ))}
        </div>
        {announcedShown ? <p className="mt-6 max-w-[60ch] text-[0.9375rem]">{t.events.announcedHelp}</p> : null}
      </section>
    </>
  );
}

/* ---- Council and conductor ---- */

const initials = (name: string) => name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export function CouncilGrid({ locale, t }: { locale: string; t: Dict }) {
  const { council } = useSiteData();
  return (
    <ul className="grid grid-cols-2 gap-[clamp(0.5rem,1vw,0.875rem)] md:grid-cols-4">
      {council.map((m, i) => {
        const description = localized(m.description, locale);
        return (
          <li key={m.id} data-reveal style={{ "--delay": `${(i % 4) * 70}ms` } as React.CSSProperties} className="tile tile-paper flex min-w-0 flex-col p-3 sm:p-5">
            {/* The logo's rhombus frames every portrait. */}
            <div className="diamond mx-auto mb-3 aspect-square w-full max-w-56">
              {m.portrait ? (
                <Photo src={m.portrait} alt={m.name} className="size-full object-cover" sizes="(min-width: 768px) 22vw, 45vw" />
              ) : (
                <div aria-hidden className={`grid size-full place-items-center font-heading text-[clamp(1.375rem,1rem+2.4vw,2.5rem)] font-semibold text-on-green ${i % 2 ? "bg-deep" : "bg-green"}`}>
                  {initials(m.name)}
                </div>
              )}
            </div>
            <h3 className="text-[clamp(1.0625rem,0.95rem+0.7vw,1.5rem)] leading-[1.12]">{m.name}</h3>
            <p className="mt-1 text-[0.9375rem] font-medium text-green-text">
              {localized(m.role, locale)}{m.age ? `, ${m.age} ${t.about.ageSuffix}` : ""}
            </p>
            {description ? <p className="mt-2 text-[0.9375rem]">{description}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ConductorBio({ locale }: { locale: string }) {
  const { settings } = useSiteData();
  return <p className="lead max-w-[46ch]">{localized(settings.conductor_bio, locale)}</p>;
}

export function ConductorPhoto({ alt }: { alt: string }) {
  const { settings } = useSiteData();
  return <Photo src={settings.conductor_photo} alt={alt} className="size-full object-cover" sizes="(min-width: 768px) 40vw, 100vw" />;
}

export function FoundingNote({ locale, label }: { locale: string; label: string }) {
  const { settings } = useSiteData();
  if (!settings.founding_date) return null;
  const parts = settings.founding_date.split("-");
  const text = parts.length === 3
    ? formatDate(settings.founding_date, locale, { day: "numeric", month: "long", year: "numeric" })
    : parts.length === 2 ? formatDate(`${settings.founding_date}-01`, locale, { month: "long", year: "numeric" }) : parts[0];
  return <p className="mt-4 font-medium">{label}: {text}</p>;
}

/* ---- Videos and albums: nothing loads from YouTube or Spotify until the visitor taps ---- */

type Tone = "green" | "deep" | "paper";

export function VideoFacade({ youtubeId, title, watch, tone = "green", fill }: { youtubeId: string; title: string; watch: string; tone?: Tone; fill?: boolean }) {
  const [playing, setPlaying] = useState(false);
  if (!/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) return null;
  if (playing) {
    return (
      <div className="tile aspect-video size-full">
        <iframe
          className="size-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setPlaying(true)} aria-label={`${watch}: ${title}`} className={`tile tile-${tone} flex aspect-video w-full flex-col justify-between gap-4 p-4 text-left sm:p-6 ${fill ? "lg:aspect-auto lg:h-full lg:min-h-64" : ""}`}>
      <span className="grid size-13 place-items-center rounded-full bg-yellow text-on-yellow"><Play className="size-6 fill-current" aria-hidden /></span>
      <span className="title-card font-heading font-semibold">{title}</span>
    </button>
  );
}

export function VideoGrid({ locale, t }: { locale: string; t: Dict }) {
  const { videos } = useSiteData();
  const tones: Tone[] = ["green", "deep", "paper"];
  return (
    <div className="mosaic">
      {videos.map((v, i) => (
        <div key={v.id} data-reveal style={{ "--delay": `${i * 70}ms` } as React.CSSProperties} className={i === 0 ? "col-span-12 lg:col-span-7 lg:row-span-2" : "col-span-12 sm:col-span-6 lg:col-span-5"}>
          <VideoFacade youtubeId={v.youtube_id} title={localized(v.title, locale)} watch={t.common.watch} tone={tones[i % 3]} fill={i === 0} />
        </div>
      ))}
    </div>
  );
}

/** An album as a cover you can tap. The Spotify player replaces the cover only then. */
export function AlbumCover({ spotifyId, title, lang, meta, action, tone }: { spotifyId: string | null; title: string; lang: string; meta: string; action: string; tone: "green" | "deep" }) {
  const [open, setOpen] = useState(false);
  if (open && spotifyId) {
    return <iframe title={title} src={`https://open.spotify.com/embed/album/${spotifyId}`} allow="encrypted-media" className="tile block h-[352px] w-full" />;
  }
  const inner = (
    <>
      <span aria-hidden className="absolute -right-[9%] -top-[12%] aspect-square w-[34%] rotate-45 rounded-md border-[clamp(0.5rem,1.4vw,1rem)] border-yellow" />
      <span className="relative max-w-[66%] text-[0.9375rem] font-medium leading-snug" suppressHydrationWarning>{meta}</span>
      <span className="relative grid gap-4">
        <span lang={lang} className="title-section max-w-[11ch] font-heading font-semibold">{title}</span>
        {spotifyId ? (
          <span className="inline-flex items-center gap-3 font-semibold">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-yellow text-on-yellow"><Play className="size-5 fill-current" aria-hidden /></span>
            {action}
          </span>
        ) : null}
      </span>
    </>
  );
  const shell = `tile tile-${tone} flex h-full min-h-[19rem] w-full flex-col justify-between gap-8 p-[clamp(1.125rem,0.6rem+2.4vw,2rem)] text-left`;
  return spotifyId
    ? <button type="button" onClick={() => setOpen(true)} className={shell}>{inner}</button>
    : <div className={shell}>{inner}</div>;
}

/* ---- Gallery ---- */

const SPANS = [
  "col-span-12 md:col-span-8 aspect-[16/10]",
  "col-span-6 md:col-span-4 aspect-[4/5] md:aspect-auto",
  "col-span-6 md:col-span-4 aspect-[4/5] md:aspect-[4/5]",
  "col-span-12 md:col-span-8 aspect-[16/10] md:aspect-auto",
  "col-span-6 md:col-span-3 aspect-square",
  "col-span-6 md:col-span-5 aspect-square md:aspect-auto",
  "col-span-12 md:col-span-4 aspect-[16/10] md:aspect-auto",
];

export function Albums({ locale, t, slug }: { locale: string; t: Dict; slug?: string }) {
  const { albums, photos } = useSiteData();
  const [open, setOpen] = useState<{ album: string; index: number } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  const shown = albums
    .filter((a) => !slug || a.slug === slug)
    .map((a) => ({ ...a, items: photos.filter((p) => p.album_id === a.id).sort((x, y) => x.position - y.position) }))
    .filter((a) => a.items.length);

  useEffect(() => {
    if (open) { if (!dialog.current?.open) dialog.current?.showModal(); }
    else dialog.current?.close();
  }, [open]);

  if (!shown.length) return slug ? null : <p className="lead">{t.gallery.empty}</p>;

  const items = open ? shown.find((a) => a.id === open.album)!.items : [];
  const step = (d: number) => setOpen((o) => o && { ...o, index: (o.index + d + items.length) % items.length });
  const current = open ? items[open.index] : null;

  return (
    <>
      {shown.map((album) => (
        <section key={album.id} className="mt-12">
          <h2 className="title-section">{localized(album.title, locale)}</h2>
          <p className="mb-6 mt-2">{localized(album.description, locale)}</p>
          <div className="mosaic">
            {album.items.map((p, i) => (
              <button
                key={p.id}
                type="button"
                data-reveal
                onClick={() => setOpen({ album: album.id, index: i })}
                aria-label={`${t.gallery.open}: ${localized(p.alt, locale)}`}
                className={`tile zoom ${SPANS[i % SPANS.length]}`}
              >
                <Photo src={p.src} alt="" sizes="(min-width: 768px) 60vw, 100vw" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </section>
      ))}
      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        aria-label={t.nav.galerie}
        onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - (touchX.current ?? e.changedTouches[0].clientX);
          touchX.current = null;
          if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
        }}
        className="inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-black/95 p-0 text-white backdrop:bg-black"
      >
        {current ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
            <Photo src={current.src} alt={localized(current.alt, locale)} sizes="100vw" className="max-h-[calc(100dvh-11rem)] w-auto max-w-full rounded-lg object-contain" />
            <p className="max-w-[60ch] text-center text-[0.9375rem] leading-snug">{localized(current.alt, locale)}</p>
            <div className="flex gap-2">
              <button type="button" className="btn btn-line min-w-12 px-3" onClick={() => step(-1)} aria-label={t.gallery.prev}><ArrowLeft className="size-5" aria-hidden /></button>
              <button type="button" className="btn btn-primary" onClick={() => setOpen(null)}><X className="size-4 shrink-0" aria-hidden /> {t.gallery.close}</button>
              <button type="button" className="btn btn-line min-w-12 px-3" onClick={() => step(1)} aria-label={t.gallery.next}><ArrowRight className="size-5" aria-hidden /></button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

/* ---- Donations ---- */

export function DonationPanel({ locale, t }: { locale: string; t: Dict }) {
  const { settings } = useSiteData();
  return (
    <div className="tile tile-green pad col-span-12 lg:col-span-7">
      <p className="eyebrow"><span className="romb" aria-hidden />{t.support.beneficiaryLabel}</p>
      <p className="title-section mt-3 font-heading font-semibold">{settings.donation_beneficiary}</p>
      {settings.iban ? (
        <div className="mt-8">
          <p className="font-medium">{t.support.ibanLabel}</p>
          <p className="mt-1 break-all font-heading text-[clamp(1.125rem,0.9rem+1.4vw,2rem)] font-semibold tabular-nums">{settings.iban}</p>
        </div>
      ) : (
        <div className="mt-8">
          <p className="max-w-[46ch]">{t.support.noIban}</p>
          <Link href={href(locale, "contact")} className="btn btn-primary go mt-5">{t.support.contactCta} <ArrowRight className="arrow size-4" aria-hidden /></Link>
        </div>
      )}
    </div>
  );
}
