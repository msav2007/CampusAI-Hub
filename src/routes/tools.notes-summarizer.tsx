import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText,
  Copy,
  Download,
  Sparkles,
  Trash2,
  RefreshCw,
  BookOpen,
  List,
  GraduationCap,
  HelpCircle,
  FileQuestion,
  FileArchive
} from "lucide-react";
import { toast } from "sonner";
import { PDFDocument, StandardFonts } from "pdf-lib";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { buildPageHead } from "@/lib/seo";

import { extractTextFromFile } from "@/lib/notes/file-extractor";
import { analyzeNotes, type SummaryMode, type AnalysisResult } from "@/lib/summarizer/logic";

export const Route = createFileRoute("/tools/notes-summarizer")({
  head: () => ({
    ...buildPageHead({
      title: "Notes Assistant: AI-Powered Study Tools Locally | CampusAI Hub",
      description: "Convert weak lecture notes into detailed summaries, flashcards, exam questions, and study guides. Runs locally in your browser.",
      path: "/tools/notes-summarizer",
      keywords: "notes assistant, summarize notes, local ai summarizer, student study tools, flashcards generator",
    }),
  }),
  component: NotesAssistantPage,
});

const SUMMARY_MODES: { value: SummaryMode; label: string; icon: any; desc: string }[] = [
  { value: "short", label: "Short Summary", icon: FileText, desc: "Brief overview" },
  { value: "detailed", label: "Detailed Summary", icon: BookOpen, desc: "Organized explanation" },
  { value: "bullets", label: "Bullet Notes", icon: List, desc: "Clean study notes" },
  { value: "revision", label: "Exam Revision", icon: GraduationCap, desc: "Definitions & key points" },
  { value: "flashcards", label: "Flashcards", icon: HelpCircle, desc: "Q&A format" },
  { value: "questions", label: "Important Questions", icon: FileQuestion, desc: "Possible exam questions" },
];

