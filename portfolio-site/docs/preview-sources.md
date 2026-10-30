# Dashboard previews and project status

`content/project-previews.json` records 22 reporting projects from the public GitHub repositories and the owner's previous portfolio. It contains available repository/README links, PBIX/PBIP/PDF/HTML files, screenshot paths, and report links. Mobile Technical Support Analytics comes from the previous portfolio and has no invented repository. No private repository content is included.

Twelve existing public Power BI view URLs were recovered from project READMEs and the previous portfolio. They are offered as click-to-load reports with direct links. HR Attendance now uses its recovered public report; its previous Microsoft sign-in share URL remains a separately labeled alternate link. Other projects link to the available report files. No new Power BI sharing permissions or embed codes were created.

The collection has 17 preview images. Most are taken from repository assets; Emergency Room is rendered from its existing PDF export. Apple, FMCG, and Mobile Technical Support use actual public report home views captured on 30 October 2026. The older FMCG PDF containing an unsupported-visual message is not a preview or a published file link. Images are format-optimized WebP copies with the report content preserved. File-only entries use a clearly labeled placeholder, not a fabricated dashboard.

All 75 original repositories also have permanent project preview pages. In addition to report screenshots, nine actual architecture/model/chart assets support project previews. Other pages show a documented workflow or real source-file paths. Sixteen learning forks retain upstream attribution. Preview types are labeled and do not imply running infrastructure.

`content/project-status.json` marks only PixelFed and the n8n queue setup as in progress, based on Sohila's current work discussed in the conversation. Repository update times do not determine project status. Edit these two records as work changes.

## Logos

Python, Apache Airflow, Databricks, PostgreSQL, and Docker SVGs come from Sohila's public profile repository (`assets/icons/`). dbt and Power BI come from Simple Icons 11.0.0; Apache Spark and n8n come from the Simple Icons repository. Simple Icons artwork is CC0; trademarks belong to their respective owners. Logos identify technologies used and do not imply affiliation. SQL uses the PostgreSQL mark and PySpark uses the Apache Spark mark.

## Profile additions

The supplied LinkedIn profile PDF corroborates Kimball dimensional modeling, scikit-learn, and Obsidian. These skills were added without replacing the existing biography, headline, education, or experience timeline. Private contact details and unsupported ranking or performance claims were not published.

## Interaction and accessibility

- Reports load from Microsoft only after a visitor chooses the interactive view.
- Every available report has a permanent page and a direct repository link.
- Screenshot dialogs use native focus containment, Escape to close, and arrow-key navigation.
- Hero animation has a persistent pause control, honors reduced motion, and pauses off screen or in background tabs.
- Search and filtering retain their state in shareable URLs; all projects and links are present in server-rendered HTML.

The social card is an original 1200 × 630 design, committed as SVG and PNG for link previews.

The portrait-inspired palette is documented in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Dashboard screenshots and official logos retain their source colors.
