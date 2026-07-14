# NURAA production deployment

## 1. Production environment variables

Add the following variables in Vercel under **Project Settings > Environment Variables**. Use `.env.example` only as a key-name reference and never commit real credentials.

- `DATABASE_URL`: Supabase transaction-mode pooler URL on port `6543`; used by the deployed Next.js application.
- `DIRECT_URL`: Supabase direct connection or session-mode pooler URL on port `5432`; used only by Prisma migrations.
- `ADMIN_EMAIL`: production administrator email.
- `ADMIN_PASSWORD`: a new, unique production password.
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SECRET_KEY`: server-only Supabase secret key. Never prefix it with `NEXT_PUBLIC_`.
- `SUPABASE_HOMEPAGE_BUCKET`: `homepage-media`.
- `SUPABASE_PRODUCT_BUCKET`: `product-media`.

If the database password contains reserved URL characters such as `@`, `:`, `/`, `?`, `#`, `[` or `]`, URL-encode the password before placing it in a PostgreSQL connection URL.

Use separate Supabase projects for Production and Preview when preview deployments may run migrations or mutate data. Otherwise, configure database and secret variables for Production only.

## 2. Database migration

Do not use `prisma migrate dev` against production. Before the first production deployment, load the production values locally or in a protected CI job and run:

```bash
npm ci
npm run db:deploy
```

Run the seed only once if the production database has no initial administrator or catalog data:

```bash
npm run db:seed
```

Seeding is intentionally not part of the Vercel build command.

## 3. Deploy with the Vercel dashboard

1. Push this project to a private Git repository.
2. Import the repository into Vercel.
3. If the repository root is the parent workspace, set **Root Directory** to `saudi-store`. If this folder is the repository root, leave it as `.`.
4. Confirm framework preset **Next.js**, install command `npm ci`, and build command `npm run build`.
5. Add all production environment variables listed above.
6. Deploy, then run the database migration from a protected local/CI environment if it has not already been applied.

## 4. Deploy with the Vercel CLI (alternative)

```bash
npx vercel login
npx vercel
npx vercel --prod
```

The first command links or creates the Vercel project. Add secrets through the dashboard or `vercel env add`; do not pass them in shell history.

## 5. Production smoke test

After deployment, verify:

1. `/en` and `/ar` render without a database error.
2. `/en/products` displays database products and Supabase Storage images.
3. `/admin/login` accepts the production administrator credentials.
4. `/admin/products` can read existing products.
5. Existing homepage and product media URLs return successfully.
6. Vercel function logs contain no Prisma connection or missing-environment-variable errors.

## Security before launch

Rotate any database password, administrator password, or Supabase secret key that has ever been pasted into chat, screenshots, logs, or a shared file. Update the rotated values in both the local `.env` and Vercel, then redeploy.
