import { describe, expect, it } from "vitest";

import { analyzeResumeAgainstJob, extractTargetKeywords } from "./scoring";

const jobDescription = `Frontend Developer
React TypeScript JavaScript HTML CSS REST API testing Git Tailwind communication teamwork`;

describe("extractTargetKeywords", () => {
  it("keeps relevant library keywords from the job description", () => {
    const keywords = extractTargetKeywords(jobDescription);

    expect(keywords).toEqual(
      expect.arrayContaining(["react", "typescript", "javascript", "testing", "tailwind"]),
    );
  });
});

describe("analyzeResumeAgainstJob", () => {
  it("produces a strong score for a well-aligned resume", () => {
    const analysis = analyzeResumeAgainstJob(
      `SUMMARY
Frontend developer building React and TypeScript web apps.

EMAIL
ada@example.com · github.com/ada

SKILLS
React, TypeScript, JavaScript, HTML, CSS, Tailwind, REST API, Git, Testing

EXPERIENCE
- Built responsive dashboards in React and TypeScript
- Optimized load time by 32% and improved team workflows

PROJECTS
- Developed a student portal with REST API integration

EDUCATION
B.Tech Computer Science`,
      jobDescription,
    );

    expect(analysis.score).toBeGreaterThanOrEqual(75);
    expect(analysis.keywordCoverage.matched).toEqual(
      expect.arrayContaining(["react", "typescript", "javascript", "testing"]),
    );
    expect(analysis.structure.sections.every((section) => section.present)).toBe(true);
  });

  it("surfaces missing keywords and actionable recommendations for a weak resume", () => {
    const analysis = analyzeResumeAgainstJob(
      `PROFILE
Hardworking student looking for opportunities.

EXPERIENCE
Worked on websites.`,
      jobDescription,
    );

    expect(analysis.score).toBeLessThan(65);
    expect(analysis.keywordCoverage.missing.length).toBeGreaterThan(0);
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  });
});
