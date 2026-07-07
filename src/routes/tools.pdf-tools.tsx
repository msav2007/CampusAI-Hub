import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText,
  Copy,
  Download,
  Layers,
  Scissors,
  RotateCw,
  Droplet,
  ArrowUpDown,
  FileMinus,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { buildPageHead } from "@/lib/seo";

import {
  extractTextFromPdf,
  mergePdfs,
  splitPdf,
  deletePdfPages,
  reorderPdfPages,
  rotatePdf,
  watermarkPdf,
  getPdfInfo,
} from "@/lib/pdf/pdf-utils";
import type { PDFInfo } from "@/lib/pdf/types";

export const Route = createFileRoute("/tools/pdf-tools")({
  head: () => ({
    ...buildPageHead({
      title: "PDF Studio: Edit, Merge, Split, Watermark PDFs Locally | CampusAI Hub",
      description:
        "Merge, split, extract text, rotate, reorder, delete pages, and watermark PDFs entirely in your browser. 100% private and free.",
      path: "/tools/pdf-tools",
      keywords:
        "pdf tools, merge pdf, split pdf, pdf text extractor, watermark pdf, local pdf tools",
    }),
  }),
  component: PdfToolsPage,
});

type ToolType = "merge" | "split" | "delete" | "reorder" | "rotate" | "extract" | "watermark";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${filename}`);
}

function PdfToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType>("merge");

  return (
    <ToolShell
      eyebrow="Productivity"
      title={
        <>
          PDF <span className="text-gradient">Studio</span>
        </>
      }
      description="A complete suite of PDF utilities. Processing happens entirely on your device, ensuring maximum privacy and instant speeds."
    >
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
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
            variant={activeTool === "delete" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveTool("delete")}
          >
            <FileMinus className="h-4 w-4" /> Delete Pages
          </Button>
          <Button
            variant={activeTool === "reorder" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveTool("reorder")}
          >
            <ArrowUpDown className="h-4 w-4" /> Reorder Pages
          </Button>
          <Button
            variant={activeTool === "rotate" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveTool("rotate")}
          >
            <RotateCw className="h-4 w-4" /> Rotate PDF
          </Button>
          <Button
            variant={activeTool === "extract" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveTool("extract")}
          >
            <FileText className="h-4 w-4" /> Extract Text
          </Button>
          <Button
            variant={activeTool === "watermark" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveTool("watermark")}
          >
            <Droplet className="h-4 w-4" /> Watermark
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeTool === "merge" && <MergeTool />}
          {activeTool === "split" && <SplitTool />}
          {activeTool === "delete" && <DeletePagesTool />}
          {activeTool === "reorder" && <ReorderPagesTool />}
          {activeTool === "rotate" && <RotateTool />}
          {activeTool === "extract" && <ExtractTool />}
          {activeTool === "watermark" && <WatermarkTool />}
        </div>
      </div>
    </ToolShell>
  );
}

// ----------------------------------------------------------------------
// Shared UI Components
// ----------------------------------------------------------------------
function PdfPreview({ file, info }: { file: File; info?: PDFInfo | null }) {
  if (!info) return null;
  return (
    <div className="flex items-center gap-4 p-4 bg-brand/5 rounded-xl border border-brand/20 text-sm">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-brand/10 shrink-0">
        <CheckCircle2 className="h-5 w-5 text-brand" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">Selected File Status</p>
        <p className="text-muted-foreground truncate">{file.name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-medium text-foreground">{info.pages} Pages</p>
        <p className="text-muted-foreground">{formatBytes(info.sizeBytes)}</p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Merge Tool
// ----------------------------------------------------------------------
function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const processMerge = async () => {
    if (files.length < 2) return;
    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-merge" });
    try {
      const blob = await mergePdfs(files);
      saveBlob(blob, `merged_${Date.now()}.pdf`);
      toast.success("PDF created successfully", { id: "pdf-merge" });
    } catch (err) {
      toast.error("Failed to merge PDFs. Encrypted PDFs not supported.", { id: "pdf-merge" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = (index: number, direction: -1 | 1) => {
    const newFiles = [...files];
    const targetIndex = index + direction;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Merge PDFs</h2>
      <FileUpload
        value={files}
        onChange={setFiles}
        accept={{ "application/pdf": [".pdf"] }}
        maxFiles={20}
        onReorder={handleReorder}
      />
      {files.length >= 2 && (
        <Button onClick={processMerge} disabled={isLoading} className="w-full mt-auto">
          {isLoading ? "Processing PDF..." : `Merge ${files.length} PDFs`}
        </Button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Split Tool
// ----------------------------------------------------------------------
function SplitTool() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);

  const [splitMode, setSplitMode] = useState<"range" | "selected">("range");
  const [rangeInput, setRangeInput] = useState("");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (uploaded: File[]) => {
    setFiles(uploaded);
    if (!uploaded[0]) {
      setPdfInfo(null);
      return;
    }
    try {
      setPdfInfo(await getPdfInfo(uploaded[0]));
    } catch {
      toast.error("Invalid PDF");
      setFiles([]);
    }
  };

  const processSplit = async () => {
    if (!file) return;

    let rangesStr = "";
    if (splitMode === "range") {
      rangesStr = rangeInput;
    } else {
      rangesStr = Array.from(selectedPages)
        .sort((a, b) => a - b)
        .join(",");
    }

    if (!rangesStr.trim()) return;

    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-split" });
    try {
      const blob = await splitPdf(file, rangesStr);
      saveBlob(blob, `split_${file.name}`);
      toast.success("PDF created successfully", { id: "pdf-split" });
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to split PDF.", { id: "pdf-split" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Split PDF</h2>
      <FileUpload
        accept={{ "application/pdf": [".pdf"] }}
        maxFiles={1}
        value={files}
        onChange={handleUpload}
      />

      {file && pdfInfo && (
        <div className="flex flex-col gap-6 flex-1 mt-4">
          <PdfPreview file={file} info={pdfInfo} />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant={splitMode === "range" ? "default" : "outline"}
                size="sm"
                onClick={() => setSplitMode("range")}
              >
                Extract Range
              </Button>
              <Button
                variant={splitMode === "selected" ? "default" : "outline"}
                size="sm"
                onClick={() => setSplitMode("selected")}
              >
                Select Pages
              </Button>
            </div>

            {splitMode === "range" ? (
              <div className="space-y-3">
                <Label>Page Range</Label>
                <Input
                  placeholder="e.g. 1-5"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Type a range to extract, like 1-5.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label>Select pages to extract</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 overflow-y-auto max-h-48 p-1">
                  {Array.from({ length: pdfInfo.pages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isSelected = selectedPages.has(pageNum);
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          const newSet = new Set(selectedPages);
                          if (isSelected) newSet.delete(pageNum);
                          else newSet.add(pageNum);
                          setSelectedPages(newSet);
                        }}
                        className={`h-10 rounded-lg border flex items-center justify-center font-medium transition-colors text-sm ${
                          isSelected
                            ? "bg-brand text-brand-foreground border-brand"
                            : "bg-surface-2/50 border-border/50 hover:border-brand/50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={processSplit}
            disabled={
              (splitMode === "range" ? !rangeInput.trim() : selectedPages.size === 0) || isLoading
            }
            className="w-full mt-auto"
          >
            {isLoading ? "Processing PDF..." : "Generate New PDF"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Delete Pages Tool
// ----------------------------------------------------------------------
function DeletePagesTool() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (uploaded: File[]) => {
    setFiles(uploaded);
    setSelectedPages(new Set());
    if (!uploaded[0]) {
      setPdfInfo(null);
      return;
    }
    try {
      setPdfInfo(await getPdfInfo(uploaded[0]));
    } catch {
      toast.error("Invalid PDF");
      setFiles([]);
    }
  };

  const processDelete = async () => {
    if (!file || selectedPages.size === 0) return;
    const toRemove = Array.from(selectedPages);

    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-del" });
    try {
      const blob = await deletePdfPages(file, toRemove);
      saveBlob(blob, `deleted_${file.name}`);
      toast.success("PDF created successfully", { id: "pdf-del" });
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to delete pages.", { id: "pdf-del" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Delete PDF Pages</h2>
      <FileUpload
        accept={{ "application/pdf": [".pdf"] }}
        maxFiles={1}
        value={files}
        onChange={handleUpload}
      />

      {file && pdfInfo && (
        <div className="flex flex-col gap-6 flex-1 mt-4">
          <PdfPreview file={file} info={pdfInfo} />
          <div className="space-y-3">
            <Label>Select pages to remove</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 overflow-y-auto max-h-60 p-1">
              {Array.from({ length: pdfInfo.pages }).map((_, i) => {
                const pageNum = i + 1;
                const isSelected = selectedPages.has(pageNum);
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      const newSet = new Set(selectedPages);
                      if (isSelected) newSet.delete(pageNum);
                      else newSet.add(pageNum);
                      setSelectedPages(newSet);
                    }}
                    className={`h-10 rounded-lg border flex items-center justify-center font-medium transition-colors text-sm ${
                      isSelected
                        ? "bg-destructive text-destructive-foreground border-destructive"
                        : "bg-surface-2/50 border-border/50 hover:border-brand/50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedPages.size} pages selected for deletion.
            </p>
          </div>
          <Button
            onClick={processDelete}
            disabled={selectedPages.size === 0 || isLoading}
            variant="destructive"
            className="w-full mt-auto"
          >
            {isLoading ? "Processing PDF..." : "Delete Selected Pages"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Reorder Pages Tool
// ----------------------------------------------------------------------
function ReorderPagesTool() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (uploaded: File[]) => {
    setFiles(uploaded);
    if (!uploaded[0]) {
      setPdfInfo(null);
      return;
    }
    try {
      const info = await getPdfInfo(uploaded[0]);
      setPdfInfo(info);
      setPageOrder(Array.from({ length: info.pages }, (_, i) => i + 1));
    } catch {
      toast.error("Invalid PDF");
      setFiles([]);
    }
  };

  const processReorder = async () => {
    if (!file || pageOrder.length === 0) return;
    const indices = pageOrder.map((p) => p - 1);

    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-reorder" });
    try {
      const blob = await reorderPdfPages(file, indices);
      saveBlob(blob, `reordered_${file.name}`);
      toast.success("PDF created successfully", { id: "pdf-reorder" });
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to reorder pages.", { id: "pdf-reorder" });
    } finally {
      setIsLoading(false);
    }
  };

  const movePage = (index: number, direction: -1 | 1) => {
    const newOrder = [...pageOrder];
    const target = index + direction;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setPageOrder(newOrder);
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Reorder Pages</h2>
      <FileUpload
        accept={{ "application/pdf": [".pdf"] }}
        maxFiles={1}
        value={files}
        onChange={handleUpload}
      />

      {file && pdfInfo && (
        <div className="flex flex-col gap-6 flex-1 mt-4">
          <PdfPreview file={file} info={pdfInfo} />
          <div className="space-y-3">
            <Label>Move pages up or down</Label>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-64 pr-2">
              {pageOrder.map((pageNum, index) => (
                <div
                  key={`${pageNum}-${index}`}
                  className="flex items-center justify-between p-3 bg-surface-2/30 rounded-xl border border-border/50"
                >
                  <span className="font-medium text-sm">Page {pageNum}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-brand"
                      onClick={() => movePage(index, -1)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-brand"
                      onClick={() => movePage(index, 1)}
                      disabled={index === pageOrder.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={processReorder} disabled={isLoading} className="w-full mt-auto">
            {isLoading ? "Processing PDF..." : "Generate New PDF"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Rotate Tool
// ----------------------------------------------------------------------
function RotateTool() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);

  const [degrees, setDegrees] = useState<90 | 180 | 270>(90);
  const [applyTo, setApplyTo] = useState<"all" | "selected">("all");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (uploaded: File[]) => {
    setFiles(uploaded);
    setSelectedPages(new Set());
    if (!uploaded[0]) {
      setPdfInfo(null);
      return;
    }
    try {
      setPdfInfo(await getPdfInfo(uploaded[0]));
    } catch {
      toast.error("Invalid PDF");
      setFiles([]);
    }
  };

  const processRotate = async () => {
    if (!file) return;
    const targetPages = applyTo === "selected" ? Array.from(selectedPages) : undefined;

    if (applyTo === "selected" && targetPages?.length === 0)
      return toast.error("No pages selected");

    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-rotate" });
    try {
      const blob = await rotatePdf(file, degrees, targetPages);
      saveBlob(blob, `rotated_${file.name}`);
      toast.success("PDF created successfully", { id: "pdf-rotate" });
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to rotate PDF.", { id: "pdf-rotate" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Rotate PDF</h2>
      <FileUpload
        accept={{ "application/pdf": [".pdf"] }}
        maxFiles={1}
        value={files}
        onChange={handleUpload}
      />

      {file && pdfInfo && (
        <div className="flex flex-col gap-6 flex-1 mt-4">
          <PdfPreview file={file} info={pdfInfo} />

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Label>Rotation Angle</Label>
              <select
                value={degrees}
                onChange={(e) => setDegrees(parseInt(e.target.value) as 90 | 180 | 270)}
                className="w-full h-10 rounded-md border border-input bg-surface-2/40 px-3 text-sm shadow-sm outline-none focus:ring-1 focus:ring-brand"
              >
                <option value={90}>90° Clockwise</option>
                <option value={180}>180° Flip</option>
                <option value={270}>270° Counter-Clockwise</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label>Apply To</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant={applyTo === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setApplyTo("all")}
                  className="flex-1"
                >
                  All Pages
                </Button>
                <Button
                  variant={applyTo === "selected" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setApplyTo("selected")}
                  className="flex-1"
                >
                  Selected Pages
                </Button>
              </div>
            </div>
          </div>

          {applyTo === "selected" && (
            <div className="space-y-3">
              <Label>Select pages to rotate</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 overflow-y-auto max-h-48 p-1">
                {Array.from({ length: pdfInfo.pages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isSelected = selectedPages.has(pageNum);
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        const newSet = new Set(selectedPages);
                        if (isSelected) newSet.delete(pageNum);
                        else newSet.add(pageNum);
                        setSelectedPages(newSet);
                      }}
                      className={`h-10 rounded-lg border flex items-center justify-center font-medium transition-colors text-sm ${
                        isSelected
                          ? "bg-brand text-brand-foreground border-brand"
                          : "bg-surface-2/50 border-border/50 hover:border-brand/50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            onClick={processRotate}
            disabled={isLoading || (applyTo === "selected" && selectedPages.size === 0)}
            className="w-full mt-auto"
          >
            {isLoading ? "Processing PDF..." : "Rotate PDF"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Watermark Tool
// ----------------------------------------------------------------------
function WatermarkTool() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);

  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.3);
  const [placement, setPlacement] = useState<"center" | "bottom-right">("center");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (uploaded: File[]) => {
    setFiles(uploaded);
    if (!uploaded[0]) {
      setPdfInfo(null);
      return;
    }
    try {
      setPdfInfo(await getPdfInfo(uploaded[0]));
    } catch {
      toast.error("Invalid PDF");
      setFiles([]);
    }
  };

  const processWatermark = async () => {
    if (!file || !text) return;
    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-wm" });
    try {
      const blob = await watermarkPdf(file, text, {
        opacity,
        size: placement === "center" ? 64 : 24,
        colorHex: "#FF0000",
        placement,
      });
      saveBlob(blob, `watermarked_${file.name}`);
      toast.success("PDF created successfully", { id: "pdf-wm" });
    } catch (err: unknown) {
      toast.error("Encrypted PDFs not supported", { id: "pdf-wm" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Watermark PDF</h2>
      <FileUpload
        accept={{ "application/pdf": [".pdf"] }}
        maxFiles={1}
        value={files}
        onChange={handleUpload}
      />

      {file && pdfInfo && (
        <div className="flex flex-col gap-6 flex-1 mt-4">
          <PdfPreview file={file} info={pdfInfo} />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Watermark Text</Label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. DRAFT"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Placement</Label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value as "center" | "bottom-right")}
                  className="w-full h-10 rounded-md border border-input bg-surface-2/40 px-3 text-sm shadow-sm outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="center">Center (Diagonal)</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-10 accent-brand"
                />
              </div>
            </div>
          </div>
          <Button
            onClick={processWatermark}
            disabled={!text.trim() || isLoading}
            className="w-full mt-auto"
          >
            {isLoading ? "Processing PDF..." : "Apply Watermark"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Extract Text Tool
// ----------------------------------------------------------------------
function ExtractTool() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);

  const [extractedText, setExtractedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (uploaded: File[]) => {
    setFiles(uploaded);
    setExtractedText("");
    if (!uploaded[0]) {
      setPdfInfo(null);
      return;
    }
    try {
      setPdfInfo(await getPdfInfo(uploaded[0]));
    } catch {
      toast.error("Invalid PDF");
      setFiles([]);
    }
  };

  const processExtract = async () => {
    if (!file) return;
    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-ext" });
    try {
      const res = await extractTextFromPdf(file);
      setExtractedText(res.text);
      toast.success("Text extracted successfully", { id: "pdf-ext" });
    } catch (err: unknown) {
      toast.error("Encrypted PDFs not supported", { id: "pdf-ext" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl glass p-6 shadow-card flex flex-col gap-6">
        <h2 className="text-lg font-semibold">Extract Text</h2>
        <FileUpload
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          value={files}
          onChange={handleUpload}
        />

        {file && pdfInfo && (
          <div className="flex flex-col gap-4 mt-4">
            <PdfPreview file={file} info={pdfInfo} />
            {!extractedText && (
              <Button onClick={processExtract} disabled={isLoading} className="w-full">
                {isLoading ? "Processing PDF..." : "Extract Text"}
              </Button>
            )}
          </div>
        )}
      </div>

      {extractedText && (
        <div className="rounded-2xl glass p-6 shadow-card flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{extractedText.trim().split(/\s+/).length} words extracted</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(extractedText);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  saveBlob(
                    new Blob([extractedText], { type: "text/plain" }),
                    `${file?.name}_text.txt`,
                  );
                }}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Save .txt
              </Button>
            </div>
          </div>
          <Textarea
            value={extractedText}
            readOnly
            className="flex-1 resize-none font-mono text-sm leading-relaxed p-4"
          />
        </div>
      )}
    </div>
  );
}
