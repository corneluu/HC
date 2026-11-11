"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/i18n";
import { href } from "@/i18n";

const VOICES = ["sopran", "alto", "tenor", "bas", "nustiu"] as const;

export function VoicePicker({ locale, t }: { locale: string; t: Dict["home"] }) {
  const [voice, setVoice] = useState<(typeof VOICES)[number]>("sopran");
  const selected = t.voices[voice];
  return (
    <fieldset>
      <legend className="font-heading text-2xl font-medium">{t.joinPick}</legend>
      <div className="mt-4 flex flex-wrap gap-2">
        {VOICES.map((v) => (
          <label key={v} className="cursor-pointer rounded-full bg-white px-4 py-2.5 font-medium text-on-yellow transition-colors has-[:checked]:bg-on-yellow has-[:checked]:text-white has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-on-yellow">
            <input type="radio" name="voce" value={v} checked={voice === v} onChange={() => setVoice(v)} className="sr-only" />
            {t.voices[v].name}
          </label>
        ))}
      </div>
      <p aria-live="polite" className="mt-5 min-h-[3.2em] max-w-[44ch]">{selected.line}</p>
      <Button asChild className="mt-4 h-12 rounded-full bg-on-yellow px-6 text-base font-semibold text-white hover:bg-on-yellow/85">
        <Link href={`${href(locale, "alatura-te")}?voice=${voice}`}>{t.joinButton}: {selected.name}</Link>
      </Button>
    </fieldset>
  );
}
