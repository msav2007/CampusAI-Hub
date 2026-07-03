import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Copy, Download, FileCode2, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildPageHead } from "@/lib/seo";
import { readJsonFromStorage, writeJsonToStorage } from "@/lib/storage";
import {
  DEFAULT_README_INPUT,
  generateReadme,
  type ReadmeInput,
} from "@/lib/readme-generator/logic";

const STORAGE_KEY = "campusai:readmegenerator:v1";

const emptyInput: ReadmeInput = {
  projectName: "",
  description: "",
  techStack: "",
  installation: "",
  usage: "",
  features: "",
  githubRepo: "",
  license: "MIT",
};

export const Route = createFileRoute("/tools/readme-generator")({
  head: () => ({
    ...buildPageHead({
      title: "Free README Generator Online — CampusAI Tools",
      description:
        "Generate a polished, professional README.md for your GitHub project in seconds. Free, runs locally, no sign-up required.",
      path: "/tools/readme-generator",
      keywords: "readme generator, github readme maker, markdown generator, free readme tool",
    }),
  }),
  component: ReadmeGeneratorPage,
});

function ReadmeGeneratorPage() {
  const [input, setInput] = useState<ReadmeInput>(emptyInput);
  const [loaded, setLoaded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const stored = readJsonFromStorage<ReadmeInput>(STORAGE_KEY);
    if (stored) {
      setInput((prev) => ({ ...prev, ...stored }));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJsonToStorage(STORAGE_KEY, input);
  }, [loaded, input]);

  const updateInput = (field: keyof ReadmeInput, value: string) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setInput(emptyInput);
    setIsCopied(false);
  };

  const handleLoadExample = () => {
    setInput(DEFAULT_README_INPUT);
    setIsCopied(false);
  };

  const markdownOutput = generateReadme(input);

  const copyToClipboard = async () => {
    if (!markdownOutput) return;
    try {
      await navigator.clipboard.writeText(markdownOutput);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([markdownOutput], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ToolShell
      eyebrow="Developer"
      title={
        <>
          README <span className="text-gradient">Generator</span>
        </>
      }
      description="Create a professional, structured README.md for your projects by simply filling out a form. Everything runs entirely in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="flex h-[800px] flex-col rounded-2xl glass p-5 shadow-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <BookOpen className="h-5 w-5 text-brand" />
              Project Details
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleLoadExample} className="text-xs">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Example Template
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs"
                aria-label="Clear form"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={input.projectName}
                onChange={(e) => updateInput("projectName", e.target.value)}
                placeholder="e.g. CampusAI Hub"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={input.description}
                onChange={(e) => updateInput("description", e.target.value)}
                placeholder="Describe what your project does..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={input.features}
                onChange={(e) => updateInput("features", e.target.value)}
                placeholder="Fast performance&#10;Accessible UI&#10;Offline mode"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack (comma separated)</Label>
              <Input
                id="techStack"
                value={input.techStack}
                onChange={(e) => updateInput("techStack", e.target.value)}
                placeholder="e.g. React, TypeScript, Tailwind CSS"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="installation">Installation Commands</Label>
                <Textarea
                  id="installation"
                  value={input.installation}
                  onChange={(e) => updateInput("installation", e.target.value)}
                  placeholder="npm install"
                  rows={2}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage">Usage Commands</Label>
                <Textarea
                  id="usage"
                  value={input.usage}
                  onChange={(e) => updateInput("usage", e.target.value)}
                  placeholder="npm run dev"
                  rows={2}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="githubRepo">GitHub Repo URL</Label>
                <Input
                  id="githubRepo"
                  value={input.githubRepo}
                  onChange={(e) => updateInput("githubRepo", e.target.value)}
                  placeholder="https://github.com/user/repo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License</Label>
                <select
                  id="license"
                  value={input.license}
                  onChange={(e) => updateInput("license", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="License"
                >
                  <option value="MIT">MIT</option>
                  <option value="Apache-2.0">Apache 2.0</option>
                  <option value="GPL-3.0">GPL 3.0</option>
                  <option value="ISC">ISC</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex h-[800px] flex-col rounded-2xl glass p-5 shadow-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <FileCode2 className="h-5 w-5 text-brand" />
              Live Preview
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-xs">
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {isCopied ? "Copied!" : "Copy code"}
              </Button>
              <Button size="sm" onClick={downloadFile} className="text-xs">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-xl border border-border/60 bg-surface-2/30">
            <Textarea
              aria-label="Generated Markdown Preview"
              value={markdownOutput}
              readOnly
              className="h-full w-full resize-none border-none bg-transparent p-4 font-mono text-[13px] leading-relaxed focus-visible:ring-0"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
