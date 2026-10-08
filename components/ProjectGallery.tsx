"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cssTimeMs } from "@/lib/css";
import type { Project } from "@/lib/types";
import styles from "./ProjectGallery.module.css";

type Props = {
  project: Project;
  nextProjectHref: string | null;
};

export function ProjectGallery({ project, nextProjectHref }: Props) {
  const { photos } = project;
  const count = photos.length;
  const [current, setCurrent] = useState(0);
  // Photo change in three steps: fade the current photo out, swap the source, fade in once it has loaded.
  // It is only an opacity fade, not movement, so it also runs when the device asks for reduced motion.
  const [visible, setVisible] = useState(true);
  const target = useRef<number | null>(null);

  const go = useCallback(
    (step: 1 | -1) => {
      if (count < 2) return;
      // Repeated clicks while fading keep counting from the photo that is about to show.
      const from = target.current ?? current;
      const next = (from + step + count) % count;
      target.current = next;
      setVisible(false);
      // Swap once the fade-out is over; its length comes from --motion-fade-out in globals.css.
      window.setTimeout(onFadeEnd, cssTimeMs("--motion-fade-out"));
    },
    [count, current],
  );

  // Fade-out finished: show the target photo (still hidden until it loads).
  // Safe to call more than once: later calls find no target and do nothing.
  function onFadeEnd() {
    if (target.current === null) return;
    setCurrent(target.current);
    target.current = null;
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const photo = photos[current];
  // Preload the neighbours so prev/next swap instantly. With two photos both neighbours are the same one.
  const neighbours = [...new Set([(current + 1) % count, (current - 1 + count) % count])]
    .filter((index) => index !== current)
    .map((index) => photos[index]);

  return (
    <div className={styles.layout}>
      <section className={styles.text}>
        <div className={styles.intro}>
          <h1 className={styles.title}>{project.title}</h1>
          {project.description && <p className={styles.description}>{project.description}</p>}
        </div>
        {project.details && <p className={styles.details}>{project.details}</p>}
      </section>

      <section className={styles.viewer} aria-label="Photos">
        <div className={styles.controls}>
          {count > 1 && (
            <button type="button" onClick={() => go(-1)}>
              [ Prev ]
            </button>
          )}
          <p aria-live="polite">
            {current + 1} of {count}
          </p>
          {count > 1 && (
            <button type="button" onClick={() => go(1)}>
              [ Next ]
            </button>
          )}
        </div>

        <div className={styles.frame}>
          <img
            className={styles.photo}
            src={photo.url}
            alt={photo.alt}
            fetchPriority="high"
            data-visible={visible}
            // Loaded: fade in, unless another click arrived meanwhile, then move straight on to that photo.
            onLoad={() => (target.current === null ? setVisible(true) : onFadeEnd())}
            onError={() => setVisible(true)}
          />
        </div>

        <div className={styles.caption}>
          {nextProjectHref && (
            <Link href={nextProjectHref}>
              Next project <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </section>

      <div className="visually-hidden" aria-hidden="true">
        {neighbours.map((neighbour) => (
          <img key={neighbour.id} src={neighbour.url} alt="" />
        ))}
      </div>
    </div>
  );
}
