import { site } from "./site";
import { db, photoUrl } from "./supabase";
import type { Photo } from "./types";

export type SiteSettings = {
  email: string;
  instagram: string;
  bio: string;
  portrait: Omit<Photo, "id"> | null;
};

const PORTRAIT_ALT = "Portrait of the photographer";

// Only real web addresses become links, so a mistyped or malicious value (e.g. "javascript:…") never runs.
const isWebLink = (value: string | null): value is string => /^https:\/\/\S+$/i.test(value ?? "");

// Read live in the browser. Empty fields in the dashboard fall back to the defaults in lib/site.ts.
export async function getSiteSettings(): Promise<SiteSettings> {
  const fallback: SiteSettings = {
    email: site.email,
    instagram: site.instagram,
    bio: site.about.bio,
    portrait: null,
  };

  const { data, error } = await db()
    .from("site_settings")
    .select("email, instagram, about_bio, portrait_path")
    .maybeSingle();
  if (error) throw new Error(`Failed to load site settings: ${error.message}`);
  if (!data) return fallback;

  return {
    email: data.email || fallback.email,
    instagram: isWebLink(data.instagram) ? data.instagram : fallback.instagram,
    bio: data.about_bio || fallback.bio,
    portrait: data.portrait_path ? { url: photoUrl(data.portrait_path), alt: PORTRAIT_ALT } : fallback.portrait,
  };
}
