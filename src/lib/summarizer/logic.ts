export type SummaryResult = {
  summary: string;
  keyPoints: string[];
  importantTerms: string[];
};

const STOP_WORDS = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "aren't",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can't",
  "cannot",
  "could",
  "couldn't",
  "did",
  "didn't",
  "do",
  "does",
  "doesn't",
  "doing",
  "don't",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "hadn't",
  "has",
  "hasn't",
  "have",
  "haven't",
  "having",
  "he",
  "he'd",
  "he'll",
  "he's",
  "her",
  "here",
  "here's",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "how's",
  "i",
  "i'd",
  "i'll",
  "i'm",
  "i've",
  "if",
  "in",
  "into",
  "is",
  "isn't",
  "it",
  "it's",
  "its",
  "itself",
  "let's",
  "me",
  "more",
  "most",
  "mustn't",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "shan't",
  "she",
  "she'd",
  "she'll",
  "she's",
  "should",
  "shouldn't",
  "so",
  "some",
  "such",
  "than",
  "that",
  "that's",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "there's",
  "these",
  "they",
  "they'd",
  "they'll",
  "they're",
  "they've",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "wasn't",
  "we",
  "we'd",
  "we'll",
  "we're",
  "we've",
  "were",
  "weren't",
  "what",
  "what's",
  "when",
  "when's",
  "where",
  "where's",
  "which",
  "while",
  "who",
  "who's",
  "whom",
  "why",
  "why's",
  "with",
  "won't",
  "would",
  "wouldn't",
  "you",
  "you'd",
  "you'll",
  "you're",
  "you've",
  "your",
  "yours",
  "yourself",
  "yourselves",
]);

function getSentences(text: string): string[] {
  // basic sentence splitting
  return (
    text
      .match(/[^.!?]+[.!?]+/g)
      ?.map((s) => s.trim())
      .filter(Boolean) || []
  );
}

function getWords(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
}

export function generateSummary(text: string): SummaryResult {
  const sentences = getSentences(text);
  if (sentences.length <= 3) {
    // Too short to summarize meaningfully
    return {
      summary: text,
      keyPoints: sentences,
      importantTerms: [],
    };
  }

  const words = getWords(text);
  const wordFreq: Record<string, number> = {};

  words.forEach((word) => {
    if (!STOP_WORDS.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const sortedTerms = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 8);

  const sentenceScores = sentences.map((sentence, index) => {
    const sWords = getWords(sentence);
    let score = 0;
    sWords.forEach((w) => {
      if (wordFreq[w]) {
        score += wordFreq[w];
      }
    });
    // normalize by length to not heavily favor long sentences
    score = sWords.length > 0 ? score / Math.sqrt(sWords.length) : 0;
    return { sentence, score, index };
  });

  // Sort by score descending
  sentenceScores.sort((a, b) => b.score - a.score);

  // Take top 3-5 for summary
  const summaryCount = Math.max(3, Math.ceil(sentences.length * 0.25));
  const summarySentences = sentenceScores
    .slice(0, summaryCount)
    .sort((a, b) => a.index - b.index) // Restore original order
    .map((s) => s.sentence);

  // Take the next few for key points (or just reuse top ones if short)
  const keyPointCount = Math.max(3, Math.ceil(sentences.length * 0.2));
  const keyPoints = sentenceScores
    .slice(0, keyPointCount + summaryCount)
    // take the best ones for key points too
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(5, keyPointCount))
    .map((s) => s.sentence);

  return {
    summary: summarySentences.join(" "),
    keyPoints,
    importantTerms: sortedTerms,
  };
}
