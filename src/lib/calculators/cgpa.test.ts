import { describe, expect, it } from "vitest";

import { calculateCgpaStats } from "./cgpa";

describe("calculateCgpaStats", () => {
  it("calculates semester GPA and cumulative CGPA", () => {
    const stats = calculateCgpaStats([
      {
        id: "sem-1",
        subjects: [
          { credits: 4, points: 9, grade: "A" },
          { credits: 3, points: 8, grade: "B" },
        ],
      },
      {
        id: "sem-2",
        subjects: [
          { credits: 3, points: 10, grade: "O" },
          { credits: 2, points: 7, grade: "C" },
        ],
      },
    ]);

    expect(stats.perSemester[0]?.gpa).toBeCloseTo(8.57, 2);
    expect(stats.perSemester[1]?.gpa).toBeCloseTo(8.8, 2);
    expect(stats.totalCredits).toBe(12);
    expect(stats.cgpa).toBeCloseTo(8.67, 2);
  });

  it("handles empty or zero-credit semesters safely", () => {
    const stats = calculateCgpaStats([
      { id: "sem-1", subjects: [{ credits: 0, points: 10, grade: "O" }] },
    ]);

    expect(stats.totalCredits).toBe(0);
    expect(stats.cgpa).toBe(0);
    expect(stats.perSemester[0]?.gpa).toBe(0);
  });
});
