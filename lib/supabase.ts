import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PHOTOS_BUCKET } from "./site";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// One browser client: the public pages read anonymously,
// the /admin dashboard signs in and keeps its session in the browser.
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: typeof window !== "undefined" } })
    : null;

// The site has no content of its own: without Supabase, loading fails with this clear message.
export function db(): SupabaseClient {
  if (!supabase) throw new Error("Supabase is not configured: set the keys in .env.local.");
  return supabase;
}

// projects ↔ photos has three foreign keys (project_id, home left, home right),
// so "all photos of a project" must name the one it means.
export const PROJECT_PHOTOS = "photos!photos_project_id_fkey";

export function photoUrl(storagePath: string): string {
  return db().storage.from(PHOTOS_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}
