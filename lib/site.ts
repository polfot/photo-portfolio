// Static site settings. Content the photographer edits lives in Supabase (see lib/settings.ts);
// the contact and about values below are only fallbacks for empty fields.
export const site = {
  name: "Ilik.",
  logo: "/logo.png",
  // The flower from app/icon.png (the favicon), also shown on the loading screen.
  icon: "/icon.png",
  // Link-share preview, generated from the logo by app/og.png/route.tsx.
  shareImage: { url: "/og.png", width: 1200, height: 630 },
  description: "Photography portfolio",
  nav: [
    { label: "home", href: "/" },
    { label: "about", href: "/about/" },
    { label: "portfolio", href: "/portfolio/" },
  ],
  homeSlideIntervalMs: 5000,
  homeExcerptWords: 12,
  portfolioStripPhotos: 3,
  email: "hello@ilik.gr",
  instagram: "https://www.instagram.com/",
  about: {
    bio: "Photographer based in Greece, working with weddings, families and the small moments in between.",
  },
  privacyHref: "/privacy/",
} as const;

export const PHOTOS_BUCKET = "photos";


// Every project shares one page, picked by ?p=, so new projects need no rebuild.
export const projectHref = (slug: string) => `/project/?p=${encodeURIComponent(slug)}`;

// Files in /public are not prefixed with basePath automatically when used in a plain <img>.
export const publicPath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
