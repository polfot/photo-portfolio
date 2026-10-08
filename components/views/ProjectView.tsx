"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ProjectGallery } from "@/components/ProjectGallery";
import { getProject, getProjectSlugs } from "@/lib/projects";
import { projectHref, site } from "@/lib/site";
import { preloadImages } from "@/lib/preload";
import { useData } from "@/lib/useData";
import { NotFound } from "@/components/NotFound";
import { Loaded } from "./Loaded";

// Keeps the loading screen until the first photo is ready.
async function loadProject(slug: string) {
  const [project, slugs] = await Promise.all([getProject(slug), getProjectSlugs()]);
  if (project?.photos[0]) await preloadImages([project.photos[0].url]);
  const nextSlug = slugs[(slugs.indexOf(slug) + 1) % slugs.length];
  return { project, nextHref: nextSlug && nextSlug !== slug ? projectHref(nextSlug) : null };
}

// One page for every project, chosen by ?p=<slug>, so new projects work without rebuilding the site.
export function ProjectView() {
  const slug = useSearchParams().get("p") ?? "";
  const state = useData(slug, () => loadProject(slug));
  const title = state.status === "ready" ? state.data.project?.title : undefined;

  useEffect(() => {
    if (title) document.title = `${title} · ${site.name}`;
  }, [title]);

  return (
    <Loaded state={state} loadingScreen>
      {({ project, nextHref }) =>
        project && project.photos.length > 0 ? (
          <ProjectGallery project={project} nextProjectHref={nextHref} />
        ) : (
          <NotFound message="This project could not be found." />
        )
      }
    </Loaded>
  );
}
