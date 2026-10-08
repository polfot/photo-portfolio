"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "@/lib/admin/api";
import { site } from "@/lib/site";
import styles from "./admin.module.css";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await signIn(String(form.get("email")), String(form.get("password")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setBusy(false);
    }
  }

  return (
    <div className={styles.login}>
      <form className={styles.form} onSubmit={onSubmit}>
        <h1 className={styles.brand}>{site.name}</h1>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input className={styles.input} name="email" type="email" autoComplete="username" required />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input className={styles.input} name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.buttonPrimary} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
