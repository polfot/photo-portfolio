"use client";

import { HomeSlideshow } from "@/components/HomeSlideshow";
import { preloadImages } from "@/lib/preload";
import { getHomeSlides } from "@/lib/projects";
import { useData } from "@/lib/useData";
import { Loaded } from "./Loaded";

// Keep the loading screen until the first slide's two photos are ready.
async function loadHome() {
  const slides = await getHomeSlides();
  if (slides[0]) await preloadImages([slides[0].leftPhoto.url, slides[0].rightPhoto.url]);
  return slides;
}

export function HomeView() {
  return (
    <Loaded state={useData("home", loadHome)} loadingScreen>
      {(slides) => <HomeSlideshow slides={slides} />}
    </Loaded>
  );
}
