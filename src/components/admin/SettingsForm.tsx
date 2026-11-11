"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { seed } from "@/data/seed";
import type { Settings } from "@/data/types";
import { getSupabase } from "@/lib/supabase";
import { isValidIban } from "@/lib/iban";
import { fieldArea, fieldInput, fieldLabel, ImageInput, LTextInput } from "./Crud";

const toursToText = (t: Settings["tours"]) => t.map((x) => (x.year ? `${x.name}, ${x.year}` : x.name)).join("\n");

function textToTours(text: string): Settings["tours"] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = l.match(/^(.*?)(?:,\s*(\d{4}))?$/)!;
    return { name: m[1].trim(), year: m[2] ? Number(m[2]) : null };
  });
}

const Hint = ({ children }: { children: string }) => <p className="mt-1.5 text-[0.9375rem] text-muted-foreground">{children}</p>;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="tile tile-paper grid min-w-0 gap-5 p-4 sm:p-6">
      <legend className="eyebrow float-left mb-1 w-full"><span className="romb" aria-hidden />{title}</legend>
      {children}
    </fieldset>
  );
}

export function SettingsForm() {
  const [s, setS] = useState<Settings>(seed.settings);
  const [tours, setTours] = useState(toursToText(seed.settings.tours));
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSupabase().from("settings").select("key,value").then(({ data, error }) => {
      if (error) { toast.error("Setările nu au putut fi încărcate."); return; }
      const merged = { ...seed.settings } as Record<string, unknown>;
      for (const row of data ?? []) merged[row.key] = row.value;
      setS(merged as Settings);
      setTours(toursToText((merged as Settings).tours));
      setLoaded(true);
    });
  }, []);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setS((old) => ({ ...old, [key]: value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const iban = s.iban.replace(/\s/g, "").toUpperCase();
    if (iban && !isValidIban(iban)) return void toast.error("IBAN-ul nu este valid. Verifică-l.");
    if (s.founding_date && !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(s.founding_date)) return void toast.error("Data fondării: AAAA, AAAA-LL sau AAAA-LL-ZZ.");
    const next: Settings = { ...s, iban, tours: textToTours(tours), years_active: Number(s.years_active) || 0 };
    const rows = Object.entries(next).map(([key, value]) => ({ key, value }));
    setSaving(true);
    const { error } = await getSupabase().from("settings").upsert(rows);
    setSaving(false);
    if (error) return void toast.error(`Nu s-a salvat: ${error.message}`);
    setS(next);
    toast.success("Salvat.");
  }

  if (!loaded) return <p className="py-4 text-muted-foreground">Se încarcă...</p>;

  return (
    <form onSubmit={save} className="grid gap-3">
      <Group title="Donații">
        <div>
          <Label htmlFor="beneficiary" className={fieldLabel}>Beneficiarul donațiilor</Label>
          <Input id="beneficiary" className={fieldInput} value={s.donation_beneficiary} onChange={(e) => set("donation_beneficiary", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="iban" className={fieldLabel}>IBAN</Label>
          <Input id="iban" className={fieldInput} autoCapitalize="characters" value={s.iban} onChange={(e) => set("iban", e.target.value)} />
          <Hint>Cât timp e gol, pagina „Susține” arată butonul „Contactează-ne”.</Hint>
        </div>
      </Group>

      <Group title="Cifrele de pe prima pagină">
        <div>
          <Label htmlFor="founding" className={fieldLabel}>Data fondării</Label>
          <Input id="founding" className={fieldInput} placeholder="de exemplu 2020-10" value={s.founding_date} onChange={(e) => set("founding_date", e.target.value)} />
          <Hint>AAAA, AAAA-LL sau AAAA-LL-ZZ. Din ea se calculează singuri „anii împreună”.</Hint>
        </div>
        <div>
          <Label htmlFor="years" className={fieldLabel}>Ani împreună</Label>
          <Input id="years" type="number" inputMode="numeric" className={`${fieldInput} max-w-32`} value={s.years_active} onChange={(e) => set("years_active", Number(e.target.value))} />
          <Hint>Se folosește doar cât timp data fondării lipsește.</Hint>
        </div>
        <div>
          <Label htmlFor="tours" className={fieldLabel}>Turnee</Label>
          <Textarea id="tours" rows={4} className={fieldArea} value={tours} onChange={(e) => setTours(e.target.value)} />
          <Hint>Câte unul pe rând, de forma „Nume, an”. Numărul lor apare pe prima pagină.</Hint>
        </div>
      </Group>

      <Group title="Dirijorul">
        <div>
          <Label htmlFor="conductor" className={fieldLabel}>Numele dirijorului</Label>
          <Input id="conductor" className={fieldInput} value={s.conductor_name} onChange={(e) => set("conductor_name", e.target.value)} />
        </div>
        <LTextInput id="bio" label="Biografia dirijorului" multiline value={s.conductor_bio} onChange={(v) => set("conductor_bio", v)} />
        <ImageInput id="conductor-photo" label="Fotografia dirijorului" folder="dirijor" value={s.conductor_photo} onChange={(url) => set("conductor_photo", url ?? seed.settings.conductor_photo)} />
      </Group>

      <div className="sticky bottom-[calc(var(--tabbar)+0.75rem)] z-10 w-fit">
        <button type="submit" disabled={saving} className="btn btn-primary shadow-[0_0_0_2px_var(--on-yellow)]">{saving ? "Se salvează..." : "Salvează setările"}</button>
      </div>
    </form>
  );
}
