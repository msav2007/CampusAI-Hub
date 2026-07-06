import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  FileSearch,
  LoaderCircle,
  Sparkles,
  Download,
  Copy,
  Briefcase,
  Layers,
  GraduationCap,
  AlignLeft,
  Search,
  CheckSquare
} from "lucide-react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import { PDFDocument, StandardFonts } from "pdf-lib";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { extractResumeText } from "@/lib/ats/extraction";
import { analyzeResumeAgainstJob, type AtsAnalysis } from "@/lib/ats/scoring";
import { buildPageHead } from "@/lib/seo";

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
      source: "pdf" | "docx" | "text";
    };

export const Route = createFileRoute("/tools/resume-ats")({
  head: () => ({
    ...buildPageHead({
      title: "Resume ATS Checker — Free PDF & DOCX Resume Scanner | CampusAI Tools",
      description: "Upload your resume, paste a job description, and get a realistic ATS score with detailed category feedback.",
      path: "/tools/resume-ats",
      keywords: "resume ats checker, ats resume score, pdf resume scanner, resume keyword checker",
    }),
  }),
  component: ResumeAtsPage,
});

function ResumeAtsPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadState, setUploadState] = useState<ResumeUploadState>({ status: "idle" });

  const deferredJobDescription = useDeferredValue(jobDescription);
  const resumeText = uploadState.status === "ready" ? uploadState.text : "";
  
  const analysis = useMemo(() => {
    if (!resumeText) return null;
    return analyzeResumeAgainstJob(resumeText, deferredJobDescription);
  }, [deferredJobDescription, resumeText]);

  const handleFileUpload = async (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    if (uploadedFiles.length === 0) {
      setUploadState({ status: "idle" });
      return;
    }
    const file = uploadedFiles[0];
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
        toast.success("Resume parsed successfully!");
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not read that file.";
      setUploadState({ status: "error", fileName: file.name, message });
      toast.error(message);
    }
  };

  const scoreTone =
    analysis && analysis.score >= 85
      ? "text-emerald-400"
      : analysis && analysis.score >= 65
        ? "text-amber-400"
        : "text-rose-400";

  const copyReport = async () => {
    if (!analysis) return;
    const report = `ATS Resume Score: ${analysis.score}/100
Rating: ${analysis.grade}

STRENGTHS:
${analysis.feedback.strengths.map(s => "- " + s).join("\n")}

WEAKNESSES:
${analysis.feedback.weaknesses.map(s => "- " + s).join("\n")}

IMPROVEMENTS:
${analysis.feedback.improvements.map(s => "- " + s).join("\n")}

MISSING KEYWORDS:
${analysis.feedback.missingKeywords.join(", ")}`;

    await navigator.clipboard.writeText(report);
    toast.success("Report copied to clipboard");
  };

  const downloadReportPdf = async () => {
    if (!analysis) return;
    toast.loading("Generating PDF...", { id: "ats-pdf" });
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let page = pdfDoc.addPage([600, 800]);
      let y = 730;
      const margin = 50;
      const lineHeight = 16;

      const drawText = (text: string, size = 12, isBold = false) => {
        page.drawText(text, { x: margin, y, size, font: isBold ? boldFont : font });
        y -= lineHeight;
        if (y < margin) {
          page = pdfDoc.addPage([600, 800]);
          y = 750;
        }
      };

      drawText("ATS Resume Analysis Report", 18, true);
      y -= 10;
      drawText(`Overall Score: ${analysis.score}/100 - ${analysis.grade}`, 14, true);
      y -= 20;

      drawText("Category Scores:", 14, true);
      drawText(`Skills Match: ${analysis.categoryScores.skillsMatch}%`);
      drawText(`Experience: ${analysis.categoryScores.experience}%`);
      drawText(`Projects: ${analysis.categoryScores.projects}%`);
      drawText(`Education: ${analysis.categoryScores.education}%`);
      drawText(`Keywords: ${analysis.categoryScores.keywords}%`);
      drawText(`Formatting: ${analysis.categoryScores.formatting}%`);
      y -= 10;

      drawText("Strengths:", 14, true);
      analysis.feedback.strengths.forEach(s => drawText(`- ${s}`));
      y -= 10;

      if (analysis.feedback.weaknesses.length > 0) {
        drawText("Weaknesses:", 14, true);
        analysis.feedback.weaknesses.forEach(s => drawText(`- ${s}`));
        y -= 10;
      }

      drawText("Suggested Improvements:", 14, true);
      analysis.feedback.improvements.forEach(s => drawText(`- ${s}`));
      y -= 10;

      drawText(`Missing Keywords: ${analysis.feedback.missingKeywords.join(", ") || "None!"}`);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ATS_Report_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF Downloaded!", { id: "ats-pdf" });
    } catch {
      toast.error("Failed to generate PDF", { id: "ats-pdf" });
    }
  };

  return (
    <ToolShell
      eyebrow="Career"
      title={<>Resume <span className="text-gradient">ATS Checker</span></>}
      description="Upload a resume, optionally paste a job description, and get a realistic ATS score with detailed feedback."
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-2xl glass p-6 shadow-card h-full min-h-[400px]">
             <h2 className="text-lg font-semibold tracking-tight mb-4">1. Upload Resume</h2>
             <FileUpload 
               accept={{
                 "application/pdf": [".pdf"],
                 "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                 "text/plain": [".txt"]
               }}
               maxFiles={1}
               value={files}
               onChange={handleFileUpload}
             />
             <UploadStatus state={uploadState} />

             <div className="mt-8">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold tracking-tight">2. Target Job (Optional)</h2>
                 <Button variant="ghost" size="sm" onClick={() => setJobDescription(SAMPLE_JOB_DESCRIPTION)}>
                   <Sparkles className="h-4 w-4 mr-2" /> Load Sample
                 </Button>
               </div>
               <Textarea
                 value={jobDescription}
                 onChange={(e) => setJobDescription(e.target.value)}
                 rows={10}
                 placeholder="Paste the job description here to generate a highly accurate Keyword and Skills Match score..."
                 className="resize-y bg-surface-2/40"
               />
             </div>
          </section>
        </div>

        <section className="rounded-2xl glass p-6 shadow-card">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-brand" />
              Result Dashboard
            </h2>
            {analysis && (
               <div className="flex gap-2">
                 <Button variant="outline" size="icon" onClick={copyReport} title="Copy Report"><Copy className="h-4 w-4" /></Button>
                 <Button variant="outline" size="icon" onClick={downloadReportPdf} title="Download PDF"><Download className="h-4 w-4" /></Button>
               </div>
            )}
          </div>

          {!analysis ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground/60">
              <FileSearch className="h-10 w-10 mb-4 opacity-50" />
              <p>Upload a resume to see your ATS Score.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                   <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Overall ATS Score</span>
                   <div className={`text-6xl font-black tracking-tighter tabular-nums mt-2 ${scoreTone}`}>
                     {analysis.score}
                   </div>
                 </div>
                 <div className="flex-1 text-center md:text-right">
                   <div className="inline-block px-4 py-1.5 rounded-full bg-brand/10 text-brand font-bold text-sm mb-2">{analysis.grade}</div>
                   <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                 </div>
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 <CategoryCard title="Skills Match" score={analysis.categoryScores.skillsMatch} icon={<CheckSquare />} />
                 <CategoryCard title="Experience" score={analysis.categoryScores.experience} icon={<Briefcase />} />
                 <CategoryCard title="Projects" score={analysis.categoryScores.projects} icon={<Layers />} />
                 <CategoryCard title="Formatting" score={analysis.categoryScores.formatting} icon={<AlignLeft />} />
                 <CategoryCard title="Education" score={analysis.categoryScores.education} icon={<GraduationCap />} />
                 <CategoryCard title="Keywords" score={analysis.categoryScores.keywords} icon={<Search />} />
              </div>

              {/* Feedback System */}
              <div className="space-y-4">
                 <div className="rounded-xl border border-border/60 bg-emerald-500/5 p-5">
                    <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Strengths</h3>
                    <ul className="space-y-2 text-sm text-foreground/90">
                      {analysis.feedback.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                 </div>

                 {analysis.feedback.weaknesses.length > 0 && (
                   <div className="rounded-xl border border-border/60 bg-rose-500/5 p-5">
                      <h3 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Weaknesses</h3>
                      <ul className="space-y-2 text-sm text-foreground/90">
                        {analysis.feedback.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
                      </ul>
                   </div>
                 )}

                 <div className="rounded-xl border border-border/60 bg-amber-500/5 p-5">
                    <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Suggested Improvements</h3>
                    <ul className="space-y-2 text-sm text-foreground/90">
                      {analysis.feedback.improvements.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="rounded-xl border border-border/60 bg-surface-2/30 p-5">
                   <h3 className="text-sm font-bold mb-3">Missing Keywords</h3>
                   <div className="flex flex-wrap gap-2">
                     {analysis.feedback.missingKeywords.length > 0 ? (
                       analysis.feedback.missingKeywords.map(k => <span key={k} className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-medium">{k}</span>)
                     ) : <span className="text-sm text-emerald-400">Perfect keyword coverage!</span>}
                   </div>
                 </div>

                 <div className="rounded-xl border border-border/60 bg-surface-2/30 p-5">
                   <h3 className="text-sm font-bold mb-3">Detected Skills & Verbs</h3>
                   <div className="flex flex-wrap gap-2">
                     {analysis.feedback.detectedSkills.map(k => <span key={k} className="px-2.5 py-1 rounded-md bg-brand/10 text-brand text-xs font-medium">{k}</span>)}
                     {analysis.feedback.actionVerbs.map(k => <span key={k} className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium">{k}</span>)}
                   </div>
                 </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </ToolShell>
  );
}

function UploadStatus({ state }: { state: ResumeUploadState }) {
  if (state.status === "idle") return null;
  if (state.status === "loading") {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/60 bg-background/30 p-3 text-sm text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" /> Extracting text...
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        <div className="font-medium">Failed to parse {state.fileName}</div>
        <div className="text-destructive/80 text-xs mt-1">{state.message}</div>
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm flex items-center justify-between">
      <div className="flex items-center gap-2 font-medium text-emerald-300">
        <CheckCircle2 className="h-4 w-4" /> Parsed successfully
      </div>
      <div className="text-xs text-emerald-400/80">{state.pageCount} page(s) • {state.source.toUpperCase()}</div>
    </div>
  );
}

function CategoryCard({ title, score, icon }: { title: string, score: number, icon: React.ReactNode }) {
  const color = score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400";
  return (
    <div className="rounded-xl border border-border/60 bg-surface-2/40 p-4 flex flex-col items-center text-center">
       <div className="text-muted-foreground/60 mb-2 [&>svg]:w-5 [&>svg]:h-5">{icon}</div>
       <div className={`text-2xl font-bold tracking-tight ${color}`}>{score}%</div>
       <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1 font-semibold">{title}</div>
    </div>
  );
}
