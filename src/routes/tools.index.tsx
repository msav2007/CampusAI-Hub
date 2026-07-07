import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ToolCard } from "@/components/site/ToolCard";
import { buildPageHead } from "@/lib/seo";
import { categories, toolCounts, tools } from "@/lib/tools-data";

const allToolsLive = toolCounts.comingSoon === 0;

export const Route = createFileRoute("/tools/")({
  head: () => ({
    ...buildPageHead({
      title: "All Tools - CampusAI Tools",
      description:
        "Browse every CampusAI tool across academics, career, developer workflows, and productivity.",
      path: "/tools",
    }),
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number] | "All">("All");

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = category === "All" || tool.category === category;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      tool.name.toLowerCase().includes(normalizedQuery) ||
      tool.description.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">The library</p>
          <h1 className="mt-3 font-display text-5xl tracking-tight sm:text-6xl">
            All <span className="text-gradient">tools</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            {allToolsLive
              ? `${toolCounts.live}/${toolCounts.total} tools are live today.`
              : `${toolCounts.live} tools are live today and ${toolCounts.comingSoon} more are in active development.`}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools..."
              className="w-full rounded-xl glass px-9 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-brand/40"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["All", ...categories] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  category === value
                    ? "border-transparent bg-foreground text-background"
                    : "border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
        {filteredTools.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">
            No tools match &quot;{query}&quot;.
          </div>
        ) : null}
      </section>
    </SiteLayout>
  );
}
