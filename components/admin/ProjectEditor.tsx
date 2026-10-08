"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  deleteProject,
  getProject,
  listPhotos,
  updateProject,
  type AdminPhoto,
  type AdminProject,
} from "@/lib/admin/api";
import { slugify } from "@/lib/admin/slug";
import { projectHref } from "@/lib/site";
import { PhotoManager } from "./PhotoManager";
import styles from "./admin.module.css";

type Fields = Pick<AdminProject, "title" | "slug" | "description" | "details">;

// Edit page for one project, addressed as /admin/project/?id=… (static export cannot pre-build per-id pages).
const DETAILS_FORM = "project-details";

export function ProjectEditor() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [fields, setFields] = useState<Fields | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getProject(id), listPhotos(id)]).then(([loaded, loadedPhotos]) => {
      setProject(loaded);
      setFields({ title: loaded.title, slug: loaded.slug, description: loaded.description, details: loaded.details });
      setPhotos(loadedPhotos);
    }, (err: Error) => setError(err.message));
  }, [id]);

  if (!id) return <p className={styles.error}>No project selected.</p>;
  if (error && !project) return <p className={styles.error}>{error}</p>;
  if (!project || !fields) return <p className={styles.muted}>Loading…</p>;

  const set = (key: keyof Fields) => (value: string) => {
    setFields({ ...fields, [key]: value });
    setStatus(null);
  };

  // Changes made outside the form (toggles, home photos) are saved straight away.
  async function saveProject(changes: Partial<AdminProject>) {
    setError(null);
    try {
      await updateProject(project!.id, changes);
      setProject({ ...project!, ...changes });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const changes = { ...fields!, slug: slugify(fields!.slug) || slugify(fields!.title) };
    setFields(changes);
    setStatus("Saving…");
    await saveProject(changes);
    setStatus("Saved");
  }

  async function onDelete() {
    if (!window.confirm(`Delete "${project!.title}" and all its photos? This cannot be undone.`)) return;
    try {
      await deleteProject(project!.id);
      router.push("/admin/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    }
  }

  const homeReady = Boolean(project.home_photo_left_id && project.home_photo_right_id);

  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>
          <Link href="/admin/" className={styles.muted}>
            Projects
          </Link>{" "}
          / {project.title}
        </h1>
        <div className={styles.actions}>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={project.published}
              onChange={() => saveProject({ published: !project.published })}
            />
            Published
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={project.show_on_home}
              onChange={() => saveProject({ show_on_home: !project.show_on_home })}
            />
            On home
          </label>
        </div>
      </div>
      {project.show_on_home && !homeReady && (
        <p className={styles.hint}>
          To appear on the home page, choose a &ldquo;Home left&rdquo; and a &ldquo;Home right&rdquo; photo below.
        </p>
      )}
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Details</h2>
        <form id={DETAILS_FORM} className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Title</span>
            <input className={styles.input} value={fields.title} onChange={(e) => set("title")(e.target.value)} required />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>URL slug — the site address becomes {projectHref(fields.slug || "…")}</span>
            <input className={styles.input} value={fields.slug} onChange={(e) => set("slug")(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Description — shown on the home page, project page and portfolio</span>
            <textarea
              className={styles.textarea}
              value={fields.description ?? ""}
              onChange={(e) => set("description")(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Category — e.g. &ldquo;Wedding, Photography&rdquo;</span>
            <input className={styles.input} value={fields.details ?? ""} onChange={(e) => set("details")(e.target.value)} />
          </label>
        </form>
      </section>

      <PhotoManager project={project} photos={photos} setPhotos={setPhotos} saveProject={saveProject} onError={setError} />

      {/* Save sits below everything; it submits the details form above through the form attribute. */}
      <div className={styles.actions}>
        <button type="submit" form={DETAILS_FORM} className={styles.buttonPrimary}>
          Save details
        </button>
        {status && <span className={styles.muted}>{status}</span>}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Danger zone</h2>
        <div className={styles.actions}>
          <button type="button" className={styles.buttonDanger} onClick={onDelete}>
            Delete project
          </button>
        </div>
      </section>
    </>
  );
}
