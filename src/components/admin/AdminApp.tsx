"use client";
/* eslint-disable @next/next/no-img-element -- pre-sized WebP logo in a static export */

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { CalendarDays, ExternalLink, Images, LogOut, Play, Settings, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { todayInTimisoara } from "@/lib/events";
import { asset, formatDate } from "@/lib/site";
import { Crud, fieldInput, fieldLabel, type Field, type Row } from "./Crud";
import { PhotosManager } from "./PhotosManager";
import { SettingsForm } from "./SettingsForm";

const EVENT_FIELDS: Field[] = [
  { key: "title", label: "Titlu", type: "ltext", required: true },
  { key: "date", label: "Data", type: "date", required: true },
  { key: "end_date", label: "Data de final (opțional)", type: "date" },
  { key: "time", label: "Ora (opțional)", type: "time" },
  { key: "kind", label: "Tip", type: "select", options: [["concert", "Concert"], ["festival", "Festival"]], required: true },
  { key: "status", label: "Stare", type: "select", options: [["announced", "Doar anunțat"], ["confirmed", "Confirmat (a avut loc)"]], required: true },
  { key: "place", label: "Loc", type: "ltext", required: true },
  { key: "note", label: "Detalii", type: "ltextarea" },
  { key: "poster", label: "Afiș (opțional)", type: "image" },
];

const COUNCIL_FIELDS: Field[] = [
  { key: "name", label: "Nume", type: "text", required: true },
  { key: "role", label: "Rol / voce", type: "ltext" },
  { key: "age", label: "Vârstă (opțional)", type: "number" },
  { key: "description", label: "Descriere scurtă (opțional)", type: "ltextarea" },
  { key: "portrait", label: "Portret (opțional)", type: "image" },
];

const VIDEO_FIELDS: Field[] = [
  { key: "youtube_id", label: "ID YouTube (cele 11 caractere din link)", type: "text", required: true, pattern: /^[A-Za-z0-9_-]{11}$/ },
  { key: "title", label: "Titlu", type: "ltext", required: true },
];

const ALBUM_FIELDS: Field[] = [
  { key: "slug", label: "Identificator (ex. italia-2026)", type: "text", required: true, pattern: /^[a-z0-9-]+$/ },
  { key: "title", label: "Titlu", type: "ltext", required: true },
  { key: "description", label: "Descriere", type: "ltext" },
];

const TABS = [
  { id: "events", label: "Evenimente", Icon: CalendarDays, help: "Doar concerte și festivaluri. Site-ul le ordonează după dată; săgețile contează doar între evenimentele din aceeași zi." },
  { id: "council", label: "Consiliu", Icon: Users, help: "Cei care apar pe pagina Despre, în ordinea de aici. Fără portret, site-ul arată inițialele." },
  { id: "videos", label: "Video", Icon: Play, help: "Videoclipurile de pe pagina Muzică. Primul din listă apare cel mai mare." },
  { id: "gallery", label: "Galerie", Icon: Images, help: "Întâi albumele, apoi fotografiile din fiecare." },
  { id: "settings", label: "Setări", Icon: Settings, help: "Donații, cifrele de pe prima pagină și datele dirijorului." },
] as const;
type Tab = (typeof TABS)[number]["id"];

const ro = (v: unknown) => (v as { ro?: string })?.ro ?? "";

/** A concert only counts on the home page once it is confirmed, so past ones still marked "announced" stand out. */
function eventBadge(row: Row) {
  if (row.status === "confirmed") return { text: "Confirmat" };
  const last = String(row.end_date || row.date);
  return last < todayInTimisoara() ? { text: "A trecut: de confirmat", warn: true } : { text: "Anunțat" };
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="frame grid min-h-svh content-center py-10">
      <div className="tile tile-paper pad mx-auto w-full max-w-md">
        <span className="tile-logo mb-5 size-14 rounded-lg"><img src={asset("/brand/kite-96.webp")} alt="" width={68} height={96} className="h-10 w-auto" /></span>
        {children}
      </div>
    </main>
  );
}

