import type { ResumeData } from "./types";

export const createDefaultResume = (): ResumeData => ({
  personalInfo: {
    fullName: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    portfolioUrl: "janedoe.dev",
    githubUrl: "github.com/janedoe",
    linkedinUrl: "linkedin.com/in/janedoe",
    summary:
      "Detail-oriented software engineer with a passion for building scalable web applications. Strong focus on modern frontend technologies and clean architecture.",
  },
  education: [
    {
      id: "edu1",
      institution: "State University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "Aug 2018",
      endDate: "May 2022",
      score: "3.8/4.0",
      details: [
        "Relevant Coursework: Data Structures, Algorithms, Web Development",
        "Dean's List 2020-2022",
      ],
    },
  ],
  experience: [
    {
      id: "exp1",
      company: "Tech Corp",
      role: "Frontend Developer Intern",
      location: "San Francisco, CA",
      startDate: "Jun 2021",
      endDate: "Aug 2021",
      details: [
        "Developed and maintained responsive React components for the main product dashboard.",
        "Improved page load speed by 15% through image optimization and code splitting.",
        "Collaborated with the design team to implement a new design system.",
      ],
    },
  ],
  projects: [
    {
      id: "proj1",
      name: "CampusAI Hub",
      description: "A suite of tools for students.",
      technologies: "React, TypeScript, Tailwind CSS",
      link: "github.com/janedoe/campusai-hub",
      details: [
        "Built a complete frontend application using React and Tailwind CSS.",
        "Implemented local storage for data persistence across sessions.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert1",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "Sep 2022",
    },
  ],
  skills: {
    languages: "JavaScript, TypeScript, Python, HTML, CSS",
    frameworks: "React, Next.js, Node.js, Express",
    tools: "Git, GitHub, VS Code, Figma",
    other: "Agile, RESTful APIs, Responsive Design",
  },
  settings: {
    theme: "classic",
    fontSize: "medium",
    spacing: "normal"
  }
});
