import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProjectView } from "@/components/views/ProjectView";

// ProjectView reads ?p= on the client, which needs a Suspense boundary in a static export.
export default function ProjectPage() {
  return (
    <div className="screen">
      <SiteHeader />
      <main>
        <Suspense>
          <ProjectView />
        </Suspense>
      </main>
    </div>
  );
}
