export type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  summary: string;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  score: string;
  details: string[];
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string[];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link?: string;
  details: string[];
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
};

export type Skills = {
  languages: string;
  frameworks: string;
  tools: string;
  other: string;
};

export type ResumeData = {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  skills: Skills;
};
