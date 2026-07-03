import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Copy,
  Download,
  Layers,
  Scissors,
  Info,
  AlertCircle,
  FilePlus,
  GripVertical,
} from "lucide-react";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { buildPageHead } from "@/lib/seo";

import { extractTextFromPdf, mergePdfs, splitPdf, getPdfInfo } from "@/lib/pdf/pdf-utils";
import type { PDFInfo } from "@/lib/pdf/types";

export const Route = createFileRoute("/tools/pdf-tools")({
  head: () => ({
    ...buildPageHead({
      title: "Free PDF Tools Online — CampusAI Hub",
      description:
        "Merge, split, compress, and extract text from PDFs entirely in your browser. No server uploads. 100% private and free.",
      path: "/tools/pdf-tools",
      keywords: "pdf tools, merge pdf, split pdf, pdf text extractor, local pdf tools",
    }),
  }),
  component: PdfToolsPage,
});

type ToolType = "extract" | "merge" | "split" | "compress";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function PdfToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType>("extract");

  return (
    <ToolShell
      eyebrow="Productivity"
      title={
        <>
          PDF <span className="text-gradient">Tools</span>
        </>
      }
      description="A collection of essential PDF utilities. Processing happens entirely on your device, ensuring maximum privacy and speed."
    >
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          <Button
            variant={activeTool === "extract" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveTool("extract")}
          >
            <FileText className="h-4 w-4" /> Extract Text
          </Button>
          <Button
            variant={activeTool === "merge" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveTool("merge")}
          >
            <Layers className="h-4 w-4" /> Merge PDFs
          </Button>
          <Button
            variant={activeTool === "split" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveTool("split")}
          >
            <Scissors className="h-4 w-4" /> Split PDF
          </Button>
          <Button
            variant={activeTool === "compress" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveTool("compress")}
          >
            <Info className="h-4 w-4" /> Compress PDF
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeTool === "extract" && <ExtractTool />}
          {activeTool === "merge" && <MergeTool />}
          {activeTool === "split" && <SplitTool />}
          {activeTool === "compress" && (
            <div className="flex flex-col items-center justify-center rounded-2xl glass p-10 text-center shadow-card min-h-[400px]">
              <Info className="h-8 w-8 text-brand mb-4" />
              <h3 className="text-xl font-semibold mb-2">Compression coming soon</h3>
              <p className="text-muted-foreground max-w-md">
                True, high-quality PDF compression entirely in the browser is challenging. We're
                working on a local-first compression engine. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}

// ----------------------------------------------------------------------
// Extract Tool
// ----------------------------------------------------------------------
function ExtractTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setError("");
    setFile(selected);
    setExtractedText("");

    try {
      const info = await getPdfInfo(selected);
      setPdfInfo(info);
    } catch (err) {
      setError("Failed to read PDF info.");
    }
  };

  const processFile = async () => {
    if (!file) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await extractTextFromPdf(file);
      setExtractedText(res.text);
    } catch (err) {
      setError("Failed to extract text. The PDF might be an image/scanned document or encrypted.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(".pdf", "")}_extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const words = extractedText ? extractedText.trim().split(/\s+/).length : 0;
  const chars = extractedText.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl glass p-6 shadow-card">
        <h2 className="text-lg font-semibold mb-4">Extract Text</h2>
        {!file ? (
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl p-10 cursor-pointer hover:bg-surface-2/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="font-medium text-sm">Click or drag PDF to upload</p>
            <p className="text-xs text-muted-foreground mt-1">Accepts only .pdf files</p>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-2/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="h-6 w-6 text-brand shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.size)} {pdfInfo && `• ${pdfInfo.pages} pages`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {!extractedText && !error && (
              <Button onClick={processFile} disabled={isLoading} className="w-full">
                {isLoading ? "Extracting..." : "Extract Text"}
              </Button>
            )}
          </div>
        )}
      </div>

      {extractedText && (
        <div className="rounded-2xl glass p-6 shadow-card flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{words} words</span>
              <span>{chars} characters</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyText}>
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
              </Button>
              <Button size="sm" onClick={downloadText}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Save .txt
              </Button>
            </div>
          </div>
          <Textarea
            value={extractedText}
            readOnly
            className="flex-1 resize-none font-mono text-xs leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Merge Tool
// ----------------------------------------------------------------------
function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const validPdfs = selected.filter((f) => f.type === "application/pdf");
    if (validPdfs.length !== selected.length) {
      setError("Some files were skipped because they are not PDFs.");
    } else {
      setError("");
    }
    setFiles((prev) => [...prev, ...validPdfs]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const moveFile = (index: number, dir: -1 | 1) => {
    if (index + dir < 0 || index + dir >= files.length) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + dir];
      copy[index + dir] = temp;
      return copy;
    });
  };

  const processMerge = async () => {
    if (files.length < 2) return;
    setIsLoading(true);
    setError("");
    try {
      const blob = await mergePdfs(files);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merged_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to merge PDFs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Merge PDFs</h2>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <FilePlus className="h-4 w-4 mr-2" /> Add Files
        </Button>
        <input
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-amber-500 text-sm bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 mb-4">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {files.length === 0 ? (
        <div
          className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl p-10 cursor-pointer hover:bg-surface-2/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Layers className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-medium">Upload multiple PDFs to merge</p>
          <p className="text-xs text-muted-foreground mt-1">Files are merged in the order shown</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-surface-2/30 rounded-xl border border-border/50 group"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveFile(i, -1)}
                    disabled={i === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveFile(i, 1)}
                    disabled={i === files.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeFile(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={processMerge}
            disabled={files.length < 2 || isLoading}
            className="w-full mt-auto"
          >
            {isLoading ? "Merging..." : `Merge ${files.length} PDFs`}
          </Button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Split Tool
// ----------------------------------------------------------------------
function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);
  const [ranges, setRanges] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setError("");
    setFile(selected);

    try {
      const info = await getPdfInfo(selected);
      setPdfInfo(info);
    } catch (err) {
      setError("Failed to read PDF info.");
    }
  };

  const processSplit = async () => {
    if (!file || !ranges) return;
    setIsLoading(true);
    setError("");
    try {
      const blob = await splitPdf(file, ranges);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `split_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to split PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col">
      <h2 className="text-lg font-semibold mb-6">Split PDF</h2>

      {!file ? (
        <div
          className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl p-10 cursor-pointer hover:bg-surface-2/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Scissors className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-medium">Upload PDF to split</p>
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6 flex-1">
          <div className="flex items-center justify-between p-4 bg-surface-2/30 rounded-xl border border-border/50">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText className="h-6 w-6 text-brand shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)} {pdfInfo && `• ${pdfInfo.pages} pages max`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>

          <div className="space-y-3">
            <Label>Pages to extract</Label>
            <Input
              placeholder="e.g. 1-3, 5, 7-9"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comma separated list of pages or ranges.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <Button
            onClick={processSplit}
            disabled={!ranges.trim() || isLoading}
            className="w-full mt-auto"
          >
            {isLoading ? "Splitting..." : "Extract Pages"}
          </Button>
        </div>
      )}
    </div>
  );
}