function NotesAssistantPage() {
  const [manualText, setManualText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [extractedFileText, setExtractedFileText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedMode, setSelectedMode] = useState<SummaryMode>("detailed");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const activeText = file ? extractedFileText : manualText;

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      setExtractedFileText("");
      return;
    }
    const uploaded = files[0];
    setFile(uploaded);
    setIsLoading(true);
    toast.loading("Analyzing file...", { id: "extract" });
    try {
      const text = await extractTextFromFile(uploaded);
      if (!text || text.trim().length < 20) {
        throw new Error("No readable content found or file is too short.");
      }
      setExtractedFileText(text);
      toast.success("Text extracted successfully", { id: "extract" });
    } catch (err: any) {
      toast.error(err.message, { id: "extract" });
      setFile(null);
      setExtractedFileText("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = (mode: SummaryMode = selectedMode) => {
    if (activeText.trim().length < 50) {
      toast.error("Please provide more text (at least 50 characters).");
      return;
    }
    
    setIsLoading(true);
    toast.loading("Analyzing notes...", { id: "gen" });
    
    // Simulate slight delay for heavy processing feel
    setTimeout(() => {
      try {
        const res = analyzeNotes(activeText, mode);
        setResult(res);
        toast.success("Summary generated successfully", { id: "gen" });
      } catch (err) {
        toast.error("Failed to generate analysis.", { id: "gen" });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.output);
    toast.success("Copied to clipboard!");
  };

  const downloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result.output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Notes_Assistant_${selectedMode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    if (!result) return;
    toast.loading("Generating PDF...", { id: "pdf" });
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();
      const margin = 50;
      const fontSize = 12;
      const titleFontSize = 18;
      const lineHeight = fontSize * 1.4;
      
      let currentY = height - margin;

      const titleMap: Record<string, string> = {
        "short": "Short Summary",
        "detailed": "Detailed Summary",
        "bullets": "Bullet Notes",
        "revision": "Exam Revision Guide",
        "flashcards": "Study Flashcards",
        "questions": "Important Questions"
      };

      page.drawText(`Notes Assistant - ${titleMap[selectedMode]}`, { 
        x: margin, 
        y: currentY, 
        size: titleFontSize, 
        font: boldFont 
      });
      currentY -= titleFontSize * 2;

      // Basic word wrap
      const paragraphs = result.output.split('\n');
      
      for (const para of paragraphs) {
        if (!para.trim()) {
          currentY -= lineHeight * 0.5;
          continue;
        }

        const isBold = para.startsWith("**") && para.endsWith("**");
        const cleanPara = para.replace(/\*\*/g, "");
        const currentFont = isBold || para.startsWith("###") ? boldFont : font;

        const words = cleanPara.split(' ');
        let line = '';
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const textWidth = currentFont.widthOfTextAtSize(testLine, fontSize);
          
          if (textWidth > width - margin * 2 && line !== '') {
            page.drawText(line.trim(), { x: margin, y: currentY, size: fontSize, font: currentFont });
            currentY -= lineHeight;
            line = words[i] + ' ';
            
            if (currentY < margin) {
              page = pdfDoc.addPage([600, 800]);
              currentY = height - margin;
            }
          } else {
            line = testLine;
          }
        }
        
        if (line !== '') {
          page.drawText(line.trim(), { x: margin, y: currentY, size: fontSize, font: currentFont });
          currentY -= lineHeight;
        }
        
        currentY -= lineHeight * 0.3; // Paragraph spacing
        if (currentY < margin) {
          page = pdfDoc.addPage([600, 800]);
          currentY = height - margin;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Notes_Assistant_${selectedMode}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF Downloaded!", { id: "pdf" });
    } catch (err) {
      toast.error("Failed to create PDF", { id: "pdf" });
    }
  };

  return (
    <ToolShell
      eyebrow="Productivity"
      title={<>Notes <span className="text-gradient">Assistant</span></>}
      description="Turn your raw notes into structured summaries, flashcards, and exam questions locally in your browser."
    >
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left Column: Input & Modes */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl glass p-6 shadow-card flex flex-col gap-6 h-full min-h-[500px]">
            <h2 className="text-lg font-semibold">1. Input Notes</h2>
            
            <div className="space-y-4 flex-1 flex flex-col">
              {!file && (
                <div className="space-y-2 flex-1 flex flex-col">
                  <Label>Manual Text Input</Label>
                  <Textarea 
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    placeholder="Paste your long notes, lecture transcripts, or study materials here..."
                    className="flex-1 resize-none bg-surface-2/40 border-border/50 text-[15px]"
                  />
                </div>
              )}

              {(!manualText || file) && (
                <div className="space-y-2">
                  {!file && <div className="text-center text-xs text-muted-foreground my-2 font-medium">OR</div>}
                  <FileUpload 
                    accept={{
                      "application/pdf": [".pdf"],
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                      "text/plain": [".txt"]
                    }}
                    maxFiles={1}
                    value={file ? [file] : []}
                    onChange={handleUpload}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-3 pt-4 border-t border-border/40">
              <Label>2. Select Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                {SUMMARY_MODES.map(mode => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setSelectedMode(mode.value)}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                        selectedMode === mode.value 
                          ? "bg-brand/10 border-brand text-brand-foreground shadow-sm" 
                          : "bg-surface-2/30 border-border/50 hover:border-brand/50 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${selectedMode === mode.value ? "text-brand" : "text-muted-foreground"}`} />
                        <span className="font-medium text-sm">{mode.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{mode.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button 
              onClick={() => handleGenerate()} 
              disabled={isLoading || (!manualText && !file)} 
              className="w-full mt-2"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isLoading ? "Analyzing notes..." : "Generate Insights"}
            </Button>
          </div>
        </div>

        {/* Right Column: Output & Analytics */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-2xl glass p-6 shadow-card flex flex-col min-h-[650px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand" />
                Results
              </h2>
              {result && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={copyResult} title="Copy Text" className="h-9 w-9">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={downloadTxt} title="Download TXT" className="h-9 w-9">
                    <FileArchive className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={downloadPdf} title="Download PDF" className="h-9 w-9">
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setResult(null)} title="Clear Result" className="h-9 w-9 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/60">
                <Sparkles className="h-10 w-10 mb-4 opacity-50" />
                <p>Provide input notes and click Generate Insights.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 flex-1">
                {/* Analytics Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-surface-2/50 rounded-xl p-3 border border-border/50 flex flex-col justify-center">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Word Count</span>
                    <span className="text-lg font-bold text-foreground">{result.analytics.wordCount}</span>
                  </div>
                  <div className="bg-surface-2/50 rounded-xl p-3 border border-border/50 flex flex-col justify-center">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Read Time</span>
                    <span className="text-lg font-bold text-foreground">{result.analytics.readingTimeMin} min</span>
                  </div>
                  <div className="bg-surface-2/50 rounded-xl p-3 border border-border/50 flex flex-col justify-center">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Chars</span>
                    <span className="text-lg font-bold text-foreground">{result.analytics.charCount}</span>
                  </div>
                  <div className="bg-surface-2/50 rounded-xl p-3 border border-border/50 flex flex-col justify-center">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Difficulty</span>
                    <span className={`text-lg font-bold ${
                      result.analytics.difficulty === "Advanced" ? "text-destructive" :
                      result.analytics.difficulty === "Intermediate" ? "text-amber-500" :
                      "text-green-500"
                    }`}>
                      {result.analytics.difficulty}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-2/30 rounded-xl border border-border/50 p-4">
                  <span className="text-xs uppercase text-muted-foreground font-semibold block mb-2">Key Topics Detected</span>
                  <div className="flex flex-wrap gap-2">
                    {result.analytics.keyTopics.map((topic, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-brand/10 text-brand text-xs font-medium">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                   <div className="bg-surface-2/30 rounded-xl border border-border/50 p-5 prose prose-sm dark:prose-invert max-w-none">
                     {result.output.split('\n').map((line, i) => {
                       if (line.startsWith("###")) {
                         return <h3 key={i} className="text-lg font-bold text-foreground mt-0 mb-4">{line.replace("### ", "")}</h3>;
                       }
                       if (line.startsWith("**") && line.endsWith("**")) {
                         return <p key={i} className="font-semibold text-foreground mt-4 mb-2">{line.replace(/\*\*/g, "")}</p>;
                       }
                       if (line.startsWith("- ")) {
                         return <li key={i} className="ml-4 text-muted-foreground">{line.substring(2)}</li>;
                       }
                       if (line.trim() === "---") {
                         return <hr key={i} className="my-6 border-border/50" />;
                       }
                       if (!line.trim()) {
                         return <div key={i} className="h-2" />;
                       }
                       
                       // Flashcard Q/A parsing
                       if (line.startsWith("**Q") && line.includes("**:")) {
                          const parts = line.split("**: ");
                          return <div key={i} className="font-bold text-foreground mb-1">{parts[0]}**: <span className="font-normal text-muted-foreground">{parts[1]}</span></div>;
                       }
                       if (line.startsWith("**A") && line.includes("**:")) {
                          const parts = line.split("**: ");
                          return <div key={i} className="font-bold text-brand mb-1">{parts[0]}**: <span className="font-normal text-foreground">{parts[1]}</span></div>;
                       }

                       return <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>;
                     })}
                   </div>
                </div>

                <div className="flex gap-2 justify-end">
                   <Button variant="outline" size="sm" onClick={() => handleGenerate()} disabled={isLoading}>
                     <RefreshCw className="h-3.5 w-3.5 mr-2" /> Regenerate
                   </Button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </ToolShell>
  );
}
