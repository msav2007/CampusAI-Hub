export const gradeOptions = [
  { label: "S (10)", grade: "S", points: 10 },
  { label: "A (9)", grade: "A", points: 9 },
  { label: "B (8)", grade: "B", points: 8 },
  { label: "C (7)", grade: "C", points: 7 },
  { label: "D (6)", grade: "D", points: 6 },
  { label: "E (5)", grade: "E", points: 5 },
  { label: "F (0)", grade: "F", points: 0 },
  { label: "P (Pass)", grade: "P", points: 0 },
] as const;

export type CgpaSubjectInput = {
  credits: number;
  grade: string;
  points?: number; // legacy support
};

export type CgpaSemesterInput = {
  id: string;
  subjects: CgpaSubjectInput[];
};

export type CgpaStats = {
  perSemester: Array<{
    id: string;
    gpa: number;
    totalCredits: number;
    gpaCredits: number;
    totalPoints: number;
  }>;
  totalCredits: number;
  gpaCredits: number;
  totalPoints: number;
  cgpa: number;
};

export function calculateCgpaStats(semesters: CgpaSemesterInput[]): CgpaStats {
  const perSemester = semesters.map((semester) => {
    let totalCredits = 0;
    let gpaCredits = 0;
    let totalPoints = 0;

    for (const subject of semester.subjects) {
      const credits = Number(subject.credits) || 0;
      totalCredits += credits;

      let grade = subject.grade;

      // Fallback for older saved data using points instead of grades
      if (!grade && subject.points !== undefined) {
        const p = Number(subject.points);
        if (p === 10) grade = "S";
        else if (p === 9) grade = "A";
        else if (p === 8) grade = "B";
        else if (p === 7) grade = "C";
        else if (p === 6) grade = "D";
        else if (p === 5) grade = "E";
        else if (p === 4) grade = "P";
        else grade = "F";
      }

      if (grade === "P") {
        // P credits only count toward completed totalCredits, not GPA
        continue;
      }

      const gradeDef = gradeOptions.find((g) => g.grade === grade);
      const points = gradeDef ? gradeDef.points : 0;

      gpaCredits += credits;
      totalPoints += credits * points;
    }

    const gpa = gpaCredits > 0 ? totalPoints / gpaCredits : 0;

    return {
      id: semester.id,
      gpa,
      totalCredits,
      gpaCredits,
      totalPoints,
    };
  });

  const totalCredits = perSemester.reduce((sum, semester) => sum + semester.totalCredits, 0);
  const gpaCredits = perSemester.reduce((sum, semester) => sum + semester.gpaCredits, 0);
  const totalPoints = perSemester.reduce((sum, semester) => sum + semester.totalPoints, 0);

  return {
    perSemester,
    totalCredits,
    gpaCredits,
    totalPoints,
    cgpa: gpaCredits > 0 ? totalPoints / gpaCredits : 0,
  };
}
