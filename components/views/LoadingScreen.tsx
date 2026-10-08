import { publicPath, site } from "@/lib/site";

// Full-screen white cover with the softly pulsing flower, shown while a page's data and first photos load.
export function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-label="Loading">
      <img src={publicPath(site.icon)} alt="" />
    </div>
  );
}
