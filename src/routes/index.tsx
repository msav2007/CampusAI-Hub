import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  GraduationCap,
  LineChart,
  Lock,
  Minus,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Target,
  Wand2,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ToolCard } from "@/components/site/ToolCard";
import { buildPageHead, jsonLdScript } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { categories, liveTools, toolCounts, tools } from "@/lib/tools-data";

const faqs = [
  {
    q: "Is CampusAI Tools really free?",
    a: "Yes. Every live tool is free today with no credit card and no paywall.",
  },
  {
    q: "Do I need an account to use the tools?",
    a: "No. Open any live tool and start immediately.",
  },
  {
    q: "How is my data handled?",
    a: "Live tools run in your browser and do not upload your inputs to our servers.",
  },
  {
    q: "Which tools are available today?",
    a: `${liveTools.map((tool) => tool.name).join(", ")} are live right now.`,
  },
  {
    q: "Can I request a new tool?",
    a: "Yes. Send us a note from the Contact page and tell us which workflow is slowing you down.",
  },
];

const allToolsLive = toolCounts.comingSoon === 0;

const stats = [
  { value: String(toolCounts.live), label: "Tools live now" },
  {
    value: allToolsLive ? `${toolCounts.live}/${toolCounts.total}` : String(toolCounts.comingSoon),
    label: allToolsLive ? "Core tools live" : "In development",
  },
  { value: "$0", label: "Free today" },
  { value: "0", label: "Signups required" },
];

const highlights = [
  {
    title: "Free student productivity tools",
    body: `${toolCounts.live} tools are live today, including CGPA, attendance, resume ATS, and JSON workflows.`,
  },
  {
    title: "No signup required",
    body: "Open a tool and start immediately. No account, no credit card, no waiting.",
  },
  {
    title: "Fast browser-based tools",
    body: "Live tools run in the browser for instant results on any device.",
  },
  {
    title: allToolsLive ? "Full launch complete" : "More tools coming soon",
    body: allToolsLive
      ? `All ${toolCounts.live} core tools are now live and ready to use.`
      : `${toolCounts.comingSoon} additional tools are already in active development.`,
  },
];

const benefits = [
  {
    icon: Wand2,
    title: "Free student productivity tools",
    desc: "Practical calculators and utilities without paywalls on what is live today.",
  },
  {
    icon: Clock,
    title: "No signup required",
    desc: "Open a tool, enter your input, and get a result immediately.",
  },
  {
    icon: Lock,
    title: "Runs in your browser",
    desc: "Live tools process data locally on your device. Nothing is uploaded.",
  },
  {
    icon: Target,
    title: "Built for real workflows",
    desc: "Focused on academic, resume, and developer tasks that students actually repeat.",
  },
  {
    icon: LineChart,
    title: allToolsLive ? "Full lineup live" : "Shipping continuously",
    desc: allToolsLive
      ? `The full ${toolCounts.live}/${toolCounts.total} tool lineup is available today.`
      : `${toolCounts.comingSoon} more tools are in development and clearly marked.`,
  },
  {
    icon: Zap,
    title: "Fast and lightweight",
    desc: "No installs, no heavy apps, and no extra setup before you start.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Pick a tool",
    desc: "Browse live tools across academics, career, and developer workflows.",
  },
  {
    step: "02",
    title: "Enter your input",
    desc: "Type your numbers, upload your resume, or paste your JSON.",
  },
  {
    step: "03",
    title: "Get your result",
    desc: "See the output instantly and improve it right away.",
  },
];

const marqueeTags = [
  "Free to use",
  "No signup required",
  "Runs in your browser",
  "Built for students",
  "Built for developers",
  "Shipping carefully",
];

const categoryIcons = {
  Academic: GraduationCap,
  Career: Briefcase,
  Developer: Code2,
  Productivity: Rocket,
} as const;

export const Route = createFileRoute("/")({
  head: () => ({
    ...buildPageHead({
      title: "CampusAI Tools - Free Student Productivity Tools",
      description:
        "Free browser-based tools for students and developers. Use the CGPA calculator, attendance planner, resume ATS checker, and JSON formatter with no signup required.",
      path: "/",
      scripts: [
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "CampusAI Tools",
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          url: absoluteUrl("/"),
          description:
            "Browser-based productivity tools for students and developers, including resume, academic, and JSON workflows.",
        }),
      ],
    }),
  }),
  component: Home,
});

