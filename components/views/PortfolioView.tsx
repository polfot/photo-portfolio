"use client";

import { PortfolioIndex } from "@/components/PortfolioIndex";
import { preloadImages } from "@/lib/preload";
import { getPortfolioItems } from "@/lib/projects";
import { useData } from "@/lib/useData";
import { Loaded } from "./Loaded";

// Keep the loading screen until the first project's photos (preview and phone strip) are ready.
async function loadPortfolio() {
  const items = await getPortfolioItems();
  if (items[0]) await preloadImages(items[0].photos.map((photo) => photo.url));
  return items;
}

export function PortfolioView() {
  return (
    <Loaded state={useData("portfolio", loadPortfolio)} loadingScreen>
      {(items) => <PortfolioIndex items={items} />}
    </Loaded>
  );
}
