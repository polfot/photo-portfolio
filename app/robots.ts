import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Search engines may index the site, never the dashboard.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/admin/" } };
}
