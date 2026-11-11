"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { Crud, type Field } from "./Crud";
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

const TABS = ["Evenimente", "Consiliu", "Videoclipuri", "Galerie", "Setări"] as const;
type Tab = (typeof TABS)[number];

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
    <form onSubmit={submit} className="tile grid max-w-md gap-4 bg-background p-6">
      <h1 className="text-4xl">Administrare</h1>
      <div>
        <Label htmlFor="email" className="text-base">Email</Label>
        <Input id="email" type="email" autoComplete="username" required className="mt-1.5 h-12 text-base" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="password" className="text-base">Parolă</Label>
        <Input id="password" type="password" autoComplete="current-password" required className="mt-1.5 h-12 text-base" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" disabled={busy} className="h-12 rounded-full text-base font-semibold">{busy ? "Se verifică..." : "Intră"}</Button>
    </form>
  );
}

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("Evenimente");

  useEffect(() => {
    if (!supabaseConfigured) return;
    const db = getSupabase();
    db.auth.getSession().then(({ data }) => setSession(data.session));
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
      <main className="frame py-10">
        <div className="tile max-w-xl bg-background p-6">
          <h1 className="text-4xl">Administrare</h1>
          <p className="mt-4">Supabase nu este configurat încă. Urmează pașii din README și setează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>
        </div>
      </main>
    );
  }

  if (!session) return <main className="frame py-10"><Login onError={(m) => toast.error(m)} /></main>;

  if (allowed === false) {
    return (
      <main className="frame py-10">
        <div className="tile max-w-xl bg-background p-6">
          <h1 className="text-4xl">Fără acces</h1>
          <p className="mt-4">Contul tău nu este în lista administratorilor.</p>
          <Button onClick={logout} className="mt-5 h-11 rounded-full px-5 text-base">Ieși din cont</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="frame py-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Administrare</h1>
        <div className="flex items-center gap-3">
          <span className="hidden text-base sm:inline">{session.user.email}</span>
          <Button variant="outline" onClick={logout} className="h-11 rounded-full px-5 text-base">Ieși din cont</Button>
        </div>
      </header>
      <nav className="mt-4 flex gap-1 overflow-x-auto pb-1" aria-label="Secțiuni">
        {TABS.map((t) => (
          <button key={t} type="button" aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)} className={`h-11 shrink-0 rounded-full px-4 font-medium ${tab === t ? "bg-primary text-primary-foreground" : "bg-background"}`}>{t}</button>
        ))}
      </nav>
      <div className="mt-5">
        {allowed === null ? <p>Se încarcă...</p> : null}
        {allowed && tab === "Evenimente" ? (
          <>
            <p className="mb-3 text-base">Doar concerte și festivaluri. Site-ul le ordonează după dată; săgețile contează doar între evenimentele din aceeași zi.</p>
            <Crud table="events" folder="afise" fields={EVENT_FIELDS} heading={(r) => `${r.date} · ${(r.title as { ro: string })?.ro ?? ""}`} defaults={{ kind: "concert", status: "announced", title: { ro: "" }, place: { ro: "" }, note: { ro: "" } }} />
          </>
        ) : null}
        {allowed && tab === "Consiliu" ? <Crud table="council_members" folder="portrete" fields={COUNCIL_FIELDS} heading={(r) => String(r.name)} defaults={{ role: { ro: "" }, description: { ro: "" } }} /> : null}
        {allowed && tab === "Videoclipuri" ? <Crud table="videos" fields={VIDEO_FIELDS} heading={(r) => (r.title as { ro: string })?.ro ?? ""} defaults={{ title: { ro: "" } }} /> : null}
        {allowed && tab === "Galerie" ? (
          <>
            <h2 className="mb-3 text-2xl">Albume</h2>
            <Crud table="gallery_albums" fields={ALBUM_FIELDS} heading={(r) => (r.title as { ro: string })?.ro ?? ""} defaults={{ title: { ro: "" }, description: { ro: "" } }} />
            <PhotosManager />
          </>
        ) : null}
        {allowed && tab === "Setări" ? <SettingsForm /> : null}
      </div>
    </main>
  );
}
