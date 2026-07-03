import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { absoluteUrl } from "@/lib/site";
import { liveToolDefinitions, toolPath } from "@/lib/tool-config";

const staticEntries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/tools", changefreq: "weekly", priority: "0.9" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
  { path: "/dashboard", changefreq: "monthly", priority: "0.3" },
] as const;

const toolEntries = liveToolDefinitions.map((tool) => ({
  path: toolPath(tool.slug),
  changefreq: "monthly",
  priority: tool.slug === "resume-ats" ? "0.95" : "0.9",
}));

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = [...staticEntries, ...toolEntries].map(
          (entry) => `  <url>
    <loc>${absoluteUrl(entry.path)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
