import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Braces,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileJson,
  LayoutList,
  Search,
  Wand2,
  Minimize2,
  ListTree
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdSlot, FaqSection, HowToSection, ShareButton } from "@/components/site/ToolExtras";
import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { JsonTree } from "@/components/ui/json-tree";
import { buildPageHead, jsonLdScript } from "@/lib/seo";
import { faqJsonLd, howToJsonLd, type FaqItem, type HowToStep } from "@/lib/structured-data";
import { formatJsonInput, type JsonFormatterOutput } from "@/lib/json/formatter";

const FAQ: FaqItem[] = [
  {
    q: "Is my JSON sent to a server?",
    a: "No. Parsing, validation, formatting, and minification run locally in your browser and nothing is uploaded.",
  },
  {
    q: "What JSON errors does it detect?",
    a: "It catches invalid JSON.parse input such as missing quotes, trailing commas, invalid escapes, and bracket mismatches, then shows the error location (line/column) when available.",
  },
  {
    q: "Can I explore large JSON files visually?",
    a: "Yes. The Tree Viewer allows you to expand, collapse, and search through deeply nested objects and arrays.",
  },
  {
    q: "Does it support JSON5 or comments?",
    a: "No. This tool follows strict JSON and intentionally flags comments or trailing commas as invalid to ensure compatibility with standard parsers.",
  },
  {
    q: "How do I minify my JSON?",
    a: "Simply paste or upload your JSON, then switch to the 'Minified' view tab to see the compressed output and size reduction.",
  },
];

const STEPS: HowToStep[] = [
  { title: "Input your JSON", body: "Paste raw JSON into the editor or upload a .json file." },
  { title: "Review & Format", body: "Check for validation errors or explore the parsed structure in the Tree Viewer." },
  { title: "Minify or Beautify", body: "Switch between Formatted (2 or 4 spaces) and Minified outputs." },
  { title: "Export", body: "Copy the result to your clipboard or download it as a .json file." },
];

const SAMPLE = `{"user":{"name":"Ada","skills":["ml","rust"],"active":true,"details":{"age":28,"role":"Engineer"}},"count":42,"status":null}`;

