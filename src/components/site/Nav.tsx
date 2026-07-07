import { Link } from "@tanstack/react-router";
import { Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/ui/theme-toggle";

const links = [
  { to: "/tools", label: "Tools" },
  { to: "/dashboard", label: "Preview" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-foreground focus:px-3 focus:py-1.5 focus:text-sm focus:text-background"
      >
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}
      >
        <div className="mx-auto max-w-6xl px-4">
          <nav
            aria-label="Primary"
            className={`flex items-center justify-between rounded-2xl px-3 py-2.5 transition-all sm:px-4 ${
              scrolled || open ? "glass-strong shadow-card" : "border border-transparent"
            }`}
          >
            <Link
              to="/"
              className="group flex items-center gap-2 rounded-lg px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="CampusAI Tools — home"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold tracking-tight">
                CampusAI <span className="font-normal text-muted-foreground">Tools</span>
              </span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  activeProps={{ className: "bg-foreground/5 text-foreground" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/dashboard"
                className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
              >
                Workspace preview
              </Link>
              <Link
                to="/tools"
                className="hidden items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-sm font-medium text-background transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
              >
                Get started
              </Link>
              <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="grid h-9 w-9 place-items-center rounded-lg glass transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </nav>

          {open ? (
            <div
              id="mobile-menu"
              className="mt-2 rounded-2xl glass-strong p-3 shadow-card animate-fade-in-up md:hidden"
            >
              <ul className="flex flex-col">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-3 text-sm text-foreground/90 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2 border-t border-border/60 pt-2">
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg glass px-3 py-2 text-center text-sm hover:bg-foreground/10"
                >
                  Preview
                </Link>
                <Link
                  to="/tools"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg bg-foreground px-3 py-2 text-center text-sm font-medium text-background hover:opacity-90"
                >
                  Get started
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}
