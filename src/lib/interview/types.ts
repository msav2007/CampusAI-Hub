export const interviewCategories = [
  "Software Engineering",
  "Data Structures",
  "Web Development",
  "HR Interview",
] as const;

export const interviewDifficulties = ["Beginner", "Intermediate", "Advanced"] as const;

export type InterviewCategory = (typeof interviewCategories)[number];
export type InterviewDifficulty = (typeof interviewDifficulties)[number];

export type InterviewQuestion = {
  id: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  question: string;
  importantKeywords: string[];
  sampleAnswerPoints: string[];
};

export type InterviewMetricBreakdown = {
  score: number;
  maxScore: number;
};

export type InterviewAnswerAnalysis = {
  score: number;
  strengths: string[];
  missingConcepts: string[];
  improvementTips: string[];
  metrics: {
    keywordCoverage: InterviewMetricBreakdown & {
      coverageRatio: number;
      matchedKeywords: string[];
      missingKeywords: string[];
    };
    answerLength: InterviewMetricBreakdown & {
      wordCount: number;
      targetRange: {
        min: number;
        max: number;
      };
      assessment: "tooShort" | "good" | "tooLong";
    };
    clarity: InterviewMetricBreakdown & {
      sentenceCount: number;
      averageSentenceLength: number;
      structureMarkers: string[];
    };
    completeness: InterviewMetricBreakdown & {
      coveredPoints: number;
      totalPoints: number;
      missingPoints: string[];
    };
  };
};

export type InterviewSessionEntry = {
  question: InterviewQuestion;
  answer: string;
};

export type InterviewSessionResult = {
  questionsCompleted: number;
  averageScore: number;
  weakAreas: string[];
  recommendations: string[];
};

export type InterviewSession = {
  id: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, string>;
  startedAt: string;
  lastUpdatedAt: string;
};

export type InterviewHistoryEntry = {
  id: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  startedAt: string;
  lastUpdatedAt: string;
  completedAt: string | null;
  questionsCompleted: number;
  totalQuestions: number;
  averageScore: number;
  weakAreas: string[];
  recommendations: string[];
};

export type InterviewAnalyzerInput = {
  question: InterviewQuestion;
  answer: string;
};

export interface InterviewAnalyzer {
  analyze(input: InterviewAnalyzerInput): InterviewAnswerAnalysis;
  summarize(entries: InterviewSessionEntry[]): InterviewSessionResult;
}
