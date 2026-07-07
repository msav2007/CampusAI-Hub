import { extractTextFromPdf } from "@/lib/pdf/pdf-utils";
import mammoth from "mammoth";

export async function extractTextFromFile(file: File): Promise<string> {
  const type = file.type;
  const name = file.name.toLowerCase();

  try {
    if (type === "application/pdf" || name.endsWith(".pdf")) {
      const res = await extractTextFromPdf(file);
      return res.text;
    }

    if (
      type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx")
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (type === "text/plain" || name.endsWith(".txt")) {
      return await file.text();
    }

    throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
  } catch (err: unknown) {
    throw new Error((err as Error).message || "Failed to extract text from file.");
  }
}
