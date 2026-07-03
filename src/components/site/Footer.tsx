import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Mail, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

const columns = [
  {
    title: "Product",
    links: [
      { to: "/tools", label: "All tools" },
      { to: "/pricing", label: "Pricing" },
      { to: "/dashboard", label: "Preview" },
    ],
  },
  {
    title: "Categories",
    links: [
      { to: "/tools", label: "Academic" },
      { to: "/tools", label: "Career" },
      { to: "/tools", label: "Developer" },
      { to: "/tools", label: "Productivity" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
] as const;

const quickLinks = [
  { icon: Mail, label: "Email", href: "mailto:hello@campusai.tools", external: true },
  { icon: MessageCircle, label: "Contact", href: "/contact", external: false },
  { icon: ShieldCheck, label: "Privacy", href: "/privacy", external: false },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");
  const [requested, setRequested] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    const subject = encodeURIComponent("CampusAI launch updates");
    const body = encodeURIComponent(`Please add ${email.trim()} to CampusAI launch updates.`);
    window.location.href = `mailto:hello@campusai.tools?subject=${subject}&body=${body}`;
    setRequested(true);
    setEmail("");
  };

  return (
    <footer className="relative mt-32 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-14 flex flex-col gap-6 rounded-2xl glass-strong p-6 shadow-card sm:p-8 md:flex-row md:items-center md:gap-8">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-display tracking-tight sm:text-xl">
              Join launch updates by email.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We do not have an automated newsletter yet. This opens an email request to our team.
            </p>
          </div>
          <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2 md:w-auto">
            <label htmlFor="newsletter" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@campus.edu"
              className="min-w-0 flex-1 rounded-xl glass px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-brand/40"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {requested ? (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Opening email
                </>
              ) : (
                <>
                  Request updates
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold tracking-tight">CampusAI Tools</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Honest browser-based tools for students, developers, and job seekers. What is live
              works today. What is not live is labeled clearly.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {quickLinks.map(({ icon: Icon, label, href, external }) =>
                external ? (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-lg glass transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    key={label}
                    to={href}
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-lg glass transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                ),
              )}
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground/80">
                {column.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="rounded text-sm text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CampusAI Tools. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Made for students, by builders.</p>
        </div>
      </div>
    </footer>
  );
}
