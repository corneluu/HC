"use client";
/* Everything on the public pages that reads site data: static from the seed, refreshed from Supabase. */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { Calendar, MessageCircle, Play } from "lucide-react";
import { useSiteData, useToday } from "@/components/Providers";
import { Photo } from "@/components/Photo";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/i18n";
import { href } from "@/i18n";
import type { ChoirEvent } from "@/data/types";
import { countConcerts, splitEvents } from "@/lib/events";
import { buildIcs } from "@/lib/ics";
import { localized } from "@/lib/localized";
import { formatDate } from "@/lib/site";
import { TOTAL_TRACKS } from "@/data/music";

/* ---- Next concert line ---- */

export function NextConcertLine({ locale, t }: { locale: string; t: Dict }) {
  const { events } = useSiteData();
  const today = useToday();
  const next = splitEvents(events.filter((e) => e.kind === "concert"), today).upcoming[0];
  if (!next) return null;
  return (
    <p className="text-base" suppressHydrationWarning>
      <Link href={href(locale, "evenimente")} className="underline decoration-2 underline-offset-4">
        {t.common.upcomingLine}: {formatDate(next.date, locale, { weekday: "long", day: "numeric", month: "long" })}
        {next.time ? `, ${t.common.at} ${next.time}` : ""}, {localized(next.place, locale)}
      </Link>
    </p>
  );
}

/* ---- Figures ---- */

