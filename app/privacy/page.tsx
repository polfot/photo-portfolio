import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { PrivacyView } from "@/components/views/PrivacyView";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="screen" data-scroll>
      <SiteHeader />
      <PrivacyView />
    </div>
  );
}
