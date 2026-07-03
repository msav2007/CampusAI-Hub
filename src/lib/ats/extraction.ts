type ExtractedResume = {
  text: string;
  pageCount: number;
  source: "pdf" | "text";
};

function sanitizeExtractedText(text: string) {
  return text
    .replaceAll("\0", " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isTextFile(file: File) {
  return file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt");
}

async function extractTextFile(file: File): Promise<ExtractedResume> {
  const text = sanitizeExtractedText(await file.text());
  if (!text) {
    throw new Error("The uploaded file is empty.");
  }

  return {
    text,
    pageCount: 1,
    source: "text",
  };
}

async function loadPdfJs() {
  const [{ getDocument, GlobalWorkerOptions }, workerModule] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);

  GlobalWorkerOptions.workerSrc = workerModule.default;
  return { getDocument };
}

function normalizePdfPageText(
  items: Array<{ str?: string; hasEOL?: boolean; transform?: number[] }>,
) {
  let pageText = "";
  let lastY: number | undefined;

  for (const item of items) {
    const chunk = item.str?.trim();
    if (!chunk) continue;

    const y = item.transform?.[5];
    const lineBreak =
      item.hasEOL || (lastY !== undefined && y !== undefined && Math.abs(lastY - y) > 4);

    if (pageText.length > 0) {
      pageText += lineBreak ? "\n" : " ";
    }

    pageText += chunk;
    lastY = y;
  }

  return pageText;
}

async function extractPdfFile(file: File): Promise<ExtractedResume> {
  const { getDocument } = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data, useWorkerFetch: false }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = normalizePdfPageText(
      content.items as Array<{ str?: string; hasEOL?: boolean; transform?: number[] }>,
    );
    if (pageText.trim()) {
      pages.push(pageText);
    }
  }

  const text = sanitizeExtractedText(pages.join("\n\n"));
  if (!text) {
    throw new Error(
      "We could not extract readable text from this PDF. Please upload a text-based PDF instead of a scanned image.",
    );
  }

  return {
    text,
    pageCount: pdf.numPages,
    source: "pdf",
  };
}

export async function extractResumeText(file: File): Promise<ExtractedResume> {
  if (file.size === 0) {
    throw new Error("The uploaded file is empty.");
  }

  if (isPdfFile(file)) {
    return extractPdfFile(file);
  }

  if (isTextFile(file)) {
    return extractTextFile(file);
  }

  throw new Error("Upload a PDF resume or a plain text fallback file.");
}
