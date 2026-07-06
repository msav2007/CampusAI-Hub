import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Copy, Download, FileCode2, RotateCcw, Sparkles, CheckSquare, Square, Eye, FileText } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { AdSlot, FaqSection, HowToSection, ShareButton } from "@/components/site/ToolExtras";
import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { buildPageHead, jsonLdScript } from "@/lib/seo";
import { readJsonFromStorage, writeJsonToStorage } from "@/lib/storage";
import { faqJsonLd, howToJsonLd, type FaqItem, type HowToStep } from "@/lib/structured-data";
import { generateReadme, type ReadmeInput, DEFAULT_README_INPUT, BADGE_URLS, type TechCategory } from "@/lib/readme-generator/logic";
import { TEMPLATES } from "@/lib/readme-generator/templates";

const STORAGE_KEY = "campusai:readmegenerator:v2";

const emptyInput: ReadmeInput = {
  projectName: "",
  shortDescription: "",
  detailedDescription: "",
  logoUrl: "",
  demoUrl: "",
  githubRepo: "",
  badges: {
    react: false, typescript: false, javascript: false, python: false, node: false, next: false, vite: false, license: true, version: false, build: false,
  },
  features: [],
  techStack: { frontend: [], backend: [], database: [], tools: [] },
  packageManager: "npm",
  screenshots: [],
  advancedSections: {
    toc: true, folderStructure: false, envVars: false, apiDocs: false,
    usageExamples: false, roadmap: false, contributing: false, license: true, author: true,
  },
  licenseType: "MIT",
  authorName: "",
};

const FAQ: FaqItem[] = [
  { q: "Is this free?", a: "Yes, README Studio is 100% free and open to use for any project." },
  { q: "Where are my images stored?", a: "Images uploaded here are converted to local data URLs for preview. For a real GitHub repository, you should upload them directly to your repo (e.g., inside an `assets` folder) and update the links in the generated markdown." },
  { q: "Does it autosave?", a: "Yes, your progress is automatically saved locally to your browser." },
  { q: "Can I use custom badges?", a: "Currently, we provide a curated list of the most common badges. You can always add custom ones manually to the raw markdown after downloading." },
];

const STEPS: HowToStep[] = [
  { title: "Select a Template", body: "Start from scratch or use a preset (React, Fullstack, AI, Library)." },
  { title: "Fill Details", body: "Add your project information, features, and tech stack." },
  { title: "Add Images", body: "Upload screenshots or provide a logo URL to make your README stand out." },
  { title: "Export", body: "Copy the raw markdown or download the README.md file directly." },
];

export const Route = createFileRoute("/tools/readme-generator")({
  head: () => ({
    ...buildPageHead({
      title: "README Studio: Professional GitHub Profile & Repo Generator | CampusAI Tools",
      description: "Create a professional, structured README.md for your GitHub projects. Live markdown preview, automatic badges, screenshots, and more.",
      path: "/tools/readme-generator",
      keywords: "readme generator, github readme maker, markdown generator, free readme tool, professional github repo, readme studio",
      scripts: [jsonLdScript(faqJsonLd(FAQ)), jsonLdScript(howToJsonLd("How to use README Studio", STEPS))],
    }),
  }),
  component: ReadmeStudioPage,
});

function Checkbox({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity">
      {checked ? <CheckSquare className="w-4 h-4 text-brand" /> : <Square className="w-4 h-4 text-muted-foreground" />}
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
    </label>
  );
}

