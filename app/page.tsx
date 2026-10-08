import { SiteHeader } from "@/components/SiteHeader";
import { HomeView } from "@/components/views/HomeView";

export default function HomePage() {
  return (
    <>
      <SiteHeader variant="overlay" />
      <main>
        <HomeView />
      </main>
    </>
  );
}
