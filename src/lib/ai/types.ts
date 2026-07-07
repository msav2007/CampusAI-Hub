export interface AIProvider {
  name: string;
  generateText(prompt: string, context?: string): Promise<string>;
  analyzeResume(resumeText: string, jobDescription?: string): Promise<unknown>;
  extractKeywords(text: string): Promise<string[]>;
}

export type AIConfig = {
  provider: "local" | "openai" | "gemini" | "ollama";
  apiKey?: string;
  model?: string;
};
