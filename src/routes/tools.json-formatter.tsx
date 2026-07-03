import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Check, CheckCircle2, Copy, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";

import { AdSlot, FaqSection, HowToSection, ShareButton } from "@/components/site/ToolExtras";
import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { buildPageHead, jsonLdScript } from "@/lib/seo";
import { faqJsonLd, howToJsonLd, type FaqItem, type HowToStep } from "@/lib/structured-data";
import { formatJsonInput } from "@/lib/json/formatter";

const FAQ: FaqItem[] = [
  {
    q: "Is my JSON sent to a server?",
    a: "No. Parsing, validation, and formatting run locally in your browser and nothing is uploaded.",
  },
  {
    q: "What JSON errors does it detect?",
    a: "It catches invalid JSON.parse input such as missing quotes, trailing commas, invalid escapes, and bracket mismatches, then shows the error location when available.",
  },
  {
    q: "Can I format large JSON files?",
    a: "Yes. Files up to several megabytes typically format instantly, depending on your device.",
  },
  {
    q: "Does it support JSON5 or comments?",
    a: "No. This tool follows strict JSON and intentionally flags comments or trailing commas as invalid.",
  },
  {
    q: "How do I copy the result?",
    a: "Use the Copy button in the output panel after the JSON validates successfully.",
  },
];

const STEPS: HowToStep[] = [
  { title: "Paste your JSON", body: "Paste raw JSON or load the sample data." },
  { title: "Choose indentation", body: "Switch between 2-space and 4-space output." },
  { title: "Review errors", body: "Invalid JSON shows the parsing message and location." },
  { title: "Copy the result", body: "Valid JSON can be copied directly from the output panel." },
];

const SAMPLE = `{"user":{"name":"Ada","skills":["ml","rust"],"active":true},"count":42}`;

export const Route = createFileRoute("/tools/json-formatter")({
  head: () => ({
    ...buildPageHead({
      title: "Free JSON Formatter & Validator Online | CampusAI Tools",
      description:
        "Free online JSON formatter and validator. Paste JSON, pretty-print it with 2 or 4 spaces, and get clear error messages with line and column details.",
      path: "/tools/json-formatter",
      keywords:
        "json formatter, json validator, json beautifier, json parser, pretty print json, online json validator",
      scripts: [
        jsonLdScript(faqJsonLd(FAQ)),
        jsonLdScript(howToJsonLd("How to format JSON", STEPS)),
      ],
    }),
  }),
  component: JsonPage,
});

function JsonPage() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => formatJsonInput(input, indent), [indent, input]);

  const copy = async () => {
    if (output.state !== "ok") return;

    try {
      await navigator.clipboard.writeText(output.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ToolShell
      eyebrow="Developer"
      title={
        <>
          JSON <span className="text-gradient">Formatter</span>
        </>
      }
      description="Paste JSON to validate and pretty-print it. Everything runs locally in your browser."
      actions={
        <ShareButton
          title="Free JSON Formatter — CampusAI Tools"
          text="Format and validate JSON in your browser."
        />
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col rounded-2xl glass p-4 shadow-card">
          <div className="flex items-center justify-between px-1 pb-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Input</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setInput(SAMPLE)}>
                <Wand2 className="h-3.5 w-3.5" />
                Sample
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setInput("")} disabled={!input}>
                Clear
              </Button>
            </div>
          </div>
          <textarea
            aria-label="JSON input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder='{"paste":"your JSON here"}'
            spellCheck={false}
            className="min-h-[320px] w-full flex-1 resize-y rounded-xl border border-border/60 bg-surface-2/40 p-3 font-mono text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div className="flex flex-col rounded-2xl glass p-4 shadow-card">
          <div className="flex items-center justify-between px-1 pb-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Output</span>
            <div className="flex items-center gap-1">
              <div className="mr-1 flex overflow-hidden rounded-md border border-border/60">
                {[2, 4].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setIndent(size as 2 | 4)}
                    className={`px-2 py-1 text-[11px] transition-colors ${
                      indent === size
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {size} sp
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={copy} disabled={output.state !== "ok"}>
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="relative min-h-[320px] flex-1 overflow-auto rounded-xl border border-border/60 bg-surface-2/40 p-3">
            {output.state === "empty" ? (
              <div className="grid h-full place-items-center text-center">
                <div className="text-sm text-muted-foreground">
                  <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-white/5">
                    <Wand2 className="h-4 w-4" />
                  </div>
                  Paste JSON on the left to see the formatted result here.
                </div>
              </div>
            ) : null}

            {output.state === "ok" ? (
              <>
                <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Valid
                </div>
                <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed">
                  {output.text}
                </pre>
              </>
            ) : null}

            {output.state === "error" ? (
              <div className="flex items-start gap-3 text-sm">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <div className="font-medium text-destructive">Invalid JSON</div>
                  <div className="mt-1 break-words text-destructive/80">{output.message}</div>
                  {output.location ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Around line {output.location.line}, column {output.location.column}.
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <HowToSection title="How to format JSON" steps={STEPS} />
      <AdSlot label="Recommended for developers" />
      <FaqSection items={FAQ} />
    </ToolShell>
  );
}