function ReadmeStudioPage() {
  const [input, setInput] = useState<ReadmeInput>(emptyInput);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<"preview" | "raw">("preview");

  useEffect(() => {
    const stored = readJsonFromStorage<ReadmeInput>(STORAGE_KEY);
    if (stored) setInput(stored);
    else setInput(DEFAULT_README_INPUT);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJsonToStorage(STORAGE_KEY, input);
  }, [loaded, input]);

  const updateInput = (updates: Partial<ReadmeInput>) => setInput((prev) => ({ ...prev, ...updates }));

  const handleClear = () => {
    setInput(emptyInput);
    toast.success("Draft cleared");
  };

  const loadTemplate = (key: keyof typeof TEMPLATES) => {
    setInput(TEMPLATES[key]);
    toast.success(`${key} template loaded`);
  };

  const handleScreenshotUpload = (files: File[]) => {
    const newUrls = files.map(f => URL.createObjectURL(f));
    updateInput({ screenshots: [...input.screenshots, ...newUrls] });
    toast.success(`${files.length} screenshots added`);
  };

  const markdownOutput = useMemo(() => generateReadme(input), [input]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownOutput);
      toast.success("README copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownOutput], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("README.md downloaded!");
  };

  return (
    <ToolShell
      eyebrow="Developer"
      title={<>README <span className="text-gradient">Studio</span></>}
      description="Create a professional, structured README.md for your projects with live markdown preview, automatic badges, and customizable sections."
      actions={<ShareButton title="README Studio — CampusAI Tools" text="Create professional GitHub READMEs instantly." />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: INPUT BUILDER */}
        <div className="flex flex-col h-[900px] rounded-2xl glass shadow-card">
          <div className="p-4 border-b border-border/40 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight uppercase text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              Builder
            </h2>
            <div className="flex gap-2">
              <div className="hidden sm:flex overflow-hidden rounded-md border border-border/60">
                {Object.keys(TEMPLATES).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => loadTemplate(key as keyof typeof TEMPLATES)}
                    className="px-2 py-1 text-[11px] transition-colors text-muted-foreground hover:text-foreground hover:bg-white/5 capitalize"
                  >
                    {key}
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 text-xs">
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-8">
            {/* Project Details */}
            <section className="space-y-4">
              <h3 className="font-semibold border-b border-border/40 pb-2">Project Details</h3>
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={input.projectName} onChange={(e) => updateInput({ projectName: e.target.value })} placeholder="e.g. Awesome Repo" />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Input value={input.shortDescription} onChange={(e) => updateInput({ shortDescription: e.target.value })} placeholder="A fantastic new tool..." />
              </div>
              <div className="space-y-2">
                <Label>Detailed Description</Label>
                <Textarea value={input.detailedDescription} onChange={(e) => updateInput({ detailedDescription: e.target.value })} rows={3} placeholder="Explain what the project does in detail..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input value={input.logoUrl} onChange={(e) => updateInput({ logoUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Demo URL</Label>
                  <Input value={input.demoUrl} onChange={(e) => updateInput({ demoUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>GitHub Repo URL</Label>
                <Input value={input.githubRepo} onChange={(e) => updateInput({ githubRepo: e.target.value })} placeholder="https://github.com/user/repo" />
              </div>
            </section>

            {/* Badges */}
            <section className="space-y-4">
              <h3 className="font-semibold border-b border-border/40 pb-2">Badges</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.keys(input.badges).map((badgeKey) => (
                  <Checkbox
                    key={badgeKey}
                    label={badgeKey.charAt(0).toUpperCase() + badgeKey.slice(1)}
                    checked={input.badges[badgeKey as keyof typeof input.badges]}
                    onChange={(val) => updateInput({ badges: { ...input.badges, [badgeKey]: val } })}
                  />
                ))}
              </div>
            </section>

            {/* Features */}
            <section className="space-y-4">
              <h3 className="font-semibold border-b border-border/40 pb-2">Features</h3>
              <div className="space-y-2">
                <Label>Features (one per line)</Label>
                <Textarea
                  value={input.features.join("\n")}
                  onChange={(e) => updateInput({ features: e.target.value.split("\n").filter(f => f.trim() !== "") })}
                  rows={4}
                  placeholder="⚡ Fast performance&#10;🎨 Beautiful UI"
                />
              </div>
            </section>

            {/* Tech Stack */}
            <section className="space-y-4">
              <h3 className="font-semibold border-b border-border/40 pb-2">Tech Stack</h3>
              {(["frontend", "backend", "database", "tools"] as TechCategory[]).map((cat) => (
                <div key={cat} className="space-y-2">
                  <Label className="capitalize">{cat} (comma separated)</Label>
                  <Input
                    value={input.techStack[cat].join(", ")}
                    onChange={(e) => updateInput({ techStack: { ...input.techStack, [cat]: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } })}
                    placeholder={`e.g. ${cat === 'frontend' ? 'React, Vite' : cat === 'backend' ? 'Node, Express' : cat === 'database' ? 'MongoDB' : 'Docker'}`}
                  />
                </div>
              ))}
            </section>

            {/* Installation */}
            <section className="space-y-4">
              <h3 className="font-semibold border-b border-border/40 pb-2">Installation</h3>
              <div className="space-y-2">
                <Label>Package Manager</Label>
                <select
                  value={input.packageManager}
                  onChange={(e) => updateInput({ packageManager: e.target.value as any })}
                  className="w-full h-9 rounded-md border border-input bg-surface-2/40 px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="npm">npm</option>
                  <option value="yarn">yarn</option>
                  <option value="pnpm">pnpm</option>
                  <option value="bun">bun</option>
                </select>
              </div>
            </section>

            {/* Screenshots */}
            <section className="space-y-4">
              <h3 className="font-semibold border-b border-border/40 pb-2">Screenshots</h3>
              <FileUpload
                accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif"] }}
                maxFiles={3}
                onChange={handleScreenshotUpload}
              />
              {input.screenshots.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {input.screenshots.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded overflow-hidden border border-border">
                       <img src={url} alt={`Screenshot ${idx}`} className="w-full h-full object-cover" />
                       <button
                         onClick={() => {
                           const s = [...input.screenshots];
                           s.splice(idx, 1);
                           updateInput({ screenshots: s });
                         }}
                         className="absolute top-0 right-0 bg-black/60 text-white text-[10px] w-4 h-4 flex items-center justify-center hover:bg-destructive"
                       >
                         x
                       </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Advanced Sections */}
            <section className="space-y-4">
              <h3 className="font-semibold border-b border-border/40 pb-2">Advanced Sections</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(input.advancedSections).map((secKey) => (
                  <Checkbox
                    key={secKey}
                    label={secKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    checked={input.advancedSections[secKey as keyof typeof input.advancedSections]}
                    onChange={(val) => updateInput({ advancedSections: { ...input.advancedSections, [secKey]: val } })}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4 pb-8">
              <h3 className="font-semibold border-b border-border/40 pb-2">Author & License</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Author Name</Label>
                  <Input value={input.authorName} onChange={(e) => updateInput({ authorName: e.target.value })} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label>License Type</Label>
                  <select
                    value={input.licenseType}
                    onChange={(e) => updateInput({ licenseType: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-surface-2/40 px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="MIT">MIT</option>
                    <option value="Apache-2.0">Apache-2.0</option>
                    <option value="GPL-3.0">GPL-3.0</option>
                    <option value="ISC">ISC</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="flex flex-col h-[900px] rounded-2xl glass shadow-card overflow-hidden">
          <div className="p-4 border-b border-border/40 flex items-center justify-between bg-surface/50">
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-md border border-border/60">
                <button
                  type="button"
                  onClick={() => setView("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                    view === "preview" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setView("raw")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                    view === "raw" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Raw
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="h-7 text-xs">
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </Button>
              <Button size="sm" onClick={handleDownload} className="h-7 text-xs">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#0d1117] dark:bg-[#0d1117] text-[#c9d1d9] dark:text-[#c9d1d9]">
            {view === "raw" ? (
              <textarea
                value={markdownOutput}
                readOnly
                className="w-full h-full p-6 bg-transparent text-sm font-mono outline-none resize-none"
                spellCheck={false}
              />
            ) : (
              <div className="p-8 prose prose-invert max-w-none 
                prose-headings:border-b prose-headings:border-[#21262d] prose-headings:pb-2 prose-headings:font-semibold
                prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                prose-a:text-[#58a6ff] prose-a:no-underline hover:prose-a:underline
                prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-[#161b22] prose-code:rounded-md prose-code:text-[#c9d1d9] prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-[#21262d]
                prose-img:max-w-full prose-img:rounded-md"
              >
                <Markdown remarkPlugins={[remarkGfm]}>{markdownOutput}</Markdown>
              </div>
            )}
          </div>
        </div>
      </div>

      <HowToSection title="How to use README Studio" steps={STEPS} />
      <AdSlot label="Recommended for developers" />
      <FaqSection items={FAQ} />
    </ToolShell>
  );
}
