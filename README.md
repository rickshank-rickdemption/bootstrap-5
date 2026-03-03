# Bootstrap Website (React + Vite)

## Local run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
Output folder: `dist/`

## Deploy to GitHub + Cloudflare Pages
This project is inside `react-app/`, so Cloudflare must build that subdirectory.

1. Push your repo to GitHub.
2. In Cloudflare Dashboard: `Workers & Pages` -> `Create` -> `Pages` -> `Connect to Git`.
3. Select your repository.
4. Use these build settings:
   - Framework preset: `Vite`
   - Root directory: `react-app`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `20` (recommended)
5. Click `Save and Deploy`.

## Why routing works on Cloudflare Pages
- `public/_redirects` is included to support SPA routes like `/components`.
- Static legacy files under `/legacy/*` and images under `/img/*` remain directly accessible.

## Included deploy helpers
- `.nvmrc` -> pins Node `20`
- `public/_redirects` -> Cloudflare Pages route handling
