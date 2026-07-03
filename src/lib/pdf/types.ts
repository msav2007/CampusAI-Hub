export type PDFInfo = {
  name: string;
  sizeBytes: number;
  pages: number;
};

export type ExtractedTextResult = {
  text: string;
  pageCount: number;
};
