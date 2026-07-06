import { PDFDocument, rgb, degrees as pdfLibDegrees, StandardFonts } from "pdf-lib";
import type { ExtractedTextResult, PDFInfo } from "./types";

async function loadPdfJs() {
  const [{ getDocument, GlobalWorkerOptions }, workerModule] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);

  GlobalWorkerOptions.workerSrc = workerModule.default;
  return { getDocument };
}

export async function getPdfInfo(file: File): Promise<PDFInfo> {
  const { getDocument } = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data, useWorkerFetch: false }).promise;

  return {
    name: file.name,
    sizeBytes: file.size,
    pages: pdf.numPages,
  };
}

export async function extractTextFromPdf(file: File): Promise<ExtractedTextResult> {
  const { getDocument } = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data, useWorkerFetch: false }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    let pageText = "";
    for (const item of content.items) {
      if ("str" in item) {
        pageText += item.str + " ";
      }
    }
    pages.push(pageText.trim());
  }

  return {
    text: pages.join("\n\n"),
    pageCount: pdf.numPages,
  };
}

export async function mergePdfs(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }

  const mergedPdfBytes = await mergedPdf.save();
  return new Blob([mergedPdfBytes as unknown as BlobPart], { type: "application/pdf" });
}

export async function splitPdf(file: File, ranges: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  const numPages = pdf.getPageCount();
  const pagesToExtract = new Set<number>();

  const parts = ranges.split(",").map((s) => s.trim());
  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end) && start > 0 && end <= numPages && start <= end) {
        for (let i = start; i <= end; i++) {
          pagesToExtract.add(i - 1);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page > 0 && page <= numPages) {
        pagesToExtract.add(page - 1);
      }
    }
  }

  const sortedPages = Array.from(pagesToExtract).sort((a, b) => a - b);
  if (sortedPages.length === 0) {
    throw new Error("Invalid page range specified.");
  }

  const copiedPages = await newPdf.copyPages(pdf, sortedPages);
  copiedPages.forEach((page) => {
    newPdf.addPage(page);
  });

  const newPdfBytes = await newPdf.save();
  return new Blob([newPdfBytes as unknown as BlobPart], { type: "application/pdf" });
}

export async function deletePdfPages(file: File, pagesToRemove: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const numPages = pdf.getPageCount();
  
  // Create a sorted set of 0-indexed pages to remove
  const toRemove = new Set(pagesToRemove.map(p => p - 1));
  
  // We must iterate backwards when removing pages in place to not mess up indices
  for (let i = numPages - 1; i >= 0; i--) {
    if (toRemove.has(i)) {
      pdf.removePage(i);
    }
  }
  
  if (pdf.getPageCount() === 0) {
    throw new Error("Cannot delete all pages from the document.");
  }

  const newPdfBytes = await pdf.save();
  return new Blob([newPdfBytes as unknown as BlobPart], { type: "application/pdf" });
}

export async function reorderPdfPages(file: File, newOrderIndices: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  // newOrderIndices are 0-based indices
  const copiedPages = await newPdf.copyPages(pdf, newOrderIndices);
  copiedPages.forEach((page) => {
    newPdf.addPage(page);
  });

  const newPdfBytes = await newPdf.save();
  return new Blob([newPdfBytes as unknown as BlobPart], { type: "application/pdf" });
}

export async function rotatePdf(file: File, rotationDegrees: number, targetPages?: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const numPages = pdf.getPageCount();

  const pagesToRotate = new Set(
    targetPages && targetPages.length > 0 
      ? targetPages.map(p => p - 1) 
      : Array.from({ length: numPages }, (_, i) => i)
  );

  for (let i = 0; i < numPages; i++) {
    if (pagesToRotate.has(i)) {
      const page = pdf.getPage(i);
      const currentRotation = page.getRotation().angle;
      page.setRotation(pdfLibDegrees(currentRotation + rotationDegrees));
    }
  }

  const newPdfBytes = await pdf.save();
  return new Blob([newPdfBytes as unknown as BlobPart], { type: "application/pdf" });
}

export async function watermarkPdf(
  file: File, 
  text: string, 
  options: { opacity: number, size: number, colorHex: string, placement: "center" | "bottom-right" }
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();
  
  // Parse color (e.g. #FF0000)
  const hex = options.colorHex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, options.size);
    const textHeight = font.heightAtSize(options.size);
    
    let x = 0;
    let y = 0;
    
    if (options.placement === "center") {
      x = width / 2 - textWidth / 2;
      y = height / 2 - textHeight / 2;
    } else if (options.placement === "bottom-right") {
      x = width - textWidth - 20;
      y = 20;
    }
    
    page.drawText(text, {
      x,
      y,
      size: options.size,
      font: font,
      color: rgb(r, g, b),
      opacity: options.opacity,
      rotate: options.placement === "center" ? pdfLibDegrees(45) : pdfLibDegrees(0),
    });
  }

  const newPdfBytes = await pdf.save();
  return new Blob([newPdfBytes as unknown as BlobPart], { type: "application/pdf" });
}
