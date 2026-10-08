"use client";

import Link from "next/link";
import { useState } from "react";
import { publicPath, site } from "@/lib/site";
import styles from "./SiteHeader.module.css";

type Props = {
  // "overlay" floats over the full-screen home slideshow; "default" sits in the page flow.
  variant?: "overlay" | "default";
};

export function SiteHeader({ variant = "default" }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={styles.header}
      data-variant={variant}
      data-menu-open={menuOpen}
      // Set inline because CSS modules would hash the name; globals.css keeps "site-header" still during page fades.
      style={{ viewTransitionName: "site-header" }}
    >
      <Link href="/" className={styles.logo}>
        <img src={publicPath(site.logo)} alt={site.name} />
      </Link>

      <button
        type="button"
        className={styles.menuToggle}
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? "close" : "menu"}
      </button>

      <nav id="site-nav" className={styles.nav} aria-label="Main">
        <ul>
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
