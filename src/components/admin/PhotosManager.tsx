"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { Crud, fieldLabel, fieldSelect, fileInput, type Field, type Row } from "./Crud";

const FIELDS: Field[] = [
  { key: "alt", label: "Descrierea fotografiei (pentru cei care nu o pot vedea)", type: "ltext", required: true },
  { key: "src", label: "Fișier", type: "image", required: true },
];

export function PhotosManager({ refreshKey = 0 }: { refreshKey?: number }) {
  const [albums, setAlbums] = useState<Row[]>([]);
  const [albumId, setAlbumId] = useState("");
  const [progress, setProgress] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    getSupabase().from("gallery_albums").select("*").order("position").then(({ data }) => {
      const list = (data ?? []) as Row[];
      setAlbums(list);
      setAlbumId((current) => (list.some((a) => a.id === current) ? current : list[0]?.id || ""));
    });
  }, [refreshKey]);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length || !albumId) return;
    const db = getSupabase();
    const { data: last } = await db.from("gallery_photos").select("position").eq("album_id", albumId).order("position", { ascending: false }).limit(1);
    let position = (last?.[0]?.position ?? -1) + 1;
    const title = (albums.find((a) => a.id === albumId)?.title as { ro: string })?.ro ?? "Fotografie";
    let failed = 0;
    for (const [i, file] of files.entries()) {
      setProgress(`Se încarcă ${i + 1} din ${files.length}...`);
      try {
        const { url, width, height } = await uploadImage(file, `galerie/${albumId}`);
        const { error } = await db.from("gallery_photos").insert({ album_id: albumId, src: url, alt: { ro: title }, width, height, position: position++ });
        if (error) throw error;
      } catch (err) {
        failed += 1;
        toast.error(`${file.name}: ${err instanceof Error ? err.message : "nu s-a încărcat"}`);
      }
    }
    setProgress(null);
    setRefresh((r) => r + 1);
    if (failed < files.length) toast.success(`${files.length - failed} din ${files.length} fotografii încărcate.`);
  }

  if (!albums.length) return <p className="tile tile-paper p-4">Creează mai întâi un album, apoi poți adăuga fotografii în el.</p>;

  return (
    <>
      <div className="tile tile-paper grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
        <div className="min-w-0">
          <Label htmlFor="album" className={fieldLabel}>Albumul în care lucrezi</Label>
          <select id="album" value={albumId} onChange={(e) => setAlbumId(e.target.value)} className={fieldSelect}>
            {albums.map((a) => <option key={a.id} value={a.id}>{(a.title as { ro: string })?.ro}</option>)}
          </select>
        </div>
        <div className="min-w-0">
          <Label htmlFor="photos" className={fieldLabel}>Adaugă mai multe fotografii deodată</Label>
          <input id="photos" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" disabled={Boolean(progress) || !albumId} onChange={upload} className={fileInput} />
          <p className="mt-1.5 text-[0.9375rem] text-muted-foreground" aria-live="polite">{progress ?? "Fiecare primește ca descriere numele albumului. O poți schimba apoi cu creionul."}</p>
        </div>
      </div>
      <div className="mt-3">
        <Crud key={albumId} table="gallery_photos" folder={`galerie/${albumId}`} fields={FIELDS} where={{ album_id: albumId }} refreshKey={refresh} addLabel="Adaugă o fotografie" heading={(r) => (r.alt as { ro: string })?.ro ?? ""} thumb={(r) => (r.src as string) || null} defaults={{ alt: { ro: "" } }} />
      </div>
    </>
  );
}
