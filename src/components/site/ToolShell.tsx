import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "./SiteLayout";

export function ToolShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All tools
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight">
              {title}
            </h1>
            <p className="mt-4 text-muted-foreground">{description}</p>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
        <div className="mt-10 animate-fade-in-up">{children}</div>
      </section>
    </SiteLayout>
  );
}
