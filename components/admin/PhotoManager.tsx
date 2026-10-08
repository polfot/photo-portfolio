"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import {
  deletePhoto,
  photoUrl,
  reorderPhotos,
  updatePhoto,
  uploadPhoto,
  type AdminPhoto,
  type AdminProject,
} from "@/lib/admin/api";
import { useReorder } from "@/lib/admin/useReorder";
import styles from "./admin.module.css";

type Props = {
  project: AdminProject;
  photos: AdminPhoto[];
  setPhotos: (update: AdminPhoto[] | ((current: AdminPhoto[]) => AdminPhoto[])) => void;
  saveProject: (changes: Partial<AdminProject>) => Promise<void>;
  onError: (message: string) => void;
};

const HOME_SLOTS = [
  { field: "home_photo_left_id", label: "Home left" },
  { field: "home_photo_right_id", label: "Home right" },
] as const;

// Upload, order, hide and caption a project's photos. Every change is saved immediately.
export function PhotoManager({ project, photos, setPhotos, saveProject, onError }: Props) {
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [dropActive, setDropActive] = useState(false);

  const fail = (err: unknown) => onError(err instanceof Error ? err.message : "Something went wrong.");

  const dragProps = useReorder(photos, setPhotos, (next) =>
    reorderPhotos(next.map((photo) => photo.id)).catch(fail),
  );

  async function upload(files: File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) return;
    setUploading({ done: 0, total: images.length });
    try {
      for (const [index, file] of images.entries()) {
        const photo = await uploadPhoto(project, file, photos.length + index);
        setPhotos((current) => [...current, photo]);
        setUploading({ done: index + 1, total: images.length });
      }
    } catch (err) {
      fail(err);
    }
    setUploading(null);
  }

  function patch(photo: AdminPhoto, changes: Partial<AdminPhoto>) {
    setPhotos((current) => current.map((item) => (item.id === photo.id ? { ...item, ...changes } : item)));
    updatePhoto(photo.id, changes).catch(fail);
  }

  async function remove(photo: AdminPhoto) {
    if (!window.confirm("Delete this photo? This cannot be undone.")) return;
    try {
      await deletePhoto(photo);
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
    } catch (err) {
      fail(err);
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDropActive(false);
    upload([...event.dataTransfer.files]);
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Photos</h2>
      <p className={styles.hint}>
        Drag to reorder. The first visible photo opens the project page and is the portfolio preview. Hidden photos stay
        here but are not shown on the site.
      </p>

      <label
        className={styles.dropzone}
        data-active={dropActive}
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={onDrop}
      >
        <span>{uploading ? `Uploading ${uploading.done} / ${uploading.total}…` : "Drop photos here or click to choose"}</span>
        <span className={styles.hint}>Photos are resized for the web before upload.</span>
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          disabled={uploading !== null}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            upload([...(event.target.files ?? [])]);
            event.target.value = "";
          }}
        />
      </label>

      <ul className={styles.photos}>
        {photos.map((photo, index) => (
          <li key={photo.id} className={styles.photo} data-hidden={!photo.is_visible} {...dragProps(index)}>
            <img className={styles.photoImage} src={photoUrl(photo.storage_path)} alt={photo.alt ?? ""} draggable={false} />
            <div className={styles.badges}>
              {HOME_SLOTS.filter(({ field }) => project[field] === photo.id).map(({ label }) => (
                <span key={label} className={styles.badge}>
                  {label}
                </span>
              ))}
            </div>
            <input
              className={styles.input}
              placeholder="Description for screen readers"
              defaultValue={photo.alt ?? ""}
              onBlur={(event) => event.target.value !== (photo.alt ?? "") && patch(photo, { alt: event.target.value })}
            />
            <label className={styles.check}>
              <input type="checkbox" checked={photo.is_visible} onChange={() => patch(photo, { is_visible: !photo.is_visible })} />
              Visible on site
            </label>
            <div className={styles.actions}>
              {HOME_SLOTS.map(({ field, label }) => (
                <button
                  key={field}
                  type="button"
                  className={styles.button}
                  disabled={project[field] === photo.id}
                  onClick={() => saveProject({ [field]: photo.id })}
                >
                  {label}
                </button>
              ))}
              <button type="button" className={styles.buttonDanger} onClick={() => remove(photo)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
