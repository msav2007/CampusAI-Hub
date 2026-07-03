export type ReadmeInput = {
  projectName: string;
  description: string;
  techStack: string;
  installation: string;
  usage: string;
  features: string;
  githubRepo: string;
  license: string;
};

export const DEFAULT_README_INPUT: ReadmeInput = {
  projectName: "Awesome Project",
  description: "A fantastic new tool to help developers build faster and smarter.",
  techStack: "React, TypeScript, Tailwind CSS, Vite",
  installation: "npm install\nnpm run dev",
  usage: "npm run start\n// Navigate to http://localhost:3000",
  features: "Fast performance\nResponsive design\nAccessible UI components",
  githubRepo: "https://github.com/username/awesome-project",
  license: "MIT",
};

export function generateReadme(input: ReadmeInput): string {
  const repoPath = input.githubRepo
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/\/$/, "");
  const projectNameDisplay = input.projectName || "Project Title";

  let markdown = `# ${projectNameDisplay}\n\n`;

  if (input.description) {
    markdown += `${input.description}\n\n`;
  }

  // Badges placeholder (just a static example if a repo is provided)
  if (repoPath) {
    markdown += `[![License: ${input.license || "MIT"}](https://img.shields.io/badge/License-${(input.license || "MIT").replace("-", "%20")}-blue.svg)](https://opensource.org/licenses/${input.license || "MIT"})\n`;
    markdown += `[![GitHub Issues](https://img.shields.io/github/issues/${repoPath})](https://github.com/${repoPath}/issues)\n`;
    markdown += `[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/${repoPath})](https://github.com/${repoPath}/pulls)\n\n`;
  }

  // Table of Contents
  markdown += `## Table of Contents\n\n`;
  if (input.features) markdown += `- [Features](#features)\n`;
  if (input.techStack) markdown += `- [Tech Stack](#tech-stack)\n`;
  if (input.installation) markdown += `- [Installation](#installation)\n`;
  if (input.usage) markdown += `- [Usage](#usage)\n`;
  markdown += `- [Folder Structure](#folder-structure)\n`;
  markdown += `- [Screenshots](#screenshots)\n`;
  markdown += `- [Contributing](#contributing)\n`;
  if (input.license) markdown += `- [License](#license)\n`;
  markdown += `\n`;

  if (input.features) {
    markdown += `## Features\n\n`;
    const featuresList = input.features.split("\n").filter((f) => f.trim() !== "");
    featuresList.forEach((f) => {
      markdown += `- ${f.startsWith("- ") ? f.slice(2) : f.trim()}\n`;
    });
    markdown += `\n`;
  }

  if (input.techStack) {
    markdown += `## Tech Stack\n\n`;
    const stackList = input.techStack.split(",").filter((s) => s.trim() !== "");
    stackList.forEach((s) => {
      markdown += `- **${s.trim()}**\n`;
    });
    markdown += `\n`;
  }

  if (input.installation) {
    markdown += `## Installation\n\n`;
    markdown += `\`\`\`bash\n`;
    markdown += `${input.installation}\n`;
    markdown += `\`\`\`\n\n`;
  }

  if (input.usage) {
    markdown += `## Usage\n\n`;
    markdown += `\`\`\`bash\n`;
    markdown += `${input.usage}\n`;
    markdown += `\`\`\`\n\n`;
  }

  markdown += `## Folder Structure\n\n`;
  markdown += `\`\`\`text\n`;
  markdown += `project-root/\n`;
  markdown += `├── src/\n`;
  markdown += `├── public/\n`;
  markdown += `├── README.md\n`;
  markdown += `└── package.json\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `## Screenshots\n\n`;
  markdown += `> Add your screenshots here.\n\n`;
  markdown += `![App Screenshot](https://via.placeholder.com/800x400?text=App+Screenshot)\n\n`;

  markdown += `## Contributing\n\n`;
  markdown += `Contributions are always welcome!\n\n`;
  markdown += `1. Fork the project\n`;
  markdown += `2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)\n`;
  markdown += `3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)\n`;
  markdown += `4. Push to the branch (\`git push origin feature/AmazingFeature\`)\n`;
  markdown += `5. Open a Pull Request\n\n`;

  if (input.license) {
    markdown += `## License\n\n`;
    markdown += `This project is licensed under the ${input.license} License - see the [LICENSE](LICENSE) file for details.\n`;
  }

  return markdown.trim();
}