export const Route = createFileRoute("/tools/json-formatter")({
  head: () => ({
    ...buildPageHead({
      title: "JSON Studio: Formatter, Validator & Tree Viewer | CampusAI Tools",
      description:
        "Free online JSON Studio. Format, validate, minify, and visually explore JSON with our interactive tree viewer. Features line-by-line error detection.",
      path: "/tools/json-formatter",
      keywords:
        "json formatter, json validator, json beautifier, json minifier, json tree viewer, online json validator, json studio",
      scripts: [
        jsonLdScript(faqJsonLd(FAQ)),
        jsonLdScript(howToJsonLd("How to format JSON", STEPS)),
      ],
    }),
  }),
  component: JsonPage,
});

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function JsonPage() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [view, setView] = useState<"formatted" | "tree" | "minified">("formatted");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadMode, setUploadMode] = useState(false);

  const output = useMemo(() => formatJsonInput(input, indent), [indent, input]);

  const handleCopy = async () => {
    if (output.state !== "ok") return;
    const textToCopy = view === "minified" ? output.minified : output.text;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    if (output.state !== "ok") return;
    const textToDownload = view === "minified" ? output.minified : output.text;
    const blob = new Blob([textToDownload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded");
  };

  const handleFileUpload = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(content);
      setUploadMode(false);
      toast.success("File loaded successfully");
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  return (
    <ToolShell
      eyebrow="Developer"
      title={
        <>
          JSON <span className="text-gradient">Studio</span>
        </>
      }
      description="Format, validate, minify, and visually explore JSON locally in your browser."
      actions={
        <ShareButton
          title="Free JSON Studio — CampusAI Tools"
          text="Format, validate, and explore JSON in your browser."
        />
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {/* INPUT PANEL */}
        <div className="flex flex-col rounded-2xl glass p-4 shadow-card">
          <div className="flex items-center justify-between px-1 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Input</span>
              <div className="flex overflow-hidden rounded-md border border-border/60">
                <button
                  type="button"
                  onClick={() => setUploadMode(false)}
                  className={`px-2 py-1 text-[11px] transition-colors ${
                    !uploadMode ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Paste
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode(true)}
                  className={`px-2 py-1 text-[11px] transition-colors ${
                    uploadMode ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => { setInput(SAMPLE); setUploadMode(false); }}>
                <Wand2 className="h-3.5 w-3.5" />
                Sample
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setInput(""); setUploadMode(false); }} disabled={!input && !uploadMode}>
                Clear
              </Button>
            </div>
          </div>
          
          {uploadMode ? (
            <div className="flex-1 rounded-xl border border-border/60 bg-surface-2/40 p-4">
              <FileUpload
                accept={{ "application/json": [".json"], "text/plain": [".txt"] }}
                maxFiles={1}
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <textarea
              aria-label="JSON input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder='{"paste":"your JSON here"}'
              spellCheck={false}
              className="min-h-[400px] w-full flex-1 resize-y rounded-xl border border-border/60 bg-surface-2/40 p-3 font-mono text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-brand/40"
            />
          )}
        </div>

        {/* OUTPUT PANEL */}
        <div className="flex flex-col rounded-2xl glass p-4 shadow-card">
          <div className="flex flex-col gap-3 pb-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Output</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleCopy} disabled={output.state !== "ok"}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownload} disabled={output.state !== "ok"}>
                  <Download className="h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
              <div className="flex overflow-hidden rounded-md border border-border/60">
                <button
                  type="button"
                  onClick={() => setView("formatted")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                    view === "formatted" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Braces className="h-3.5 w-3.5" />
                  Formatted
                </button>
                <button
                  type="button"
                  onClick={() => setView("tree")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                    view === "tree" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ListTree className="h-3.5 w-3.5" />
                  Tree
                </button>
                <button
                  type="button"
                  onClick={() => setView("minified")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                    view === "minified" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  Minified
                </button>
              </div>

              {view === "formatted" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Indent:</span>
                  <div className="flex overflow-hidden rounded-md border border-border/60">
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
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {view === "tree" && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tree..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-32 rounded-md border border-border/60 bg-background/50 pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-brand/40 sm:w-48"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="relative flex flex-col flex-1 gap-4">
            <div className="relative flex-1 min-h-[320px] overflow-auto rounded-xl border border-border/60 bg-surface-2/40 p-3">
              {output.state === "empty" ? (
                <div className="grid h-full place-items-center text-center">
                  <div className="text-sm text-muted-foreground">
                    <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-white/5">
                      <FileJson className="h-4 w-4" />
                    </div>
                    Provide JSON on the left to see results here.
                  </div>
                </div>
              ) : null}

              {output.state === "ok" ? (
                <>
                  <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300 z-10">
                    <CheckCircle2 className="h-3 w-3" />
                    Valid
                  </div>
                  
                  {view === "formatted" && (
                    <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed">
                      {output.text}
                    </pre>
                  )}

                  {view === "tree" && (
                    <div className="py-2">
                      <JsonTree data={output.parsed} searchQuery={searchQuery} />
                    </div>
                  )}

                  {view === "minified" && (
                    <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-muted-foreground">
                      {output.minified}
                    </pre>
                  )}
                </>
              ) : null}

              {output.state === "error" ? (
                <div className="flex items-start gap-3 text-sm p-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <div>
                    <div className="font-medium text-destructive">Invalid JSON</div>
                    <div className="mt-1 break-words text-destructive/80">{output.message}</div>
                    {output.location ? (
                      <div className="mt-2 inline-block rounded-md border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs text-destructive-foreground">
                        Line <span className="font-bold">{output.location.line}</span>, Column <span className="font-bold">{output.location.column}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            {/* STATS PANEL */}
            {output.state === "ok" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-lg bg-surface-2/30 border border-border/50 p-2.5 flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Keys</span>
                  <span className="font-mono text-sm font-semibold mt-0.5">{output.stats.totalKeys}</span>
                </div>
                <div className="rounded-lg bg-surface-2/30 border border-border/50 p-2.5 flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Depth</span>
                  <span className="font-mono text-sm font-semibold mt-0.5">{output.stats.maxDepth}</span>
                </div>
                <div className="rounded-lg bg-surface-2/30 border border-border/50 p-2.5 flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Size</span>
                  <span className="font-mono text-sm font-semibold mt-0.5">
                    {view === "minified" ? formatBytes(new Blob([output.minified]).size) : formatBytes(output.stats.sizeBytes)}
                  </span>
                </div>
                <div className="rounded-lg bg-surface-2/30 border border-border/50 p-2.5 flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Reduction</span>
                  <span className="font-mono text-sm font-semibold mt-0.5 text-emerald-400">
                    {output.text.length > 0
                      ? Math.max(0, Math.round((1 - output.minified.length / output.text.length) * 100))
                      : 0}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <HowToSection title="How to use JSON Studio" steps={STEPS} />
      <AdSlot label="Recommended for developers" />
      <FaqSection items={FAQ} />
    </ToolShell>
  );
}
