"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Dict } from "@/i18n";
import { href } from "@/i18n";
import { needsParentalConsent, validateJoin, type JoinErrorKey, type JoinValues } from "@/lib/join";
import { CONTACT } from "@/data/music";

const FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;
const VOICES = ["sopran", "alto", "tenor", "bas", "nustiu"] as const;
const fieldClass = "h-12 rounded-xl bg-background px-4 text-base md:text-base";

const EMPTY: JoinValues = { name: "", phone: "", age: "", voice: "", experience: "", instrument: "", message: "", parentalConsent: false, privacyConsent: false };

type Props = { locale: string; t: Dict["join"]; voices: Dict["home"]["voices"] };

const Hint = ({ id, children }: { id: string; children: string }) => <p id={id} className="mt-1 text-base text-muted-foreground">{children}</p>;

function Form({ locale, t, voices, initialVoice }: Props & { initialVoice: string }) {
  const [v, setV] = useState<JoinValues>({ ...EMPTY, voice: initialVoice });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<JoinErrorKey[]>([]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof JoinValues>(key: K, value: JoinValues[K]) => setV((old) => ({ ...old, [key]: value }));
  const minor = needsParentalConsent(v.age);

  const err = (key: JoinErrorKey) =>
    errors.includes(key) ? <p id={`${key}-error`} className="mt-1.5 text-base font-medium text-destructive">{t.errors[key]}</p> : null;
  const aria = (key: JoinErrorKey, hint?: string) => ({
    "aria-invalid": errors.includes(key) || undefined,
    "aria-describedby": [errors.includes(key) ? `${key}-error` : "", hint ?? ""].filter(Boolean).join(" ") || undefined,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateJoin(v);
    setErrors(found);
    if (found.length) {
      toast.error(t.invalid);
      document.getElementById(found[0])?.focus();
      return;
    }
    if (honeypot) { setDone(true); return; } // a bot filled the hidden field: pretend success, send nothing
    if (!FORM_ID) { toast.error(t.unconfigured); return; }

    setSending(true);
    try {
      const res = await fetch(`https://formspree.io/f/${encodeURIComponent(FORM_ID)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nume: v.name, telefon: v.phone, varsta: v.age, voce: voices[v.voice as keyof typeof voices]?.name ?? v.voice,
          experienta: v.experience, instrument: v.instrument, mesaj: v.message,
          acord_parental: minor ? "da" : "nu este cazul", acord_confidentialitate: "da",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast.success(t.success);
      setDone(true);
    } catch {
      toast.error(t.failure);
    } finally {
      setSending(false);
    }
  }

  if (done) return <p role="status" className="tile tile-yellow p-8 font-heading text-3xl font-medium leading-tight">{t.success}</p>;

  const labelClass = "text-base font-semibold";

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
      {!FORM_ID ? (
        <p role="note" className="tile tile-yellow p-5 font-medium sm:col-span-2">
          {t.unconfigured.split(CONTACT.phoneDisplay)[0]}
          <a href={CONTACT.phoneHref} className="font-bold underline underline-offset-4">{CONTACT.phoneDisplay}</a>
          {t.unconfigured.split(CONTACT.phoneDisplay)[1]}
        </p>
      ) : null}

      {/* Honeypot, invisible to people and to assistive technology. */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" name="_gotcha" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="name" className={labelClass}>{t.name}</Label>
        <Input id="name" autoComplete="name" className={`mt-1.5 ${fieldClass}`} value={v.name} onChange={(e) => set("name", e.target.value)} {...aria("name")} />
        {err("name")}
      </div>
      <div>
        <Label htmlFor="phone" className={labelClass}>{t.phone}</Label>
        <Input id="phone" type="tel" autoComplete="tel" className={`mt-1.5 ${fieldClass}`} value={v.phone} onChange={(e) => set("phone", e.target.value)} {...aria("phone")} />
        {err("phone")}
      </div>
      <div>
        <Label htmlFor="age" className={labelClass}>{t.age}</Label>
        <Input id="age" inputMode="numeric" className={`mt-1.5 ${fieldClass}`} value={v.age} onChange={(e) => set("age", e.target.value)} {...aria("age")} />
        {err("age")}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="voice" className={labelClass}>{t.voice}</Label>
        <select id="voice" className={`mt-1.5 w-full rounded-xl border border-input bg-background px-4 text-base ${fieldClass.replace("md:text-base", "")}`} value={v.voice} onChange={(e) => set("voice", e.target.value)} {...aria("voice")}>
          <option value="">{t.voiceChoose}</option>
          {VOICES.map((x) => <option key={x} value={x}>{voices[x].name}</option>)}
        </select>
        {err("voice")}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="experience" className={labelClass}>{t.experience}</Label>
        <Textarea id="experience" rows={3} className="mt-1.5 rounded-xl bg-background p-4 text-base md:text-base" aria-describedby="experience-hint" value={v.experience} onChange={(e) => set("experience", e.target.value)} />
        <Hint id="experience-hint">{t.experienceHint}</Hint>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="instrument" className={labelClass}>{t.instrument}</Label>
        <Input id="instrument" className={`mt-1.5 ${fieldClass}`} aria-describedby="instrument-hint" value={v.instrument} onChange={(e) => set("instrument", e.target.value)} />
        <Hint id="instrument-hint">{t.instrumentHint}</Hint>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="message" className={labelClass}>{t.message}</Label>
        <Textarea id="message" rows={3} className="mt-1.5 rounded-xl bg-background p-4 text-base md:text-base" aria-describedby="message-hint" value={v.message} onChange={(e) => set("message", e.target.value)} />
        <Hint id="message-hint">{t.messageHint}</Hint>
      </div>

      {minor ? (
        <div className="sm:col-span-2">
          <div className="flex items-start gap-3">
            <Checkbox id="parentalConsent" className="mt-0.5 size-6" checked={v.parentalConsent} onCheckedChange={(c) => set("parentalConsent", c === true)} {...aria("parentalConsent")} />
            <Label htmlFor="parentalConsent" className="block text-base font-normal leading-snug">{t.parental}</Label>
          </div>
          {err("parentalConsent")}
        </div>
      ) : null}

      <div className="sm:col-span-2">
        <div className="flex items-start gap-3">
          <Checkbox id="privacyConsent" className="mt-0.5 size-6" checked={v.privacyConsent} onCheckedChange={(c) => set("privacyConsent", c === true)} {...aria("privacyConsent")} />
          <Label htmlFor="privacyConsent" className="block text-base font-normal leading-snug">
            {t.privacyBefore}
            <Link href={href(locale, "confidentialitate")} className="font-semibold underline underline-offset-4">{t.privacyLink}</Link>
            {t.privacyAfter}
          </Label>
        </div>
        {err("privacyConsent")}
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={sending} className="h-13 rounded-full px-8 text-lg font-semibold">
          {sending ? t.sending : t.submit}
        </Button>
      </div>
    </form>
  );
}

function WithVoiceParam(props: Props) {
  const voice = useSearchParams().get("voice") ?? "";
  return <Form {...props} key={voice} initialVoice={(VOICES as readonly string[]).includes(voice) ? voice : ""} />;
}

export function JoinForm(props: Props) {
  return (
    <Suspense fallback={<Form {...props} initialVoice="" />}>
      <WithVoiceParam {...props} />
    </Suspense>
  );
}
