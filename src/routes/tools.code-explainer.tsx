import { createFileRoute } from "@tanstack/react-router";
import { Code2, Copy, Trash2, Zap, AlertTriangle, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildPageHead } from "@/lib/seo";
import { readJsonFromStorage, writeJsonToStorage } from "@/lib/storage";
import {
  analyzeCode,
  type CodeAnalysisResult,
  type ExplainerLanguage,
} from "@/lib/code-explainer/logic";

const STORAGE_KEY = "campusai:codeexplainer:v1";

type HistoryState = {
  inputCode: string;
  language: ExplainerLanguage;
  result: CodeAnalysisResult | null;
};

const LANGUAGES: ExplainerLanguage[] = [
  "Auto Detect",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C/C++",
  "Other",
];

export const Route = createFileRoute("/tools/code-explainer")({
  head: () => ({
    ...buildPageHead({
      title: "Free Code Explainer Online — CampusAI Tools",
      description:
        "Paste any code snippet and get a simple, line-by-line explanation and structural breakdown instantly. Works offline.",
      path: "/tools/code-explainer",
      keywords: "code explainer, code analysis, what does this code do, free code explainer",
    }),
  }),
  component: CodeExplainerPage,
});

function CodeExplainerPage() {
  const [inputCode, setInputCode] = useState("");
  const [language, setLanguage] = useState<ExplainerLanguage>("Auto Detect");
  const [result, setResult] = useState<CodeAnalysisResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const stored = readJsonFromStorage<HistoryState>(STORAGE_KEY);
    if (stored) {
      if (stored.inputCode) setInputCode(stored.inputCode);
      if (stored.language) setLanguage(stored.language);
      if (stored.result) setResult(stored.result);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJsonToStorage(STORAGE_KEY, { inputCode, language, result });
  }, [loaded, inputCode, language, result]);

  const handleAnalyze = () => {
    if (!inputCode.trim()) return;
    const res = analyzeCode(inputCode, language);
    setResult(res);
    setIsCopied(false);
  };

  const handleReset = () => {
    setInputCode("");
    setResult(null);
    setIsCopied(false);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    const textToCopy = `Language: ${result.language}\n\nExplanation:\n${result.explanation}\n\nStructure:\n- Functions: ${result.structure.functions}\n- Imports: ${result.structure.imports}\n- Variables: ${result.structure.variables}\n- Loops: ${result.structure.loops}\n- Conditions: ${result.structure.conditions}\n- Classes: ${result.structure.classes}\n\nConcepts detected:\n${result.concepts.join(", ") || "None"}\n\nSuggestions:\n${result.suggestions.join("\n")}\n\nIssues:\n${result.issues.join("\n") || "None found."}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const numLines = inputCode ? inputCode.split("\n").length : 0;
  const numChars = inputCode.length;

  return (
    <ToolShell
      eyebrow="Developer"
      title={
        <>
          Code <span className="text-gradient">Explainer</span>
        </>
      }
      description="Paste complex code snippets to get a simple explanation, structural breakdown, and suggestions. Runs locally in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="flex flex-col rounded-2xl glass p-5 shadow-card h-[600px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Code2 className="h-5 w-5 text-brand" />
              Source Code
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as ExplainerLanguage)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Programming Language"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {numLines} lines | {numChars} chars
              </div>
            </div>
          </div>

          <Textarea
            aria-label="Input code to explain"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="// Paste your code here..."
            className="flex-1 resize-none rounded-xl border-border/60 bg-surface-2/30 p-4 font-mono text-[13px] leading-relaxed focus:ring-brand/40"
            spellCheck={false}
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={inputCode.trim().length < 5}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              Explain Code
            </Button>
            {inputCode && (
              <Button variant="ghost" onClick={handleReset} aria-label="Clear input">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col rounded-2xl glass p-5 shadow-card h-[600px]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Analysis Result</h2>
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
                <Zap className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="mt-4 font-medium text-muted-foreground">No analysis yet</p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Paste your code on the left and click Explain.
              </p>
            </div>
          ) : (
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 text-sm leading-relaxed">
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold uppercase tracking-wider text-xs text-brand-2">
                    Explanation
                  </h3>
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand uppercase">
                    {result.language}
                  </span>
                </div>
                <p className="rounded-xl border border-border/40 bg-surface-2/20 p-4">
                  {result.explanation}
                </p>
              </section>

              {result.concepts.length > 0 && (
                <section>
                  <h3 className="mb-2 font-semibold uppercase tracking-wider text-xs text-brand-2">
                    Detected Concepts
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.concepts.map((concept, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-border/50 bg-background/50 px-3 py-1 text-xs font-medium text-foreground shadow-sm"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-2 font-semibold uppercase tracking-wider text-xs text-brand-2">
                  Code Structure
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 rounded-xl border border-border/40 bg-surface-2/20 p-4 text-center">
                  <div>
                    <div className="text-lg font-bold">{result.structure.functions}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Functions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{result.structure.classes}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Classes</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{result.structure.loops}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Loops</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{result.structure.conditions}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Branches</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{result.structure.variables}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Variables</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{result.structure.imports}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Imports</div>
                  </div>
                </div>
              </section>

              {result.issues.length > 0 && (
                <section>
                  <h3 className="mb-2 flex items-center gap-1.5 font-semibold uppercase tracking-wider text-xs text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Possible Issues
                  </h3>
                  <ul className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive">
                    {result.issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.suggestions.length > 0 && (
                <section>
                  <h3 className="mb-2 flex items-center gap-1.5 font-semibold uppercase tracking-wider text-xs text-amber-500">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Suggestions
                  </h3>
                  <ul className="space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-600 dark:text-amber-400">
                    {result.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
