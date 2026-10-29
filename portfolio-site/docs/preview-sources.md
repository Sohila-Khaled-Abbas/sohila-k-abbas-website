# Dashboard previews and project status

`content/project-previews.json` records 21 reporting projects found in the public GitHub repositories. It contains the original repository, README, available PBIX/PBIP/PDF/HTML files, screenshot paths, and report links. No private repository content is included.

The public Power BI URLs for Smart Supply Chain, Wuzzuf, and Apple were copied from their READMEs. HR Attendance uses a shared report URL that requires Microsoft sign-in; it is linked but never embedded. Other projects link to the available report files. No new Power BI sharing permissions or embed codes were created.

Screenshot assets are taken from each project's repository. Emergency Room is rendered from its existing PDF export. The FMCG PDF contains an unsupported-visual message, so it is linked as a file and is not used as a screenshot. All displayed images are format-optimized WebP copies with the report content preserved. File-only entries use a clearly labeled placeholder, not a fabricated dashboard.

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
