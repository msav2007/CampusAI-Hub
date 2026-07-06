import { PDFDocument } from "pdf-lib";
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
