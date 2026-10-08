"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getSettings, photoUrl, updateSettings, uploadPortrait, type AdminSettings } from "@/lib/admin/api";
import styles from "./admin.module.css";

// About page content and contact details. Empty fields fall back to the defaults in lib/site.ts.
const SETTINGS_FORM = "site-settings";

export function SettingsForm() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings, (err: Error) => setError(err.message));
  }, []);

  if (error && !settings) return <p className={styles.error}>{error}</p>;
  if (!settings) return <p className={styles.muted}>Loading…</p>;

  const set = (key: keyof AdminSettings) => (value: string) => {
    setSettings({ ...settings, [key]: value });
    setStatus(null);
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("Saving…");
    setError(null);
    try {
      const { email, instagram, about_bio } = settings!;
      await updateSettings({ email, instagram, about_bio });
      setStatus("Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      setStatus(null);
    }
  }

  async function onPortrait(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const path = await uploadPortrait(file, settings!.portrait_path);
      setSettings({ ...settings!, portrait_path: path });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the portrait.");
    }
    setUploading(false);
  }

  return (
    <>
      <h1 className={styles.title}>Settings</h1>
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>About page</h2>
        <form id={SETTINGS_FORM} className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>About text</span>
            <textarea className={styles.textarea} value={settings.about_bio ?? ""} onChange={(e) => set("about_bio")(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input className={styles.input} type="email" value={settings.email ?? ""} onChange={(e) => set("email")(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Instagram link</span>
            <input
              className={styles.input}
              type="url"
              placeholder="https://www.instagram.com/…"
              value={settings.instagram ?? ""}
              onChange={(e) => set("instagram")(e.target.value)}
            />
          </label>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Portrait</h2>
        {settings.portrait_path ? (
          <img className={styles.thumb} src={photoUrl(settings.portrait_path)} alt="Current portrait" />
        ) : (
          <p className={styles.hint}>No portrait yet. The About page shows no photo until one is added.</p>
        )}
        <label className={`${styles.button} ${styles.start}`}>
          {uploading ? "Uploading…" : "Choose a new portrait"}
          <input type="file" accept="image/*" hidden disabled={uploading} onChange={(e) => onPortrait(e.target.files?.[0])} />
        </label>
      </section>

      {/* Save sits below everything; it submits the about form above through the form attribute. */}
      <div className={styles.actions}>
        <button type="submit" form={SETTINGS_FORM} className={styles.buttonPrimary}>
          Save
        </button>
        {status && <span className={styles.muted}>{status}</span>}
      </div>
    </>
  );
}
