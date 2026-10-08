import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { PortfolioView } from "@/components/views/PortfolioView";

export const metadata: Metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  return (
    <div className="screen">
      <SiteHeader />
      <main>
        <h1 className="visually-hidden">Portfolio</h1>
        <PortfolioView />
      </main>
    </div>
  );
}
