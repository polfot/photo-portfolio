"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signOut } from "@/lib/admin/api";
import { site } from "@/lib/site";
import { supabase } from "@/lib/supabase";
import { LoginForm } from "./LoginForm";
import styles from "./admin.module.css";

const NAV = [
  { label: "Projects", href: "/admin/" },
  { label: "Settings", href: "/admin/settings/" },
];

// Gate for every /admin page: shows the login form until the photographer is signed in.
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className={styles.login}>
        <p>
          Supabase is not configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>.
        </p>
      </div>
    );
  }
  if (session === undefined) return null;
  if (!session) return <LoginForm />;

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <span className={styles.brand}>{site.name}</span>
        <nav className={styles.nav} aria-label="Dashboard">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
          <Link href="/" target="_blank" rel="noreferrer">
            View site ↗
          </Link>
        </nav>
        <button type="button" className={styles.button} onClick={signOut}>
          Sign out
        </button>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
