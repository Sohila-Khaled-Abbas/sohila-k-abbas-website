# Profile and social content updates

## Public GitHub projects

The existing [project synchronization](AUTOMATIC_PROJECT_SYNC.md) runs hourly through GitHub Actions. It discovers public repositories, refreshes source metadata and changed README excerpts, creates preview pages for new original repositories, and builds and checks the complete site before committing. Vercel deploys validated changes on `main`. Visitor-side metadata refresh has a 15-minute cache. Scheduled GitHub jobs can be delayed.

About-page repository counts are derived from the same published catalog. Case-study and reporting counts come from their own source records. Project status, case-study narratives, screenshots, and course completion remain editorial: repository activity does not establish completion or business impact.

## LinkedIn public-source check

The requested daily portfolio check uses public, verifiable profile and post information when available. Compare it with `content/profile.json`, `content/linkedin-posts.json`, and `content/professional-evidence.json`. Keep the last verified values if LinkedIn blocks retrieval, a post is unavailable, or the author cannot be established. Do not replace an inaccessible source with an assumption. Keep engagement snapshots dated.

This is a best-effort public-source check, not guaranteed real-time access to every LinkedIn profile change or new post. [Sign In with LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2) provides basic identity scopes; it does not grant a member-post feed. Reading member posts through the [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-10) requires approved restricted access to `r_member_social`. A normal sign-in or unrelated plugin does not supply that permission.

Never export browser cookies, session tokens, private analytics, or hidden account data to implement synchronization. If an approved LinkedIn integration becomes available, connect it through its official authorization flow and retain these content protections.

## Official post previews

`content/linkedin-posts.json` stores public original-post URLs, independently verified official embed URLs, editorial summaries, and dated public reaction/comment counts. Activity IDs and embed IDs can differ: do not derive one from the other. If an official embed URL is unavailable, retain a clear original-post link.

`/posts/` shows recent updates and selected popular writing. An embed is created only after the visitor selects **Load LinkedIn preview**. Closing it removes the iframe. The optional embed retrieves LinkedIn-managed content at viewing time; it does not discover new posts. Direct source links remain available if the preview is blocked.

## Owner-maintained protections

Apply `content/sync-policy.json` before importing profile changes. It keeps experience owner-maintained, protects the selected experience list with a checksum, blocks disallowed community-link hosts, preserves contact privacy, and distinguishes enrollment from completion. Do not import experience automatically. Update the experience checksum only after the owner approves a revised list. Never publish the owner’s phone, old CV archive, private account analytics, local inquiry fixtures, or unreviewed business approvals.

Update only supported facts, validate the active `portfolio-site/` app, review the diff, and verify the Vercel production deployment after merging. Preserve unrelated edits and the existing approved-business contact flow.
