# Publish the portfolio

This site is static and portable. Build once with Node.js 22 or later; deploy only `dist/`. No database, server runtime, API key, or paid service is required by the code.

## Vercel — recommended

1. Push this repository to your GitHub account.
2. In Vercel, choose **Add New → Project** and import `Sohila-Khaled-Abbas/sohila-k-abbas-website`. Set **Root Directory** to `portfolio-site`.
3. The existing production project is `sohila-khaled-abbas`. Choose **Other** as the framework if recreating it. The committed `vercel.json` supplies `npm run build` and the `dist` output directory.
4. Deploy. Vercel will rebuild subsequent pushes through its Git integration.
5. When using a custom domain, set `SITE_URL` to its full HTTPS origin and redeploy. Otherwise the build uses Vercel’s production project URL, then the verified website origin in `content/profile.json`.

The canonical URL and sitemap use the configured production origin. If all origin settings are removed, the build omits canonical links and the sitemap.

## Site identity and search appearance

The site name is **Sohila Khaled Abbas**. The homepage title uses the name plus a concise data-engineering and ML role. The complete professional headline is in `content/profile.json` and appears on the About and Résumé pages. Individual project pages have their own descriptive titles.

When a production origin is available, the homepage includes `WebSite` and `Person` JSON-LD; the About page includes a `ProfilePage` entity. All name, headline, and professional-profile links come from the supplied profile. These preferences help describe the site; they do not guarantee search rankings or a particular search-result appearance.

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
- `content/project-previews.json`: report links, screenshots, and available files.
- `content/project-status.json`: explicitly maintained in-progress projects.
- `content/project-details.json`: original project previews, public file inventory, and documented toolkit.
- `content/community.json` and `content/credentials.json`: migrated community and learning collections.
- `scripts/studio.mjs`: current home composition and project-directory templates.
- `src/home.html`: shared icon symbols and the illustrative process example.
- `src/assets/theme.css`: shared light/dark design tokens, loaded after component styles.
- `src/assets/`: component CSS, browser interactions, portrait, project media, favicon, and social card.
- `scripts/build.mjs`, `scripts/pages.mjs`, and `scripts/previews.mjs`: static generation and page/report templates.

Run `npm run build` after changing source. `npm run check` verifies internal routes, anchors, directory completeness, and the hosting configuration. External repository descriptions are context, not verified business-impact evidence. Keep private repository data and original CV files out of this public source.

## Production

The verified Vercel project is `sohila-khaled-abbas`, with the public production domain https://sohila-khaled-abbas.vercel.app and root directory `portfolio-site`. GitHub main is its deployment source. The ChatGPT Sites copy can remain available as a secondary host; canonical and social links point to the Vercel production origin.
