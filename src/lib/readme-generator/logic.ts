export type TechCategory = "frontend" | "backend" | "database" | "tools";

export type ReadmeInput = {
  projectName: string;
  shortDescription: string;
  detailedDescription: string;
  logoUrl: string;
  demoUrl: string;
  githubRepo: string;

  badges: Record<string, boolean>;

  features: string[];

  techStack: Record<TechCategory, string[]>;

  packageManager: "npm" | "yarn" | "pnpm" | "bun";

  screenshots: string[];

  advancedSections: {
    toc: boolean;
    folderStructure: boolean;
    envVars: boolean;
    apiDocs: boolean;
    usageExamples: boolean;
    roadmap: boolean;
    contributing: boolean;
    license: boolean;
    author: boolean;
  };

  licenseType: string;
  authorName: string;
};

export const DEFAULT_README_INPUT: ReadmeInput = {
  projectName: "Awesome Project",
  shortDescription: "A fantastic new tool to help developers build faster and smarter.",
  detailedDescription:
    "This project solves the complex problem of X by utilizing Y. It provides a seamless developer experience with built-in tools for Z, ensuring that your workflow is uninterrupted and highly productive.",
  logoUrl: "",
  demoUrl: "https://awesome-project.demo.com",
  githubRepo: "https://github.com/username/awesome-project",

  badges: {
    react: true,
    typescript: true,
    license: true,
    version: false,
    build: false,
    next: false,
    vite: false,
    node: false,
    python: false,
  },

  features: [
    "⚡ Fast performance and minimal bundle size",
    "🎨 Responsive design with modern UI principles",
    "♿ Accessible components following WAI-ARIA standards",
    "🌙 Built-in dark mode support",
  ],

  techStack: {
    frontend: ["React", "TypeScript", "Tailwind CSS"],
    backend: ["Node.js", "Express"],
    database: ["PostgreSQL", "Prisma"],
    tools: ["Docker", "GitHub Actions"],
  },

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
  authorName: "Jane Doe",
};

export const BADGE_URLS: Record<string, { label: string; url: string }> = {
  react: {
    label: "React",
    url: "https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB",
  },
  typescript: {
    label: "TypeScript",
    url: "https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white",
  },
  javascript: {
    label: "JavaScript",
    url: "https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E",
  },
  python: {
    label: "Python",
    url: "https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54",
  },
  node: {
    label: "Node.js",
    url: "https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white",
  },
  next: {
    label: "Next.js",
    url: "https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white",
  },
  vite: {
    label: "Vite",
    url: "https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white",
  },
};

