export type GradeScale = "S" | "A" | "B" | "C" | "D" | "E" | "F";

export const GRADE_THRESHOLDS: Record<GradeScale, number> = {
  S: 90,
  A: 80,
  B: 70,
  C: 60,
  D: 50,
  E: 40,
  F: 0,
};

export type GradeComponent = {
  id: string;
  name: string;
  weight: number; // e.g. 20 for 20%
  score: number;
  maxScore: number;
};

export type PredictionResult = {
  currentPercentage: number;
  currentGrade: GradeScale;
  bestCasePercentage: number;
  bestCaseGrade: GradeScale;
  worstCasePercentage: number;
  worstCaseGrade: GradeScale;
  finalWeightRemaining: number;
  requiredForTarget: Record<GradeScale, number | null>; // Returns the percentage needed on the final exam. Null if impossible.
};
