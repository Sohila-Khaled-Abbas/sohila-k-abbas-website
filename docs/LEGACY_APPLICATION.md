# Preserved original application

The original portfolio used React and Vite with root-level `src/`, `public/`, package manifests, and related application configuration. These files remain available for reference and historical continuity.

The current production website is a separate, dependency-free static generator in [`portfolio-site/`](../portfolio-site/). Vercel's `sohila-khaled-abbas` project uses **Root Directory `portfolio-site`**, build **`npm run build`**, and output **`dist`**. Running the root React build does not produce the current portfolio.

## Working on the current website

```sh
cd portfolio-site
npm run build
npm run check
npm run dev
```

Use Node.js 22 or later. The [architecture guide](../portfolio-site/docs/ARCHITECTURE.md) and [content guide](../portfolio-site/docs/CONTENT_GUIDE.md) describe the active source.

## Historical source boundaries

The previous public portfolio supplied verified portrait, mentoring/community content, credentials, and project/report URLs. See the [migration record](../portfolio-site/docs/portfolio-migration.md). Retaining the old code does not mean every historical claim, metric, integration, or deployment setting is used by the new site.

Legacy edits should be scoped separately and validated against that application's own package scripts and configuration. Do not move its dependencies or server integrations into the portable site merely to reproduce the old build.
