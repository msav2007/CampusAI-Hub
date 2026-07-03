import { useState, type ReactNode } from "react";
import { Check, Share2 } from "lucide-react";

import type { FaqItem, HowToStep } from "@/lib/structured-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-heading" className="mt-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">FAQ</p>
          <h2 id="faq-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
        </div>
      </div>
      <div className="mt-6 rounded-2xl glass p-2 shadow-card sm:p-4">
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, index) => (
            <AccordionItem
              key={item.q}
              value={`item-${index}`}
              className="border-border/60 last:border-b-0"
            >
              <AccordionTrigger className="px-3 text-left text-base font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="px-3 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function HowToSection({ title, steps }: { title: string; steps: HowToStep[] }) {
  return (
    <section aria-labelledby="howto-heading" className="mt-16">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">How it works</p>
      <h2 id="howto-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl glass p-5 shadow-card">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-border/80 bg-surface-2 text-xs font-semibold tabular-nums">
              {index + 1}
            </div>
            <h3 className="mt-3 text-sm font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function AdSlot({ label = "Sponsored" }: { label?: string }) {
  return (
    <aside
      aria-label="Advertisement placeholder"
      className="mt-10 rounded-2xl border border-dashed border-border/60 bg-surface-2/30 p-6 text-center"
    >
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">{label}</div>
      <p className="mt-2 text-sm text-muted-foreground">
        Reserved space for future partner recommendations. We only recommend tools we&apos;ve used
        ourselves.
      </p>
    </aside>
  );
}

export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const payload = { title, text: text ?? title, url };

    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share(
          payload,
        );
        return;
      }
    } catch {
      // Ignore native share cancellations and fall back to copying the URL.
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={onClick} aria-label="Share this tool">
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Link copied
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          Share
        </>
      )}
    </Button>
  );
}

export function ToolMeta({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex flex-wrap items-center gap-2">{children}</div>;
}
