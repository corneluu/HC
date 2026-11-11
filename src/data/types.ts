import type { LText } from "../lib/localized.ts";
import type { EventLike } from "../lib/events.ts";

export type ChoirEvent = EventLike & {
  id: string;
  title: LText;
  place: LText;
  note: LText;
  poster: string | null;
  position: number;
};

export type CouncilMember = {
  id: string;
  name: string;
  role: LText;
  age: number | null;
  description: LText;
  portrait: string | null;
  position: number;
};

export type Video = { id: string; youtube_id: string; title: LText; position: number };

export type Album = { id: string; slug: string; title: LText; description: LText; position: number };

export type Photo = {
  id: string;
  album_id: string;
  src: string; // a key of photos.generated.json, or an https URL from storage
  alt: LText;
  width: number | null;
  height: number | null;
  position: number;
};

export type Settings = {
  founding_date: string; // YYYY-MM-DD or YYYY-MM; empty until the owner supplies it
  years_active: number; // used while founding_date is empty
  iban: string;
  donation_beneficiary: string;
  tours: { name: string; year: number | null }[];
  conductor_name: string;
  conductor_bio: LText;
  conductor_photo: string;
};

export type SiteData = {
  events: ChoirEvent[];
  council: CouncilMember[];
  videos: Video[];
  albums: Album[];
  photos: Photo[];
  settings: Settings;
};
