import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Browser client with the anon key only; write access is enforced by RLS. */
export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) throw new Error("Supabase is not configured");
  client ??= createClient(url, anonKey);
  return client;
}

export const IMAGE_BUCKET = "images";
