"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { Crud, type Field, type Row } from "./Crud";

const FIELDS: Field[] = [
  { key: "alt", label: "Descrierea fotografiei (pentru cei care nu o pot vedea)", type: "ltext", required: true },
  { key: "src", label: "Fișier", type: "image", required: true },
];

export function PhotosManager() {
  const [albums, setAlbums] = useState<Row[]>([]);
  const [albumId, setAlbumId] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    getSupabase().from("gallery_albums").select("*").order("position").then(({ data }) => {
      const list = (data ?? []) as Row[];
      setAlbums(list);
      setAlbumId((current) => current || list[0]?.id || "");
    });
  }, []);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length || !albumId) return;
    setBusy(true);
    const db = getSupabase();
    const { data: last } = await db.from("gallery_photos").select("position").eq("album_id", albumId).order("position", { ascending: false }).limit(1);
    let position = (last?.[0]?.position ?? -1) + 1;
    const title = (albums.find((a) => a.id === albumId)?.title as { ro: string })?.ro ?? "Fotografie";
    for (const file of files) {
      try {
        const { url, width, height } = await uploadImage(file, `galerie/${albumId}`);
        const { error } = await db.from("gallery_photos").insert({ album_id: albumId, src: url, alt: { ro: title }, width, height, position: position++ });
        if (error) throw error;
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : "nu s-a încărcat"}`);
      }
    }
    setBusy(false);
    setRefresh((r) => r + 1);
    toast.success("Încărcare terminată.");
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-2xl">Fotografii</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="album" className="text-base font-semibold">Album</Label>
          <select id="album" value={albumId} onChange={(e) => setAlbumId(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-base">
            {albums.map((a) => <option key={a.id} value={a.id}>{(a.title as { ro: string })?.ro}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="photos" className="text-base font-semibold">Adaugă fotografii</Label>
          <input id="photos" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy || !albumId} onChange={upload} className="mt-1 block w-full text-base file:mr-3 file:h-11 file:rounded-full file:border-0 file:bg-muted file:px-4" />
          {busy ? <p className="mt-1">Se încarcă...</p> : null}
        </div>
      </div>
      <div className="mt-3">
        {albumId ? <Crud key={albumId} table="gallery_photos" folder={`galerie/${albumId}`} fields={FIELDS} where={{ album_id: albumId }} refreshKey={refresh} heading={(r) => (r.alt as { ro: string })?.ro ?? ""} defaults={{ alt: { ro: "" } }} /> : <p>Creează mai întâi un album.</p>}
      </div>
    </section>
  );
}
