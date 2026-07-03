export type ExplainerLanguage =
  "Auto Detect" | "JavaScript" | "TypeScript" | "Python" | "Java" | "C/C++" | "Other";

export type CodeAnalysisResult = {
  language: string;
  explanation: string;
  structure: {
    functions: number;
    imports: number;
    variables: number;
    loops: number;
    conditions: number;
    classes: number;
  };
  concepts: string[];
  suggestions: string[];
  issues: string[];
};

export function analyzeCode(
  code: string,
  preferredLanguage: ExplainerLanguage,
): CodeAnalysisResult {
  const lines = code.split("\n");
  const numLines = lines.length;

  // Basic language detection
  let lang = preferredLanguage !== "Auto Detect" ? preferredLanguage : "Other";
  if (preferredLanguage === "Auto Detect") {
    if (/def \w+\(/.test(code) || (/import [a-z0-9_]+/.test(code) && !/;/.test(code)))
      lang = "Python";
    else if (/public class/.test(code) || /System\.out\.println/.test(code)) lang = "Java";
    else if (/#include <.*>/.test(code) || /int main\(\)/.test(code)) lang = "C/C++";
    else if (/interface \w+ \{/.test(code) || /type \w+ =/.test(code)) lang = "TypeScript";
    else if (/function \w+\(/.test(code) || /const \w+ =/.test(code) || /console\.log/.test(code))
      lang = "JavaScript";
    else lang = "Other";
  }

  // Feature detection
  let functions = 0,
    imports = 0,
    variables = 0,
    loops = 0,
    conditions = 0,
    classes = 0;

  if (lang === "Python") {
    functions = (code.match(/def \w+\(/g) || []).length;
    imports = (code.match(/import /g) || []).length + (code.match(/from \w+ import/g) || []).length;
    variables = (code.match(/^[ \t]*[a-zA-Z_]\w*[ \t]*=[ \t]*[^=]/gm) || []).length;
    loops = (code.match(/for \w+ in/g) || []).length + (code.match(/while .*(?=:)/g) || []).length;
    conditions =
      (code.match(/if .*(?=:)/g) || []).length + (code.match(/elif .*(?=:)/g) || []).length;
    classes = (code.match(/class \w+.*(?=:)/g) || []).length;
  } else {
    // C-style languages
    functions =
      (code.match(/function \w+\(/g) || []).length +
      (code.match(/\w+\s*\([^)]*\)\s*\{/g) || []).length;
    imports = (code.match(/import /g) || []).length + (code.match(/#include/g) || []).length;
    variables = (code.match(/(const|let|var|int|string|float|double|boolean) \w+/gi) || []).length;
    loops = (code.match(/for\s*\(/g) || []).length + (code.match(/while\s*\(/g) || []).length;
    conditions = (code.match(/if\s*\(/g) || []).length + (code.match(/else if\s*\(/g) || []).length;
    classes = (code.match(/class \w+/g) || []).length;
  }

  // Generate explanation
  let explanation = `This appears to be a ${lang} snippet with ${numLines} lines of code. `;
  if (classes > 0)
    explanation += `It uses an object-oriented structure with ${classes} class(es). `;
  else if (functions > 0)
    explanation += `It follows a procedural or functional structure with ${functions} function(s). `;
  else explanation += "It appears to be a simple script without complex nested structures. ";

  if (imports > 0) explanation += "It relies on external dependencies or modules.";

  // Detect concepts
  const concepts: string[] = [];
  if (loops > 0) concepts.push("Iteration/Loops");
  if (conditions > 0) concepts.push("Conditional Logic");
  if (classes > 0) concepts.push("Object-Oriented Programming");
  if (/fetch\(|axios|XMLHttpRequest/.test(code)) concepts.push("API/Network Requests");
  if (/async|await|Promise/.test(code)) concepts.push("Asynchronous Programming");
  if (/\b(try|catch|except)\b/.test(code)) concepts.push("Exception Handling");
  if (/\b(map|filter|reduce)\b/.test(code)) concepts.push("Functional Array Methods");
  if (/\b(useState|useEffect|React)\b/.test(code)) concepts.push("React Hooks");

  // Detect issues
  const issues: string[] = [];
  if (!/\b(try|catch|except)\b/.test(code) && concepts.includes("API/Network Requests")) {
    issues.push("Missing error handling for network requests (no try/catch found).");
  }
  if (lang === "JavaScript" || lang === "TypeScript") {
    if (/\bvar\b/.test(code))
      issues.push("Consider using 'let' or 'const' instead of 'var' for block scoping.");
    if (/==[^=]/.test(code))
      issues.push("Consider using '===' instead of '==' to avoid type coercion.");
  }

  // Suggestions
  const suggestions: string[] = [];
  if ((code.match(/\/\/|#|\/\*/g) || []).length < Math.min(3, numLines / 10)) {
    suggestions.push("Consider adding more comments to explain the complex parts of the logic.");
  }
  if (variables > 0 && !code.match(/const /g)) {
    // rudimentary check
    if (lang === "JavaScript" || lang === "TypeScript") {
      suggestions.push("Use 'const' for variables that are never reassigned.");
    }
  }
  if (issues.length === 0) {
    suggestions.push("Code looks clean from a basic static analysis perspective.");
  }

  return {
    language: lang,
    explanation,
    structure: { functions, imports, variables, loops, conditions, classes },
    concepts,
    suggestions,
    issues,
  };
}
