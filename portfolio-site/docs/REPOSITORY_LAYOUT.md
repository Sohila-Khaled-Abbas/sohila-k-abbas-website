# GitHub source location

The finished portable site is in `portfolio-site/` inside the existing `Sohila-Khaled-Abbas/sohila-k-abbas-website` GitHub repository.

Use `portfolio-site` as Vercel’s **Root Directory**. Its build command is `npm run build`; its output directory is `dist`. The `vercel.json` in that directory provides both values.

For Firebase Hosting, open a terminal in `portfolio-site`, build the site, and deploy with an explicit `--project` value. `portfolio-site/firebase.json` supplies the static Hosting configuration.

The current site’s own editable source is independent of this GitHub copy. Keep future changes in the GitHub folder when using Vercel or Firebase as the main host.
