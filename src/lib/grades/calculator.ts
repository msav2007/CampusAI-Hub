import {
  GRADE_THRESHOLDS,
  type GradeComponent,
  type GradeScale,
  type PredictionResult,
} from "./types";

export function getGradeFromPercentage(percentage: number): GradeScale {
  if (percentage >= GRADE_THRESHOLDS.S) return "S";
  if (percentage >= GRADE_THRESHOLDS.A) return "A";
  if (percentage >= GRADE_THRESHOLDS.B) return "B";
  if (percentage >= GRADE_THRESHOLDS.C) return "C";
  if (percentage >= GRADE_THRESHOLDS.D) return "D";
  if (percentage >= GRADE_THRESHOLDS.E) return "E";
  return "F";
}

export function calculatePrediction(
  components: GradeComponent[],
  finalExamWeight: number,
): PredictionResult {
  let currentScoreContributed = 0;
  let totalCompletedWeight = 0;

  for (const comp of components) {
    if (comp.maxScore > 0) {
      currentScoreContributed += (comp.score / comp.maxScore) * comp.weight;
      totalCompletedWeight += comp.weight;
    }
  }

  // Calculate current standing purely based on completed assignments
  const currentPercentage =
    totalCompletedWeight > 0 ? (currentScoreContributed / totalCompletedWeight) * 100 : 0;
  const currentGrade = getGradeFromPercentage(currentPercentage);

  const bestCasePercentage = currentScoreContributed + finalExamWeight;
  const worstCasePercentage = currentScoreContributed; // Assuming 0 on final

  const bestCaseGrade = getGradeFromPercentage(bestCasePercentage);
  const worstCaseGrade = getGradeFromPercentage(worstCasePercentage);

  const requiredForTarget = {} as Record<GradeScale, number | null>;

  const grades: GradeScale[] = ["S", "A", "B", "C", "D", "E"];
  for (const grade of grades) {
    const targetPercentage = GRADE_THRESHOLDS[grade];

    // How much more weight do they need to reach the target?
    const requiredScore = targetPercentage - currentScoreContributed;

    if (requiredScore <= 0) {
      // Already achieved this grade even with a 0 on the final
      requiredForTarget[grade] = 0;
    } else if (requiredScore > finalExamWeight) {
      // Impossible to achieve even with 100% on the final
      requiredForTarget[grade] = null;
    } else {
      // The percentage they need to score specifically on the final exam
      requiredForTarget[grade] = (requiredScore / finalExamWeight) * 100;
    }
  }

  requiredForTarget["F"] = 0; // F is always possible/0 required

  return {
    currentPercentage,
    currentGrade,
    bestCasePercentage,
    bestCaseGrade,
    worstCasePercentage,
    worstCaseGrade,
    finalWeightRemaining: finalExamWeight,
    requiredForTarget,
  };
}
