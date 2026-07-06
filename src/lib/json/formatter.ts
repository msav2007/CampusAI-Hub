export type JsonFormatterOutput =
  | { state: "empty" }
  | { state: "ok"; parsed: unknown; text: string; minified: string; stats: JsonStats }
  | { state: "error"; message: string; location: { line: number; column: number } | null };

export interface JsonStats {
  totalKeys: number;
  objectsCount: number;
  arraysCount: number;
  stringsCount: number;
  numbersCount: number;
  booleansCount: number;
  nullsCount: number;
  maxDepth: number;
  sizeBytes: number;
}

export function locateJsonError(message: string, source: string) {
  // Typical V8 error: "Unexpected token u in JSON at position 23"
  // or "Unexpected number in JSON at position 45"
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (!positionMatch) return null;

  const position = Number(positionMatch[1]);
  const contentBeforeError = source.slice(0, position);
  const line = contentBeforeError.split("\n").length;
  const column = position - contentBeforeError.lastIndexOf("\n");

  return { line, column };
}

export function computeJsonStats(obj: unknown, currentDepth = 1): JsonStats {
  const stats: JsonStats = {
    totalKeys: 0,
    objectsCount: 0,
    arraysCount: 0,
    stringsCount: 0,
    numbersCount: 0,
    booleansCount: 0,
    nullsCount: 0,
    maxDepth: currentDepth,
    sizeBytes: 0, // Calculated outside
  };

  if (obj === null) {
    stats.nullsCount++;
    return stats;
  }

  if (typeof obj === "string") {
    stats.stringsCount++;
    return stats;
  }
  if (typeof obj === "number") {
    stats.numbersCount++;
    return stats;
  }
  if (typeof obj === "boolean") {
    stats.booleansCount++;
    return stats;
  }

  if (Array.isArray(obj)) {
    stats.arraysCount++;
    for (const item of obj) {
      const childStats = computeJsonStats(item, currentDepth + 1);
      mergeStats(stats, childStats);
    }
    return stats;
  }

  if (typeof obj === "object") {
    stats.objectsCount++;
    const keys = Object.keys(obj);
    stats.totalKeys += keys.length;
    for (const key of keys) {
      const childStats = computeJsonStats((obj as Record<string, unknown>)[key], currentDepth + 1);
      mergeStats(stats, childStats);
    }
    return stats;
  }

  return stats;
}

function mergeStats(target: JsonStats, source: JsonStats) {
  target.totalKeys += source.totalKeys;
  target.objectsCount += source.objectsCount;
  target.arraysCount += source.arraysCount;
  target.stringsCount += source.stringsCount;
  target.numbersCount += source.numbersCount;
  target.booleansCount += source.booleansCount;
  target.nullsCount += source.nullsCount;
  if (source.maxDepth > target.maxDepth) {
    target.maxDepth = source.maxDepth;
  }
}

export function formatJsonInput(input: string, indent: 2 | 4): JsonFormatterOutput {
  if (!input.trim()) {
    return { state: "empty" };
  }

  try {
    const parsed = JSON.parse(input);
    const text = JSON.stringify(parsed, null, indent);
    const minified = JSON.stringify(parsed);
    const stats = computeJsonStats(parsed);
    stats.sizeBytes = new Blob([input]).size;

    return {
      state: "ok",
      parsed,
      text,
      minified,
      stats,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    return {
      state: "error",
      message,
      location: locateJsonError(message, input),
    };
  }
}