function useCountUp(target: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(target);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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

function Figure({ target, label, note, className }: { target: number; label: string; note?: string; className: string }) {
  const { ref, shown } = useCountUp(target);
  return (
    <div ref={ref} className={`tile flex min-h-44 flex-col justify-end p-4 sm:min-h-64 sm:p-8 ${className}`}>
      <NumberFlow value={shown} className="font-heading text-[clamp(4rem,11vw,10rem)] font-semibold leading-none tracking-[-0.04em]" />
      <p className="hyphens-auto font-heading text-lg font-medium sm:text-3xl">{label}</p>
      {note ? <p className="mt-1 text-base">{note}</p> : null}
    </div>
  );
}

export function Figures({ t }: { t: Dict }) {
  const { events, settings } = useSiteData();
  const today = useToday();
  const years = yearsTogether(settings.founding_date, settings.years_active, today);
  return (
    <div className="cross-mosaic">
      <Figure target={years} label={t.home.years} className="tile-yellow" />
      <Figure target={TOTAL_TRACKS} label={t.home.tracks} className="tile-surface" />
      <Figure target={countConcerts(events, today)} label={t.home.concerts} note={t.home.concertsNote} className="tile-surface" />
      <Figure target={settings.tours.length} label={t.home.tours} note={settings.tours.map((x) => x.name).join(", ")} className="tile-green" />
    </div>
  );
}

function yearsTogether(founded: string, fallback: number, today: string) {
  if (!founded) return fallback;
  const [y, m = "01"] = founded.split("-");
  const [ty, tm] = today.split("-");
  return Number(ty) - Number(y) - (tm < m ? 1 : 0);
}

/* ---- Timeline ---- */

function EventCard({ event, locale, t, past }: { event: ChoirEvent; locale: string; t: Dict; past: boolean }) {
  const Title = past ? "h4" : "h3";
  const title = localized(event.title, locale);
  const place = localized(event.place, locale);
  const note = localized(event.note, locale);
  const dateText = formatDate(event.date, locale, { day: "numeric", month: "long", year: "numeric" })
    + (event.end_date ? ` – ${formatDate(event.end_date, locale, { day: "numeric", month: "long", year: "numeric" })}` : "");

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
    <li className="relative" data-reveal>
      <span aria-hidden className="kite timeline-mark" data-past={past} />
      <article className={`tile grid gap-5 p-6 sm:p-8 ${event.poster ? "md:grid-cols-[1fr_14rem]" : ""} ${past ? "tile-surface" : "tile-yellow"}`}>
        <div>
          <p className="flex flex-wrap items-center gap-x-3 font-medium" suppressHydrationWarning>
            <time dateTime={event.date}>{dateText}</time>
            {event.time ? <span>{event.time}</span> : null}
            <span>{event.kind === "festival" ? t.events.festival : t.events.concert}</span>
            {event.status === "announced" && past ? <span className="rounded-full bg-muted px-2.5 text-sm text-foreground">{t.common.announced}</span> : null}
          </p>
          <Title className="mt-2 hyphens-auto text-[clamp(1.625rem,2.8vw,2.5rem)] [overflow-wrap:anywhere]">{title}</Title>
          <p className="mt-2">{place}</p>
          {note ? <p className="mt-1">{note}</p> : null}
          {past ? null : (
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={download} className="h-11 rounded-full bg-on-yellow px-5 text-base text-white hover:bg-on-yellow/85"><Calendar className="size-4" /> {t.common.addToCalendar}</Button>
              <Button asChild variant="outline" className="h-11 rounded-full border-on-yellow bg-transparent px-5 text-base text-on-yellow hover:bg-on-yellow/10 hover:text-on-yellow dark:border-on-yellow dark:bg-transparent dark:hover:bg-on-yellow/10">
                <a href={share} target="_blank" rel="noopener"><MessageCircle className="size-4" /> {t.common.shareWhatsapp}</a>
              </Button>
            </div>
          )}
        </div>
        {event.poster && /^https:\/\//.test(event.poster) ? <Photo src={event.poster} alt={title} className="w-full rounded-lg" /> : null}
      </article>
    </li>
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
        <h2 id="urmeaza" className="title-section mb-8">{t.events.upcoming}</h2>
        {upcoming.length ? (
          <ol className="timeline space-y-4">{upcoming.map((e) => <EventCard key={e.id} event={e} locale={locale} t={t} past={false} />)}</ol>
        ) : <p className="lead">{t.events.noUpcoming}</p>}
      </section>
      <section className="section" aria-labelledby="trecute">
        <h2 id="trecute" className="title-section mb-8">{t.events.past}</h2>
        <div className="space-y-12">
          {[...new Set(past.map((e) => e.date.slice(0, 4)))].map((year) => (
            <div key={year} className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(9rem,16rem)_minmax(0,1fr)]">
              <h3 className="self-start text-[clamp(3rem,6vw,5.5rem)] text-green-text md:sticky md:top-6">{year}</h3>
              <ol className="timeline space-y-4">
                {past.filter((e) => e.date.startsWith(year)).map((e) => <EventCard key={e.id} event={e} locale={locale} t={t} past />)}
              </ol>
            </div>
          ))}
        </div>
        {announcedShown ? <p className="mt-6 max-w-[60ch] text-base">{t.events.announcedHelp}</p> : null}
      </section>
    </>
  );
}

/* ---- Council and conductor ---- */

