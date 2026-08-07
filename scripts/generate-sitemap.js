import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://sohila-k-abbas-website.web.app";

const entries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/templates", changefreq: "weekly", priority: "0.8" },
  { path: "/intake", changefreq: "monthly", priority: "0.8" },
];

function generateSitemap(entries) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml generated (${entries.length} entries)`);
