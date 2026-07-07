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
  FileArchive,
  MessageCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { PDFDocument, StandardFonts } from "pdf-lib";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { buildPageHead } from "@/lib/seo";

import { extractTextFromFile } from "@/lib/notes/file-extractor";
import {
  analyzeNotes,
  chatWithNotes,
  type SummaryMode,
  type AnalysisResult,
} from "@/lib/summarizer/logic";

export const Route = createFileRoute("/tools/notes-summarizer")({
  head: () => ({
    ...buildPageHead({
      title: "Notes Assistant Pro: Local AI Summarizer | CampusAI Hub",
      description:
        "Convert notes into summaries, flashcards, exam questions, and chat with your documents locally.",
      path: "/tools/notes-summarizer",
    }),
  }),
  component: NotesAssistantPage,
});

const SUMMARY_MODES: {
  value: SummaryMode;
  label: string;
  icon: React.ElementType;
  desc: string;
}[] = [
  { value: "ai-summary", label: "AI Summary", icon: FileText, desc: "TextRank analysis" },
  {
    value: "student-notes",
    label: "Student Notes",
    icon: BookOpen,
    desc: "Headings & definitions",
  },
  { value: "exam-mode", label: "Exam Mode", icon: GraduationCap, desc: "MCQs & questions" },
  { value: "flashcards", label: "Flashcards", icon: HelpCircle, desc: "Front/back study cards" },
];

