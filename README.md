# Ilik.

Photography portfolio. Static Next.js site on GitHub Pages; projects, photos and settings are read live from Supabase
and managed in the `/admin` dashboard.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the Supabase keys.

## Structure

- `app/` pages; `/project/?p=<slug>` serves every project, so new projects need no rebuild
- `components/` site components; `components/views/` load live data, `components/admin/` is the dashboard
- `lib/` data access (`projects.ts`, `settings.ts`), site constants (`site.ts`)
- `app/globals.css` all design tokens (colours, spacing, type, motion)
- `supabase/schema.sql` database tables, storage bucket and access rules

## Deploy

Pushing to `main` builds and publishes to GitHub Pages (`.github/workflows/deploy.yml`).
