import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, ShieldCheck, Zap } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { buildPageHead } from "@/lib/seo";
import { toolCounts } from "@/lib/tools-data";

const allToolsLive = toolCounts.comingSoon === 0;

const values = [
  {
    icon: Heart,
    title: "Free by default",
    body: "Every live tool stays free today. We would rather be useful than noisy.",
  },
  {
    icon: ShieldCheck,
    title: "Honest and transparent",
    body: allToolsLive
      ? "We tell you what is live, what stays local, and where the roadmap goes next."
      : "We tell you what is live, what is in development, and how your data is handled.",
  },
  {
    icon: Zap,
    title: "Built to ship",
    body: "Focused tools that solve one real student problem quickly in the browser.",
  },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    ...buildPageHead({
      title: "About - CampusAI Tools",
      description:
        "CampusAI Tools is an early-stage project building honest browser-based productivity tools for students and developers.",
      path: "/about",
    }),
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Our story</p>
        <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          Free tools for students, <span className="text-gradient">built in the open.</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          CampusAI Tools is an early-stage project. We started with the tools students actually use
          every week, like CGPA, attendance, resume, and JSON workflows, and we are growing from
          there one trustworthy release at a time.
        </p>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="rounded-2xl glass p-6 shadow-card">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand shadow-glow">
                <value.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-4xl px-4">
        <div className="rounded-3xl glass-strong p-10 shadow-card sm:p-14">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-3xl tracking-tight">Where we are today.</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                A small team shipping browser-based tools for students and developers. All core
                tools work today, and local history is already live in supported workflows. Accounts
                and team flows are still on the roadmap.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: String(toolCounts.live), label: "tools live" },
                {
                  value: allToolsLive
                    ? `${toolCounts.live}/${toolCounts.total}`
                    : String(toolCounts.comingSoon),
                  label: allToolsLive ? "core tools live" : "tools in development",
                },
                { value: "$0", label: "free today" },
                { value: "0", label: "signup needed" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border p-4">
                  <p className="font-display text-2xl text-gradient">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-3xl px-4 text-center">
        <h3 className="font-display text-3xl tracking-tight sm:text-4xl">
          Want to shape what we build next?
        </h3>
        <p className="mt-3 text-muted-foreground">
          Tell us which workflow is costing you the most time right now. We read every message.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Get in touch
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 rounded-xl glass px-5 py-2.5 text-sm font-medium hover:bg-foreground/10"
          >
            Browse tools
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
