import { calculateCgpaStats, type CgpaSemesterInput } from "../src/lib/calculators/cgpa";

const semesters: CgpaSemesterInput[] = [
  {
    id: "sem1",
    name: "Sem 1",
    subjects: [
      { id: "1", name: "Math", credits: 4, grade: "S" }, // 4 * 10 = 40
      { id: "2", name: "Physics", credits: 3, grade: "A" }, // 3 * 9 = 27
      { id: "3", name: "Lab", credits: 2, grade: "P" }, // 2 credits, not in GPA
      { id: "4", name: "History", credits: 3, grade: "F" }, // 3 * 0 = 0
    ],
  },
  {
    id: "sem2",
    name: "Sem 2",
    subjects: [
      { id: "5", name: "CS", credits: 4, grade: "B" }, // 4 * 8 = 32
    ],
  },
];

const result = calculateCgpaStats(semesters);

console.log("Sem 1:");
console.log("  GPA:", result.perSemester[0].gpa); // (40 + 27 + 0) / (4 + 3 + 3) = 67 / 10 = 6.7
console.log("  Total Credits:", result.perSemester[0].totalCredits); // 4 + 3 + 2 + 3 = 12
console.log("  GPA Credits:", result.perSemester[0].gpaCredits); // 10

console.log("Sem 2:");
console.log("  GPA:", result.perSemester[1].gpa); // 32 / 4 = 8.0
console.log("  Total Credits:", result.perSemester[1].totalCredits); // 4
console.log("  GPA Credits:", result.perSemester[1].gpaCredits); // 4

console.log("Total:");
console.log("  CGPA:", result.cgpa); // (67 + 32) / (10 + 4) = 99 / 14 = 7.071...
console.log("  Total Credits:", result.totalCredits); // 16
console.log("  GPA Credits:", result.gpaCredits); // 14
