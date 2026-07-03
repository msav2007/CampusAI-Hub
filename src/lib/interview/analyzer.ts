import type {
  InterviewAnalyzer,
  InterviewAnalyzerInput,
  InterviewAnswerAnalysis,
  InterviewDifficulty,
  InterviewSessionEntry,
} from "./types";

const KEYWORD_MAX_SCORE = 35;
const LENGTH_MAX_SCORE = 15;
const CLARITY_MAX_SCORE = 20;
const COMPLETENESS_MAX_SCORE = 30;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "because",
  "by",
  "for",
  "from",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "so",
  "that",
  "the",
  "their",
  "then",
  "there",
  "they",
  "this",
  "to",
  "use",
  "when",
  "with",
  "you",
  "your",
]);

const STRUCTURE_MARKERS = [
  "first",
  "second",
  "third",
  "because",
  "for example",
  "for instance",
  "however",
  "therefore",
  "finally",
  "overall",
  "in short",
  "so",
];

const TARGET_LENGTHS: Record<
  InterviewDifficulty,
  {
    min: number;
    max: number;
  }
> = {
  Beginner: { min: 45, max: 180 },
  Intermediate: { min: 75, max: 240 },
  Advanced: { min: 110, max: 320 },
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value).split(" ").filter(Boolean);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function uniqueItems(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const key = normalizeText(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function splitSentences(answer: string) {
  return answer
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function hasToken(tokenSet: Set<string>, token: string) {
  if (tokenSet.has(token)) return true;
  if (token.endsWith("s") && tokenSet.has(token.slice(0, -1))) return true;
  if (!token.endsWith("s") && tokenSet.has(`${token}s`)) return true;
  return false;
}

function extractImportantTerms(text: string) {
  return tokenize(text).filter((token) => token.length > 3 && !STOP_WORDS.has(token));
}

function scoreKeywordCoverage({ question, answer }: InterviewAnalyzerInput) {
  const normalizedAnswer = normalizeText(answer);
  const matchedKeywords = question.importantKeywords.filter((keyword) =>
    normalizedAnswer.includes(normalizeText(keyword)),
  );
  const missingKeywords = question.importantKeywords.filter(
    (keyword) => !matchedKeywords.includes(keyword),
  );
  const coverageRatio =
    question.importantKeywords.length === 0
      ? 0
      : matchedKeywords.length / question.importantKeywords.length;

  return {
    score: Math.round(coverageRatio * KEYWORD_MAX_SCORE),
    maxScore: KEYWORD_MAX_SCORE,
    coverageRatio,
    matchedKeywords,
    missingKeywords,
  };
}

function scoreLength(wordCount: number, difficulty: InterviewDifficulty) {
  const range = TARGET_LENGTHS[difficulty];

  let score = LENGTH_MAX_SCORE;
  let assessment: "tooShort" | "good" | "tooLong" = "good";

  if (wordCount < range.min) {
    assessment = "tooShort";
    score = Math.round(clamp((wordCount / range.min) * LENGTH_MAX_SCORE, 2, LENGTH_MAX_SCORE));
  } else if (wordCount > range.max) {
    assessment = "tooLong";
    score = Math.round(
      clamp(LENGTH_MAX_SCORE - ((wordCount - range.max) / range.max) * 10, 4, LENGTH_MAX_SCORE),
    );
  }

  return {
    score,
    maxScore: LENGTH_MAX_SCORE,
    wordCount,
    targetRange: range,
    assessment,
  };
}

function scoreClarity(answer: string) {
  const sentences = splitSentences(answer);
  const words = tokenize(answer);
  const sentenceCount = Math.max(sentences.length, 1);
  const averageSentenceLength = words.length / sentenceCount;
  const normalizedAnswer = normalizeText(answer);
  const structureMarkers = STRUCTURE_MARKERS.filter((marker) =>
    normalizedAnswer.includes(normalizeText(marker)),
  );

  let score = 6;

  if (sentenceCount >= 2) score += 4;
  if (averageSentenceLength >= 8 && averageSentenceLength <= 24) score += 4;
  if (structureMarkers.length >= 1) score += 3;
  if (answer.includes(",") || answer.includes(";") || answer.includes("\n")) score += 2;
  if (sentences.every((sentence) => sentence.split(" ").filter(Boolean).length <= 35)) score += 1;

  return {
    score: clamp(score, 0, CLARITY_MAX_SCORE),
    maxScore: CLARITY_MAX_SCORE,
    sentenceCount,
    averageSentenceLength: Number(averageSentenceLength.toFixed(1)),
    structureMarkers,
  };
}

function scoreCompleteness({ question, answer }: InterviewAnalyzerInput) {
  const answerTokens = new Set(tokenize(answer));
  const coverage = question.sampleAnswerPoints.map((point) => {
    const importantTerms = extractImportantTerms(point);
    const matchedTerms = importantTerms.filter((term) => hasToken(answerTokens, term));
    const threshold = Math.max(1, Math.ceil(importantTerms.length * 0.45));

    return {
      point,
      covered: matchedTerms.length >= threshold,
    };
  });

  const coveredPoints = coverage.filter((item) => item.covered).length;
  const totalPoints = coverage.length;
  const ratio = totalPoints === 0 ? 0 : coveredPoints / totalPoints;

  return {
    score: Math.round(ratio * COMPLETENESS_MAX_SCORE),
    maxScore: COMPLETENESS_MAX_SCORE,
    coveredPoints,
    totalPoints,
    missingPoints: coverage.filter((item) => !item.covered).map((item) => item.point),
  };
}

function buildStrengths(analysis: InterviewAnswerAnalysis) {
  const strengths: string[] = [];

  if (analysis.metrics.keywordCoverage.coverageRatio >= 0.55) {
    const highlights = analysis.metrics.keywordCoverage.matchedKeywords.slice(0, 3).join(", ");
    strengths.push(
      `You used relevant interview language${highlights ? ` like ${highlights}` : ""}.`,
    );
  }

  if (analysis.metrics.answerLength.assessment === "good") {
    strengths.push("The answer has a solid level of detail for this difficulty.");
  }

  if (analysis.metrics.clarity.score >= 14) {
    strengths.push("Your response is easy to follow and broken into understandable ideas.");
  }

  if (
    analysis.metrics.completeness.totalPoints > 0 &&
    analysis.metrics.completeness.coveredPoints >= analysis.metrics.completeness.totalPoints - 1
  ) {
    strengths.push("You covered most of the core points an interviewer would expect.");
  }

  if (strengths.length === 0) {
    strengths.push("You stayed on topic and started addressing the main question.");
  }

  return strengths.slice(0, 4);
}

function buildMissingConcepts(analysis: InterviewAnswerAnalysis) {
  const missingConcepts = uniqueItems([
    ...analysis.metrics.completeness.missingPoints,
    ...analysis.metrics.keywordCoverage.missingKeywords,
  ]);

  return missingConcepts.slice(0, 4);
}

function buildImprovementTips(analysis: InterviewAnswerAnalysis) {
  const tips: string[] = [];

  if (analysis.metrics.keywordCoverage.missingKeywords.length > 0) {
    tips.push(
      `Add more job-specific terms such as ${analysis.metrics.keywordCoverage.missingKeywords
        .slice(0, 3)
        .join(", ")}.`,
    );
  }

  if (analysis.metrics.answerLength.assessment === "tooShort") {
    tips.push(
      "Add one concrete example, trade-off, or step-by-step explanation to deepen the answer.",
    );
  }

  if (analysis.metrics.answerLength.assessment === "tooLong") {
    tips.push("Lead with the main point first, then support it with one focused example.");
  }

  if (analysis.metrics.clarity.score < 12) {
    tips.push("Use shorter sentences and signposts such as 'first', 'because', and 'for example'.");
  }

  if (analysis.metrics.completeness.missingPoints.length > 0) {
    tips.push(
      "Make sure you cover the missing core ideas before moving to examples or extra detail.",
    );
  }

  if (tips.length === 0) {
    tips.push("Practice saying the answer aloud so it sounds natural, confident, and structured.");
  }

  return tips.slice(0, 4);
}

function analyzeAnswer(input: InterviewAnalyzerInput): InterviewAnswerAnalysis {
  const wordCount = tokenize(input.answer).length;
  const keywordCoverage = scoreKeywordCoverage(input);
  const answerLength = scoreLength(wordCount, input.question.difficulty);
  const clarity = scoreClarity(input.answer);
  const completeness = scoreCompleteness(input);
  const score = clamp(
    keywordCoverage.score + answerLength.score + clarity.score + completeness.score,
    0,
    100,
  );

  const analysis: InterviewAnswerAnalysis = {
    score,
    strengths: [],
    missingConcepts: [],
    improvementTips: [],
    metrics: {
      keywordCoverage,
      answerLength,
      clarity,
      completeness,
    },
  };

  analysis.strengths = buildStrengths(analysis);
  analysis.missingConcepts = buildMissingConcepts(analysis);
  analysis.improvementTips = buildImprovementTips(analysis);

  return analysis;
}

function summarizeEntries(entries: InterviewSessionEntry[]) {
  const answeredEntries = entries.filter((entry) => entry.answer.trim().length > 0);

  if (answeredEntries.length === 0) {
    return {
      questionsCompleted: 0,
      averageScore: 0,
      weakAreas: [],
      recommendations: [],
    };
  }

  const analyses = answeredEntries.map((entry) => analyzeAnswer(entry));
  const averageScore = Math.round(
    analyses.reduce((total, analysis) => total + analysis.score, 0) / analyses.length,
  );

  const keywordAverage =
    analyses.reduce(
      (total, analysis) =>
        total + analysis.metrics.keywordCoverage.score / analysis.metrics.keywordCoverage.maxScore,
      0,
    ) / analyses.length;
  const lengthAverage =
    analyses.reduce(
      (total, analysis) =>
        total + analysis.metrics.answerLength.score / analysis.metrics.answerLength.maxScore,
      0,
    ) / analyses.length;
  const clarityAverage =
    analyses.reduce(
      (total, analysis) =>
        total + analysis.metrics.clarity.score / analysis.metrics.clarity.maxScore,
      0,
    ) / analyses.length;
  const completenessAverage =
    analyses.reduce(
      (total, analysis) =>
        total + analysis.metrics.completeness.score / analysis.metrics.completeness.maxScore,
      0,
    ) / analyses.length;

  const weakAreas: string[] = [];

  if (keywordAverage < 0.7) weakAreas.push("Keyword coverage");
  if (lengthAverage < 0.7) weakAreas.push("Answer depth");
  if (clarityAverage < 0.7) weakAreas.push("Clarity");
  if (completenessAverage < 0.7) weakAreas.push("Completeness");

  const frequentMissingConcepts = uniqueItems(
    analyses.flatMap((analysis) => analysis.missingConcepts).slice(0, 6),
  );
  if (frequentMissingConcepts.length > 0) {
    weakAreas.push(`Missing concepts: ${frequentMissingConcepts.slice(0, 2).join(", ")}`);
  }

  const recommendations: string[] = [];

  if (keywordAverage < 0.7) {
    recommendations.push("Use more of the specific terms the interviewer expects to hear.");
  }

  if (lengthAverage < 0.7) {
    recommendations.push(
      "Add one more layer of detail so each answer feels complete but still focused.",
    );
  }

  if (clarityAverage < 0.7) {
    recommendations.push("Structure answers with a clear beginning, explanation, and example.");
  }

  if (completenessAverage < 0.7) {
    recommendations.push("Cover the core idea, the reason behind it, and the practical impact.");
  }

  if (averageScore >= 80 && recommendations.length === 0) {
    recommendations.push(
      "Keep practicing with new categories to make your answers more flexible under pressure.",
    );
  }

  return {
    questionsCompleted: answeredEntries.length,
    averageScore,
    weakAreas: uniqueItems(weakAreas).slice(0, 4),
    recommendations: uniqueItems(recommendations).slice(0, 4),
  };
}

export const localInterviewAnalyzer: InterviewAnalyzer = {
  analyze: analyzeAnswer,
  summarize: summarizeEntries,
};

export function analyzeInterviewAnswer(
  question: InterviewAnalyzerInput["question"],
  answer: string,
  analyzer: InterviewAnalyzer = localInterviewAnalyzer,
) {
  return analyzer.analyze({ question, answer });
}

export function summarizeInterviewSession(
  entries: InterviewSessionEntry[],
  analyzer: InterviewAnalyzer = localInterviewAnalyzer,
) {
  return analyzer.summarize(entries);
}
