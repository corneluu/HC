"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Photo } from "@/components/Photo";
import { getSupabase } from "@/lib/supabase";
import { removeImage, uploadImage } from "@/lib/upload";
import type { LText } from "@/lib/localized";

export type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "ltext" | "ltextarea" | "date" | "time" | "number" | "select" | "image";
  required?: boolean;
  pattern?: RegExp;
  options?: [string, string][];
};

export type Row = Record<string, unknown> & { id: string; position: number };

const OTHER_LANGS = [["en", "Engleză"], ["it", "Italiană"], ["de", "Germană"]] as const;

export const fieldLabel = "text-base font-semibold";
export const fieldInput = "mt-1.5 h-12 rounded-lg bg-background px-3.5 text-base md:text-base";
export const fieldArea = "mt-1.5 rounded-lg bg-background p-3.5 text-base md:text-base";
export const fieldSelect = "mt-1.5 h-12 w-full rounded-lg border border-input bg-background px-3 text-base";
export const fileInput = "mt-2 block w-full min-w-0 text-base file:mr-3 file:h-11 file:cursor-pointer file:rounded-lg file:border-0 file:bg-green file:px-4 file:font-semibold file:text-on-green";
const iconButton = "grid size-11 shrink-0 place-items-center rounded-lg hover:bg-muted disabled:opacity-35";

