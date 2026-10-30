# Contributing

The current website is in `portfolio-site/`. Keep changes to the preserved root React application separate and state the target explicitly in a pull request.

## Workflow

1. Create a branch from current `main`.
2. Edit the portable site's `content/`, templates in `scripts/`, or assets in `src/assets/`.
3. From `portfolio-site/`, run `npm run build` and `npm run check` with Node.js 22 or later.
4. Preview with `npm run dev`. Check changed pages on mobile/desktop and in both themes. Verify keyboard focus and reduced-motion behavior when changing interactions.
5. Open a pull request describing the user-visible change, sources for new facts, and validation. Wait for relevant CI checks before merging.
6. After merge, verify the matching Vercel production deployment and public routes.

No package installation is needed for the portable site. Do not commit generated `dist/` output, credentials, original CV PDFs, private project content, or large showcase videos.

## Content and design

Use the [content guide](portfolio-site/docs/CONTENT_GUIDE.md) for projects, report links, and editorial status. Keep forks attributed. Preserve actual report content, project diagrams, and the owner's portrait. Do not infer employment, production uptime, or business impact from a repository.

Use [`theme.css`](portfolio-site/src/assets/theme.css) for shared color changes and the [design system](portfolio-site/docs/DESIGN_SYSTEM.md) for token and interaction rules. Keep the SVG/PNG social card and favicon consistent with the palette.

The root README and `docs/README.md` should continue to point to the active source. New technical guides belong in `portfolio-site/docs/` unless they apply specifically to the whole repository or legacy application.
