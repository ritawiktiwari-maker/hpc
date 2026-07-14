# Image uploads (Vercel Blob) — setup

The admin **Website Images** and **Services** panels can upload images in three ways:

1. **Upload a file** (then crop before saving)
2. **Paste an image link** — e.g. an Unsplash URL (then crop before saving)
3. Automatic **Unsplash fallbacks** show on the public site until you set your own

## How images are stored

- When **Vercel Blob is configured**, uploaded/cropped images are pushed to Blob
  and only the short hosted URL is stored in the database (fast, tiny rows).
- When Blob is **not** configured, the app automatically falls back to storing the
  image inline (base64) in the database — so the admin keeps working either way.
- Pasted URLs (Unsplash, etc.) are stored as-is.

## Enable Vercel Blob (recommended)

This project is already linked to Vercel (Postgres env vars are present).

1. Install the CLI and log in **as your own account** (interactive — run it yourself):
   ```
   npm i -g vercel
   vercel logout
   vercel login          # sign in as ritawiktiwari@gmail.com
   vercel link           # link this folder to the project (if not already)
   ```
2. Create a Blob store and connect it to the project:
   - Vercel Dashboard → your project → **Storage** → **Create** → **Blob**, or
   - `vercel blob store add hpc-images`
3. Pull the new env var locally:
   ```
   vercel env pull .env.local
   ```
   This adds **`BLOB_READ_WRITE_TOKEN`**, which `/api/upload` uses automatically.
4. Restart `npm run dev`. New uploads now go to Blob.

No code changes are needed — `app/api/upload/route.ts` detects the token at runtime.
