"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { seed } from "@/data/seed";
import type { Settings } from "@/data/types";
import { getSupabase } from "@/lib/supabase";
import { isValidIban } from "@/lib/iban";
import { ImageInput, LTextInput } from "./Crud";

const toursToText = (t: Settings["tours"]) => t.map((x) => (x.year ? `${x.name}, ${x.year}` : x.name)).join("\n");

function textToTours(text: string): Settings["tours"] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = l.match(/^(.*?)(?:,\s*(\d{4}))?$/)!;
    return { name: m[1].trim(), year: m[2] ? Number(m[2]) : null };
  });
}

export function SettingsForm() {
  const [s, setS] = useState<Settings>(seed.settings);
  const [tours, setTours] = useState(toursToText(seed.settings.tours));
  const [loaded, setLoaded] = useState(false);

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
    const { error } = await getSupabase().from("settings").upsert(rows);
    if (error) return void toast.error(`Nu s-a salvat: ${error.message}`);
    setS(next);
    toast.success("Salvat.");
  }

  if (!loaded) return <p>Se încarcă...</p>;

  const input = "mt-1 h-11 text-base";
  const label = "text-base font-semibold";
  return (
    <form onSubmit={save} className="tile grid gap-5 bg-background p-4 sm:p-6">
      <div>
        <Label htmlFor="beneficiary" className={label}>Beneficiarul donațiilor</Label>
        <Input id="beneficiary" className={input} value={s.donation_beneficiary} onChange={(e) => set("donation_beneficiary", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="iban" className={label}>IBAN (gol = se afișează butonul „Contactează-ne”)</Label>
        <Input id="iban" className={input} value={s.iban} onChange={(e) => set("iban", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="founding" className={label}>Data fondării (AAAA, AAAA-LL sau AAAA-LL-ZZ, opțional)</Label>
        <Input id="founding" className={input} value={s.founding_date} onChange={(e) => set("founding_date", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="years" className={label}>Ani împreună (folosit cât timp data fondării lipsește)</Label>
        <Input id="years" type="number" className={input} value={s.years_active} onChange={(e) => set("years_active", Number(e.target.value))} />
      </div>
      <div>
        <Label htmlFor="tours" className={label}>Turnee (câte unul pe rând: Nume, an)</Label>
        <Textarea id="tours" rows={4} className="mt-1 text-base" value={tours} onChange={(e) => setTours(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="conductor" className={label}>Numele dirijorului</Label>
        <Input id="conductor" className={input} value={s.conductor_name} onChange={(e) => set("conductor_name", e.target.value)} />
      </div>
      <LTextInput id="bio" label="Biografia dirijorului" multiline value={s.conductor_bio} onChange={(v) => set("conductor_bio", v)} />
      <ImageInput id="conductor-photo" label="Fotografia dirijorului" folder="dirijor" value={s.conductor_photo} onChange={(url) => set("conductor_photo", url ?? seed.settings.conductor_photo)} />
      <Button type="submit" className="h-11 w-fit rounded-full px-5 text-base font-semibold">Salvează</Button>
    </form>
  );
}
