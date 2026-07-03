import { describe, expect, it } from "vitest";

import { formatJsonInput, locateJsonError } from "./formatter";

describe("formatJsonInput", () => {
  it("pretty prints valid JSON with the selected indentation", () => {
    const result = formatJsonInput('{"name":"Ada","active":true}', 4);

    expect(result).toEqual({
      state: "ok",
      text: '{\n    "name": "Ada",\n    "active": true\n}',
    });
  });

  it("returns an empty state for blank input", () => {
    expect(formatJsonInput("   ", 2)).toEqual({ state: "empty" });
  });

  it("reports a location when JSON parsing fails", () => {
    const result = formatJsonInput('{"name": "Ada",}', 2);

    expect(result.state).toBe("error");
    if (result.state === "error") {
      expect(result.location).toEqual({ line: 1, column: 16 });
    }
  });
});

describe("locateJsonError", () => {
  it("returns null when the parser message has no position", () => {
    expect(locateJsonError("Unexpected token", "{}")).toBeNull();
  });
});
