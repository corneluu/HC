import type { Settings, SiteData } from "@/data/types";
import { getSupabase } from "@/lib/supabase";

/** Fresh content from Supabase. Empty tables keep the seed, so an unseeded project cannot blank the site. */
export async function fetchLiveData(seed: SiteData): Promise<SiteData> {
  const db = getSupabase();
  const list = (table: string) => db.from(table).select("*").order("position");
  const [events, council, videos, albums, photos, settings] = await Promise.all([
    list("events"), list("council_members"), list("videos"), list("gallery_albums"), list("gallery_photos"),
    db.from("settings").select("key,value"),
  ]);

  const pick = <T,>(res: { data: unknown; error: unknown }, fallback: T[]): T[] =>
    !res.error && Array.isArray(res.data) && res.data.length ? (res.data as T[]) : fallback;

  const merged = { ...seed.settings } as Record<string, unknown>;
  if (!settings.error) for (const row of settings.data ?? []) merged[row.key] = row.value;

  return {
    events: pick(events, seed.events),
    council: pick(council, seed.council),
    videos: pick(videos, seed.videos),
    albums: pick(albums, seed.albums),
    photos: pick(photos, seed.photos),
    settings: merged as Settings,
  };
}
