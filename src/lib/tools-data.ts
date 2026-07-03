import {
  BookOpen,
  Braces,
  Calculator,
  CalendarCheck,
  Code2,
  FileCheck2,
  FileText,
  FileType2,
  MessagesSquare,
  NotebookPen,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import {
  categories,
  comingSoonToolDefinitions,
  isLiveToolSlug,
  liveToolDefinitions,
  liveToolSlugs,
  toolCounts,
  toolDefinitions,
  toolPath,
  type ToolCategory,
  type ToolDefinition,
} from "./tool-config";

const toolIcons: Record<ToolDefinition["slug"], LucideIcon> = {
  "attendance-calculator": CalendarCheck,
  "cgpa-calculator": Calculator,
  "code-explainer": Code2,
  "grade-predictor": TrendingUp,
  "interview-ai": MessagesSquare,
  "json-formatter": Braces,
  "notes-summarizer": NotebookPen,
  "pdf-tools": FileType2,
  "readme-generator": BookOpen,
  "resume-ats": FileCheck2,
  "resume-builder": FileText,
};

export type Tool = ToolDefinition & {
  category: ToolCategory;
  href: string;
  icon: LucideIcon;
};

export const tools: Tool[] = toolDefinitions.map((tool) => ({
  ...tool,
  href: toolPath(tool.slug),
  icon: toolIcons[tool.slug],
}));

export const liveTools = tools.filter((tool) => tool.status === "live");
export const comingSoonTools = tools.filter((tool) => tool.status === "comingSoon");

export {
  categories,
  comingSoonToolDefinitions,
  isLiveToolSlug,
  liveToolDefinitions,
  liveToolSlugs,
  toolCounts,
  toolDefinitions,
  toolPath,
};
