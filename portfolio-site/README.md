# Sohila Khaled Abbas — Data & Analytics Engineer | Machine Learning Engineer

A complete, portable personal portfolio for Sohila Khaled Abbas: data and analytics engineering, machine learning, business intelligence, ETL/ELT, data warehousing, automation, and practical learning.

## Content

- Dedicated home, work, dashboards, about, résumé, learning, and contact pages.
- Twenty-one permanent reporting project pages with 14 real screenshots, three click-to-load public Power BI reports, one labeled sign-in link, and available project files.
- Explicit in-progress status for PixelFed and the n8n queue setup.
- Twelve permanent project case-study pages.
- A searchable directory of 91 accessible public GitHub repositories, including clearly attributed forks.
- An interactive three-step retail example with explicitly invented records.
- About, learning resources, and verified professional contact links.
- Animated hero with technology logos, pause and reduced-motion support; responsive navigation, keyboard screenshot dialogs, light/dark themes, and a print-friendly résumé.
- Shareable filters, copyable project links, and a 1200 × 630 social preview card.

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

See [content provenance](docs/CONTENT_SOURCES.md) for the source boundaries and accuracy rules.

No package installation is required. Run the build before deploying. No visitor analytics or tracking is included. Theme and animation preferences are saved in browser local storage.

See [preview sources and accessibility](docs/preview-sources.md) for report provenance and interaction details.
