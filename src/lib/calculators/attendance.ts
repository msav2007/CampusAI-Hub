export type AttendanceInput = {
  total: number;
  attended: number;
  target: number;
};

export type AttendanceResult =
  | { state: "error"; error: string }
  | {
      state: "ok";
      current: number;
      needed: number;
      canSkip: number;
      meets: boolean;
    };

export function calculateAttendanceResult({
  total,
  attended,
  target,
}: AttendanceInput): AttendanceResult {
  if (!Number.isFinite(total) || !Number.isFinite(attended) || !Number.isFinite(target)) {
    return { state: "error", error: "Enter valid numbers." };
  }

  if (total <= 0) {
    return { state: "error", error: "Total classes must be greater than 0." };
  }

  if (attended < 0 || attended > total) {
    return { state: "error", error: "Attended classes must be between 0 and total." };
  }

  if (target <= 0 || target >= 100) {
    return { state: "error", error: "Target must be between 1 and 99." };
  }

  const current = (attended / total) * 100;
  const targetRatio = target / 100;

  let needed = 0;
  if (current < target) {
    needed = Math.ceil((targetRatio * total - attended) / (1 - targetRatio));
  }

  let canSkip = 0;
  if (current >= target) {
    canSkip = Math.floor(attended / targetRatio - total);
  }

  return {
    state: "ok",
    current,
    needed: Math.max(0, needed),
    canSkip: Math.max(0, canSkip),
    meets: current >= target,
  };
}
