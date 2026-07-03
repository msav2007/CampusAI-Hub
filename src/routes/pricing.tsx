import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { buildPageHead } from "@/lib/seo";
import { toolCounts } from "@/lib/tools-data";

const tiers = [
  {
    name: "Free",
    price: "$0",
    tag: "Available today",
    features: [
      `${toolCounts.live} live browser tools`,
      "No signup required",
      "Runs entirely in your browser",
      "Free for current launch",
    ],
    cta: "Browse tools",
    link: "/tools" as const,
    highlight: true,
  },
  {
    name: "Pro",
    price: "Soon",
    tag: "Planned",
    features: [
      "AI-powered tools",
      "Saved history and sync",
      "Higher usage limits",
      "Priority support",
    ],
    cta: "Request early access",
    link: "/contact" as const,
    highlight: false,
  },
  {
    name: "Campus",
    price: "Soon",
    tag: "Planned",
    features: ["Team workspaces", "Shared tool access", "Admin controls", "Campus onboarding"],
    cta: "Get in touch",
    link: "/contact" as const,
    highlight: false,
  },
];

export const Route = createFileRoute("/pricing")({
  head: () => ({
    ...buildPageHead({
      title: "Pricing — CampusAI Tools",
      description:
        "CampusAI Tools is free today. Live browser tools require no signup, and future paid plans will be announced before launch.",
      path: "/pricing",
    }),
  }),
  component: Pricing,
});

function Pricing() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          Simple, honest pricing
        </div>
        <h1 className="mt-6 font-display text-5xl tracking-tight sm:text-6xl">
          Free today. <span className="text-gradient">Fair tomorrow.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Everything live right now is free with no signup. If we launch paid plans later, we will
          publish the pricing before anything changes.
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl p-8 shadow-card ${
                tier.highlight ? "glass-strong ring-1 ring-brand/40" : "glass"
              }`}
            >
              {tier.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-primary-foreground">
                  Available now
                </span>
              ) : null}
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{tier.tag}</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl tracking-tight">{tier.price}</span>
                {tier.price === "$0" ? (
                  <span className="text-sm text-muted-foreground">/launch</span>
                ) : null}
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={tier.link}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity ${
                  tier.highlight
                    ? "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Pro and Campus tiers are not live yet. We will announce pricing clearly before any public
          rollout.
        </p>
      </section>
    </SiteLayout>
  );
}
