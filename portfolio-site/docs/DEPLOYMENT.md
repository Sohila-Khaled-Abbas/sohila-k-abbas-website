# Publish the portfolio

This site is static and portable. Build once with Node.js 22 or later; deploy only `dist/`. No database, server runtime, API key, or paid service is required by the code.

## Vercel — recommended

1. Push this repository to your GitHub account.
2. In Vercel, choose **Add New → Project** and import `Sohila-Khaled-Abbas/sohila-k-abbas-website`. Set **Root Directory** to `portfolio-site`.
3. Choose **Other** as the framework if prompted. The committed `vercel.json` supplies `npm run build` and the `dist` output directory.
4. Deploy. Vercel will rebuild subsequent pushes through its Git integration.
5. When using a custom domain, set `SITE_URL` to its full HTTPS origin and redeploy. Otherwise the build uses Vercel’s production project URL when available.

The canonical URL and sitemap use the configured production origin. When no origin is available, the build omits canonical links and the sitemap rather than pointing to a different host.

Official documentation: [Import a Git repository](https://vercel.com/docs/git) · [Static configuration](https://vercel.com/docs/project-configuration/vercel-json).

## Firebase Hosting — alternative

Create or select your Firebase project in your own account. Firebase Hosting is already configured to publish `dist/`. No project ID is embedded in the repository.

```powershell
npm run build
npm run check
npx firebase-tools login
npx firebase-tools deploy --only hosting --project YOUR_FIREBASE_PROJECT_ID
```

Replace `YOUR_FIREBASE_PROJECT_ID` with your real project ID. You can set the final URL before building:

```powershell
$env:SITE_URL = "https://YOUR_FIREBASE_PROJECT_ID.web.app"
npm run build
npx firebase-tools deploy --only hosting --project YOUR_FIREBASE_PROJECT_ID
```

Official documentation: [Hosting quickstart](https://firebase.google.com/docs/hosting/quickstart) · [Hosting configuration](https://firebase.google.com/docs/hosting/full-config).

## Local preview

After cloning the GitHub repository, run these commands from its `portfolio-site` directory.

```powershell
npm run build
npm run check
npm run dev
```

Open `http://localhost:4173/`. The preview includes real directory routes and a custom 404 page.

## Content maintenance

- `content/profile.json`: professional experience, education, skills, and training.
- `content/cases.json` and `content/additional-cases.json`: case-study copy.
- `content/repositories.json`: a dated public GitHub metadata snapshot.
- `src/home.html`: home-page composition.
- `src/assets/`: CSS, browser interactions, and favicon.
- `scripts/build.mjs` and `scripts/pages.mjs`: static page generator and templates.

Run `npm run build` after changing source. `npm run check` verifies internal routes, anchors, directory completeness, and the hosting configuration. External repository descriptions are context, not verified business-impact evidence. Keep private repository data and original CV files out of this public source.

## Existing hosted version

The current ChatGPT Sites version can remain online during migration. A Vercel or Firebase project must be created in the owner’s hosting account before either service can publish a new production URL. This repository does not imply that such an external deployment has already occurred.