const initials = (name: string) => name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export function CouncilGrid({ locale, t }: { locale: string; t: Dict }) {
  const { council } = useSiteData();
  return (
    <ul className="grid grid-cols-2 gap-[clamp(0.5rem,1vw,0.875rem)] lg:grid-cols-4">
      {council.map((m, i) => {
        const description = localized(m.description, locale);
        return (
          <li key={m.id} data-reveal style={{ "--delay": `${(i % 4) * 70}ms` } as React.CSSProperties} className="tile tile-surface flex flex-col p-4 sm:p-6">
            <div className="tile mb-4 aspect-square">
              {m.portrait ? (
                <Photo src={m.portrait} alt={m.name} className="size-full object-cover" sizes="(min-width: 1024px) 25vw, 50vw" />
              ) : (
                <div aria-hidden className={`grid size-full place-items-center ${i % 2 ? "bg-green" : "bg-yellow"}`}>
                  <div className={`kite grid aspect-[3/4] w-3/5 place-items-center pb-[12%] font-heading text-[clamp(1.5rem,4vw,3rem)] font-semibold ${i % 2 ? "bg-yellow text-on-yellow" : "bg-green text-on-green"}`}>
                    {initials(m.name)}
                  </div>
                </div>
              )}
            </div>
            <h3 className="text-[clamp(1.25rem,1.9vw,1.75rem)] leading-tight">{m.name}</h3>
            <p className="mt-1 text-green-text">
              {localized(m.role, locale)}{m.age ? `, ${m.age} ${t.about.ageSuffix}` : ""}
            </p>
            {description ? <p className="mt-2 text-base">{description}</p> : null}
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

/* ---- Videos ---- */

export function VideoFacade({ youtubeId, title, watch, tone = "yellow", fill }: { youtubeId: string; title: string; watch: string; tone?: "yellow" | "green" | "surface"; fill?: boolean }) {
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
    <button type="button" onClick={() => setPlaying(true)} aria-label={`${watch}: ${title}`} className={`tile lift tile-${tone} group flex aspect-video w-full flex-col justify-between p-5 text-left sm:p-7 ${fill ? "lg:aspect-auto lg:h-full" : ""}`}>
      <span className={`grid size-14 place-items-center rounded-full transition-transform group-hover:scale-110 ${tone === "yellow" ? "bg-on-yellow text-white" : "bg-yellow text-on-yellow"}`}><Play className="size-6 fill-current" /></span>
      <span className="font-heading text-[clamp(1.5rem,2.6vw,2.5rem)] font-semibold leading-none tracking-[-0.03em]">{title}</span>
    </button>
  );
}

export function VideoGrid({ locale, t }: { locale: string; t: Dict }) {
  const { videos } = useSiteData();
  const tones = ["yellow", "green", "surface"] as const;
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

  const shown = albums
    .filter((a) => !slug || a.slug === slug)
    .map((a) => ({ ...a, items: photos.filter((p) => p.album_id === a.id).sort((x, y) => x.position - y.position) }))
    .filter((a) => a.items.length);

  useEffect(() => {
    if (open) dialog.current?.showModal();
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
                className={`tile group ${SPANS[i % SPANS.length]}`}
              >
                <Photo src={p.src} alt="" sizes="(min-width: 768px) 60vw, 100vw" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              </button>
            ))}
          </div>
        </section>
      ))}
      <dialog ref={dialog} onClose={() => setOpen(null)} aria-label={t.nav.galerie} onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }} className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/90">
        {current ? (
          <div className="flex h-svh w-screen flex-col items-center justify-center gap-3 p-3">
            <Photo src={current.src} alt={localized(current.alt, locale)} sizes="100vw" className="max-h-[80svh] w-auto max-w-full rounded-lg object-contain" />
            <p className="max-w-[60ch] text-center text-white">{localized(current.alt, locale)}</p>
            <div className="flex gap-2">
              <Button variant="secondary" className="h-11 rounded-full px-5 text-base" onClick={() => step(-1)} aria-label={t.gallery.prev}>←</Button>
              <Button variant="secondary" className="h-11 rounded-full px-5 text-base" onClick={() => setOpen(null)}>{t.gallery.close}</Button>
              <Button variant="secondary" className="h-11 rounded-full px-5 text-base" onClick={() => step(1)} aria-label={t.gallery.next}>→</Button>
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
    <div className="tile tile-yellow col-span-12 p-6 sm:p-10 lg:col-span-7">
      <p className="font-medium">{t.support.beneficiaryLabel}</p>
      <p className="mt-1 font-heading text-[clamp(1.75rem,3.4vw,3rem)] font-semibold leading-none tracking-[-0.03em]">{settings.donation_beneficiary}</p>
      {settings.iban ? (
        <div className="mt-8">
          <p className="font-medium">{t.support.ibanLabel}</p>
          <p className="mt-1 break-all font-heading text-[clamp(1.25rem,2.4vw,2rem)] font-semibold tabular-nums">{settings.iban}</p>
        </div>
      ) : (
        <div className="mt-8">
          <p className="max-w-[46ch]">{t.support.noIban}</p>
          <Button asChild className="mt-5 h-12 rounded-full bg-on-yellow px-6 text-base font-semibold text-white hover:bg-on-yellow/85">
            <Link href={href(locale, "contact")}>{t.support.contactCta}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
