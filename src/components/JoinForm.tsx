"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
const fieldClass = "h-13 rounded-lg bg-background px-4 text-lg md:text-lg";
const areaClass = "rounded-lg bg-background p-4 text-base md:text-base";

const EMPTY: JoinValues = { name: "", phone: "", age: "", voice: "", experience: "", instrument: "", message: "", parentalConsent: false, privacyConsent: false };

/** One question per screen. Each step lists the errors that must be clear before moving on. */
const STEPS: JoinErrorKey[][] = [["name"], ["phone"], ["age", "parentalConsent"], ["voice"], [], ["privacyConsent"]];

type Props = { locale: string; t: Dict["join"]; voices: Dict["home"]["voices"] };

const Hint = ({ id, children }: { id: string; children: string }) => <p id={id} className="mt-1.5 text-[0.9375rem] text-muted-foreground">{children}</p>;

const CONFETTI = Array.from({ length: 30 }, (_, i) => ({
  "--x": `${(i * 37) % 100}%`, "--d": `${(i % 7) * 0.11}s`, "--t": `${1.5 + (i % 5) * 0.28}s`, "--rot": `${240 + i * 43}deg`,
  "--c": ["var(--yellow)", "#f6f3e8", "#7fdcc0"][i % 3],
}) as React.CSSProperties);

