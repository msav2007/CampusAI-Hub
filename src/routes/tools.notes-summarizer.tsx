import { createFileRoute } from "@tanstack/react-router";
import { Copy, FileText, Sparkles, Trash2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildPageHead } from "@/lib/seo";
import { readJsonFromStorage, writeJsonToStorage } from "@/lib/storage";
import { generateSummary, type SummaryResult } from "@/lib/summarizer/logic";

const STORAGE_KEY = "campusai:notessummarizer:v1";

type HistoryState = {
  inputText: string;
  result: SummaryResult | null;
};

export const Route = createFileRoute("/tools/notes-summarizer")({
  head: () => ({
    ...buildPageHead({
      title: "Free Notes Summarizer Online — CampusAI Tools",
      description:
        "Turn long lectures into crisp summaries instantly. Completely free, local processing, no sign-up required.",
      path: "/tools/notes-summarizer",
      keywords: "notes summarizer, text summarizer, lecture notes to summary, free summarizer",
    }),
  }),
  component: NotesSummarizerPage,
});

function NotesSummarizerPage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const stored = readJsonFromStorage<HistoryState>(STORAGE_KEY);
    if (stored) {
      if (stored.inputText) setInputText(stored.inputText);
      if (stored.result) setResult(stored.result);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJsonToStorage(STORAGE_KEY, { inputText, result });
  }, [loaded, inputText, result]);

  const handleSummarize = () => {
    if (!inputText.trim()) return;
    const res = generateSummary(inputText);
    setResult(res);
    setIsCopied(false);
  };

  const handleReset = () => {
    setInputText("");
    setResult(null);
    setIsCopied(false);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    const textToCopy = `Summary:\n${result.summary}\n\nKey Points:\n${result.keyPoints.map((p) => `- ${p}`).join("\n")}\n\nImportant Terms: ${result.importantTerms.join(", ")}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <ToolShell
      eyebrow="Productivity"
      title={
        <>
          Notes <span className="text-gradient">Summarizer</span>
        </>
      }
      description="Paste your lecture notes or long texts to instantly extract the key points, summary, and important terms. Processing happens entirely on your device."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="flex flex-col rounded-2xl glass p-5 shadow-card h-full min-h-[500px]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <FileText className="h-5 w-5 text-brand" />
              Original Text
            </h2>
            <div className="text-xs text-muted-foreground">{inputText.length} chars</div>
          </div>

          <Textarea
            aria-label="Input text to summarize"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your notes, lecture transcript, or long article here..."
            className="flex-1 resize-none rounded-xl border-border/60 bg-surface-2/30 p-4 text-[15px] leading-relaxed focus:ring-brand/40"
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleSummarize}
              disabled={inputText.trim().length < 20}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Summarize
            </Button>
            {inputText && (
              <Button variant="ghost" onClick={handleReset} aria-label="Clear input">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col rounded-2xl glass p-5 shadow-card h-full min-h-[500px]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Generated Summary</h2>
            {result && (
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                <Copy className="h-4 w-4" />
                {isCopied ? "Copied!" : "Copy All"}
              </Button>
            )}
          </div>

          {!result ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl border border-dashed border-border/60 bg-surface-2/30">
                <Sparkles className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="mt-4 font-medium text-muted-foreground">No summary yet</p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Paste your notes on the left and click Summarize.
              </p>
            </div>
          ) : (
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 text-sm leading-relaxed">
              <section>
                <h3 className="mb-2 font-semibold uppercase tracking-wider text-xs text-brand-2">
                  Summary
                </h3>
                <p className="rounded-xl border border-border/40 bg-surface-2/20 p-4">
                  {result.summary}
                </p>
              </section>

              {result.keyPoints.length > 0 && (
                <section>
                  <h3 className="mb-2 font-semibold uppercase tracking-wider text-xs text-brand-2">
                    Key Points
                  </h3>
                  <ul className="space-y-2 rounded-xl border border-border/40 bg-surface-2/20 p-4">
                    {result.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.importantTerms.length > 0 && (
                <section>
                  <h3 className="mb-2 font-semibold uppercase tracking-wider text-xs text-brand-2">
                    Important Terms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.importantTerms.map((term, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-border/50 bg-background/50 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
