import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Lock } from "lucide-react";
import type { CSSProperties, MouseEvent } from "react";

import type { Tool } from "@/lib/tools-data";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const isLive = tool.status === "live";

  const handleMove = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--y", `${event.clientY - bounds.top}px`);
  };

  const inner = (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at var(--x) var(--y), oklch(0.72 0.18 285 / 0.18), transparent 40%)",
        }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/80 bg-surface-2 shadow-inner transition-transform group-hover:scale-105">
          <Icon className="h-5 w-5 text-foreground/90" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-1.5">
          {tool.badge && (
            <span className="rounded-full border border-brand-2/20 bg-brand-2/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand-2">
              {tool.badge}
            </span>
          )}
          {tool.popular && (
            <span className="rounded-full border border-foreground/10 bg-foreground/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground/80">
              Popular
            </span>
          )}
          {isLive ? (
            <ArrowUpRight
              className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden="true"
            />
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
          )}
        </div>
      </div>
      <h3 className="relative mt-4 text-[15px] font-semibold tracking-tight">{tool.name}</h3>
      <p className="relative mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {tool.description}
      </p>
      <div className="relative mt-4 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="text-xs text-muted-foreground">{tool.category}</span>
        <span className="text-xs text-foreground/70 transition-colors group-hover:text-foreground">
          {isLive ? "Open →" : "Coming soon"}
        </span>
      </div>
    </>
  );

  const className =
    "group relative block overflow-hidden rounded-2xl glass p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0";

  if (!isLive) {
    return (
      <div
        onMouseMove={handleMove}
        aria-label={`${tool.name} — coming soon`}
        style={{ "--x": "50%", "--y": "0%" } as CSSProperties}
        className={`${className} cursor-not-allowed opacity-90`}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      to={tool.href}
      search={{}}
      onMouseMove={handleMove}
      aria-label={`${tool.name} — ${tool.description}`}
      style={{ "--x": "50%", "--y": "0%" } as CSSProperties}
      className={className}
    >
      {inner}
    </Link>
  );
}
