import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  FileSearch,
  LoaderCircle,
  Sparkles,
  Upload,
} from "lucide-react";
import { startTransition, useDeferredValue, useMemo, useState, type ChangeEvent } from "react";

import { AdSlot, FaqSection, HowToSection, ShareButton } from "@/components/site/ToolExtras";
import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { extractResumeText } from "@/lib/ats/extraction";
import { analyzeResumeAgainstJob } from "@/lib/ats/scoring";
import { buildPageHead, jsonLdScript } from "@/lib/seo";
import { faqJsonLd, howToJsonLd, type FaqItem, type HowToStep } from "@/lib/structured-data";

const FAQ: FaqItem[] = [
  {
    q: "Does my resume get uploaded to a server?",
    a: "No. PDF parsing and ATS scoring run in your browser so your resume stays on your device.",
  },
  {
    q: "Which files can I upload?",
    a: "This launch version supports PDF resumes and plain text fallback files. Text-based PDFs work best.",
  },
  {
    q: "Why did my PDF fail to extract?",
    a: "Scanned image PDFs do not always contain selectable text. Export a text-based PDF from Word, Docs, or your design tool for better results.",
  },
  {
    q: "How is the ATS score calculated?",
    a: "The score blends keyword coverage, section completeness, formatting signals, and evidence of impact. It is meant as practical guidance, not a recruiter guarantee.",
  },
  {
    q: "Do I need a job description?",
    a: "Yes. Keyword matching is strongest when you compare your resume against a specific role.",
  },
];

const STEPS: HowToStep[] = [
  { title: "Upload your resume", body: "Choose a PDF resume or a text fallback file." },
  {
    title: "Paste the job description",
    body: "Use the exact role requirements for better keyword matching.",
  },
  {
    title: "Review the ATS score",
    body: "See keyword coverage, section checks, and formatting feedback.",
  },
  {
    title: "Improve the resume",
    body: "Use the missing keywords and recommendations before applying.",
  },
];

const SAMPLE_JOB_DESCRIPTION = `Frontend Developer

We are looking for a Frontend Developer with strong React, TypeScript, JavaScript, HTML, CSS, and API integration experience. You should be comfortable building responsive interfaces, collaborating with designers, testing components, and shipping production-ready web apps.

Requirements:
- 1+ years of experience with React and TypeScript
- Experience with REST APIs, Git, and modern testing workflows
- Strong communication, problem solving, and teamwork
- Bonus: Tailwind CSS, Next.js, Vitest, or Playwright`;

type ResumeUploadState =
  | { status: "idle" }
  | { status: "loading"; fileName: string }
  | { status: "error"; fileName: string; message: string }
  | {
      status: "ready";
      fileName: string;
      text: string;
      pageCount: number;
      source: "pdf" | "text";
    };

export const Route = createFileRoute("/tools/resume-ats")({
  head: () => ({
    ...buildPageHead({
      title: "Resume ATS Checker — Free PDF Resume Scanner | CampusAI Tools",
      description:
        "Upload a PDF resume, paste a job description, and get a clear ATS score with keyword coverage, missing terms, section checks, and improvement guidance.",
      path: "/tools/resume-ats",
      keywords:
        "resume ats checker, ats resume score, pdf resume scanner, resume keyword checker, job description match, resume parser",
      scripts: [
        jsonLdScript(faqJsonLd(FAQ)),
        jsonLdScript(howToJsonLd("How to use the resume ATS checker", STEPS)),
      ],
    }),
  }),
  component: ResumeAtsPage,
});

function ResumeAtsPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [uploadState, setUploadState] = useState<ResumeUploadState>({ status: "idle" });

  const deferredJobDescription = useDeferredValue(jobDescription);
  const resumeText = uploadState.status === "ready" ? uploadState.text : "";
  const analysis = useMemo(() => {
    if (!resumeText || !deferredJobDescription.trim()) return null;
    return analyzeResumeAgainstJob(resumeText, deferredJobDescription);
  }, [deferredJobDescription, resumeText]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadState({ status: "loading", fileName: file.name });

    try {
      const extracted = await extractResumeText(file);
      startTransition(() => {
        setUploadState({
          status: "ready",
          fileName: file.name,
          text: extracted.text,
          pageCount: extracted.pageCount,
          source: extracted.source,
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not read that file.";
      setUploadState({ status: "error", fileName: file.name, message });
    } finally {
      event.target.value = "";
    }
  };

  const scoreTone =
    analysis && analysis.score >= 85
      ? "text-emerald-300"
      : analysis && analysis.score >= 65
        ? "text-amber-300"
        : "text-rose-300";

  return (
    <ToolShell
      eyebrow="Career"
      title={
        <>
          Resume <span className="text-gradient">ATS Checker</span>
        </>
      }
      description="Upload a resume PDF, compare it with a real job description, and get clear ATS feedback without leaving the browser."
      actions={
        <ShareButton
          title="Resume ATS Checker — CampusAI Tools"
          text="Scan your resume against a job description and see what an ATS is likely to notice."
        />
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-2xl glass p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Resume upload
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">Upload a PDF resume</h2>
              </div>
              <span className="rounded-full border border-border/60 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                Local processing
              </span>
            </div>

            <label className="mt-5 flex cursor-pointer flex-col rounded-2xl border border-dashed border-border/70 bg-surface-2/30 p-6 transition hover:border-brand/40 hover:bg-surface-2/50">
              <input
                type="file"
                aria-label="Upload resume file"
                accept=".pdf,.txt,text/plain,application/pdf"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
                <Upload className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="mt-4 text-base font-semibold tracking-tight">
                Choose a PDF or text resume
              </div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Text-based PDFs work best. If your PDF is a scanned image, export a standard PDF
                from Word, Docs, or Canva first.
              </p>
            </label>

            <UploadStatus state={uploadState} />
          </section>

          <section className="rounded-2xl glass p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Job description
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">Paste the target role</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setJobDescription(SAMPLE_JOB_DESCRIPTION)}
              >
                <Sparkles className="h-4 w-4" />
                Load sample
              </Button>
            </div>
            <Textarea
              aria-label="Job description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={12}
              placeholder="Paste the exact job description here to compare required skills, keywords, and role expectations."
              className="mt-5 resize-y"
            />
          </section>
        </div>

        <section className="rounded-2xl glass p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                ATS analysis
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Results</h2>
            </div>
            <FileCheck2 className="h-5 w-5 text-muted-foreground" />
          </div>

          {uploadState.status === "loading" ? (
            <div className="mt-10 flex items-center gap-3 rounded-2xl border border-border/60 bg-surface-2/40 p-4 text-sm text-muted-foreground">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Extracting text from {uploadState.fileName}...
            </div>
          ) : null}

          {uploadState.status === "error" ? (
            <div className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
              <div className="flex items-start gap-3 text-destructive">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <div className="font-medium">Resume could not be analyzed</div>
                  <div className="mt-1 text-destructive/80">{uploadState.message}</div>
                </div>
              </div>
            </div>
          ) : null}

          {uploadState.status !== "loading" && uploadState.status !== "error" && !analysis ? (
            <div className="mt-10 grid min-h-[420px] place-items-center rounded-2xl border border-border/60 bg-surface-2/30 p-8 text-center">
              <div className="max-w-sm">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-border/60 bg-white/5">
                  <FileSearch className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">Ready when you are</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Upload a resume and paste a job description to see keyword coverage, ATS section
                  checks, and polished recommendations.
                </p>
              </div>
            </div>
          ) : null}

          {analysis ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Overall ATS score
                    </div>
                    <div
                      className={`mt-2 text-5xl font-bold tracking-tight tabular-nums ${scoreTone}`}
                    >
                      {analysis.score}
                    </div>
                    <div className="mt-2 text-sm text-foreground/90">{analysis.summary}</div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3 text-right">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Rating
                    </div>
                    <div className="mt-1 text-sm font-semibold">{analysis.grade}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {analysis.wordCount} words
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="Keyword coverage"
                  value={`${analysis.keywordCoverage.score}/55`}
                  hint={`${analysis.keywordCoverage.matched.length} matched`}
                />
                <MetricCard
                  label="Resume structure"
                  value={`${analysis.structure.score}/20`}
                  hint={`${analysis.structure.sections.filter((section) => section.present).length} sections found`}
                />
                <MetricCard
                  label="Formatting"
                  value={`${analysis.formatting.score}/15`}
                  hint={
                    analysis.formatting.conciseLength
                      ? "Length looks focused"
                      : "Length may need tightening"
                  }
                />
                <MetricCard
                  label="Impact signals"
                  value={`${analysis.impact.score}/10`}
                  hint={`${analysis.impact.actionVerbs.length} action verbs found`}
                />
              </div>

              <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-5">
                <div className="text-sm font-semibold tracking-tight">Matched keywords</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.keywordCoverage.matched.length > 0 ? (
                    analysis.keywordCoverage.matched.map((keyword) => (
                      <KeywordChip key={keyword} tone="good" text={keyword} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No high-confidence keyword matches yet.
                    </p>
                  )}
                </div>

                <div className="mt-5 text-sm font-semibold tracking-tight">Missing keywords</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.keywordCoverage.missing.length > 0 ? (
                    analysis.keywordCoverage.missing.map((keyword) => (
                      <KeywordChip key={keyword} tone="warn" text={keyword} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Great coverage. The resume already reflects the visible target keywords.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-5">
                <div className="text-sm font-semibold tracking-tight">Section checklist</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {analysis.structure.sections.map((section) => (
                    <div
                      key={section.key}
                      className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm"
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          section.present ? "text-emerald-300" : "text-muted-foreground/40"
                        }`}
                      />
                      <span
                        className={section.present ? "text-foreground/90" : "text-muted-foreground"}
                      >
                        {section.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-5">
                <div className="text-sm font-semibold tracking-tight">Priority improvements</div>
                <ul className="mt-3 space-y-2">
                  {analysis.recommendations.map((recommendation) => (
                    <li
                      key={recommendation}
                      className="flex items-start gap-2 text-sm text-foreground/90"
                    >
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-2" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {uploadState.status === "ready" ? (
                <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold tracking-tight">
                      Extracted resume preview
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {uploadState.pageCount} page{uploadState.pageCount === 1 ? "" : "s"} ·{" "}
                      {uploadState.source.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {uploadState.text.slice(0, 540)}
                    {uploadState.text.length > 540 ? "..." : ""}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      <HowToSection title="How to use the resume ATS checker" steps={STEPS} />
      <AdSlot label="Career partner spotlight" />
      <FaqSection items={FAQ} />
    </ToolShell>
  );
}

function UploadStatus({ state }: { state: ResumeUploadState }) {
  if (state.status === "idle") {
    return (
      <div className="mt-4 rounded-2xl border border-border/60 bg-background/30 p-4 text-sm text-muted-foreground">
        No resume uploaded yet.
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border/60 bg-background/30 p-4 text-sm text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Reading {state.fileName}...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        <div className="font-medium">{state.fileName}</div>
        <div className="mt-1 text-destructive/80">{state.message}</div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm">
      <div className="flex items-center gap-2 font-medium text-emerald-200">
        <CheckCircle2 className="h-4 w-4" />
        {state.fileName} is ready
      </div>
      <div className="mt-1 text-emerald-100/80">
        {state.pageCount} page{state.pageCount === 1 ? "" : "s"} parsed successfully.
      </div>
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function KeywordChip({ text, tone }: { text: string; tone: "good" | "warn" }) {
  const className =
    tone === "good"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : "border-amber-400/20 bg-amber-400/10 text-amber-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${className}`}
    >
      {text}
    </span>
  );
}
