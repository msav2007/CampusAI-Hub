const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with",
  "will",
  "you",
  "your",
  "we",
  "our",
  "they",
  "their",
  "role",
  "team",
  "work",
  "working",
  "looking",
  "candidate",
  "candidates",
  "experience",
  "years",
  "year",
]);

const KEYWORD_LIBRARY = [
  "react",
  "typescript",
  "javascript",
  "node",
  "nodejs",
  "next.js",
  "tanstack",
  "tailwind",
  "html",
  "css",
  "python",
  "java",
  "c++",
  "c#",
  "sql",
  "mysql",
  "postgresql",
  "mongodb",
  "firebase",
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "git",
  "rest",
  "graphql",
  "api",
  "testing",
  "vitest",
  "jest",
  "playwright",
  "cypress",
  "agile",
  "scrum",
  "data analysis",
  "machine learning",
  "deep learning",
  "nlp",
  "power bi",
  "tableau",
  "excel",
  "figma",
  "product management",
  "project management",
  "communication",
  "leadership",
  "problem solving",
  "teamwork",
  "customer support",
  "sales",
  "marketing",
];

const ACTION_VERBS = [
  "built",
  "created",
  "designed",
  "developed",
  "delivered",
  "improved",
  "implemented",
  "launched",
  "led",
  "managed",
  "optimized",
  "reduced",
  "scaled",
  "shipped",
];

const SECTION_PATTERNS = [
  { key: "contact", label: "Contact details", pattern: /\b(email|phone|linkedin|github)\b/i },
  { key: "summary", label: "Summary", pattern: /\b(summary|profile|objective)\b/i },
  { key: "skills", label: "Skills", pattern: /\b(skills|technical skills|core skills)\b/i },
  { key: "experience", label: "Experience", pattern: /\b(experience|employment|work history)\b/i },
  { key: "projects", label: "Projects", pattern: /\b(projects|project experience)\b/i },
  { key: "education", label: "Education", pattern: /\b(education|academics|qualification)\b/i },
] as const;

export type AtsAnalysis = {
  score: number;
  summary: string;
  grade: "Excellent" | "Good" | "Needs work";
  wordCount: number;
  keywordCoverage: {
    score: number;
    matched: string[];
    missing: string[];
    targetKeywords: string[];
  };
  structure: {
    score: number;
    sections: Array<{ key: string; label: string; present: boolean }>;
  };
  formatting: {
    score: number;
    bulletPoints: boolean;
    metrics: boolean;
    conciseLength: boolean;
  };
  impact: {
    score: number;
    actionVerbs: string[];
  };
  recommendations: string[];
};