function Login({ onError }: { onError: (m: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await getSupabase().auth.signInWithPassword({ email, password }).catch(() => ({ error: new Error("network") }));
    setBusy(false);
    if (error) onError("Autentificare eșuată. Verifică adresa și parola.");
  }
  return (
    <Shell>
      <form onSubmit={submit} className="grid gap-4">
        <h1 className="title-section">Administrare</h1>
        <p className="text-muted-foreground">Doar pentru consiliul corului.</p>
        <div>
          <Label htmlFor="email" className={fieldLabel}>Email</Label>
          <Input id="email" type="email" autoComplete="username" required className={fieldInput} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password" className={fieldLabel}>Parolă</Label>
          <Input id="password" type="password" autoComplete="current-password" required className={fieldInput} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary">{busy ? "Se verifică..." : "Intră"}</button>
      </form>
    </Shell>
  );
}

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(!supabaseConfigured);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("events");
  const [albumsVersion, setAlbumsVersion] = useState(0);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const db = getSupabase();
    db.auth.getSession().then(({ data }) => { setSession(data.session); setChecked(true); });
    const { data } = db.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let live = true;
    // Only hides the screens: the database refuses writes from anyone not listed in admins.
    getSupabase().from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle()
      .then(({ data }) => { if (live) setAllowed(Boolean(data)); });
    return () => { live = false; };
  }, [session]);

  const logout = useCallback(async () => {
    await getSupabase().auth.signOut();
    setAllowed(null);
  }, []);

  if (!supabaseConfigured) {
    return (
      <Shell>
        <h1 className="title-section">Administrare</h1>
        <p className="mt-4">Panoul nu este conectat încă la baza de date. Urmează pașii din README: creează proiectul Supabase, apoi setează adresa lui și cheia publică.</p>
      </Shell>
    );
  }

  if (!checked) return <Shell><p>Se încarcă...</p></Shell>;
  if (!session) return <Login onError={(m) => toast.error(m)} />;

  if (allowed === false) {
    return (
      <Shell>
        <h1 className="title-section">Fără acces</h1>
        <p className="mt-4">Contul {session.user.email} nu este în lista administratorilor.</p>
        <button type="button" onClick={logout} className="btn btn-line mt-5">Ieși din cont</button>
      </Shell>
    );
  }

  const current = TABS.find((t) => t.id === tab)!;
  const pick = (id: Tab) => { setTab(id); scrollTo(0, 0); };

  return (
    <>
      <header className="site-header" data-scrolled="true">
        <div className="frame flex items-center justify-between gap-2 py-2.5">
          <span className="flex min-w-0 items-center gap-2.5 font-heading text-lg font-semibold leading-none">
            <span className="tile-logo size-11 shrink-0 rounded-lg"><img src={asset("/brand/kite-96.webp")} alt="" width={68} height={96} className="h-8 w-auto" /></span>
            <span className="truncate">Administrare</span>
          </span>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Secțiuni">
            {TABS.map(({ id, label }) => (
              <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => pick(id)} className="rounded-lg px-3 py-2 font-medium hover:bg-muted aria-[current=page]:bg-green aria-[current=page]:text-on-green">{label}</button>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            <span className="mr-2 hidden max-w-56 truncate text-[0.9375rem] text-muted-foreground xl:inline">{session.user.email}</span>
            <a href={asset("/ro/")} target="_blank" rel="noopener noreferrer" aria-label="Deschide site-ul" title="Deschide site-ul" className="grid size-11 place-items-center rounded-lg hover:bg-muted"><ExternalLink className="size-5" /></a>
            <button type="button" onClick={logout} aria-label="Ieși din cont" title="Ieși din cont" className="grid size-11 place-items-center rounded-lg hover:bg-muted"><LogOut className="size-5" /></button>
          </div>
        </div>
      </header>

      <main className="frame max-w-4xl pb-10 pt-6">
        <h1 className="title-section">{current.label === "Video" ? "Videoclipuri" : current.label}</h1>
        <p className="mb-5 mt-2 max-w-[60ch] text-muted-foreground">{current.help}</p>
        {allowed === null ? <p className="py-4 text-muted-foreground">Se încarcă...</p> : null}
        {allowed && tab === "events" ? (
          <Crud
            table="events" folder="afise" fields={EVENT_FIELDS} addLabel="Adaugă un eveniment" badge={eventBadge}
            heading={(r) => ro(r.title)}
            detail={(r) => (r.date ? formatDate(String(r.date), "ro", { day: "numeric", month: "long", year: "numeric" }) : "")}
            defaults={{ kind: "concert", status: "announced", title: { ro: "" }, place: { ro: "" }, note: { ro: "" } }}
          />
        ) : null}
        {allowed && tab === "council" ? <Crud table="council_members" folder="portrete" fields={COUNCIL_FIELDS} addLabel="Adaugă un membru" heading={(r) => String(r.name ?? "")} detail={(r) => ro(r.role)} thumb={(r) => (r.portrait as string) || null} defaults={{ role: { ro: "" }, description: { ro: "" } }} /> : null}
        {allowed && tab === "videos" ? <Crud table="videos" fields={VIDEO_FIELDS} addLabel="Adaugă un videoclip" heading={(r) => ro(r.title)} detail={(r) => `youtu.be/${String(r.youtube_id ?? "")}`} defaults={{ title: { ro: "" } }} /> : null}
        {allowed && tab === "gallery" ? (
          <>
            <h2 className="eyebrow mb-3"><span className="romb" aria-hidden />Albume</h2>
            <Crud table="gallery_albums" fields={ALBUM_FIELDS} addLabel="Adaugă un album" heading={(r) => ro(r.title)} detail={(r) => ro(r.description)} defaults={{ title: { ro: "" }, description: { ro: "" } }} onChanged={() => setAlbumsVersion((v) => v + 1)} />
            <h2 className="eyebrow mb-3 mt-10"><span className="romb" aria-hidden />Fotografii</h2>
            <PhotosManager refreshKey={albumsVersion} />
          </>
        ) : null}
        {allowed && tab === "settings" ? <SettingsForm /> : null}
      </main>

      <nav className="tabbar" aria-label="Secțiuni">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => pick(id)} className="tab">
            <Icon className="size-[1.375rem]" aria-hidden />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
