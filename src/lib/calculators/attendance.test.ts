import { describe, expect, it } from "vitest";

import { calculateAttendanceResult } from "./attendance";

describe("calculateAttendanceResult", () => {
  it("calculates safe skips when the student is already above target", () => {
    const result = calculateAttendanceResult({ total: 60, attended: 48, target: 75 });

    expect(result).toEqual({
      state: "ok",
      current: 80,
      needed: 0,
      canSkip: 4,
      meets: true,
    });
  });

  it("calculates required recovery classes when the student is below target", () => {
    const result = calculateAttendanceResult({ total: 40, attended: 24, target: 75 });

    expect(result).toEqual({
      state: "ok",
      current: 60,
      needed: 24,
      canSkip: 0,
      meets: false,
    });
  });

  it("returns a validation error for impossible attendance values", () => {
    const result = calculateAttendanceResult({ total: 10, attended: 14, target: 75 });

    expect(result).toEqual({
      state: "error",
      error: "Attended classes must be between 0 and total.",
    });
  });
});
