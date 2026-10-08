import { site } from "./site";
import { db, photoUrl, PROJECT_PHOTOS } from "./supabase";
import type { HomeSlide, Photo, PortfolioItem, Project } from "./types";

// Read live in the browser on every visit, so dashboard changes show up without a rebuild.

type PhotoRow = { id: string; storage_path: string; alt: string | null };

type HomeRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  left: PhotoRow | null;
  right: PhotoRow | null;
};

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  details: string | null;
  photos: PhotoRow[];
};

const PHOTO_FIELDS = "id, storage_path, alt";

export async function getHomeSlides(): Promise<HomeSlide[]> {
  const { data, error } = await db()
    .from("projects")
    .select(
      `id, slug, title, description,
       left:photos!projects_home_photo_left_id_fkey(${PHOTO_FIELDS}),
       right:photos!projects_home_photo_right_id_fkey(${PHOTO_FIELDS})`,
    )
    .eq("show_on_home", true)
    .order("home_order")
    .returns<HomeRow[]>();

  if (error) throw new Error(`Failed to load home slides: ${error.message}`);

  return data.flatMap(({ left, right, description, ...project }) => {
    if (!left || !right) return [];
    return [
      {
        ...project,
        description: description ?? "",
        leftPhoto: toPhoto(left, project.title),
        rightPhoto: toPhoto(right, project.title),
      },
    ];
  });
}

// Portfolio index: every project with its first few photos.
export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const count = site.portfolioStripPhotos;

  const { data, error } = await db()
    .from("projects")
    .select(`slug, title, description, ${PROJECT_PHOTOS}(${PHOTO_FIELDS})`)
    .order("home_order")
    .order("sort_order", { referencedTable: "photos" })
    .limit(count, { referencedTable: "photos" })
    .returns<Omit<ProjectRow, "id" | "details">[]>();

  if (error) throw new Error(`Failed to load portfolio: ${error.message}`);

  return data.flatMap(({ photos, description, ...project }) =>
    photos.length > 0
      ? [{ ...project, description: description ?? "", photos: photos.map((row) => toPhoto(row, project.title)) }]
      : [],
  );
}

// Every project slug, in home page order, so "next project" follows the same sequence.
export async function getProjectSlugs(): Promise<string[]> {
  const { data, error } = await db().from("projects").select("slug").order("home_order");
  if (error) throw new Error(`Failed to load projects: ${error.message}`);
  return data.map((project) => project.slug);
}

export async function getProject(slug: string): Promise<Project | null> {
  const { data, error } = await db()
    .from("projects")
    .select(`id, slug, title, description, details, ${PROJECT_PHOTOS}(${PHOTO_FIELDS})`)
    .eq("slug", slug)
    .order("sort_order", { referencedTable: "photos" })
    .maybeSingle<ProjectRow>();

  if (error) throw new Error(`Failed to load project "${slug}": ${error.message}`);
  if (!data) return null;

  return {
    ...data,
    description: data.description ?? "",
    details: data.details ?? "",
    // Photos without a description get a distinct fallback alt per position, not the same title repeated.
    photos: data.photos.map((row, index) => toPhoto(row, `${data.title}, photo ${index + 1}`)),
  };
}

function toPhoto(row: PhotoRow, fallbackAlt: string): Photo {
  return { id: row.id, url: photoUrl(row.storage_path), alt: row.alt || fallbackAlt };
}
