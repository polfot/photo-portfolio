"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createProject,
  listProjects,
  photoUrl,
  reorderProjects,
  updateProject,
  type AdminProjectRow,
} from "@/lib/admin/api";
import { useReorder } from "@/lib/admin/useReorder";
import { projectHref } from "@/lib/site";
import styles from "./admin.module.css";

const editorHref = (id: string) => `/admin/project/?id=${id}`;

// All projects in site order. Dragging a row changes the order on the home page, portfolio and "next project".
export function ProjectList() {
  const router = useRouter();
  const [projects, setProjects] = useState<AdminProjectRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listProjects().then(setProjects, (err: Error) => setError(err.message));
  }, []);

  const run = (task: Promise<unknown>) => task.catch((err: Error) => setError(err.message));

  const dragProps = useReorder(projects ?? [], setProjects, (next) =>
    run(reorderProjects(next.map((project) => project.id))),
  );

  function toggle(project: AdminProjectRow, field: "published" | "show_on_home") {
    const value = !project[field];
    setProjects((list) => list!.map((item) => (item.id === project.id ? { ...item, [field]: value } : item)));
    run(updateProject(project.id, { [field]: value }));
  }

  async function addProject() {
    setCreating(true);
    try {
      const project = await createProject("New project", projects?.length ?? 0);
      router.push(editorHref(project.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the project.");
      setCreating(false);
    }
  }

  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>Projects</h1>
        <button type="button" className={styles.buttonPrimary} onClick={addProject} disabled={creating}>
          {creating ? "Creating…" : "New project"}
        </button>
      </div>
      <p className={styles.hint}>Drag rows to change the order on the site. Unpublished projects are hidden everywhere.</p>
      {error && <p className={styles.error}>{error}</p>}
      {projects === null && !error && <p className={styles.muted}>Loading…</p>}
      {projects?.length === 0 && <p className={styles.muted}>No projects yet.</p>}

      <ul className={styles.rows}>
        {projects?.map((project, index) => {
          const cover = project.photos[0];
          return (
            <li key={project.id} className={styles.row} {...dragProps(index)}>
              <span className={styles.handle} aria-hidden="true">
                ⋮⋮
              </span>
              {cover ? (
                <img className={styles.thumb} src={photoUrl(cover.storage_path)} alt="" />
              ) : (
                <span className={styles.thumb} />
              )}
              <div>
                <Link href={editorHref(project.id)}>{project.title}</Link>
                <p className={styles.hint}>
                  {project.photos.length} photos · {projectHref(project.slug)}
                </p>
              </div>
              <label className={styles.check}>
                <input type="checkbox" checked={project.published} onChange={() => toggle(project, "published")} />
                Published
              </label>
              <label className={styles.check}>
                <input type="checkbox" checked={project.show_on_home} onChange={() => toggle(project, "show_on_home")} />
                On home
              </label>
            </li>
          );
        })}
      </ul>
    </>
  );
}
