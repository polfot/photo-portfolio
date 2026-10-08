import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { AboutView } from "@/components/views/AboutView";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="screen">
      <SiteHeader />
      <AboutView />
    </div>
  );
}
