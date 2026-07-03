import type { ReactNode } from "react";
import { SiteLayout } from "./SiteLayout";

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="prose-invert mt-10 space-y-6 text-[15px] leading-relaxed text-foreground/85 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul>li]:text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
      </section>
    </SiteLayout>
  );
}
