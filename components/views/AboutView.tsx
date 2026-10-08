"use client";

import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { site } from "@/lib/site";
import { useData } from "@/lib/useData";
import { Loaded } from "./Loaded";
import styles from "./AboutView.module.css";

export function AboutView() {
  return (
    <>
      <main className={styles.main}>
        <h1 className="visually-hidden">About</h1>
        <Loaded state={useData("settings", getSiteSettings)}>
          {({ bio, portrait, email, instagram }) => (
            <div className={styles.content}>
              {portrait && <img className={styles.portrait} src={portrait.url} alt={portrait.alt} />}
              <div className={styles.text}>
                <p className={styles.bio}>{bio}</p>
                <ul className={styles.list}>
                  <li>
                    <a href={`mailto:${email}`}>{email}</a>
                  </li>
                  <li>
                    <a href={instagram} target="_blank" rel="noreferrer">
                      Instagram
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </Loaded>
      </main>

      <footer className={styles.footer}>
        <p>All Rights Reserved © {new Date().getFullYear()}</p>
        <Link href={site.privacyHref} className={styles.vertical}>
          Privacy policy
        </Link>
      </footer>
    </>
  );
}
