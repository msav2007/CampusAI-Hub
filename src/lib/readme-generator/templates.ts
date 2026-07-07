import type { ReadmeInput } from "./logic";

const baseTemplate: ReadmeInput = {
  projectName: "",
  shortDescription: "",
  detailedDescription: "",
  logoUrl: "",
  demoUrl: "",
  githubRepo: "",
  badges: {
    react: false,
    typescript: false,
    license: true,
    version: false,
    build: false,
    next: false,
    vite: false,
    node: false,
    python: false,
    javascript: false,
  },
  features: [],
  techStack: { frontend: [], backend: [], database: [], tools: [] },
  packageManager: "npm",
  screenshots: [],
  advancedSections: {
    toc: true,
    folderStructure: true,
    envVars: false,
    apiDocs: false,
    usageExamples: true,
    roadmap: true,
    contributing: true,
    license: true,
    author: true,
  },
  licenseType: "MIT",
  authorName: "Developer",
};

export const TEMPLATES: Record<string, ReadmeInput> = {
  react: {
    ...baseTemplate,
    projectName: "React Web App",
    shortDescription: "A blazing fast, responsive React web application.",
    detailedDescription:
      "This project provides a beautiful, responsive, and highly optimized UI for modern users. Built with Vite and React, it ensures instant HMR and tiny bundle sizes.",
    badges: { ...baseTemplate.badges, react: true, vite: true, typescript: true },
    features: [
      "⚡ Instant HMR with Vite",
      "🎨 Beautiful, responsive UI",
      "♿ Accessible components",
      "🌙 Built-in dark mode",
    ],
    techStack: {
      ...baseTemplate.techStack,
      frontend: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    },
    advancedSections: { ...baseTemplate.advancedSections, envVars: true },
  },
  fullstack: {
    ...baseTemplate,
    projectName: "Full Stack SaaS",
    shortDescription: "A complete full-stack SaaS application template.",
    detailedDescription:
      "This project contains a complete end-to-end stack for building a SaaS product, complete with authentication, a database, and a fully featured API.",
    badges: { ...baseTemplate.badges, next: true, node: true, typescript: true, build: true },
    features: [
      "🔐 Secure JWT Authentication",
      "🗄️ Fully typed ORM (Prisma)",
      "🚀 Server-Side Rendering with Next.js",
      "💳 Stripe payment integration",
    ],
    techStack: {
      frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
      backend: ["Node.js", "Express", "Prisma"],
      database: ["PostgreSQL", "Redis"],
      tools: ["Docker", "GitHub Actions", "Vercel"],
    },
    packageManager: "pnpm",
    advancedSections: { ...baseTemplate.advancedSections, apiDocs: true, envVars: true },
  },
  ai: {
    ...baseTemplate,
    projectName: "AI Assistant Engine",
    shortDescription: "An intelligent text and code generation engine.",
    detailedDescription:
      "A powerful backend wrapper around modern LLMs. It handles prompt engineering, context chunking, and streaming responses back to the client.",
    badges: { ...baseTemplate.badges, python: true, license: true },
    features: [
      "🤖 LLM integration (OpenAI, Anthropic, local)",
      "⚡ Streaming responses",
      "📝 Automatic context chunking and vector storage",
    ],
    techStack: {
      frontend: [],
      backend: ["FastAPI", "Python", "LangChain"],
      database: ["Pinecone", "PostgreSQL"],
      tools: ["Docker"],
    },
    advancedSections: { ...baseTemplate.advancedSections, envVars: true, apiDocs: true },
  },
  library: {
    ...baseTemplate,
    projectName: "Awesome JS Library",
    shortDescription: "A lightweight utility library for doing X.",
    detailedDescription:
      "Stop wasting time writing boilerplate. This zero-dependency library provides the ultimate set of functions for handling complex data structures efficiently.",
    badges: { ...baseTemplate.badges, typescript: true, version: true, build: true },
    features: [
      "📦 Zero dependencies",
      "💪 Strongly typed with TypeScript",
      "🚀 Tree-shakeable ESM builds",
      "🧪 100% test coverage",
    ],
    techStack: {
      frontend: ["TypeScript", "Vitest", "Rollup"],
      backend: [],
      database: [],
      tools: ["GitHub Actions"],
    },
    advancedSections: {
      ...baseTemplate.advancedSections,
      usageExamples: true,
      folderStructure: false,
    },
  },
};
