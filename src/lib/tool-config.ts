export type ToolCategory = "Academic" | "Career" | "Developer" | "Productivity";
export type ToolStatus = "live" | "comingSoon";

export type ToolDefinition = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  popular?: boolean;
  badge?: string;
};

export const categories = ["Academic", "Career", "Developer", "Productivity"] as const;

export const toolDefinitions: ToolDefinition[] = [
  {
    slug: "cgpa-calculator",
    name: "CGPA Calculator",
    description: "Compute CGPA across semesters with grade weights.",
    category: "Academic",
    status: "live",
    popular: true,
  },
  {
    slug: "attendance-calculator",
    name: "Attendance Calculator",
    description: "See how many classes you can safely skip.",
    category: "Academic",
    status: "live",
    popular: true,
  },
  {
    slug: "grade-predictor",
    name: "Grade Predictor",
    description: "Predict your final grade from current scores.",
    category: "Academic",
    status: "live",
  },
  {
    slug: "resume-ats",
    name: "Resume ATS Checker",
    description: "Score your resume against a job description with clear ATS feedback.",
    category: "Career",
    status: "live",
    popular: true,
    badge: "AI",
  },
  {
    slug: "resume-builder",
    name: "Resume Builder",
    description: "Craft recruiter-ready resumes in minutes.",
    category: "Career",
    status: "live",
    badge: "AI",
  },

  {
    slug: "readme-generator",
    name: "README Generator",
    description: "Generate polished READMEs from a repo URL.",
    category: "Developer",
    status: "live",
    badge: "AI",
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and debug JSON fast.",
    category: "Developer",
    status: "live",
  },
  {
    slug: "pdf-tools",
    name: "PDF Tools",
    description: "Merge, split, compress, and convert PDFs.",
    category: "Productivity",
    status: "live",
    popular: true,
  },
  {
    slug: "notes-summarizer",
    name: "Notes Summarizer",
    description: "Turn long lectures into crisp summaries.",
    category: "Productivity",
    status: "live",
    badge: "AI",
  },
];

export const liveToolSlugs = new Set(
  toolDefinitions.filter((tool) => tool.status === "live").map((tool) => tool.slug),
);

export const liveToolDefinitions = toolDefinitions.filter((tool) => tool.status === "live");
export const comingSoonToolDefinitions = toolDefinitions.filter(
  (tool) => tool.status === "comingSoon",
);

export const toolCounts = {
  total: toolDefinitions.length,
  live: liveToolDefinitions.length,
  comingSoon: comingSoonToolDefinitions.length,
};

export function isLiveToolSlug(slug: string) {
  return liveToolSlugs.has(slug);
}

export function toolPath(slug: string) {
  return `/tools/${slug}`;
}
