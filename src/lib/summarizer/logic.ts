import { localAI } from "@/lib/ai";

export type SummaryMode =
  | "ai-summary"
  | "student-notes"
  | "exam-mode"
  | "flashcards";

export type Analytics = {
  wordCount: number;
  charCount: number;
  readingTimeMin: number;
  keyTopics: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

export type AnalysisResult = {
  analytics: Analytics;
  output: string;
};

const STOP_WORDS = new Set(["a","about","above","after","again","against","all","am","an","and","any","are","as","at","be","because","been","before","being","below","between","both","but","by","can","could","did","do","does","doing","down","during","each","few","for","from","further","had","has","have","having","he","her","here","hers","herself","him","himself","his","how","i","if","in","into","is","it","its","itself","me","more","most","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","she","should","so","some","such","than","that","the","their","theirs","them","themselves","then","there","these","they","this","those","through","to","too","under","until","up","very","was","we","were","what","when","where","which","while","who","whom","why","with","would","you","your","yours","yourself","yourselves"]);

const DEFINITION_MARKERS = [" is defined as ", " refers to ", " means ", " is a type of ", " known as ", " called ", " represents ", " stands for "];

function getSentences(text: string): string[] {
  return text.match(/[^.!?\n]+[.!?\n]+/g)?.map((s) => s.trim().replace(/\s+/g, " ")).filter((s) => s.length > 5) || [];
}

function getWords(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
}

function textRank(sentences: string[], wordFreq: Record<string, number>): { sentence: string; score: number; index: number }[] {
  return sentences.map((sentence, index) => {
    const sWords = getWords(sentence);
    let score = 0;
    sWords.forEach((w) => {
      if (wordFreq[w]) score += wordFreq[w];
    });
    // Boost definitions
    DEFINITION_MARKERS.forEach((marker) => {
      if (sentence.toLowerCase().includes(marker)) score *= 1.5;
    });
    if (index < sentences.length * 0.1) score *= 1.2;
    score = sWords.length > 0 ? score / Math.sqrt(sWords.length) : 0;
    return { sentence, score, index };
  });
}

export async function analyzeNotes(text: string, mode: SummaryMode): Promise<AnalysisResult> {
  const sentences = getSentences(text);
  const rawWords = text.match(/\b\w+\b/g) || [];
  const words = getWords(text);

  const wordCount = rawWords.length;
  const charCount = text.length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const wordFreq: Record<string, number> = {};
  words.forEach((word) => {
    if (!STOP_WORDS.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const sortedTerms = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  const keyTopics = sortedTerms.slice(0, 8);

  const avgWordLength = words.length ? words.reduce((a, b) => a + b.length, 0) / words.length : 0;
  const avgSentenceLength = sentences.length ? wordCount / sentences.length : 0;

  let difficulty: "Beginner" | "Intermediate" | "Advanced" = "Beginner";
  if (avgWordLength > 6.5 || avgSentenceLength > 20) difficulty = "Advanced";
  else if (avgWordLength > 5.5 || avgSentenceLength > 15) difficulty = "Intermediate";

  const analytics: Analytics = { wordCount, charCount, readingTimeMin, keyTopics, difficulty };

  if (sentences.length <= 3) {
    return { analytics, output: text };
  }

  const sentenceScores = textRank(sentences, wordFreq);
  const rankedSentences = [...sentenceScores].sort((a, b) => b.score - a.score);

  let output = "";

  switch (mode) {
    case "ai-summary": {
      const topCount = Math.max(5, Math.ceil(sentences.length * 0.3));
      const top = rankedSentences.slice(0, topCount).sort((a, b) => a.index - b.index);
      
      const paragraphs = [];
      let currentPara = [];
      for (let i = 0; i < top.length; i++) {
        currentPara.push(top[i].sentence);
        if (currentPara.length >= 4 || i === top.length - 1) {
          paragraphs.push(currentPara.join(" "));
          currentPara = [];
        }
      }
      output = "### AI Style Summary (TextRank Graph)\n\n" + paragraphs.join("\n\n");
      break;
    }

    case "student-notes": {
      const topCount = Math.max(4, Math.ceil(sentences.length * 0.25));
      const top = rankedSentences.slice(0, topCount).sort((a, b) => a.index - b.index);
      
      const definitions = sentences.filter((s) => DEFINITION_MARKERS.some((m) => s.toLowerCase().includes(m)));
      
      output = "### Student Notes\n\n";
      if (definitions.length > 0) {
        output += "#### Core Definitions\n";
        definitions.slice(0, 5).forEach((d) => { output += `- ${d}\n`; });
        output += "\n";
      }
      
      output += "#### Key Concepts\n";
      top.forEach((s, i) => {
        if (i % 3 === 0) output += `\n**${keyTopics[i % keyTopics.length].toUpperCase()}**\n`;
        output += `- ${s.sentence}\n`;
      });
      break;
    }

    case "exam-mode": {
      const topSentences = rankedSentences.slice(0, 10).map((s) => s.sentence);
      output = "### Exam Prep Mode\n\n#### Important Topics\n" + keyTopics.join(", ") + "\n\n";
      
      output += "#### Multiple Choice Questions\n";
      topSentences.slice(0, 3).forEach((s, i) => {
        const topic = keyTopics[i % keyTopics.length];
        output += `${i + 1}. Regarding ${topic}, which of the following is most accurate based on the text?\n`;
        output += `   A) ${s}\n   B) [Distractor A]\n   C) [Distractor B]\n   D) None of the above\n\n`;
      });

      output += "#### Short Answer Questions\n";
      topSentences.slice(3, 6).forEach((s, i) => {
        output += `- Explain the significance of the following statement: "${s}"\n`;
      });
      
      output += "\n#### Long Answer / Essay\n";
      if (keyTopics.length >= 2) {
        output += `- Discuss the relationship between ${keyTopics[0]} and ${keyTopics[1]} in the context of the provided material.\n`;
      }
      break;
    }

    case "flashcards": {
      const flashcards: { q: string; a: string; diff: string }[] = [];
      sentences.forEach((s) => {
        const lower = s.toLowerCase();
        for (const marker of DEFINITION_MARKERS) {
          if (lower.includes(marker)) {
            const parts = s.split(new RegExp(marker, "i"));
            if (parts.length === 2 && parts[0].length < 50 && parts[1].length > 10) {
              const term = parts[0].trim().replace(/^(the|a|an)\s+/i, "");
              flashcards.push({
                q: `What is ${term.charAt(0).toUpperCase() + term.slice(1)}?`,
                a: s,
                diff: s.length > 100 ? "Hard" : "Easy"
              });
              break;
            }
          }
        }
      });

      if (flashcards.length < 8) {
        const needed = 8 - flashcards.length;
        rankedSentences.slice(0, needed + flashcards.length).forEach((s) => {
          if (!flashcards.some((f) => f.a === s.sentence)) {
            const t = keyTopics.find((t) => s.sentence.toLowerCase().includes(t)) || keyTopics[0];
            flashcards.push({
              q: `Explain '${t}' in this context.`,
              a: s.sentence,
              diff: "Medium"
            });
          }
        });
      }

      output = "### Flashcard System\n\n" + flashcards.slice(0, 15).map((f, i) => `**Card ${i + 1} [${f.diff}]**\n**Front:** ${f.q}\n**Back:** ${f.a}`).join("\n\n---\n\n");
      break;
    }
  }

  return { analytics, output };
}

export async function chatWithNotes(text: string, query: string): Promise<string> {
  return localAI.semanticSearch(query, text);
}
