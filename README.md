# NURAA Saudi Store MVP

Mobile-first bilingual storefront for Saudi Arabia, built with Next.js, TypeScript and Tailwind CSS.

## Local development

1. Copy `.env.example` to `.env` and update `DATABASE_URL` when a PostgreSQL instance is available.
2. Run `npm run dev`.
3. Open `/en` or `/ar`.

## Database

The catalog schema lives in `prisma/schema.prisma`. Run `npm run db:generate` to generate the client and `npm run db:migrate` when the database connection is configured.

The storefront reads products exclusively from PostgreSQL through the catalog repository. `src/lib/products.ts` is used only by the one-time seed command and is never imported by storefront routes.

## Admin

After migrating and seeding the database, open `/admin/login`. The initial administrator is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Change both values before any shared or production environment is used.

## Production deployment

Vercel and Supabase production setup is documented in [`docs/vercel-deployment.md`](docs/vercel-deployment.md). The production migration command is `npm run db:deploy`; it is intentionally separate from the Vercel build.
