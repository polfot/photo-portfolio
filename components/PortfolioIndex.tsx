"use client";

import Link from "next/link";
import { useState } from "react";
import { projectHref } from "@/lib/site";
import type { PortfolioItem, Photo } from "@/lib/types";
import styles from "./PortfolioIndex.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

// Until a photo has loaded its real proportions are unknown; assume the common portrait shape.
const DEFAULT_RATIO = 4 / 5;

export function PortfolioIndex({ items }: { items: PortfolioItem[] }) {
  // Desktop: the last hovered (or focused) project stays on screen; the first one shows until then.
  const [active, setActive] = useState(0);
  if (items.length === 0) return <p className="status-message">No projects yet.</p>;

  return (
    <>
      <div className={styles.layout}>
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li key={item.slug}>
              <Link
                href={projectHref(item.slug)}
                className={styles.link}
                aria-current={index === active}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.preview} aria-hidden="true">
          <p className={styles.counter}>
            ( {pad(active + 1)} / {pad(items.length)} )
          </p>

          {/* All previews are stacked and crossfaded, so every image is already loaded on hover. */}
          <div className={styles.stack}>
            {items.map((item, index) => (
              <figure key={item.slug} className={styles.item} data-active={index === active}>
                <figcaption className={styles.excerpt}>{item.description}</figcaption>
                <img className={styles.photo} src={item.photos[0].url} alt="" />
              </figure>
            ))}
          </div>
        </div>
      </div>

      {/* Phones have no hover: every project shows its title and a strip of its first photos. */}
      <ul className={styles.strips}>
        {items.map((item) => (
          <li key={item.slug} className={styles.project}>
            <div className={styles.projectHeader}>
              <h2 className={styles.projectTitle}>{item.title}</h2>
              <Link href={projectHref(item.slug)}>[ View ]</Link>
            </div>
            <Link href={projectHref(item.slug)} className={styles.strip} tabIndex={-1} aria-hidden="true">
              {item.photos.map((photo) => (
                <StripPhoto key={photo.id} photo={photo} />
              ))}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

// Each photo grows in proportion to its width/height ratio, so all photos in a strip share one height
// and together fill the full width, whatever their original sizes.
function StripPhoto({ photo }: { photo: Photo }) {
  const [ratio, setRatio] = useState(DEFAULT_RATIO);

  return (
    <img
      className={styles.stripPhoto}
      src={photo.url}
      alt={photo.alt}
      loading="lazy"
      style={{ flexGrow: ratio, aspectRatio: ratio }}
      onLoad={(event) => setRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)}
    />
  );
}
