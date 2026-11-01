# Interactive project stories

All original repository pages and reporting pages use the same accessible guided reader. Each story connects the project's question, approach, available result, and source evidence. The content remains specific to the project; the shared interface makes it easier to inspect.

## Content and accuracy

- `content/project-details.json` provides the canonical name, summary, documented methods, workflow, technologies, previews, and public source inventory.
- `content/cases.json` and `content/additional-cases.json` provide the deeper question, approach, takeaway, and scope notes for the twelve editorial case studies.
- `content/project-previews.json` provides actual report images, public or sign-in report access, presentations, and report files.
- `content/project-status.json` remains the only authority for an **In progress** label. Source activity does not establish status or completion.

Source-only projects remain source overviews. Empty repositories explicitly say that no implementation/result is published. Never create client impact, performance figures, screenshots, or implementation steps to fill an empty chapter. Existing synthetic-scenario and virtual-experience context stays visible below the reader, whichever chapter is selected.

The linked inventory combines project and report files, deduplicated by URL. Visitors can search filenames and filter documentation, code/configuration, data, or report/model artifacts. The inventory describes linked files rather than claiming to enumerate the complete upstream tree. Related projects are selected using shared technologies and subject, rather than showing the same unrelated projects everywhere.

## Interaction

`scripts/project-story.mjs` renders the content; `src/assets/project-story.js` adds chapter navigation, previous/next controls, full-story mode, current-chapter links, history support, and source-file filters. The reading-position indicator describes navigation through the story, not project completion.

Chapter anchors are shareable (`#story-question`, `#story-build`, `#story-result`, `#story-evidence`). Existing `#problem`, `#approach`, `#explore`, and `#project-files` anchors continue to select the matching chapter. Report interactions remain optional: only explicitly public Power BI views can load, after visitor interaction. The updated Python roadmap and coding-lab link remains intact.

Without JavaScript, all chapters and source links remain visible. Printing expands all chapters and all linked files. The layout supports keyboard controls, light/dark themes, phone widths, and reduced-motion preferences. No additional third-party scripts, frameworks, or analytics are introduced.

## Naming and automatic updates

Kickstarter uses **Kickstarter Analytics Engineering Platform** consistently in the project directory, project page, case study, search index, related work, and metadata. Two other titles imported from setup instructions were corrected to **Kafka Cluster Lab** and **Local Data Aggregator**.

`readmeTitle()` in `scripts/sync-github.mjs` reads Markdown or HTML H1 headings outside comments and backtick/tilde code fences. It ignores terminal/setup headings and falls back to the repository name when there is no appropriate heading. Curated names remain unchanged during source refresh. Regression tests cover the original fenced `# Windows:` failure, HTML headings, nested fence lengths, and title preservation.

New original repositories automatically receive the story interface when the existing hourly sync generates their static project page. Existing curated narratives, contact privacy, and approved-business inquiry requirements remain unchanged.

## Validation

Run `npm test`, `npm run build`, and `npm run check` from the active app directory. Content checks require four chapters on every original project/report page, canonical names, retained source links, and no automatic external iframes. In the browser, verify chapter navigation and history, direct chapter links, full-story mode, file search and empty-state recovery, report access links, screenshots, phone layout, and both themes.
