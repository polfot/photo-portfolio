import type { Metadata } from "next";
import { NotFound } from "@/components/NotFound";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Page not found" };

// Exported as 404.html, which GitHub Pages serves for any unknown address.
export default function NotFoundPage() {
  return (
    <div className="screen">
      <SiteHeader />
      <main>
        <NotFound />
      </main>
    </div>
  );
}
