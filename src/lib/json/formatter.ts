export type JsonFormatterOutput =
  | { state: "empty" }
  | { state: "ok"; text: string }
  | { state: "error"; message: string; location: { line: number; column: number } | null };

export function locateJsonError(message: string, source: string) {
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (!positionMatch) return null;

  const position = Number(positionMatch[1]);
  const contentBeforeError = source.slice(0, position);
  const line = contentBeforeError.split("\n").length;
  const column = position - contentBeforeError.lastIndexOf("\n");

  return { line, column };
}

export function formatJsonInput(input: string, indent: 2 | 4): JsonFormatterOutput {
  if (!input.trim()) {
    return { state: "empty" };
  }

  try {
    const parsed = JSON.parse(input);
    return {
      state: "ok",
      text: JSON.stringify(parsed, null, indent),
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
