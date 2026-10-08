import { Suspense } from "react";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

// The editor reads ?id= on the client, which needs a Suspense boundary in a static export.
export default function AdminProjectPage() {
  return (
    <Suspense>
      <ProjectEditor />
    </Suspense>
  );
}