function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number] | "All">("All");

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesCategory = category === "All" || tool.category === category;
      const matchesQuery =
        !normalizedQuery ||
        tool.name.toLowerCase().includes(normalizedQuery) ||
        tool.description.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const categoryCounts = categories.map((value) => ({
    label: value,
    icon: categoryIcons[value],
    count: tools.filter((tool) => tool.category === value).length,
  }));

  return (
    <SiteLayout>
      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[-80px] h-[520px] bg-radial-top"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-6 text-center sm:pb-24 sm:pt-10">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground animate-fade-in-up">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-gradient-brand">
              <Sparkles className="h-2.5 w-2.5 text-primary-foreground" aria-hidden="true" />
            </span>
            <span>
              {allToolsLive
                ? `${toolCounts.live} live tools now - full launch complete`
                : `${toolCounts.live} live tools now, more shipping soon`}
            </span>
          </div>
          <h1 className="mt-6 font-display text-[2.75rem] leading-[1.05] tracking-tight animate-fade-in-up [animation-delay:80ms] sm:text-6xl md:text-7xl md:leading-[1.02]">
            Free student productivity tools.
            <br />
            <span className="text-gradient">Built for students and developers.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground animate-fade-in-up [animation-delay:160ms] sm:text-lg">
            Fast browser-based tools for academics, resumes, coding, and everyday student work with
            no signup required.
          </p>

          <div className="mx-auto mt-10 max-w-2xl animate-fade-in-up [animation-delay:220ms]">
            <label htmlFor="hero-search" className="sr-only">
              Search tools
            </label>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-1 rounded-2xl bg-gradient-brand opacity-30 blur-xl"
              />
              <div className="relative flex items-center gap-2 rounded-2xl glass-strong px-4 py-3 shadow-card transition focus-within:ring-2 focus-within:ring-brand/40">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <input
                  id="hero-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Search ${toolCounts.total} tools - try resume, CGPA, or JSON...`}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="hidden items-center gap-1 rounded-md border border-border/80 bg-foreground/5 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">
                  ⌘K
                </kbd>
              </div>
            </div>
            <div
              role="tablist"
              aria-label="Filter tools by category"
              className="mt-4 flex flex-wrap items-center justify-center gap-1.5"
            >
              {(["All", ...categories] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={category === value}
                  onClick={() => setCategory(value)}
                  className={`rounded-full px-3 py-1.5 text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    category === value
                      ? "border-transparent bg-foreground text-background"
                      : "border border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up [animation-delay:280ms]">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Explore all tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl glass px-5 py-2.5 text-sm font-medium transition-all hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Open preview
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Free to use
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              No signup required
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Runs in your browser
            </div>
            <div className="flex items-center gap-1.5">
              <LineChart className="h-3.5 w-3.5" aria-hidden="true" />
              {allToolsLive
                ? `${toolCounts.live}/${toolCounts.total} tools now live`
                : `${toolCounts.comingSoon} more in development`}
            </div>
          </div>
        </div>
      </section>

      <section aria-label="What we offer" className="mx-auto -mt-4 max-w-6xl px-4">
        <p className="text-center text-[11px] uppercase tracking-widest text-muted-foreground/80">
          What you get today
        </p>
        <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <div className="flex items-center gap-10 whitespace-nowrap animate-[marquee_35s_linear_infinite] sm:gap-14">
            {[...marqueeTags, ...marqueeTags].map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="font-display text-sm text-foreground/60 transition-colors hover:text-foreground/90 sm:text-base"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </section>

      <section aria-label="Tool categories" className="mx-auto mt-20 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categoryCounts.map((categoryStat) => (
            <button
              key={categoryStat.label}
              type="button"
              onClick={() => setCategory(categoryStat.label)}
              className="rounded-2xl glass p-4 text-left shadow-card transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Filter by ${categoryStat.label} tools`}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-brand shadow-glow">
                  <categoryStat.icon
                    className="h-4 w-4 text-primary-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{categoryStat.label}</p>
                  <p className="text-xs text-muted-foreground">{categoryStat.count} tools</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Tools" className="mx-auto mt-16 max-w-6xl px-4">
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-display tracking-tight sm:text-3xl">
              {query || category !== "All" ? "Matching tools" : "All tools"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredTools.length} of {tools.length} shown
            </p>
          </div>
          <Link
            to="/tools"
            className="hidden items-center gap-1 rounded-md px-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool, index) => (
              <div
                key={tool.slug}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }}
              >
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl glass p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No tools match &quot;{query}&quot;. Try a different keyword.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg glass px-3 py-1.5 text-xs hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby="how" className="mx-auto mt-28 max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">How it works</p>
          <h2 id="how" className="mt-3 text-3xl font-display tracking-tight sm:text-4xl">
            From blank page to shipped in three steps.
          </h2>
        </div>
        <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {howItWorks.map((step) => (
            <li
              key={step.step}
              className="relative overflow-hidden rounded-2xl glass p-6 shadow-card"
            >
              <span
                aria-hidden="true"
                className="absolute right-4 top-4 font-display text-5xl text-foreground/5"
              >
                {step.step}
              </span>
              <p className="text-xs uppercase tracking-widest text-brand-2">Step {step.step}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="benefits" className="mx-auto mt-28 max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Why CampusAI Tools
          </p>
          <h2 id="benefits" className="mt-3 text-3xl font-display tracking-tight sm:text-4xl">
            Built for the way you actually work.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Honest, fast, and free. We are shipping tools one careful release at a time.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl glass p-6 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-border/80 bg-surface-2">
                <benefit.icon className="h-5 w-5 text-foreground/90" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{benefit.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="popular" className="mx-auto mt-28 max-w-6xl px-4">
        <h2 id="popular" className="text-2xl font-display tracking-tight sm:text-3xl">
          Available now
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {toolCounts.live} free tools you can use today with no account needed.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liveTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section aria-label="Stats" className="mx-auto mt-28 max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 shadow-card sm:p-12">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-brand-2/20 blur-3xl"
          />
          <div className="relative grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl tracking-tight text-gradient sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="trust" className="mx-auto mt-28 max-w-6xl px-4">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Privacy</p>
            <h2 id="trust" className="mt-3 text-3xl font-display tracking-tight sm:text-4xl">
              Your inputs stay on your device.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Live tools run in your browser. We do not upload calculator, resume, or JSON inputs to
              our servers, and we do not sell your data.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Runs in your browser",
                "No signup required",
                "We do not sell your data",
                "Honest roadmap labels",
              ].map((tag) => (
                <span key={tag} className="rounded-full glass px-3 py-1 text-xs text-foreground/80">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <ul className="space-y-4 rounded-2xl glass p-6 shadow-card">
            {[
              "Live tools process data locally in your browser",
              "No account needed to use what is available today",
              "Privacy and roadmap copy are kept honest and current",
              "Reach us anytime through the Contact page",
            ].map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-2" aria-hidden="true" />
                <span className="text-sm leading-relaxed text-foreground/90">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="highlights" className="mx-auto mt-28 max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="highlights" className="text-3xl font-display tracking-tight sm:text-4xl">
            What you get today
          </h2>
          <p className="mt-3 text-muted-foreground">
            An honest snapshot of CampusAI Tools as it exists right now.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {highlights.map((highlight) => (
            <figure key={highlight.title} className="rounded-2xl glass p-6 shadow-card">
              <blockquote className="text-[15px] leading-relaxed text-foreground/90">
                {highlight.body}
              </blockquote>
              <figcaption className="mt-4">
                <p className="text-sm font-medium">{highlight.title}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq" className="mx-auto mt-28 max-w-3xl px-4">
        <div className="text-center">
          <h2 id="faq" className="text-3xl font-display tracking-tight sm:text-4xl">
            Frequently asked
          </h2>
          <p className="mt-3 text-muted-foreground">Common questions about what is live today.</p>
        </div>
        <div className="mt-10 space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} id={`faq-${index}`} />
          ))}
        </div>
      </section>

      <section aria-label="Get started" className="mx-auto mt-28 max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-10 text-center shadow-card sm:p-16">
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-brand opacity-20" />
          <div className="relative">
            <h2 className="font-display text-3xl tracking-tight sm:text-5xl">
              Ready to try a free tool?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Pick a live tool and start instantly with no signup, no credit card, and no waiting.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Browse tools
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-xl glass px-5 py-2.5 text-sm font-medium transition-all hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                About us
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              {allToolsLive
                ? `Free today - No signup required - ${toolCounts.live}/${toolCounts.total} tools live`
                : `Free today - No signup required - ${toolCounts.comingSoon} more tools in development`}
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function FAQItem({ q, a, id }: { q: string; a: string; id: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl glass">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-btn`}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="text-sm font-medium sm:text-base">{q}</span>
        <span
          aria-hidden="true"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border"
        >
          {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </span>
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        hidden={!open}
        className="animate-fade-in-up px-5 pb-5 text-sm leading-relaxed text-muted-foreground"
      >
        {a}
      </div>
    </div>
  );
}
