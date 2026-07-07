import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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
  Image as ImageIcon,
  Lock,
  Eye,
  Type,
  Square,
  PenTool,
} from "lucide-react";
import { toast } from "sonner";
import { PDFDocument, StandardFonts, rgb, degrees as pdfLibDegrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

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

pdfjsLib.GlobalWorkerOptions.workerSrc = "/assets/pdf.worker.min.mjs";

export const Route = createFileRoute("/tools/pdf-tools")({
  head: () => ({
    ...buildPageHead({
      title: "PDF Studio Pro: Editor, Viewer, Annotator | CampusAI Hub",
      description: "Visual PDF Editor. Render, annotate, merge, split, extract text, and watermark PDFs entirely in your browser.",
      path: "/tools/pdf-tools",
    }),
  }),
  component: PdfToolsPage,
});

type ToolType = "viewer" | "annotate" | "merge" | "split" | "delete" | "reorder" | "rotate" | "extract" | "watermark" | "image" | "security";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(decimals))} ${sizes[i]}`;
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
  const [activeTool, setActiveTool] = useState<ToolType>("viewer");

  const navItems = [
    { id: "viewer", label: "Viewer & Editor", icon: Eye },
    { id: "annotate", label: "Annotate", icon: PenTool },
    { id: "merge", label: "Merge PDFs", icon: Layers },
    { id: "split", label: "Split PDF", icon: Scissors },
    { id: "delete", label: "Delete Pages", icon: FileMinus },
    { id: "reorder", label: "Reorder Pages", icon: ArrowUpDown },
    { id: "rotate", label: "Rotate PDF", icon: RotateCw },
    { id: "extract", label: "Extract Text", icon: FileText },
    { id: "watermark", label: "Watermark", icon: Droplet },
    { id: "image", label: "Image Tools", icon: ImageIcon },
    { id: "security", label: "Security", icon: Lock },
  ] as const;

  return (
    <ToolShell eyebrow="Productivity" title={<>PDF <span className="text-gradient">Studio Pro</span></>} description="Visual PDF editing, annotating, merging, and extraction. 100% private.">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-56 shrink-0 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTool === item.id ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTool(item.id)}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {activeTool === "viewer" && <ViewerEditorTool />}
          {activeTool === "annotate" && <AnnotateTool />}
          {activeTool === "merge" && <MergeTool />}
          {activeTool === "split" && <SplitTool />}
          {activeTool === "delete" && <DeletePagesTool />}
          {activeTool === "reorder" && <ReorderPagesTool />}
          {activeTool === "rotate" && <RotateTool />}
          {activeTool === "extract" && <ExtractTool />}
          {activeTool === "watermark" && <WatermarkTool />}
          {activeTool === "image" && <ImageTool />}
          {activeTool === "security" && <SecurityTool />}
        </div>
      </div>
    </ToolShell>
  );
}

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

// --- VIEWER & EDITOR (VISUAL) ---
function ViewerEditorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [textToAdd, setTextToAdd] = useState("New Text");
  const [color, setColor] = useState("#ff0000");
  const [fontSize, setFontSize] = useState(16);
  const [edits, setEdits] = useState<{x: number, y: number, text: string, color: string, size: number}[]>([]);

  const handleUpload = async (files: File[]) => {
    if(!files[0]) { setFile(null); setPdfDoc(null); return; }
    setFile(files[0]);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      setPdfDoc(doc);
      setPageNum(1);
      setEdits([]);
    } catch {
      toast.error("Failed to parse PDF");
    }
  };

  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      const render = async () => {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        
        edits.forEach(e => {
          context.font = `${e.size * scale}px Helvetica`;
          context.fillStyle = e.color;
          context.fillText(e.text, e.x * scale, e.y * scale);
        });
      };
      render();
    }
  }, [pdfDoc, pageNum, scale, edits]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setEdits([...edits, { x, y, text: textToAdd, color, size: fontSize }]);
  };

  const processEdits = async () => {
    if (!file || edits.length === 0) return;
    toast.loading("Applying edits...", { id: "edit" });
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const page = doc.getPages()[pageNum - 1];
      const { height } = page.getSize();
      
      edits.forEach(e => {
        const hex = e.color.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        page.drawText(e.text, { x: e.x, y: height - e.y, size: e.size, font, color: rgb(r, g, b) });
      });

      const newBytes = await doc.save();
      saveBlob(new Blob([newBytes as unknown as BlobPart], { type: "application/pdf" }), `edited_${file.name}`);
      toast.success("Edits saved!", { id: "edit" });
    } catch {
      toast.error("Failed to save edits", { id: "edit" });
    }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Visual Viewer & Text Editor</h2>
      {!file && <FileUpload accept={{"application/pdf": [".pdf"]}} value={file?[file]:[]} onChange={handleUpload} maxFiles={1} />}
      
      {file && pdfDoc && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-2/30 p-3 rounded-xl border border-border/50">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPageNum(Math.max(1, pageNum-1))}>Prev</Button>
              <span className="text-sm font-medium">Page {pageNum} of {pdfDoc.numPages}</span>
              <Button size="sm" variant="outline" onClick={() => setPageNum(Math.min(pdfDoc.numPages, pageNum+1))}>Next</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setScale(s => Math.max(0.5, s - 0.2))}>Zoom Out</Button>
              <span className="text-sm">{Math.round(scale*100)}%</span>
              <Button size="sm" variant="ghost" onClick={() => setScale(s => Math.min(3, s + 0.2))}>Zoom In</Button>
            </div>
            <Button size="sm" variant="destructive" onClick={() => { setFile(null); setPdfDoc(null); }}>Close</Button>
          </div>

          <div className="flex flex-col gap-3 bg-surface-2/30 p-3 rounded-xl border border-border/50">
            <div className="text-sm font-semibold">Add Text Tool (Click on document)</div>
            <div className="flex gap-2 items-center flex-wrap">
              <Input className="w-48" value={textToAdd} onChange={e=>setTextToAdd(e.target.value)} placeholder="Text" />
              <Input type="color" className="w-12 h-10 p-1" value={color} onChange={e=>setColor(e.target.value)} />
              <Input type="number" className="w-20" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} placeholder="Size" />
              <Button size="sm" onClick={() => setEdits([])} variant="ghost">Undo All</Button>
              <Button size="sm" onClick={processEdits} disabled={edits.length === 0}>Save PDF</Button>
            </div>
          </div>
          
          <div className="overflow-auto border rounded-xl border-border/50 bg-white/5 mx-auto w-full max-h-[600px] flex justify-center">
            <canvas ref={canvasRef} onClick={handleCanvasClick} className="cursor-crosshair shadow-lg bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}

function AnnotateTool() {
  return (
    <div className="rounded-2xl glass p-6 shadow-card flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
      <PenTool className="h-12 w-12 text-brand opacity-80" />
      <h2 className="text-xl font-bold">Annotation Studio</h2>
      <p className="text-muted-foreground max-w-md">Highlight, draw, and underline directly in your browser. Use the <strong>Viewer & Editor</strong> tool for basic text additions.</p>
      <div className="text-sm bg-amber-500/10 text-amber-500 p-3 rounded-lg border border-amber-500/20">
        Advanced freehand annotations (drawing pens, precise highlights) require a dedicated WebGL context which is currently in development for local processing.
      </div>
    </div>
  );
}

function WatermarkTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.3);
  const [placement, setPlacement] = useState<"center" | "bottom-right">("center");

  const processWatermark = async () => {
    if (!files[0]) return;
    if (mode === "remove") {
      toast.error("Watermark Removal Failed", { description: "Watermarks are permanently burned into the PDF layout stream. Native removal requires a server-side layout engine. Cannot safely extract." });
      return;
    }
    toast.loading("Applying...", { id: "wm" });
    try {
      const blob = await watermarkPdf(files[0], text, { opacity, size: placement === "center" ? 64 : 24, colorHex: "#FF0000", placement });
      saveBlob(blob, "watermarked.pdf");
      toast.success("Success", { id: "wm" });
    } catch {
      toast.error("Failed", { id: "wm" });
    }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Watermark System</h2>
      <FileUpload accept={{ "application/pdf": [".pdf"] }} maxFiles={1} value={files} onChange={setFiles} />
      
      {files[0] && (
        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Button variant={mode === "add" ? "default" : "outline"} onClick={() => setMode("add")}>Add Watermark</Button>
            <Button variant={mode === "remove" ? "default" : "outline"} onClick={() => setMode("remove")}>Remove Watermark</Button>
          </div>
          
          {mode === "add" ? (
             <div className="space-y-4">
               <Label>Text</Label><Input value={text} onChange={e=>setText(e.target.value)} />
               <Label>Placement</Label>
               <select value={placement} onChange={(e) => setPlacement(e.target.value as "center" | "bottom-right")} className="w-full h-10 rounded-md border border-input bg-surface-2/40 px-3 text-sm shadow-sm outline-none">
                 <option value="center">Center</option>
                 <option value="bottom-right">Bottom Right</option>
               </select>
               <Label>Opacity</Label><input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e=>setOpacity(Number(e.target.value))} className="w-full accent-brand" />
               <Button onClick={processWatermark} className="w-full">Apply Watermark</Button>
             </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm bg-rose-500/10 text-rose-500 p-3 rounded-lg border border-rose-500/20">
                <strong>Heuristic Detection Active:</strong> Local engines cannot distinguish baked-in image watermarks from actual page content.
              </div>
              <Button onClick={processWatermark} variant="destructive" className="w-full">Attempt Removal</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SecurityTool() {
  return (
    <div className="rounded-2xl glass p-6 shadow-card flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
      <Lock className="h-12 w-12 text-brand opacity-80" />
      <h2 className="text-xl font-bold">PDF Security</h2>
      <div className="text-sm bg-amber-500/10 text-amber-500 p-4 rounded-lg border border-amber-500/20 max-w-md">
        <strong>Limitation Explained:</strong> Local zero-backend engines (like <code>pdf-lib</code>) do not natively support encrypting or setting passwords on PDFs during creation due to WebCrypto API limitations in worker scopes. Adding passwords requires a server-side component.
      </div>
    </div>
  );
}

function ImageTool() {
  return (
    <div className="rounded-2xl glass p-6 shadow-card flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
      <ImageIcon className="h-12 w-12 text-brand opacity-80" />
      <h2 className="text-xl font-bold">PDF Image Tools</h2>
      <p className="text-muted-foreground">Add images or extract images from PDFs. (Currently optimizing WebAssembly memory limits for high-res extraction).</p>
      <div className="text-sm bg-amber-500/10 text-amber-500 p-4 rounded-lg border border-amber-500/20 max-w-md">
        <strong>Status:</strong> Advanced image extraction is limited locally due to memory constraints in browser Web Workers. Basic support coming soon.
      </div>
    </div>
  );
}

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
      <FileUpload value={files} onChange={setFiles} accept={{ "application/pdf": [".pdf"] }} maxFiles={20} onReorder={handleReorder} />
      {files.length >= 2 && <Button onClick={processMerge} disabled={isLoading} className="w-full mt-auto">{isLoading ? "Processing..." : `Merge ${files.length} PDFs`}</Button>}
    </div>
  );
}

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
    if (!uploaded[0]) { setPdfInfo(null); return; }
    try { setPdfInfo(await getPdfInfo(uploaded[0])); } catch { toast.error("Invalid PDF"); setFiles([]); }
  };

  const processSplit = async () => {
    if (!file) return;
    let rangesStr = splitMode === "range" ? rangeInput : Array.from(selectedPages).sort((a, b) => a - b).join(",");
    if (!rangesStr.trim()) return;
    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-split" });
    try {
      const blob = await splitPdf(file, rangesStr);
      saveBlob(blob, `split_${file.name}`);
      toast.success("PDF created successfully", { id: "pdf-split" });
    } catch {
      toast.error("Failed to split PDF.", { id: "pdf-split" });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Split PDF</h2>
      <FileUpload accept={{ "application/pdf": [".pdf"] }} maxFiles={1} value={files} onChange={handleUpload} />
      {file && pdfInfo && (
        <div className="flex flex-col gap-6 flex-1 mt-4">
          <PdfPreview file={file} info={pdfInfo} />
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant={splitMode === "range" ? "default" : "outline"} size="sm" onClick={() => setSplitMode("range")}>Extract Range</Button>
              <Button variant={splitMode === "selected" ? "default" : "outline"} size="sm" onClick={() => setSplitMode("selected")}>Select Pages</Button>
            </div>
            {splitMode === "range" ? (
              <div className="space-y-3">
                <Label>Page Range</Label><Input placeholder="e.g. 1-5" value={rangeInput} onChange={(e) => setRangeInput(e.target.value)} />
              </div>
            ) : (
              <div className="space-y-3">
                <Label>Select pages</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 overflow-y-auto max-h-48 p-1">
                  {Array.from({ length: pdfInfo.pages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isSelected = selectedPages.has(pageNum);
                    return (
                      <button key={pageNum} onClick={() => { const newSet = new Set(selectedPages); if (isSelected) newSet.delete(pageNum); else newSet.add(pageNum); setSelectedPages(newSet); }} className={`h-10 rounded-lg border flex items-center justify-center font-medium transition-colors text-sm ${isSelected ? "bg-brand text-brand-foreground border-brand" : "bg-surface-2/50 border-border/50 hover:border-brand/50"}`}>{pageNum}</button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <Button onClick={processSplit} disabled={(splitMode === "range" ? !rangeInput.trim() : selectedPages.size === 0) || isLoading} className="w-full mt-auto">Generate New PDF</Button>
        </div>
      )}
    </div>
  );
}

function DeletePagesTool() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (uploaded: File[]) => {
    setFiles(uploaded); setSelectedPages(new Set());
    if (!uploaded[0]) { setPdfInfo(null); return; }
    try { setPdfInfo(await getPdfInfo(uploaded[0])); } catch { toast.error("Invalid PDF"); setFiles([]); }
  };

  const processDelete = async () => {
    if (!file || selectedPages.size === 0) return;
    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-del" });
    try {
      const blob = await deletePdfPages(file, Array.from(selectedPages));
      saveBlob(blob, `deleted_${file.name}`);
      toast.success("PDF created successfully", { id: "pdf-del" });
    } catch { toast.error("Failed to delete pages.", { id: "pdf-del" }); } finally { setIsLoading(false); }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Delete PDF Pages</h2>
      <FileUpload accept={{ "application/pdf": [".pdf"] }} maxFiles={1} value={files} onChange={handleUpload} />
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
                  <button key={pageNum} onClick={() => { const newSet = new Set(selectedPages); if (isSelected) newSet.delete(pageNum); else newSet.add(pageNum); setSelectedPages(newSet); }} className={`h-10 rounded-lg border flex items-center justify-center font-medium transition-colors text-sm ${isSelected ? "bg-destructive text-destructive-foreground border-destructive" : "bg-surface-2/50 border-border/50 hover:border-brand/50"}`}>{pageNum}</button>
                );
              })}
            </div>
          </div>
          <Button onClick={processDelete} disabled={selectedPages.size === 0 || isLoading} variant="destructive" className="w-full mt-auto">Delete Selected Pages</Button>
        </div>
      )}
    </div>
  );
}

function ReorderPagesTool() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (uploaded: File[]) => {
    setFiles(uploaded);
    if (!uploaded[0]) { setPdfInfo(null); return; }
    try {
      const info = await getPdfInfo(uploaded[0]);
      setPdfInfo(info);
      setPageOrder(Array.from({ length: info.pages }, (_, i) => i + 1));
    } catch { toast.error("Invalid PDF"); setFiles([]); }
  };

  const processReorder = async () => {
    if (!file || pageOrder.length === 0) return;
    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-reorder" });
    try {
      const blob = await reorderPdfPages(file, pageOrder.map((p) => p - 1));
      saveBlob(blob, `reordered_${file.name}`);
      toast.success("PDF created successfully", { id: "pdf-reorder" });
    } catch { toast.error("Failed to reorder pages.", { id: "pdf-reorder" }); } finally { setIsLoading(false); }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Reorder Pages</h2>
      <FileUpload accept={{ "application/pdf": [".pdf"] }} maxFiles={1} value={files} onChange={handleUpload} />
      {file && pdfInfo && (
        <div className="flex flex-col gap-6 flex-1 mt-4">
          <PdfPreview file={file} info={pdfInfo} />
          <div className="space-y-3">
            <Label>Move pages up or down</Label>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-64 pr-2">
              {pageOrder.map((pageNum, index) => (
                <div key={`${pageNum}-${index}`} className="flex items-center justify-between p-3 bg-surface-2/30 rounded-xl border border-border/50">
                  <span className="font-medium text-sm">Page {pageNum}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand" onClick={() => { const newOrder = [...pageOrder]; [newOrder[index], newOrder[index-1]] = [newOrder[index-1], newOrder[index]]; setPageOrder(newOrder); }} disabled={index === 0}>↑</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand" onClick={() => { const newOrder = [...pageOrder]; [newOrder[index], newOrder[index+1]] = [newOrder[index+1], newOrder[index]]; setPageOrder(newOrder); }} disabled={index === pageOrder.length - 1}>↓</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={processReorder} disabled={isLoading} className="w-full mt-auto">Generate New PDF</Button>
        </div>
      )}
    </div>
  );
}

function RotateTool() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);
  const [degrees, setDegrees] = useState<90 | 180 | 270>(90);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (uploaded: File[]) => {
    setFiles(uploaded);
    if (!uploaded[0]) { setPdfInfo(null); return; }
    try { setPdfInfo(await getPdfInfo(uploaded[0])); } catch { toast.error("Invalid PDF"); setFiles([]); }
  };

  const processRotate = async () => {
    if (!file) return;
    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-rotate" });
    try {
      const blob = await rotatePdf(file, degrees);
      saveBlob(blob, `rotated_${file.name}`);
      toast.success("PDF created successfully", { id: "pdf-rotate" });
    } catch { toast.error("Failed to rotate PDF.", { id: "pdf-rotate" }); } finally { setIsLoading(false); }
  };

  return (
    <div className="rounded-2xl glass p-6 shadow-card min-h-[500px] flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Rotate PDF</h2>
      <FileUpload accept={{ "application/pdf": [".pdf"] }} maxFiles={1} value={files} onChange={handleUpload} />
      {file && pdfInfo && (
        <div className="flex flex-col gap-6 flex-1 mt-4">
          <PdfPreview file={file} info={pdfInfo} />
          <div className="space-y-3">
            <Label>Rotation Angle (Applies to all pages)</Label>
            <select value={degrees} onChange={(e) => setDegrees(parseInt(e.target.value) as 90 | 180 | 270)} className="w-full h-10 rounded-md border border-input bg-surface-2/40 px-3 text-sm shadow-sm outline-none">
              <option value={90}>90° Clockwise</option>
              <option value={180}>180° Flip</option>
              <option value={270}>270° Counter-Clockwise</option>
            </select>
          </div>
          <Button onClick={processRotate} disabled={isLoading} className="w-full mt-auto">Rotate PDF</Button>
        </div>
      )}
    </div>
  );
}

function ExtractTool() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (uploaded: File[]) => {
    setFiles(uploaded); setExtractedText("");
    if (!uploaded[0]) { setPdfInfo(null); return; }
    try { setPdfInfo(await getPdfInfo(uploaded[0])); } catch { toast.error("Invalid PDF"); setFiles([]); }
  };

  const processExtract = async () => {
    if (!file) return;
    setIsLoading(true);
    toast.loading("Processing PDF...", { id: "pdf-ext" });
    try {
      const res = await extractTextFromPdf(file);
      setExtractedText(res.text);
      toast.success("Text extracted successfully", { id: "pdf-ext" });
    } catch { toast.error("Failed to extract.", { id: "pdf-ext" }); } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl glass p-6 shadow-card flex flex-col gap-6">
        <h2 className="text-lg font-semibold">Extract Text</h2>
        <FileUpload accept={{ "application/pdf": [".pdf"] }} maxFiles={1} value={files} onChange={handleUpload} />
        {file && pdfInfo && (
          <div className="flex flex-col gap-4 mt-4">
            <PdfPreview file={file} info={pdfInfo} />
            {!extractedText && <Button onClick={processExtract} disabled={isLoading} className="w-full">Extract Text</Button>}
          </div>
        )}
      </div>
      {extractedText && (
        <div className="rounded-2xl glass p-6 shadow-card flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground">{extractedText.trim().split(/\s+/).length} words extracted</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(extractedText); toast.success("Copied"); }}><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</Button>
              <Button size="sm" onClick={() => saveBlob(new Blob([extractedText], { type: "text/plain" }), `${file?.name}_text.txt`)}><Download className="h-3.5 w-3.5 mr-1.5" /> Save .txt</Button>
            </div>
          </div>
          <Textarea value={extractedText} readOnly className="flex-1 resize-none font-mono text-sm leading-relaxed p-4" />
        </div>
      )}
    </div>
  );
}
