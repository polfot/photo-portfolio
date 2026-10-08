// Browser-side data access for the /admin dashboard. Every call runs as the signed-in photographer.
import { PHOTOS_BUCKET, site } from "@/lib/site";
import { db, photoUrl, PROJECT_PHOTOS } from "@/lib/supabase";
import { resizeForWeb } from "./image";
import { slugify } from "./slug";

export type AdminProject = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  details: string | null;
  published: boolean;
  show_on_home: boolean;
  home_order: number;
  home_photo_left_id: string | null;
  home_photo_right_id: string | null;
};

export type AdminProjectRow = AdminProject & {
  photos: { id: string; storage_path: string; sort_order: number }[];
};

export type AdminPhoto = {
  id: string;
  project_id: string;
  storage_path: string;
  alt: string | null;
  is_visible: boolean;
  sort_order: number;
};

export type AdminSettings = {
  email: string | null;
  instagram: string | null;
  about_bio: string | null;
  portrait_path: string | null;
};

const PROJECT_FIELDS =
  "id, slug, title, description, details, published, show_on_home, home_order, home_photo_left_id, home_photo_right_id";
const PHOTO_FIELDS = "id, project_id, storage_path, alt, is_visible, sort_order";
const UNIQUE_VIOLATION = "23505";

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export { photoUrl };

// Auth ------------------------------------------------------------------------

export async function signIn(email: string, password: string) {
  const { error } = await db().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  await db().auth.signOut();
}

// Projects --------------------------------------------------------------------

export async function listProjects(): Promise<AdminProjectRow[]> {
  return unwrap(
    await db()
      .from("projects")
      .select(`${PROJECT_FIELDS}, ${PROJECT_PHOTOS}(id, storage_path, sort_order)`)
      .order("home_order")
      .order("sort_order", { referencedTable: "photos" })
      .returns<AdminProjectRow[]>(),
  );
}

export async function getProject(id: string): Promise<AdminProject> {
  return unwrap(await db().from("projects").select(PROJECT_FIELDS).eq("id", id).single<AdminProject>());
}

// New projects start unpublished, at the end of the list, with a unique slug.
export async function createProject(title: string, homeOrder: number): Promise<AdminProject> {
  const base = slugify(title) || "project";
  for (let attempt = 1; ; attempt++) {
    const slug = attempt === 1 ? base : `${base}-${attempt}`;
    const { data, error } = await db()
      .from("projects")
      .insert({ title, slug, home_order: homeOrder })
      .select(PROJECT_FIELDS)
      .single<AdminProject>();
    if (!error) return data;
    if (error.code !== UNIQUE_VIOLATION) throw new Error(error.message);
  }
}

export async function updateProject(id: string, changes: Partial<Omit<AdminProject, "id">>) {
  const { error } = await db().from("projects").update(changes).eq("id", id);
  if (error) throw new Error(error.code === UNIQUE_VIOLATION ? "This URL slug is already used by another project." : error.message);
}

export async function reorderProjects(ids: string[]) {
  await Promise.all(ids.map((id, index) => updateProject(id, { home_order: index })));
}

export async function deleteProject(id: string) {
  const photos = await listPhotos(id);
  await removeFiles(photos.map((photo) => photo.storage_path));
  unwrap(await db().from("projects").delete().eq("id", id));
}

// Photos ----------------------------------------------------------------------

export async function listPhotos(projectId: string): Promise<AdminPhoto[]> {
  return unwrap(
    await db()
      .from("photos")
      .select(PHOTO_FIELDS)
      .eq("project_id", projectId)
      .order("sort_order")
      .returns<AdminPhoto[]>(),
  );
}

// Uploads one file at a time so the caller can show progress; each photo is resized before upload.
// Files get descriptive names for image search, e.g. "<project-id>/wedding-santorini-03-1a2b3c4d.jpg";
// the short random part keeps names unique when photos are added later.
export async function uploadPhoto(project: AdminProject, file: File, sortOrder: number): Promise<AdminPhoto> {
  const number = String(sortOrder + 1).padStart(2, "0");
  const path = await uploadFile(`${project.id}/${project.slug}-${number}-${shortId()}.jpg`, file);
  return unwrap(
    await db()
      .from("photos")
      .insert({ project_id: project.id, storage_path: path, sort_order: sortOrder })
      .select(PHOTO_FIELDS)
      .single<AdminPhoto>(),
  );
}

export async function updatePhoto(id: string, changes: Partial<Pick<AdminPhoto, "alt" | "is_visible" | "sort_order">>) {
  unwrap(await db().from("photos").update(changes).eq("id", id));
}

export async function reorderPhotos(ids: string[]) {
  await Promise.all(ids.map((id, index) => updatePhoto(id, { sort_order: index })));
}

export async function deletePhoto(photo: AdminPhoto) {
  unwrap(await db().from("photos").delete().eq("id", photo.id));
  await removeFiles([photo.storage_path]);
}

// Site settings ---------------------------------------------------------------

export async function getSettings(): Promise<AdminSettings> {
  return unwrap(
    await db().from("site_settings").select("email, instagram, about_bio, portrait_path").eq("id", 1).single<AdminSettings>(),
  );
}

export async function updateSettings(changes: Partial<AdminSettings>) {
  unwrap(await db().from("site_settings").update(changes).eq("id", 1));
}

export async function uploadPortrait(file: File, previousPath: string | null): Promise<string> {
  const path = await uploadFile(`site/${slugify(site.name)}-portrait-${shortId()}.jpg`, file);
  await updateSettings({ portrait_path: path });
  if (previousPath) await removeFiles([previousPath]);
  return path;
}

// Storage helpers -------------------------------------------------------------

const shortId = () => crypto.randomUUID().slice(0, 8);

async function uploadFile(path: string, file: File): Promise<string> {
  const blob = await resizeForWeb(file);
  const { error } = await db().storage.from(PHOTOS_BUCKET).upload(path, blob, { contentType: blob.type });
  if (error) throw new Error(error.message);
  return path;
}

async function removeFiles(paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await db().storage.from(PHOTOS_BUCKET).remove(paths);
  if (error) throw new Error(error.message);
}
