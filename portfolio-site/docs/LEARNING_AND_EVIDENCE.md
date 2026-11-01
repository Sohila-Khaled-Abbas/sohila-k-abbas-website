# Learning, recommendations, and professional evidence

The November 2026 update adds two routes:

- `/learning/`: a searchable course log with subject filters, shareable filter URLs, public course links, related project evidence, and clearly proposed next-practice ideas.
- `/recruiters/`: a concise professional overview connecting three areas of work to public projects, roles and dates, remote work preferences, and the existing approved-business contact flow.

The home page, About, résumé, learning hubs, credential page, and main navigation link these views together. The Community page contains public professional recommendations and source-linked recognition.

## Maintain the source records

| File | Purpose |
| --- | --- |
| `content/learning.json` | Course titles, instructors, public URLs, enrollment status, topics, and related project repositories. |
| `content/professional-evidence.json` | Recommendation authors, short excerpts, dates, source URLs, audience snapshot, and historical recognition. |
| `content/recruiter-guide.json` | Professional focus areas and the public projects a hiring team can inspect. |
| `content/profile.json` | Existing experience and dates, plus the current ML focus and review date. |

Course enrollment was confirmed by Sohila on 1 November 2026. Course descriptions and instructor names were checked against the public Udemy course pages. Do not infer completion percentages, enrollment dates, exams passed, or certificates earned. The seven courses remain labeled **Enrolled**. Related projects are adjacent evidence, not claims that a course assignment or capstone is complete. Next-practice ideas are explicitly proposed exercises.

Public catalog pages:

- [Excel VBA and macros](https://www.udemy.com/course/excel-vba-and-macros-course/)
- [dbt bootcamp](https://www.udemy.com/course/complete-dbt-data-build-tool-bootcamp-zero-to-hero-learn-dbt/)
- [Apache Airflow](https://www.udemy.com/course/the-ultimate-hands-on-course-to-master-apache-airflow/)
- [Big data engineering with GCP and Azure](https://www.udemy.com/course/big-data-engineering-bootcamp-with-gcp-and-azure-cloud/)
- [Operating systems](https://www.udemy.com/course/fundamentals-of-operating-systems/)
- [Docker containers in Arabic](https://www.udemy.com/course/a-practical-guide-to-docker-containers/)
- [Database engineering](https://www.udemy.com/course/database-engines-crash-course/)

The learning page uses Schema.org `Course` items in an `ItemList`, describing the courses rather than awarding Sohila a credential. Course prices, ratings, completion percentages, and borrowed course videos are intentionally absent.

## Recommendations and public recognition

The [received LinkedIn recommendations](https://www.linkedin.com/in/sohilakabbas/details/recommendations/) were inspected in the owner's connected browser on 1 November 2026. The selected recommendations by Mohammed Adham, Omar Magdy, and Waleed Mouhammed were visibly shared with **All LinkedIn members**. Each card keeps its author, date, a brief exact excerpt, a paraphrased summary, and a link to the original recommendation view. LinkedIn may require sign-in to read that view.

The LinkedIn follower count is a dated profile snapshot, not a live counter or an estimate of project impact. Do not copy private profile analytics, recruiter-only settings, notifications, or other account information into public content.

[TechZone's public spotlight](https://ae.linkedin.com/posts/techzone1_careershift-womenindata-analyticsengineering-activity-7411101120615415808-lpsC) describes Sohila's 2025 community work and reports several Favikon rankings. The portfolio attributes those historical rankings to TechZone and retains their separate category and geographic scopes.

Further full-list research found two accessible records, each linking to the correct `sohilakabbas` profile: Antony Martini’s worldwide Data Science list places Sohila at #145 in the author’s 141–150 comment; Eslam Tarek’s 51–80 comment on Eslam Abdallah’s Egypt-wide LinkedIn list places her at #59, with a list date of 23 January 2026 in the post. These are shown as separately attributed historical snapshots, without presenting either as a live Favikon measurement.

A search-indexed post by Abdelrahman Eldesouky describes an Arabic-speaking worldwide Data Science list dated 29 May 2026 and names Sohila fourth. Direct LinkedIn navigation reported that post deleted or removed, and its shortened PDF link did not open the report. The record is therefore documented here as an indexed historical mention and was not added as an accessible source card on the public site.

The current [Favikon Egypt BI & Data Viz public ranking](https://app.favikon.com/public/ranking/creators/tech-software_bi-data-viz_linkedin_egypt/) was also inspected. Its limited public preview did not establish Sohila's current position. A current #1 or #2 claim was therefore not imported from her profile or older portfolio. Add a current ranking only after an original, dated Favikon record establishes the exact platform, niche, geography, and rank. Historical secondary reporting is not a substitute for that record.

The supplied LinkedIn PDF supported the additional ML focus on leakage-aware evaluation and target-derived features. Selected roles and dates follow the owner-maintained profile and its explicit exclusions. Numerical impact claims and model-performance claims were not added without a reproducible method and source. The PDF itself was not published because it contains personal contact details.

## Research behind the features

- [Nielsen Norman Group: creating a portfolio](https://www.nngroup.com/articles/ux-design-portfolios/) supports scannable, relevant project narratives that explain the problem, role, process, and constraints. Applying that principle to a data portfolio is a design judgment; the recruiter overview makes the evidence easier to find.
- [W3C WAI: page structure](https://www.w3.org/WAI/tutorials/page-structure/) informed labeled regions, meaningful headings, native controls, keyboard interaction, and readable groupings.
- [Schema.org: Course](https://schema.org/Course) defines course metadata. It does not establish the learner's completion or certification.

The website keeps its established warm palette and existing motion controls. The new sections use static HTML, a small local filter script, and no extra analytics. LinkedIn previews are optional and load only after a visitor chooses a preview. Search values are inserted through text properties, and filter state is kept in the URL. All course cards remain available without JavaScript.

## Verify an edit

Run `npm test`, `npm run build`, and `npm run check` from `portfolio-site/`. The content checks require public project connections, canonical course URLs, clear enrollment status, attributed recommendations, and historical ranking context. Check search, filter combinations, empty-state recovery, URL persistence, native disclosures, mobile widths, and both themes in the browser.

Business verification, the encrypted approval registry, and contact privacy remain governed by [BUSINESS_INQUIRIES.md](BUSINESS_INQUIRIES.md).
