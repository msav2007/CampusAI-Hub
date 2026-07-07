export type AtsAnalysis = {
  score: number;
  grade: "Excellent" | "Good" | "Needs work";
  summary: string;
  categoryScores: {
    skillsMatch: number; // 0-100
    experience: number; // 0-100
    projects: number; // 0-100
    formatting: number; // 0-100
    education: number; // 0-100
    keywords: number; // 0-100
  };
  feedback: {
    strengths: string[];
    weaknesses: string[];
    missingKeywords: string[];
    improvements: string[];
    detectedSkills: string[];
    actionVerbs: string[];
    badPhrases: string[];
  };
  wordCount: number;
};

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
const SKILLS_DB = [
  "react",
  "typescript",
  "javascript",
  "node",
  "nodejs",
  "next.js",
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
  "spearheaded",
  "orchestrated",
  "engineered",
  "achieved",
  "resolved",
  "modernized",
];
const BAD_PHRASES = [
  "responsible for",
  "duties included",
  "helped with",
  "worked on",
  "assisted in",
  "team player",
  "hard worker",
  "detail-oriented",
];

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

function tokenize(text: string) {
  return normalizeAtsText(text)
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean);
}

function extractTargetKeywords(jobDescription: string) {
  const tokens = tokenize(jobDescription);
  const freq = new Map<string, number>();
  for (const t of tokens) {
    if (t.length < 3 || STOP_WORDS.has(t)) continue;
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map((x) => x[0]);
  const matchedSkills = SKILLS_DB.filter((s) =>
    normalizeAtsText(jobDescription).includes(normalizeAtsText(s)),
  );
  return [...new Set([...matchedSkills, ...ranked])].slice(0, 25);
}

export function analyzeResumeAgainstJob(resumeText: string, jobDescription: string): AtsAnalysis {
  const normResume = normalizeAtsText(resumeText);

  // Extract Target Keywords & Skills
  const jdKeywords = jobDescription
    ? extractTargetKeywords(jobDescription)
    : SKILLS_DB.slice(0, 15); // Fallback to general skills
  const matchedKeywords = jdKeywords.filter((k) => normResume.includes(normalizeAtsText(k)));
  const missingKeywords = jdKeywords.filter((k) => !matchedKeywords.includes(k));

  const detectedSkills = SKILLS_DB.filter((s) => normResume.includes(normalizeAtsText(s)));
  const actionVerbsFound = ACTION_VERBS.filter((v) =>
    new RegExp(`\\b${v}\\b`, "i").test(normResume),
  );
  const badPhrasesFound = BAD_PHRASES.filter((p) => normResume.includes(p));

  // Section Checks
  const hasExperience = /\b(experience|employment|work history)\b/i.test(normResume);
  const hasProjects = /\b(projects|project experience)\b/i.test(normResume);
  const hasEducation = /\b(education|academics|qualification|university|college|degree)\b/i.test(
    normResume,
  );
  const hasContact = /\b(email|phone|linkedin|github|@|\.com|\d{3}-\d{3})\b/i.test(normResume);

  // Formatting & Length
  const wordCount = tokenize(resumeText).length;
  const hasBullets = /(^|\n)\s*[-•*]/m.test(resumeText);
  const hasMetrics = /(\d+%|\$\d+|\d+\+|\b\d{2,}\b)/.test(resumeText);
  const conciseLength = wordCount >= 250 && wordCount <= 900;

  // Category Scores (0-100)
  const keywordsScore = jdKeywords.length
    ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
    : 80;

  // Skills Match (if JD has skills, check overlap. else just raw skill count)
  const jdSkills = SKILLS_DB.filter((s) =>
    normalizeAtsText(jobDescription).includes(normalizeAtsText(s)),
  );
  let skillsMatchScore = 80;
  if (jdSkills.length > 0) {
    const matchedJdSkills = jdSkills.filter((s) => normResume.includes(s));
    skillsMatchScore = Math.round((matchedJdSkills.length / jdSkills.length) * 100);
  } else {
    skillsMatchScore = Math.min(100, detectedSkills.length * 10);
  }

  const experienceScore = hasExperience ? (hasMetrics ? 100 : 70) : 0;
  const projectsScore = hasProjects ? (hasBullets ? 100 : 70) : 0;
  const educationScore = hasEducation ? 100 : 0;

  let formattingScore = 100;
  if (!hasBullets) formattingScore -= 30;
  if (!conciseLength) formattingScore -= 30;
  if (!hasContact) formattingScore -= 40;
  formattingScore = Math.max(0, formattingScore);

  // Overall Score (Weighted)
  const score = Math.round(
    keywordsScore * 0.25 +
      skillsMatchScore * 0.2 +
      experienceScore * 0.2 +
      formattingScore * 0.15 +
      projectsScore * 0.1 +
      educationScore * 0.1,
  );

  const grade = score >= 85 ? "Excellent" : score >= 65 ? "Good" : "Needs work";
  const summary =
    grade === "Excellent"
      ? "Outstanding ATS alignment! Your resume checks all the boxes."
      : grade === "Good"
        ? "Solid resume. Tweaking a few missing elements can bump you into the top tier."
        : "This resume might struggle in an ATS. Follow the improvements to fix critical issues.";

  // Feedback Generation
  const strengths = [];
  const weaknesses = [];
  const improvements = [];

  if (hasContact) strengths.push("Contact information detected.");
  else weaknesses.push("Missing contact information.");

  if (hasBullets) strengths.push("Good use of bullet points for readability.");
  else improvements.push("Format your experience and projects with bullet points.");

  if (hasMetrics) strengths.push("You quantified your achievements with numbers/metrics.");
  else improvements.push("Quantify your impact (use numbers, %, $).");

  if (actionVerbsFound.length >= 5) strengths.push("Strong use of action verbs.");
  else
    improvements.push(
      "Start bullet points with strong action verbs (e.g., 'Engineered', 'Optimized').",
    );

  if (badPhrasesFound.length > 0) {
    weaknesses.push(`Found weak phrases: ${badPhrasesFound.join(", ")}`);
    improvements.push("Replace weak phrases like 'responsible for' with active achievements.");
  }

  if (!conciseLength) {
    if (wordCount < 250) weaknesses.push("Resume is too short, lacking detail.");
    if (wordCount > 900) weaknesses.push("Resume is too long. Keep it concise (1-2 pages).");
  }

  if (!hasExperience) improvements.push("Add a clear 'Experience' or 'Work History' section.");
  if (!hasProjects) improvements.push("Add a 'Projects' section to showcase practical skills.");
  if (!hasEducation) improvements.push("Make sure your 'Education' section is clearly labeled.");

  return {
    score,
    grade,
    summary,
    categoryScores: {
      skillsMatch: skillsMatchScore,
      experience: experienceScore,
      projects: projectsScore,
      formatting: formattingScore,
      education: educationScore,
      keywords: keywordsScore,
    },
    feedback: {
      strengths,
      weaknesses,
      missingKeywords,
      improvements,
      detectedSkills,
      actionVerbs: actionVerbsFound,
      badPhrases: badPhrasesFound,
    },
    wordCount,
  };
}
