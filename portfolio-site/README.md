# Sohila Khaled Abbas — Data & Analytics Engineer | Machine Learning Engineer

A complete, portable personal portfolio for Sohila Khaled Abbas: data and analytics engineering, machine learning, business intelligence, ETL/ELT, data warehousing, automation, and practical learning.

## Content

- Dedicated home, work, about, résumé, learning, and contact pages.
- Twelve permanent project case-study pages.
- A searchable directory of 91 accessible public GitHub repositories, including clearly attributed forks.
- An interactive three-step retail example with explicitly invented records.
- About, learning resources, and verified professional contact links.
- Responsive navigation, keyboard-accessible tabs, light/dark themes, email copying, a print-friendly résumé, and a custom 404 page.

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

No package installation or build step is needed. No visitor analytics or tracking is included. Only the theme preference is saved in browser local storage.