export function normalizeAtsText(text: string) {
  return text
    .toLowerCase()
    .replace(/node\.js/g, "nodejs")
    .replace(/next\.js/g, "nextjs")
    .replace(/c\+\+/g, "cpp")
    .replace(/c#/g, "csharp")
    .replace(/[^\p{L}\p{N}\s%+#.-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function tokenize(text: string) {
  return normalizeAtsText(text)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

export function extractTargetKeywords(jobDescription: string) {
  const normalized = normalizeAtsText(jobDescription);
  const tokens = tokenize(jobDescription);
  const frequentTokens = new Map<string, number>();

  for (const token of tokens) {
    if (token.length < 3 || STOP_WORDS.has(token)) continue;
    frequentTokens.set(token, (frequentTokens.get(token) ?? 0) + 1);
  }

  const rankedTokens = [...frequentTokens.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 16)
    .map(([token]) => token);

  const matchedLibraryKeywords = KEYWORD_LIBRARY.filter((keyword) =>
    normalized.includes(normalizeAtsText(keyword)),
  );

  return unique([...matchedLibraryKeywords, ...rankedTokens]).slice(0, 20);
}

function hasKeyword(text: string, keyword: string) {
  const normalizedText = normalizeAtsText(text);
  const normalizedKeyword = normalizeAtsText(keyword);

  if (normalizedKeyword.includes(" ")) {
    return normalizedText.includes(normalizedKeyword);
  }

  return new RegExp(`(^|\\s)${escapeRegExp(normalizedKeyword)}(?=\\s|$)`, "i").test(normalizedText);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildRecommendations(analysis: Omit<AtsAnalysis, "recommendations">) {
  const recommendations: string[] = [];

  if (analysis.keywordCoverage.missing.length > 0) {
    recommendations.push(
      `Add the strongest missing keywords: ${analysis.keywordCoverage.missing
        .slice(0, 5)
        .join(", ")}.`,
    );
  }

  const missingSections = analysis.structure.sections.filter((section) => !section.present);
  if (missingSections.length > 0) {
    recommendations.push(
      `Add clear section headings for ${missingSections
        .map((section) => section.label.toLowerCase())
        .slice(0, 3)
        .join(", ")}.`,
    );
  }

  if (!analysis.formatting.metrics) {
    recommendations.push(
      "Quantify outcomes with numbers, percentages, or time saved where possible.",
    );
  }

  if (!analysis.formatting.bulletPoints) {
    recommendations.push(
      "Use bullet points for experience and projects so ATS parsers can separate achievements cleanly.",
    );
  }

  if (!analysis.formatting.conciseLength) {
    recommendations.push(
      "Keep the resume concise. Aim for roughly 250 to 900 words for this type of one-page scan.",
    );
  }

  if (analysis.impact.actionVerbs.length < 4) {
    recommendations.push(
      "Start key bullets with stronger action verbs such as built, led, optimized, or delivered.",
    );
  }

  return recommendations.slice(0, 4);
}

export function analyzeResumeAgainstJob(resumeText: string, jobDescription: string): AtsAnalysis {
  const targetKeywords = extractTargetKeywords(jobDescription);
  const matchedKeywords = targetKeywords.filter((keyword) => hasKeyword(resumeText, keyword));
  const missingKeywords = targetKeywords.filter((keyword) => !matchedKeywords.includes(keyword));
  const keywordScore =
    targetKeywords.length === 0
      ? 0
      : Math.round((matchedKeywords.length / targetKeywords.length) * 55);

  const sectionResults = SECTION_PATTERNS.map((section) => ({
    key: section.key,
    label: section.label,
    present: section.pattern.test(resumeText),
  }));
  const sectionScore = Math.round(
    (sectionResults.filter((section) => section.present).length / SECTION_PATTERNS.length) * 20,
  );

  const wordCount = tokenize(resumeText).length;
  const bulletPoints = /(^|\n)\s*[-•*]/m.test(resumeText);
  const metrics = /(\d+%|\$\d+|\d+\+|\b\d{2,}\b)/.test(resumeText);
  const conciseLength = wordCount >= 250 && wordCount <= 900;
  const formattingScore = (bulletPoints ? 5 : 0) + (metrics ? 5 : 0) + (conciseLength ? 5 : 0);

  const actionVerbs = unique(
    ACTION_VERBS.filter((verb) =>
      new RegExp(`(^|\\s)${verb}(?=\\s|$)`, "i").test(normalizeAtsText(resumeText)),
    ),
  );
  const impactScore = Math.min(10, actionVerbs.length * 2);

  const score = Math.min(100, keywordScore + sectionScore + formattingScore + impactScore);
  const grade: AtsAnalysis["grade"] =
    score >= 85 ? "Excellent" : score >= 65 ? "Good" : "Needs work";
  const summary =
    grade === "Excellent"
      ? "Strong ATS alignment. The resume already mirrors the job description well."
      : grade === "Good"
        ? "Solid foundation. A few targeted keyword and structure changes should improve the match."
        : "The resume needs clearer ATS signals before public applications.";

  const baseAnalysis = {
    score,
    summary,
    grade,
    wordCount,
    keywordCoverage: {
      score: keywordScore,
      matched: matchedKeywords,
      missing: missingKeywords,
      targetKeywords,
    },
    structure: {
      score: sectionScore,
      sections: sectionResults,
    },
    formatting: {
      score: formattingScore,
      bulletPoints,
      metrics,
      conciseLength,
    },
    impact: {
      score: impactScore,
      actionVerbs,
    },
  };

  return {
    ...baseAnalysis,
    recommendations: buildRecommendations(baseAnalysis),
  };
}
