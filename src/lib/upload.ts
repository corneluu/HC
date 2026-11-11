import { getSupabase, IMAGE_BUCKET } from "@/lib/supabase";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 12 * 1024 * 1024;
const MAX_WIDTH = 1920;

export function checkImage(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return "Sunt acceptate doar imagini JPG, PNG, WebP sau AVIF.";
  if (file.size > MAX_BYTES) return "Imaginea este prea mare (maximum 12 MB).";
  return null;
}

/** Re-encoding through a canvas resizes the image and drops all metadata, GPS included. */
async function reencode(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) throw new Error("Imaginea nu a putut fi procesată.");
  return { blob, width, height };
}

export async function uploadImage(file: File, folder: string) {
  const problem = checkImage(file);
  if (problem) throw new Error(problem);
  const { blob, width, height } = await reencode(file);
  const db = getSupabase();
  const path = `${folder}/${crypto.randomUUID()}.webp`;
  const { error } = await db.storage.from(IMAGE_BUCKET).upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw error;
  return { url: db.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl, width, height };
}

/** Best effort: a leftover file is harmless, so failures are ignored. */
export async function removeImage(url: unknown) {
  if (typeof url !== "string") return;
  const marker = `/object/public/${IMAGE_BUCKET}/`;
  const at = url.indexOf(marker);
  if (at < 0) return;
  await getSupabase().storage.from(IMAGE_BUCKET).remove([url.slice(at + marker.length)]);
}