export function generateReadme(input: ReadmeInput): string {
  const repoPath = input.githubRepo
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/\/$/, "");

  let markdown = "";

  // HEADER
  markdown += `<div align="center">\n`;
  if (input.logoUrl) {
    markdown += `  <img src="${input.logoUrl}" alt="Logo" width="80" height="80">\n`;
  }
  markdown += `  <h3 align="center">${input.projectName || "Project Title"}</h3>\n`;
  markdown += `  <p align="center">\n`;
  markdown += `    ${input.shortDescription || "A short description of the project"}\n`;
  if (input.demoUrl || input.githubRepo) {
    markdown += `    <br />\n`;
    if (input.demoUrl)
      markdown += `    <a href="${input.demoUrl}"><strong>View Demo »</strong></a>\n`;
    if (input.demoUrl && input.githubRepo) markdown += `    <br />\n    <br />\n`;
    if (input.githubRepo) {
      markdown += `    <a href="${input.githubRepo}/issues/new?labels=bug">Report Bug</a>\n`;
      markdown += `    ·\n`;
      markdown += `    <a href="${input.githubRepo}/issues/new?labels=enhancement">Request Feature</a>\n`;
    }
  }
  markdown += `  </p>\n`;

  // BADGES
  let badgeString = "";
  Object.keys(input.badges).forEach((key) => {
    if (input.badges[key]) {
      if (BADGE_URLS[key]) {
        badgeString += `![${BADGE_URLS[key].label}](${BADGE_URLS[key].url}) `;
      }
    }
  });
  if (input.badges.license && input.licenseType) {
    badgeString += `[![License: ${input.licenseType}](https://img.shields.io/badge/License-${input.licenseType.replace("-", "%20")}-blue.svg?style=for-the-badge)](https://opensource.org/licenses/${input.licenseType}) `;
  }
  if (repoPath) {
    if (input.badges.version) {
      badgeString += `[![GitHub release](https://img.shields.io/github/v/release/${repoPath}?style=for-the-badge)](${input.githubRepo}/releases) `;
    }
    if (input.badges.build) {
      badgeString += `[![Build Status](https://img.shields.io/github/actions/workflow/status/${repoPath}/main.yml?style=for-the-badge)](${input.githubRepo}/actions) `;
    }
  }
  if (badgeString) {
    markdown += `  <p align="center">\n    ${badgeString}\n  </p>\n`;
  }
  markdown += `</div>\n\n`;

  // DETAILED DESCRIPTION
  if (input.detailedDescription) {
    markdown += `## About The Project\n\n${input.detailedDescription}\n\n`;
  }

  // SCREENSHOTS
  if (input.screenshots.length > 0) {
    markdown += `### Screenshots\n\n`;
    input.screenshots.forEach((url) => {
      markdown += `<img src="${url}" alt="Screenshot" width="100%">\n\n`;
    });
  }

  // TOC
  if (input.advancedSections.toc) {
    markdown += `## Table of Contents\n\n`;
    if (input.techStack) markdown += `- [Tech Stack](#tech-stack)\n`;
    if (input.features.length) markdown += `- [Features](#features)\n`;
    markdown += `- [Getting Started](#getting-started)\n`;
    if (input.advancedSections.usageExamples) markdown += `- [Usage](#usage)\n`;
    if (input.advancedSections.roadmap) markdown += `- [Roadmap](#roadmap)\n`;
    if (input.advancedSections.contributing) markdown += `- [Contributing](#contributing)\n`;
    if (input.advancedSections.license) markdown += `- [License](#license)\n`;
    if (input.advancedSections.author) markdown += `- [Contact](#contact)\n`;
    markdown += `\n`;
  }

  // TECH STACK
  if (Object.values(input.techStack).some((cat) => cat.length > 0)) {
    markdown += `## Tech Stack\n\n`;
    if (input.techStack.frontend.length)
      markdown += `**Client:** ${input.techStack.frontend.join(", ")}\n\n`;
    if (input.techStack.backend.length)
      markdown += `**Server:** ${input.techStack.backend.join(", ")}\n\n`;
    if (input.techStack.database.length)
      markdown += `**Database:** ${input.techStack.database.join(", ")}\n\n`;
    if (input.techStack.tools.length)
      markdown += `**Tools:** ${input.techStack.tools.join(", ")}\n\n`;
  }

  // FEATURES
  if (input.features.length > 0) {
    markdown += `## Features\n\n`;
    input.features.forEach((f) => {
      markdown += `- ${f}\n`;
    });
    markdown += `\n`;
  }

  // GETTING STARTED
  markdown += `## Getting Started\n\n`;
  markdown += `To get a local copy up and running follow these simple steps.\n\n`;

  if (input.advancedSections.envVars) {
    markdown += `### Prerequisites\n\n`;
    markdown += `This project requires certain environment variables. Create a \`.env\` file in the root directory.\n`;
    markdown += `\`\`\`env\nAPI_KEY=your_api_key_here\n\`\`\`\n\n`;
  }

  markdown += `### Installation\n\n`;
  markdown += `1. Clone the repo\n`;
  markdown += `   \`\`\`sh\n   git clone ${input.githubRepo || "https://github.com/username/project.git"}\n   \`\`\`\n`;
  markdown += `2. Install NPM packages\n`;
  markdown += `   \`\`\`sh\n   ${input.packageManager} install\n   \`\`\`\n`;
  markdown += `3. Run development server\n`;
  markdown += `   \`\`\`sh\n   ${input.packageManager} run dev\n   \`\`\`\n\n`;

  if (input.advancedSections.folderStructure) {
    markdown += `## Folder Structure\n\n`;
    markdown += `\`\`\`text\n`;
    markdown += `project-root/\n`;
    markdown += `├── src/\n`;
    markdown += `├── public/\n`;
    markdown += `├── README.md\n`;
    markdown += `└── package.json\n`;
    markdown += `\`\`\`\n\n`;
  }

  if (input.advancedSections.usageExamples) {
    markdown += `## Usage\n\n`;
    markdown += `Provide useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space.\n\n`;
  }

  if (input.advancedSections.apiDocs) {
    markdown += `## API Documentation\n\n`;
    markdown += `| Method | Endpoint | Description |\n`;
    markdown += `|---|---|---|\n`;
    markdown += `| GET | /api/users | Fetch all users |\n\n`;
  }

  if (input.advancedSections.roadmap) {
    markdown += `## Roadmap\n\n`;
    markdown += `- [ ] Feature 1\n`;
    markdown += `- [ ] Feature 2\n`;
    markdown += `- [ ] Feature 3\n\n`;
  }

  if (input.advancedSections.contributing) {
    markdown += `## Contributing\n\n`;
    markdown += `Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.\n\n`;
    markdown += `1. Fork the Project\n`;
    markdown += `2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)\n`;
    markdown += `3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)\n`;
    markdown += `4. Push to the Branch (\`git push origin feature/AmazingFeature\`)\n`;
    markdown += `5. Open a Pull Request\n\n`;
  }

  if (input.advancedSections.license) {
    markdown += `## License\n\n`;
    markdown += `Distributed under the ${input.licenseType} License. See \`LICENSE\` for more information.\n\n`;
  }

  if (input.advancedSections.author) {
    markdown += `## Contact\n\n`;
    markdown += `${input.authorName} - [@twitter_handle](https://twitter.com/twitter_handle) - email@example.com\n\n`;
    if (input.githubRepo) {
      markdown += `Project Link: [${input.githubRepo}](${input.githubRepo})\n\n`;
    }
  }

  return markdown.trim();
}
