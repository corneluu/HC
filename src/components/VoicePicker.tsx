"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Dict } from "@/i18n";
import { href } from "@/i18n";

const VOICES = ["sopran", "alto", "tenor", "bas", "nustiu"] as const;

/** Sits on a green tile: the chosen voice turns yellow, like every other thing worth tapping. */
export function VoicePicker({ locale, t }: { locale: string; t: Dict["home"] }) {
  const [voice, setVoice] = useState<(typeof VOICES)[number]>("sopran");
  const selected = t.voices[voice];
  return (
    <fieldset className="min-w-0">
      <legend className="title-card font-heading font-medium">{t.joinPick}</legend>
      <div className="mt-4 flex flex-wrap gap-2">
        {VOICES.map((v) => (
          <label key={v} className="cursor-pointer rounded-lg border-2 border-on-green/45 px-3.5 py-2.5 font-semibold leading-tight transition-colors has-[:checked]:border-yellow has-[:checked]:bg-yellow has-[:checked]:text-on-yellow has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-yellow">
            <input type="radio" name="voce" value={v} checked={voice === v} onChange={() => setVoice(v)} className="sr-only" />
            {t.voices[v].name}
          </label>
        ))}
      </div>
      <p aria-live="polite" className="mt-5 min-h-[4.7em] max-w-[44ch]">{selected.line}</p>
      <Link href={`${href(locale, "alatura-te")}?voice=${voice}`} className="btn btn-primary go mt-3">
        {t.joinButton}: {selected.name} <ArrowRight className="arrow size-4" aria-hidden />
      </Link>
    </fieldset>
  );
}
