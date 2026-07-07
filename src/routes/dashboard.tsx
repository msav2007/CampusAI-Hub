import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Braces, Calculator, Sparkles, Wrench } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { buildPageHead } from "@/lib/seo";
import { comingSoonTools, liveTools, toolCounts } from "@/lib/tools-data";

const previewComingSoon = comingSoonTools.slice(0, 3);
const allToolsLive = toolCounts.comingSoon === 0;

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    ...buildPageHead({
      title: "Workspace Preview - CampusAI Tools",
      description: allToolsLive
        ? "All 11 CampusAI tools are now live. Accounts are still on the roadmap, but every browser workflow already works today with no signup."
        : "A preview of the CampusAI Tools workspace. Accounts and saved history are still in development; live tools work today with no signup.",
      path: "/dashboard",
      noIndex: true,
    }),
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Early access</p>
            <h1 className="mt-2 truncate font-display text-4xl tracking-tight sm:text-5xl">
              Your <span className="text-gradient">workspace preview</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              {allToolsLive
                ? `All ${toolCounts.live}/${toolCounts.total} tools are now live with no signup required.`
                : "Accounts and saved history are still coming soon. The live tools already work today with no signup required."}
            </p>
          </div>
          <Link
            to="/tools"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Browse tools
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: Calculator, label: "Tools live now", value: String(toolCounts.live) },
            {
              icon: Sparkles,
              label: allToolsLive ? "Tools completed" : "Tools in development",
              value: allToolsLive
                ? `${toolCounts.live}/${toolCounts.total}`
                : String(toolCounts.comingSoon),
            },
            { icon: Wrench, label: "Signups required", value: "0" },
            { icon: Braces, label: "Price today", value: "Free" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl glass p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-2">
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-brand-2">Today</span>
              </div>
              <p className="mt-4 font-display text-3xl tracking-tight">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className={allToolsLive ? "lg:col-span-3" : "lg:col-span-2"}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Live tools</h2>
              <Link to="/tools" className="text-xs text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {liveTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <Link
                    key={tool.slug}
                    to={tool.href}
                    search={{}}
                    className="flex items-center gap-3 rounded-2xl glass p-4 transition-colors hover:bg-foreground/5"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-brand shadow-glow">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{tool.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Available now - No signup
                      </p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>

          {allToolsLive ? (
            <div className="lg:col-span-3">
              <div className="rounded-2xl glass p-5 shadow-card">
                <h2 className="text-lg font-semibold tracking-tight">Launch status</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The full {toolCounts.live}/{toolCounts.total} tool lineup is live. Accounts and
                  team workflows can still evolve later, but every core browser-based tool is
                  already usable today.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-lg font-semibold tracking-tight">Coming soon</h2>
              <div className="rounded-2xl glass p-2 shadow-card">
                {previewComingSoon.map((tool, index) => {
                  const Icon = tool.icon;

                  return (
                    <div
                      key={tool.slug}
                      className={`flex items-start gap-3 p-3 ${
                        index !== previewComingSoon.length - 1 ? "border-b border-border/60" : ""
                      }`}
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-surface-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{tool.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {tool.category} - In development
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div className="border-t border-border/60 p-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Saved history, accounts, and more AI workflows are still on the roadmap.{" "}
                    <Link
                      to="/contact"
                      className="text-foreground/80 underline-offset-2 hover:text-foreground hover:underline"
                    >
                      Tell us what to build next
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