/** Romanian is what the site needs. The other three languages stay folded away until someone wants them. */
export function LTextInput({ id, label, value, onChange, multiline }: { id: string; label: string; value: LText; onChange: (v: LText) => void; multiline?: boolean }) {
  const field = (code: string) => {
    const props = { id: `${id}-${code}`, value: value?.[code as keyof LText] ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [code]: e.target.value }) };
    return multiline ? <Textarea {...props} rows={3} className={fieldArea} /> : <Input {...props} className={fieldInput} />;
  };
  const translated = OTHER_LANGS.filter(([code]) => value?.[code]?.trim()).length;
  return (
    <div>
      <Label htmlFor={`${id}-ro`} className={fieldLabel}>{label}</Label>
      {field("ro")}
      <details className="mt-2 rounded-lg border border-border">
        <summary className="flex min-h-11 cursor-pointer items-center px-3.5 text-[0.9375rem] font-medium">Traduceri: {translated} din 3 completate</summary>
        <div className="grid gap-3 px-3.5 pb-3.5">
          <p className="text-[0.9375rem] text-muted-foreground">Unde lipsește o traducere, site-ul arată textul în română.</p>
          {OTHER_LANGS.map(([code, name]) => (
            <div key={code}>
              <Label htmlFor={`${id}-${code}`} className="text-[0.9375rem] font-medium">{name}</Label>
              {field(code)}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export function ImageInput({ id, label, value, folder, onChange }: { id: string; label: string; value: string | null; folder: string; onChange: (url: string | null, size?: { width: number; height: number }) => void }) {
  const [busy, setBusy] = useState(false);
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const { url, width, height } = await uploadImage(file, folder);
      onChange(url, { width, height });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Încărcarea a eșuat.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <Label htmlFor={id} className={fieldLabel}>{label}</Label>
      {value ? <div className="mt-2 w-32 overflow-hidden rounded-lg"><Photo src={value} alt="" sizes="128px" /></div> : null}
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={pick} disabled={busy} className={fileInput} />
      <p className="mt-1.5 text-[0.9375rem] text-muted-foreground" aria-live="polite">{busy ? "Se încarcă..." : "JPG, PNG, WebP sau AVIF, maximum 12 MB. Metadatele, inclusiv locația, se șterg automat."}</p>
      {value ? <button type="button" className="mt-1 min-h-11 font-semibold underline underline-offset-4" onClick={() => onChange(null)}>Elimină imaginea</button> : null}
    </div>
  );
}

function clean(fields: Field[], draft: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = draft[f.key];
    if (f.type === "number") out[f.key] = v === "" || v == null ? null : Number(v);
    else if (f.type === "date" || f.type === "time" || f.type === "image") out[f.key] = v || null;
    else out[f.key] = v;
  }
  return out;
}

function problem(fields: Field[], draft: Record<string, unknown>): string | null {
  for (const f of fields) {
    const v = draft[f.key];
    const text = f.type.startsWith("ltext") ? (v as LText)?.ro : v;
    if (f.required && !String(text ?? "").trim()) return `Completează „${f.label}”${f.type.startsWith("ltext") ? " (în română)" : ""}.`;
    if (f.pattern && text && !f.pattern.test(String(text))) return `„${f.label}” nu are formatul corect.`;
  }
  return null;
}

type Props = {
  table: string;
  fields: Field[];
  heading: (row: Row) => string;
  /** Second line under the heading, for example a date. */
  detail?: (row: Row) => string;
  /** Short status chip; `warn` paints it yellow so it asks for attention. */
  badge?: (row: Row) => { text: string; warn?: boolean } | null;
  thumb?: (row: Row) => string | null;
  addLabel?: string;
  defaults?: Record<string, unknown>;
  folder?: string;
  where?: Record<string, string>;
  refreshKey?: number;
  /** Called after a row is added, changed or removed. */
  onChanged?: () => void;
};

export function Crud({ table, fields, heading, detail, badge, thumb, addLabel = "Adaugă", defaults = {}, folder = "diverse", where, refreshKey = 0, onChanged }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const whereKey = JSON.stringify(where ?? {});

  const load = useCallback(async () => {
    let q = getSupabase().from(table).select("*").order("position");
    for (const [k, v] of Object.entries(JSON.parse(whereKey) as Record<string, string>)) q = q.eq(k, v);
    const { data, error } = await q;
    if (error) toast.error("Datele nu au putut fi încărcate.");
    else setRows(data as Row[]);
  }, [table, whereKey]);

  useEffect(() => {
    let live = true;
    Promise.resolve().then(() => { if (live) void load(); });
    return () => { live = false; };
  }, [load, refreshKey]);

  // On a phone the form can open far from where the finger is: bring it into view.
  useEffect(() => { if (editing) formRef.current?.scrollIntoView({ block: "nearest" }); }, [editing]);

  const list = rows ?? [];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const bad = problem(fields, draft);
    if (bad) return toast.error(bad);
    setSaving(true);
    const db = getSupabase();
    const payload = clean(fields, draft);
    const { error } = editing === "new"
      ? await db.from(table).insert({ ...payload, ...where, position: list.reduce((m, r) => Math.max(m, r.position), -1) + 1 })
      : await db.from(table).update(payload).eq("id", editing as string);
    setSaving(false);
    if (error) return toast.error(`Nu s-a salvat: ${error.message}`);
    toast.success("Salvat.");
    setEditing(null);
    void load();
    onChanged?.();
  }

  async function remove(row: Row) {
    if (!window.confirm(`Ștergi definitiv „${heading(row)}”?`)) return;
    const { error } = await getSupabase().from(table).delete().eq("id", row.id);
    if (error) return toast.error(`Nu s-a șters: ${error.message}`);
    await Promise.all(fields.filter((f) => f.type === "image").map((f) => removeImage(row[f.key])));
    toast.success("Șters.");
    void load();
    onChanged?.();
  }

  async function move(index: number, by: number) {
    const a = list[index];
    const b = list[index + by];
    if (!a || !b) return;
    const db = getSupabase();
    const [one, two] = await Promise.all([
      db.from(table).update({ position: b.position }).eq("id", a.id),
      db.from(table).update({ position: a.position }).eq("id", b.id),
    ]);
    if (one.error || two.error) toast.error("Ordinea nu s-a schimbat.");
    void load();
  }

  const open = (row: Row | null) => {
    setDraft(row ? { ...row } : { ...defaults });
    setEditing(row ? row.id : "new");
  };

  const form = (
    <form ref={formRef} onSubmit={save} className="tile tile-paper grid scroll-mt-24 gap-5 border-2 border-green p-4 sm:p-6">
      <h3 className="title-card">{editing === "new" ? addLabel : "Editează"}</h3>
      {fields.map((f) => {
        const id = `${table}-${f.key}`;
        const value = draft[f.key];
        const set = (v: unknown) => setDraft((d) => ({ ...d, [f.key]: v }));
        if (f.type === "ltext" || f.type === "ltextarea") return <LTextInput key={f.key} id={id} label={f.label} value={(value as LText) ?? { ro: "" }} multiline={f.type === "ltextarea"} onChange={set} />;
        if (f.type === "image") return <ImageInput key={f.key} id={id} label={f.label} folder={folder} value={(value as string) ?? null} onChange={(url) => set(url)} />;
        return (
          <div key={f.key}>
            <Label htmlFor={id} className={fieldLabel}>{f.label}</Label>
            {f.type === "select" ? (
              <select id={id} value={String(value ?? "")} onChange={(e) => set(e.target.value)} className={fieldSelect}>
                {f.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ) : f.type === "textarea" ? (
              <Textarea id={id} rows={4} className={fieldArea} value={String(value ?? "")} onChange={(e) => set(e.target.value)} />
            ) : (
              <Input id={id} type={f.type === "number" ? "number" : f.type} inputMode={f.type === "number" ? "numeric" : undefined} className={fieldInput} value={String(value ?? "")} onChange={(e) => set(e.target.value)} />
            )}
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className="btn btn-primary">{saving ? "Se salvează..." : "Salvează"}</button>
        <button type="button" className="btn btn-line" onClick={() => setEditing(null)}>Renunță</button>
      </div>
    </form>
  );

  return (
    <div className="grid gap-2.5">
      {editing === "new" ? form : <button type="button" onClick={() => open(null)} className="btn btn-primary w-fit"><Plus className="size-4 shrink-0" aria-hidden /> {addLabel}</button>}
      {rows === null ? <p className="py-4 text-muted-foreground">Se încarcă...</p> : null}
      {rows?.length === 0 && editing !== "new" ? <p className="tile tile-paper p-4">Încă nu e nimic aici. Apasă „{addLabel}”.</p> : null}
      <ul className="grid gap-2">
        {list.map((row, i) => {
          if (editing === row.id) return <li key={row.id}>{form}</li>;
          const chip = badge?.(row);
          const image = thumb?.(row);
          const second = detail?.(row);
          return (
            <li key={row.id} className="tile tile-paper flex flex-wrap items-center gap-x-3 gap-y-1 p-2.5 pl-3.5">
              {image ? <span className="size-14 shrink-0 overflow-hidden rounded-md"><Photo src={image} alt="" sizes="56px" className="size-full object-cover" /></span> : null}
              <span className="min-w-36 flex-1">
                <span className="block break-words font-heading text-[1.0625rem] font-semibold leading-snug">{heading(row) || "Fără titlu"}</span>
                {second || chip ? (
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.9375rem] text-muted-foreground">
                    {second}
                    {chip ? <span className={`rounded-md px-2 py-0.5 text-sm font-semibold ${chip.warn ? "bg-yellow text-on-yellow" : "bg-muted text-foreground"}`}>{chip.text}</span> : null}
                  </span>
                ) : null}
              </span>
              <span className="ml-auto flex">
                <button type="button" className={iconButton} aria-label={`Mută mai sus: ${heading(row)}`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-5" /></button>
                <button type="button" className={iconButton} aria-label={`Mută mai jos: ${heading(row)}`} disabled={i === list.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-5" /></button>
                <button type="button" className={iconButton} aria-label={`Editează: ${heading(row)}`} onClick={() => open(row)}><Pencil className="size-5" /></button>
                <button type="button" className={`${iconButton} text-destructive`} aria-label={`Șterge: ${heading(row)}`} onClick={() => remove(row)}><Trash2 className="size-5" /></button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
