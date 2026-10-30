# Sohila Khaled Abbas — Data & Analytics Engineer | Machine Learning Engineer

A complete, portable personal portfolio for Sohila Khaled Abbas: data and analytics engineering, machine learning, business intelligence, ETL/ELT, data warehousing, automation, and practical learning.

**Live website:** [sohila-khaled-abbas.vercel.app](https://sohila-khaled-abbas.vercel.app/)

![Portrait-inspired portfolio preview](src/assets/social-card.png)

This is the active website source. In the GitHub repository it lives in `portfolio-site/`; Vercel builds this directory. The original React application at the repository root is preserved separately.

## Content

- Dedicated home, work, dashboards, about, résumé, learning, and contact pages.
- Twenty-two permanent reporting project pages with 17 real screenshots, 12 public Power BI links, available report files, and project presentations.
- Explicit in-progress status for PixelFed and the n8n queue setup.
- Preview pages for all 75 original repositories, including 12 detailed case studies. Sixteen learning forks retain upstream attribution.
- Actual architecture and model images, documented workflow overviews, and source-file previews.
- A searchable directory of 91 accessible public GitHub repositories, including clearly attributed forks.
- An interactive three-step retail example with explicitly invented records.
- About, learning resources, and verified professional contact links.
- Portrait-led animated hero with technology logos, pause and reduced-motion support; responsive navigation, keyboard screenshot dialogs, light/dark themes, and a print-friendly résumé.
- A portrait-inspired ivory, taupe, cocoa, and muted burgundy palette, with shared light/dark tokens and verified text contrast pairs.
- Shareable gallery/list filters, Ctrl/Command+K project search, copyable project links, and a 1200 × 630 social preview card.
- Community, credential collection, mentoring, and collaboration pages with a local email-draft brief.

Project descriptions were checked against the public repository READMEs on 30 October 2026. No employment, business impact, production uptime, or client testimonials are inferred from portfolio code. Sample graphics are illustrative.

## Build and run

Requires Node.js 22 or later. There are no application dependencies.

```sh
npm run build
npm run check
npm run dev
```

Deploy the generated `dist/` directory. `vercel.json` and `firebase.json` are included. See [deployment instructions](docs/DEPLOYMENT.md) for Vercel import and Firebase Hosting commands.

Edit `content/` and `src/`, then rebuild. The static generator creates the complete site; no visitor needs JavaScript for the main page content or repository links. JavaScript adds directory search and filters, themes, and interactive examples.

See the [documentation index](docs/README.md) for architecture, design tokens, content editing, deployment, and provenance.

No package installation is required. Run the build before deploying. No visitor analytics or tracking is included. Theme and animation preferences are saved in browser local storage.

See [preview sources and accessibility](docs/preview-sources.md) for report provenance and interaction details.

See [portfolio migration](docs/portfolio-migration.md) for source provenance and project preview coverage.
