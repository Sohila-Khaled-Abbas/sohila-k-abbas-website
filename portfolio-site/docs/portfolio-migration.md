# Content migration and preview coverage

Source: Sohila's original public portfolio at `https://sohila-k-abbas-website.web.app/`, reviewed on 30 October 2026 through its rendered page and the original components in the root of `Sohila-Khaled-Abbas/sohila-k-abbas-website`.

The Vercel portfolio remains in `portfolio-site/`; the original application is preserved.

## Content added

- Data Analytics Mentor at Data Pill, July 2025–April 2026, in addition to the existing experience entries.
- Specific technical activities from the old experience section, with the existing role titles and dates retained.
- TechZone mentoring, The Data Tea, and Notion Egypt Community workshops.
- The original certificate collection, grouped coursework and credential names, CV archive link, and additional toolkit items.
- Public dashboard URLs, project presentations, and Streamlit app links from the original project collection.
- Sohila's existing portrait, used without changing facial features.

No anonymous testimonials, creator rankings, follower counts, or unsubstantiated business-impact percentages were migrated. The credentials page groups course, platform, practice-track, and credential names; it does not invent completion dates or certificate IDs. The dated training section remains separate.

## Project coverage

`content/project-details.json` contains every original repository in the existing 91-repository directory: 75 original repositories, with the 16 learning forks separately labeled. Its file paths and branch names were checked against current public repository metadata and trees. The empty Airbnb Athens repository is explicitly labeled and excluded from indexing; no implementation is invented.

The old Stock Price Data Pipeline URL (`udemy_airflow`) redirects to repository ID 1206219261, already present in the directory as `Stock-Price-Data-Pipeline`. Its entry uses the current repository name. DeepClean OS maps to `deep-clean-data-tool`. The Apple RAG project's title and explanation follow the current technical-support README rather than the old financial-filings description. The n8n queue stack is described as a queue/worker setup rather than as 74 deployed workflows.

Each original repository has a permanent project preview page. Previews use a real saved dashboard screenshot, a real repository architecture/model/chart asset, a concise workflow overview based on documentation, or actual source-file paths. These types are labeled. A source preview is not a screenshot or proof of running infrastructure.

The reporting collection now contains 22 projects and 17 preview images. Apple, FMCG, and Mobile Technical Support use screenshots captured from their published Power BI home views on 30 October 2026; the remaining report images come from repository assets and the Emergency Room PDF. Twelve public Power BI view URLs are available from the combined sources. The nine newly recovered links were opened through the site and confirmed to render their report pages. HR's previous authenticated share link remains available separately. Mobile Technical Support Analytics is sourced from the previous portfolio and has no fabricated GitHub repository or downloadable report file.

## Design and interaction

- Portrait-led ivory, taupe, cocoa, and muted burgundy home, with warm copper details and real project imagery. Shared light/dark tokens and contrast measurements are documented in [the design system](DESIGN_SYSTEM.md).
- Distinct project covers, large case-study previews, file browsers, and toolkit links.
- Searchable gallery/list views, shareable filters, and an accessible project finder with Ctrl/Command+K.
- Native image dialogs, keyboard navigation, reduced-motion support, pause controls, and responsive navigation.
- Community, credentials, and remote-collaboration pages.
- Project-brief form prepares a local mailto draft; it does not submit visitor information to a server or send mail automatically.

All source and generated routes use the same dependency-free static build. The canonical production origin remains `https://sohila-khaled-abbas.vercel.app`.
