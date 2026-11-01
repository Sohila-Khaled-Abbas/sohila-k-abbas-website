# Maintain the portfolio content

Work in `portfolio-site/` when using the GitHub repository. Run the build and checks after editing content or templates.

## Profile and experience

Edit `content/profile.json`. Keep job titles, dates, organizations, and education grounded in the owner's records. Use the full professional headline supplied by Sohila. Add measured results only when their method and source are available. The résumé uses the same profile data as the About page.

## Add an original project

1. Add or refresh its public metadata in `content/repositories.json`. Keep private repositories out of the public snapshot.
2. Add its matching record to `content/project-details.json`. The `repo` value must match the repository name exactly.
3. Provide the title, summary, technologies, public source URL, real branch name, and public file links. Add documented implementation steps when available.
4. Use a real asset in `src/assets/project-media/` or a concise documented workflow. Source-file previews are generated when no image or workflow is available.
5. Add a case study to `content/cases.json` or `content/additional-cases.json` only when there is enough technical evidence for a meaningful narrative.
6. Run `npm run build` and `npm run check`. The latter requires a preview record for every original repository.

Forked learning resources remain labeled as forks and retain their upstream links. An empty repository should say that no source files are available.

## Add a Power BI report

Edit `content/project-previews.json` with the report's project name, source, file links, and available screenshots. Keep image captions and alt text specific. A published `/view?r=...` link can use `live.access: "public"`; a shared workspace report requiring Microsoft sign-in must stay labeled `sign-in` and must not be embedded as public content.

Add screenshots to `src/assets/previews/` as optimized WebP files. Keep their report content unchanged. If a screenshot is captured from the public report rather than a repository file, retain its `source_url` and capture date. Do not create new Power BI sharing permissions while merely editing the site.

## Maintain project status

`content/project-status.json` is editorial. Add or remove in-progress entries when Sohila confirms the work status. GitHub update timestamps do not imply completion or active work.

## Learning and community

Use `content/community.json` for mentoring/community roles and `content/credentials.json` for the grouped learning collection. The current course log uses `content/learning.json`; recommendations and dated public recognition use `content/professional-evidence.json`. See [learning and evidence sources](LEARNING_AND_EVIDENCE.md). Keep completion dates and formal certification claims separate from course names, practice tracks, and platform links. Dated training belongs in the profile record.

## Change the design

Start with `src/assets/theme.css` and [the design system](DESIGN_SYSTEM.md). Keep portrait and project image colors unchanged. Update `src/assets/favicon.svg`, the SVG/PNG social card, and browser theme colors when changing the brand palette.

## Validate and publish

```sh
npm run build
npm run check
npm run dev
```

Check the changed pages in light/dark themes and at mobile/desktop widths. Use a branch and pull request. Vercel publishes `main` through its Git integration after the change is merged; verify the resulting production deployment.

## Business inquiries

Contact privacy and business access follow [BUSINESS_INQUIRIES.md](BUSINESS_INQUIRIES.md). Keep the owner’s phone and old CV archive links out of public contact pages. Business approvals are maintained separately from repository/project content and require actual review.

## Interactive About and LinkedIn posts

Use `content/about-systems.json` for workflow nodes and existing project evidence. The four counters derive from the published project, case-study, report, and enrolled-course records. Keep diagrams conceptual and avoid implying a project uses a tool unless its source supports that statement.

Use `content/linkedin-posts.json` for recent and popular writing, verified official embed URLs, and dated public engagement counts. Keep summaries in the owner’s voice. Respect `content/sync-policy.json` during all profile updates. See [automation behavior and limits](AUTOMATION.md).
