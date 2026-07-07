import type { AIProvider } from "./types";

export class LocalHeuristicEngine implements AIProvider {
  name = "Local Heuristic Engine";

  async generateText(prompt: string, context?: string): Promise<string> {
    // Basic text ranking / heuristic generation placeholder
    return "This is a local heuristic response. " + prompt;
  }

  async analyzeResume(resumeText: string, jobDescription?: string): Promise<any> {
    // Placeholder for local ATS logic
    return {};
  }

  async extractKeywords(text: string): Promise<string[]> {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 4);
    
    const freqs: Record<string, number> = {};
    for (const w of words) freqs[w] = (freqs[w] || 0) + 1;
    
    return Object.entries(freqs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map((e) => e[0]);
  }

  async semanticSearch(query: string, text: string): Promise<string> {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const paragraphs = text.split(/\n\n+/);
    
    let bestMatch = "";
    let maxScore = -1;

    for (const p of paragraphs) {
      const lower = p.toLowerCase();
      let score = 0;
      for (const qw of queryWords) {
        if (lower.includes(qw)) score++;
      }
      if (score > maxScore) {
        maxScore = score;
        bestMatch = p;
      }
    }

    if (maxScore === 0) return "No relevant information found in the notes for your question.";
    return bestMatch.trim();
  }
}

export const localAI = new LocalHeuristicEngine();
