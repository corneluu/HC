"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const LANGS = [["ro", "Română"], ["en", "Engleză"], ["it", "Italiană"], ["de", "Germană"]] as const;

export function LTextInput({ id, label, value, onChange, multiline }: { id: string; label: string; value: LText; onChange: (v: LText) => void; multiline?: boolean }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-base font-semibold">{label}</legend>
      {LANGS.map(([code, name]) => {
        const props = { id: `${id}-${code}`, value: value?.[code] ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [code]: e.target.value }) };
        return (
          <div key={code}>
            <Label htmlFor={props.id} className="text-sm">{name}{code !== "ro" ? " (dacă lipsește, se folosește româna)" : ""}</Label>
            {multiline ? <Textarea {...props} rows={3} className="mt-1 text-base" /> : <Input {...props} className="mt-1 h-11 text-base" />}
          </div>
        );
      })}
    </fieldset>
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
      <Label htmlFor={id} className="text-base font-semibold">{label}</Label>
      {value ? <div className="mt-2 w-32 overflow-hidden rounded-lg"><Photo src={value} alt="" sizes="128px" /></div> : null}
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={pick} disabled={busy} className="mt-2 block w-full text-base file:mr-3 file:h-11 file:rounded-full file:border-0 file:bg-muted file:px-4" />
      <p className="mt-1 text-sm">JPG, PNG, WebP sau AVIF, maximum 12 MB. Metadatele (inclusiv locația) se șterg automat.{busy ? " Se încarcă..." : ""}</p>
      {value ? <Button type="button" variant="ghost" className="mt-1 h-10" onClick={() => onChange(null)}>Elimină imaginea</Button> : null}
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
  defaults?: Record<string, unknown>;
  folder?: string;
  where?: Record<string, string>;
  refreshKey?: number;
};

export function Crud({ table, fields, heading, defaults = {}, folder = "diverse", where, refreshKey = 0 }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const bad = problem(fields, draft);
    if (bad) return toast.error(bad);
    const db = getSupabase();
    const payload = clean(fields, draft);
    const { error } = editing === "new"
      ? await db.from(table).insert({ ...payload, ...where, position: rows.reduce((m, r) => Math.max(m, r.position), -1) + 1 })
      : await db.from(table).update(payload).eq("id", editing as string);
    if (error) return toast.error(`Nu s-a salvat: ${error.message}`);
    toast.success("Salvat.");
    setEditing(null);
    void load();
  }

  async function remove(row: Row) {
    if (!window.confirm(`Ștergi definitiv „${heading(row)}”?`)) return;
    const { error } = await getSupabase().from(table).delete().eq("id", row.id);
    if (error) return toast.error(`Nu s-a șters: ${error.message}`);
    await Promise.all(fields.filter((f) => f.type === "image").map((f) => removeImage(row[f.key])));
    toast.success("Șters.");
    void load();
  }

  async function move(index: number, by: number) {
    const a = rows[index];
    const b = rows[index + by];
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
    <form onSubmit={save} className="tile grid gap-4 bg-background p-4 sm:p-6">
      {fields.map((f) => {
        const id = `${table}-${f.key}`;
        const value = draft[f.key];
        const set = (v: unknown) => setDraft((d) => ({ ...d, [f.key]: v }));
        if (f.type === "ltext" || f.type === "ltextarea") return <LTextInput key={f.key} id={id} label={f.label} value={(value as LText) ?? { ro: "" }} multiline={f.type === "ltextarea"} onChange={set} />;
        if (f.type === "image") return <ImageInput key={f.key} id={id} label={f.label} folder={folder} value={(value as string) ?? null} onChange={(url) => set(url)} />;
        return (
          <div key={f.key}>
            <Label htmlFor={id} className="text-base font-semibold">{f.label}</Label>
            {f.type === "select" ? (
              <select id={id} value={String(value ?? "")} onChange={(e) => set(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-base">
                {f.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ) : f.type === "textarea" ? (
              <Textarea id={id} rows={4} className="mt-1 text-base" value={String(value ?? "")} onChange={(e) => set(e.target.value)} />
            ) : (
              <Input id={id} type={f.type === "number" ? "number" : f.type} className="mt-1 h-11 text-base" value={String(value ?? "")} onChange={(e) => set(e.target.value)} />
            )}
          </div>
        );
      })}
      <div className="flex gap-2">
        <Button type="submit" className="h-11 rounded-full px-5 text-base font-semibold">Salvează</Button>
        <Button type="button" variant="outline" className="h-11 rounded-full px-5 text-base" onClick={() => setEditing(null)}>Renunță</Button>
      </div>
    </form>
  );

  return (
    <div className="grid gap-2">
      {editing === "new" ? form : <Button onClick={() => open(null)} className="h-11 w-fit rounded-full px-5 text-base font-semibold"><Plus className="size-4" /> Adaugă</Button>}
      <ul className="grid gap-2">
        {rows.map((row, i) => editing === row.id ? <li key={row.id}>{form}</li> : (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background p-3">
            <span className="min-w-40 flex-1 break-words font-medium">{heading(row)}</span>
            <span className="flex gap-1">
              <Button variant="ghost" className="size-11" aria-label="Mută mai sus" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-5" /></Button>
              <Button variant="ghost" className="size-11" aria-label="Mută mai jos" disabled={i === rows.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-5" /></Button>
              <Button variant="ghost" className="size-11" aria-label="Editează" onClick={() => open(row)}><Pencil className="size-5" /></Button>
              <Button variant="ghost" className="size-11 text-destructive" aria-label="Șterge" onClick={() => remove(row)}><Trash2 className="size-5" /></Button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