function Form({ locale, t, voices, initialVoice }: Props & { initialVoice: string }) {
  const [v, setV] = useState<JoinValues>({ ...EMPTY, voice: initialVoice });
  const [step, setStep] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<JoinErrorKey[]>([]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const pane = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const set = <K extends keyof JoinValues>(key: K, value: JoinValues[K]) => setV((old) => ({ ...old, [key]: value }));
  const minor = needsParentalConsent(v.age);
  const last = step === STEPS.length - 1;

  // After a step change (not on first load) the new question takes focus, so keyboards and screen readers follow.
  useEffect(() => {
    if (!moved.current) return;
    pane.current?.querySelector<HTMLElement>("input:not([type=hidden]), textarea, button[role=checkbox]")?.focus({ preventScroll: true });
    pane.current?.scrollIntoView({ block: "nearest" });
  }, [step]);

  const go = (to: number) => { moved.current = true; setStep(to); };

  // The thank-you panel is shorter than the form, so bring it back into view.
  const thanks = useRef<HTMLDivElement>(null);
  useEffect(() => { if (done) thanks.current?.scrollIntoView({ block: "center" }); }, [done]);

  const err = (key: JoinErrorKey) =>
    errors.includes(key) ? <p id={`${key}-error`} className="mt-2 font-medium text-destructive">{t.errors[key]}</p> : null;
  const aria = (key: JoinErrorKey, hint?: string) => ({
    "aria-invalid": errors.includes(key) || undefined,
    "aria-describedby": [errors.includes(key) ? `${key}-error` : "", hint ?? ""].filter(Boolean).join(" ") || undefined,
  });

  function next() {
    const found = validateJoin(v).filter((k) => STEPS[step].includes(k));
    setErrors(found);
    if (found.length) { document.getElementById(found[0])?.focus(); return; }
    go(step + 1);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!last) { next(); return; }
    const found = validateJoin(v);
    setErrors(found);
    if (found.length) {
      toast.error(t.invalid);
      const first = STEPS.findIndex((keys) => keys.some((k) => found.includes(k)));
      if (first !== step) go(first);
      else document.getElementById(found[0])?.focus();
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
      setDone(true);
    } catch {
      toast.error(t.failure);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div ref={thanks} role="status" className="tile tile-green relative grid min-h-64 scroll-mt-28 content-center p-6 sm:p-10">
        <div className="confetti" aria-hidden>{CONFETTI.map((style, i) => <i key={i} style={style} />)}</div>
        <p className="title-section relative font-heading font-semibold">{t.success}</p>
      </div>
    );
  }

  const question = "title-card block font-heading font-semibold";

  return (
    <form onSubmit={submit} noValidate>
      {!FORM_ID ? (
        <p role="note" className="mb-6 rounded-lg border-2 border-green p-4 font-medium">
          {t.unconfigured.split(CONTACT.phoneDisplay)[0]}
          <a href={CONTACT.phoneHref} className="font-bold underline underline-offset-4">{CONTACT.phoneDisplay}</a>
          {t.unconfigured.split(CONTACT.phoneDisplay)[1]}
        </p>
      ) : null}

      {/* Honeypot, invisible to people and to assistive technology. */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" name="_gotcha" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
      </div>

      <p className="mb-2 text-[0.9375rem] font-semibold" aria-live="polite">{t.stepWord} {step + 1} {t.stepOf} {STEPS.length}</p>
      <div className="steps-bar" aria-hidden><i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>

      <div ref={pane} key={step} className="step-in mt-7 min-h-52 scroll-mt-28">
        {step === 0 ? (
          <div>
            <Label htmlFor="name" className={question}>{t.q.name}</Label>
            <Input id="name" autoComplete="name" enterKeyHint="next" className={`mt-4 ${fieldClass}`} value={v.name} onChange={(e) => set("name", e.target.value)} {...aria("name", "name-hint")} />
            <Hint id="name-hint">{t.name}</Hint>
            {err("name")}
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <Label htmlFor="phone" className={question}>{t.q.phone}</Label>
            <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" className={`mt-4 ${fieldClass}`} value={v.phone} onChange={(e) => set("phone", e.target.value)} {...aria("phone", "phone-hint")} />
            <Hint id="phone-hint">{t.phone}</Hint>
            {err("phone")}
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <Label htmlFor="age" className={question}>{t.q.age}</Label>
            <Input id="age" inputMode="numeric" enterKeyHint="next" className={`mt-4 max-w-40 ${fieldClass}`} value={v.age} onChange={(e) => set("age", e.target.value)} {...aria("age", "age-hint")} />
            <Hint id="age-hint">{t.age}</Hint>
            {err("age")}
            {minor ? (
              <div className="mt-6">
                <div className="flex items-start gap-3">
                  <Checkbox id="parentalConsent" className="mt-0.5 size-6 shrink-0" checked={v.parentalConsent} onCheckedChange={(c) => set("parentalConsent", c === true)} {...aria("parentalConsent")} />
                  <Label htmlFor="parentalConsent" className="block text-base font-normal leading-snug">{t.parental}</Label>
                </div>
                {err("parentalConsent")}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <fieldset className="min-w-0" {...aria("voice")}>
            <legend className={question}>{t.q.voice}</legend>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {VOICES.map((x, i) => (
                <label key={x} className="choice">
                  <input id={i === 0 ? "voice" : undefined} type="radio" name="voice" value={x} checked={v.voice === x} onChange={() => set("voice", x)} className="sr-only" />
                  {voices[x].name}
                </label>
              ))}
            </div>
            {v.voice ? <p className="mt-4 max-w-[46ch] text-[0.9375rem]" aria-live="polite">{voices[v.voice as keyof typeof voices]?.line}</p> : null}
            {err("voice")}
          </fieldset>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-6">
            <div>
              <Label htmlFor="experience" className={question}>{t.q.more}</Label>
              <Textarea id="experience" rows={3} className={`mt-4 ${areaClass}`} aria-describedby="experience-hint" value={v.experience} onChange={(e) => set("experience", e.target.value)} />
              <Hint id="experience-hint">{t.experienceHint}</Hint>
            </div>
            <div>
              <Label htmlFor="instrument" className="text-base font-semibold">{t.instrument} <span className="font-normal text-muted-foreground">({t.optional})</span></Label>
              <Input id="instrument" className={`mt-2 ${fieldClass}`} aria-describedby="instrument-hint" value={v.instrument} onChange={(e) => set("instrument", e.target.value)} />
              <Hint id="instrument-hint">{t.instrumentHint}</Hint>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="grid gap-6">
            <div>
              <Label htmlFor="message" className={question}>{t.q.last}</Label>
              <Textarea id="message" rows={3} className={`mt-4 ${areaClass}`} aria-describedby="message-hint" value={v.message} onChange={(e) => set("message", e.target.value)} />
              <Hint id="message-hint">{`${t.messageHint} (${t.optional})`}</Hint>
            </div>
            <div>
              <div className="flex items-start gap-3">
                <Checkbox id="privacyConsent" className="mt-0.5 size-6 shrink-0" checked={v.privacyConsent} onCheckedChange={(c) => set("privacyConsent", c === true)} {...aria("privacyConsent")} />
                <Label htmlFor="privacyConsent" className="block text-base font-normal leading-snug">
                  {t.privacyBefore}
                  <Link href={href(locale, "confidentialitate")} className="font-semibold underline underline-offset-4">{t.privacyLink}</Link>
                  {t.privacyAfter}
                </Label>
              </div>
              {err("privacyConsent")}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-2">
        {step > 0 ? (
          <button type="button" onClick={() => { setErrors([]); go(step - 1); }} className="btn btn-line"><ArrowLeft className="size-4 shrink-0" aria-hidden /> {t.back}</button>
        ) : <span />}
        {last ? (
          <button type="submit" disabled={sending} className="btn btn-primary go">{sending ? t.sending : t.submit} <ArrowRight className="arrow size-4" aria-hidden /></button>
        ) : (
          <button type="submit" className="btn btn-green go">{t.next} <ArrowRight className="arrow size-4" aria-hidden /></button>
        )}
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