function NotesAssistantPage() {
  const [manualText, setManualText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [extractedFileText, setExtractedFileText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedMode, setSelectedMode] = useState<SummaryMode | "chat">("ai-summary");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Chat state
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);

  const activeText = file ? extractedFileText : manualText;

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) {
      handleClear();
      return;
    }
    const uploaded = files[0];
    setFile(uploaded);
    setIsLoading(true);
    toast.loading("Analyzing file...", { id: "extract" });
    try {
      const text = await extractTextFromFile(uploaded);
      if (!text || text.trim().length < 20)
        throw new Error("No readable content found or file is too short.");
      setExtractedFileText(text);
      toast.success("Text extracted successfully", { id: "extract" });
    } catch (err: unknown) {
      toast.error((err as Error).message, { id: "extract" });
      handleClear();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setExtractedFileText("");
    setManualText("");
    setResult(null);
    setChatHistory([]);
  };

  const handleGenerate = async (mode: SummaryMode) => {
    if (activeText.trim().length < 50)
      return toast.error("Please provide more text (at least 50 characters).");
    setIsLoading(true);
    toast.loading("Analyzing notes...", { id: "gen" });
    try {
      const res = await analyzeNotes(activeText, mode);
      setResult(res);
      toast.success("Summary generated successfully", { id: "gen" });
    } catch (err) {
      toast.error("Failed to generate analysis.", { id: "gen" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatQuery.trim() || activeText.trim().length < 50) return;
    const q = chatQuery;
    setChatQuery("");
    setChatHistory((prev) => [...prev, { role: "user", text: q }]);
    setIsLoading(true);

    try {
      const answer = await chatWithNotes(activeText, q);
      setChatHistory((prev) => [...prev, { role: "ai", text: answer }]);
    } catch {
      toast.error("Failed to search notes.");
    } finally {
      setIsLoading(false);
    }
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
      let currentY = height - margin;

      page.drawText(`Notes Assistant - ${selectedMode}`, {
        x: margin,
        y: currentY,
        size: 18,
        font: boldFont,
      });
      currentY -= 36;

      const paragraphs = result.output.split("\n");
      for (const para of paragraphs) {
        if (!para.trim()) {
          currentY -= 10;
          continue;
        }
        const isBold = para.startsWith("**") || para.startsWith("###");
        const cleanPara = para.replace(/\*\*/g, "").replace(/###\s/g, "");
        const currentFont = isBold ? boldFont : font;

        const words = cleanPara.split(" ");
        let line = "";
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          if (currentFont.widthOfTextAtSize(testLine, 12) > width - margin * 2 && line !== "") {
            page.drawText(line.trim(), { x: margin, y: currentY, size: 12, font: currentFont });
            currentY -= 16;
            line = words[i] + " ";
            if (currentY < margin) {
              page = pdfDoc.addPage([600, 800]);
              currentY = height - margin;
            }
          } else {
            line = testLine;
          }
        }
        if (line !== "") {
          page.drawText(line.trim(), { x: margin, y: currentY, size: 12, font: currentFont });
          currentY -= 16;
        }
        currentY -= 5;
        if (currentY < margin) {
          page = pdfDoc.addPage([600, 800]);
          currentY = height - margin;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Notes_${selectedMode}.pdf`;
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
      title={
        <>
          Notes <span className="text-gradient">Assistant Pro</span>
        </>
      }
      description="Advanced intelligence: AI summaries, student notes, exam prep, flashcards, and local document chat."
    >
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl glass p-6 shadow-card flex flex-col gap-6 h-full min-h-[500px]">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h2 className="text-lg font-semibold">1. Input Notes</h2>
              {(file || manualText) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-destructive h-8"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Clear
                </Button>
              )}
            </div>

            <div className="space-y-4 flex-1 flex flex-col">
              {!file && (
                <div className="space-y-2 flex-1 flex flex-col">
                  <Label>Manual Text Input</Label>
                  <Textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Paste notes or upload a file..."
                    className="flex-1 resize-none bg-surface-2/40 border-border/50"
                  />
                </div>
              )}

              {(!manualText || file) && (
                <div className="space-y-2">
                  {!file && (
                    <div className="text-center text-xs text-muted-foreground my-2 font-medium">
                      OR
                    </div>
                  )}
                  <FileUpload
                    accept={{
                      "application/pdf": [".pdf"],
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
                        ".docx",
                      ],
                      "text/plain": [".txt"],
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
                {SUMMARY_MODES.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => {
                        setSelectedMode(mode.value);
                        if (activeText) handleGenerate(mode.value);
                      }}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${selectedMode === mode.value ? "bg-brand/10 border-brand text-brand-foreground" : "bg-surface-2/30 border-border/50 hover:border-brand/50"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`h-4 w-4 ${selectedMode === mode.value ? "text-brand" : "text-muted-foreground"}`}
                        />
                        <span className="font-medium text-sm">{mode.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{mode.desc}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => setSelectedMode("chat")}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${selectedMode === "chat" ? "bg-brand/10 border-brand text-brand-foreground" : "bg-surface-2/30 border-border/50 hover:border-brand/50"}`}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle
                      className={`h-4 w-4 ${selectedMode === "chat" ? "text-brand" : "text-muted-foreground"}`}
                    />
                    <span className="font-medium text-sm">Chat (Local)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Search uploaded notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-2xl glass p-6 shadow-card flex flex-col min-h-[650px]">
            {selectedMode === "chat" ? (
              <div className="flex flex-col h-full flex-1">
                <div className="flex items-center mb-6 border-b border-border/40 pb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-brand" /> Chat with Notes
                  </h2>
                </div>
                {!activeText ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground/60 flex-col">
                    <FileText className="h-10 w-10 mb-4 opacity-50" />
                    <p>Upload a document to start chatting.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                      {chatHistory.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm mt-10">
                          Ask a question based on your notes!
                        </div>
                      ) : (
                        chatHistory.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`p-3 rounded-xl max-w-[85%] text-sm ${msg.role === "user" ? "bg-brand text-brand-foreground" : "bg-surface-2/60 border border-border/50"}`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        placeholder="Search or ask about your notes..."
                        onKeyDown={(e) => e.key === "Enter" && handleChat()}
                      />
                      <Button onClick={handleChat} disabled={isLoading || !chatQuery.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full flex-1">
                <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand" /> Output
                  </h2>
                  {result && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyResult}
                        className="h-8 w-8"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={downloadTxt}
                        className="h-8 w-8"
                      >
                        <FileArchive className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={downloadPdf}
                        className="h-8 w-8"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                {!result ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground/60 flex-col">
                    <FileText className="h-10 w-10 mb-4 opacity-50" />
                    <p>Select a mode to generate insights.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {result.output.split("\n").map((line, i) => {
                        if (line.startsWith("###"))
                          return (
                            <h3 key={i} className="text-lg font-bold">
                              {line.replace("### ", "")}
                            </h3>
                          );
                        if (line.startsWith("####"))
                          return (
                            <h4 key={i} className="text-md font-semibold text-brand mt-4">
                              {line.replace("#### ", "")}
                            </h4>
                          );
                        if (line.startsWith("**") && line.endsWith("**"))
                          return (
                            <p key={i} className="font-semibold">
                              {line.replace(/\*\*/g, "")}
                            </p>
                          );
                        if (line.startsWith("- "))
                          return (
                            <li key={i} className="ml-4">
                              {line.substring(2)}
                            </li>
                          );
                        if (line.trim() === "---")
                          return <hr key={i} className="my-6 border-border/50" />;
                        if (!line.trim()) return <div key={i} className="h-2" />;
                        return (
                          <p key={i} className="text-muted-foreground">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
