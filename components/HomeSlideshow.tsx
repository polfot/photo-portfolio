"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowIcon } from "@/components/ArrowIcon";
import { projectHref, site } from "@/lib/site";
import { truncateWords } from "@/lib/text";
import type { HomeSlide } from "@/lib/types";
import styles from "./HomeSlideshow.module.css";

type Direction = "next" | "prev";

type SlideState = {
  current: number;
  previous: number | null;
  direction: Direction;
};

export function HomeSlideshow({ slides }: { slides: HomeSlide[] }) {
  const count = slides.length;
  const [state, setState] = useState<SlideState>({ current: 0, previous: null, direction: "next" });
  const [hovered, setHovered] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  const go = useCallback(
    (step: 1 | -1) =>
      setState(({ current }) => ({
        current: (current + step + count) % count,
        previous: current,
        direction: step === 1 ? "next" : "prev",
      })),
    [count],
  );

  const goTo = (index: number) =>
    setState((prev) =>
      index === prev.current
        ? prev
        : { current: index, previous: prev.current, direction: index > prev.current ? "next" : "prev" },
    );

  // Restart the countdown after every change, so manual navigation gets a full interval too.
  useEffect(() => {
    if (count < 2 || hovered || pageHidden) return;
    const timer = window.setTimeout(() => go(1), site.homeSlideIntervalMs);
    return () => window.clearTimeout(timer);
  }, [state, count, hovered, pageHidden, go]);

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "ArrowRight") go(1);
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKey);
    };
  }, [go]);

  if (count === 0) return null;

  const isNear = (index: number) =>
    index === state.current ||
    index === (state.current + 1) % count ||
    index === (state.current - 1 + count) % count;

  return (
    <section
      className={styles.slideshow}
      aria-roledescription="carousel"
      aria-label="Featured projects"
      // Pause only while the pointer is over the feature photo; the text panel keeps it running.
      onMouseMove={(event) =>
        setHovered((event.target as Element).closest(`.${styles.feature}`) !== null)
      }
      onMouseLeave={() => setHovered(false)}
    >
      {slides.map((slide, index) => {
        const role =
          index === state.current ? "enter" : index === state.previous ? "exit" : "idle";
        const animate = state.previous !== null && role !== "idle";

        return (
          <article
            key={slide.id}
            className={styles.slide}
            data-role={role}
            data-direction={animate ? state.direction : undefined}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}: ${slide.title}`}
            inert={index !== state.current}
          >
            <div className={styles.panel}>
              <img
                className={styles.detailPhoto}
                src={slide.leftPhoto.url}
                alt={slide.leftPhoto.alt}
                loading={isNear(index) ? "eager" : "lazy"}
                decoding="async"
              />
              <p className={styles.description}>{truncateWords(slide.description, site.homeExcerptWords)}</p>
            </div>
            <div className={styles.feature}>
              <img
                className={styles.featurePhoto}
                src={slide.rightPhoto.url}
                alt={slide.rightPhoto.alt}
                loading={isNear(index) ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
              />
              <Link href={projectHref(slide.slug)} className={styles.openProject}>
                View project
                <span className={styles.openProjectArrow}>
                  <ArrowIcon direction="right" />
                </span>
              </Link>
            </div>
          </article>
        );
      })}

      {count > 1 && (
        <nav className={styles.dots} aria-label="Projects">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={styles.dot}
              onClick={() => goTo(index)}
              aria-label={slide.title}
              aria-current={index === state.current}
            />
          ))}
        </nav>
      )}

      {count > 1 && (
        <div className={styles.controls}>
          <button type="button" className={styles.arrow} onClick={() => go(-1)} aria-label="Previous project">
            <ArrowIcon direction="up" />
          </button>
          <button type="button" className={styles.arrow} onClick={() => go(1)} aria-label="Next project">
            <ArrowIcon direction="down" />
          </button>
        </div>
      )}
    </section>
  );
}
