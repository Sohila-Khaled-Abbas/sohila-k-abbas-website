# GitHub source location

The finished portable site is in `portfolio-site/` inside the existing `Sohila-Khaled-Abbas/sohila-k-abbas-website` GitHub repository.

Use `portfolio-site` as Vercel’s **Root Directory**. Its build command is `npm run build`; its output directory is `dist`. The `vercel.json` in that directory provides both values.

For Firebase Hosting, open a terminal in `portfolio-site`, build the site, and deploy with an explicit `--project` value. `portfolio-site/firebase.json` supplies the static Hosting configuration.

The GitHub repository root also contains the original React/Vite application (`src/`, `public/`, and its own package files). It is a preserved legacy application and is not the current Vercel build. Do not run its root build when preparing this portfolio release.

The root README and `docs/` directory explain this distinction and point to the authoritative guides in `portfolio-site/docs/`. The [architecture guide](ARCHITECTURE.md) describes the active generator. Generated `dist/` output and rendered showcase videos stay outside Git history.

The ChatGPT Sites host keeps a separate source snapshot. When updating both hosts, publish the same reviewed source to GitHub and the Sites source repository. Vercel's canonical production build continues to use GitHub `main`.
