import { Plus, Trash2 } from "lucide-react";
import type { ResumeData, Education, Experience, Project, Certification } from "@/lib/resume/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ResumeForm({
  data,
  onChange,
}: {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}) {
  const updatePersonalInfo = (field: keyof ResumeData["personalInfo"], value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value },
    });
  };

  const updateSkills = (field: keyof ResumeData["skills"], value: string) => {
    onChange({
      ...data,
      skills: { ...data.skills, [field]: value },
    });
  };

  const updateSettings = (field: keyof ResumeData["settings"], value: string) => {
    onChange({
      ...data,
      settings: { ...data.settings, [field]: value },
    });
  };

  const addArrayItem = <K extends "education" | "experience" | "projects" | "certifications">(
    field: K,
    newItem: ResumeData[K][0],
  ) => {
    onChange({
      ...data,
      [field]: [...data[field], newItem],
    });
  };

  const updateArrayItem = <K extends "education" | "experience" | "projects" | "certifications">(
    field: K,
    index: number,
    updatedItem: ResumeData[K][0],
  ) => {
    const newArray = [...data[field]];
    newArray[index] = updatedItem;
    onChange({ ...data, [field]: newArray });
  };

  const removeArrayItem = <K extends "education" | "experience" | "projects" | "certifications">(
    field: K,
    index: number,
  ) => {
    const newArray = [...data[field]];
    newArray.splice(index, 1);
    onChange({ ...data, [field]: newArray });
  };

  const reorderArrayItem = <K extends "education" | "experience" | "projects" | "certifications">(
    field: K,
    index: number,
    direction: -1 | 1
  ) => {
    const newArray = [...data[field]];
    const target = index + direction;
    if (target < 0 || target >= newArray.length) return;
    [newArray[index], newArray[target]] = [newArray[target], newArray[index]];
    onChange({ ...data, [field]: newArray });
  };

  return (
    <div className="space-y-8 p-1">
      {/* Design Settings */}
      <section className="space-y-4 rounded-xl border border-border/50 bg-brand/5 p-4">
        <h2 className="text-xl font-semibold text-brand">Design Settings</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Theme</Label>
            <select
              value={data.settings?.theme || "classic"}
              onChange={(e) => updateSettings("theme", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="classic">Classic (Black/White)</option>
              <option value="modern">Modern (Blue/Slate)</option>
              <option value="professional">Professional (Slate)</option>
              <option value="minimal">Minimal (Light Gray)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Font Size</Label>
            <select
              value={data.settings?.fontSize || "medium"}
              onChange={(e) => updateSettings("fontSize", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="small">Small (More fit)</option>
              <option value="medium">Medium (Standard)</option>
              <option value="large">Large (More readable)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Spacing</Label>
            <select
              value={data.settings?.spacing || "normal"}
              onChange={(e) => updateSettings("spacing", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="compact">Compact (Dense)</option>
              <option value="normal">Normal</option>
              <option value="spacious">Spacious (Airy)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Personal Info */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Personal Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={data.personalInfo.fullName}
              onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.personalInfo.email}
              onChange={(e) => updatePersonalInfo("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={data.personalInfo.phone}
              onChange={(e) => updatePersonalInfo("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data.personalInfo.location}
              onChange={(e) => updatePersonalInfo("location", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolioUrl">Portfolio URL</Label>
            <Input
              id="portfolioUrl"
              value={data.personalInfo.portfolioUrl || ""}
              onChange={(e) => updatePersonalInfo("portfolioUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              value={data.personalInfo.githubUrl || ""}
              onChange={(e) => updatePersonalInfo("githubUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              value={data.personalInfo.linkedinUrl || ""}
              onChange={(e) => updatePersonalInfo("linkedinUrl", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            rows={3}
            value={data.personalInfo.summary}
            onChange={(e) => updatePersonalInfo("summary", e.target.value)}
          />
        </div>
      </section>

      {/* Experience */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Experience</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              addArrayItem("experience", {
                id: crypto.randomUUID(),
                company: "",
                role: "",
                location: "",
                startDate: "",
                endDate: "",
                details: [],
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        {data.experience.map((exp, index) => (
          <div
            key={exp.id}
            className="relative space-y-4 rounded-xl border border-border/50 bg-surface-2/30 p-4"
          >
            <div className="absolute right-2 top-2 flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand" onClick={() => reorderArrayItem("experience", index, -1)} disabled={index === 0}>
                ↑
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand" onClick={() => reorderArrayItem("experience", index, 1)} disabled={index === data.experience.length - 1}>
                ↓
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeArrayItem("experience", index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={exp.company}
                  onChange={(e) =>
                    updateArrayItem("experience", index, { ...exp, company: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={exp.role}
                  onChange={(e) =>
                    updateArrayItem("experience", index, { ...exp, role: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  value={exp.startDate}
                  onChange={(e) =>
                    updateArrayItem("experience", index, { ...exp, startDate: e.target.value })
                  }
                  placeholder="e.g. Jun 2021"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  value={exp.endDate}
                  onChange={(e) =>
                    updateArrayItem("experience", index, { ...exp, endDate: e.target.value })
                  }
                  placeholder="e.g. Present"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Location</Label>
                <Input
                  value={exp.location}
                  onChange={(e) =>
                    updateArrayItem("experience", index, { ...exp, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Details (one per line)</Label>
                <Textarea
                  rows={4}
                  value={exp.details.join("\n")}
                  onChange={(e) =>
                    updateArrayItem("experience", index, {
                      ...exp,
                      details: e.target.value.split("\n"),
                    })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Education</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              addArrayItem("education", {
                id: crypto.randomUUID(),
                institution: "",
                degree: "",
                field: "",
                startDate: "",
                endDate: "",
                score: "",
                details: [],
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        {data.education.map((edu, index) => (
          <div
            key={edu.id}
            className="relative space-y-4 rounded-xl border border-border/50 bg-surface-2/30 p-4"
          >
            <div className="absolute right-2 top-2 flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand" onClick={() => reorderArrayItem("education", index, -1)} disabled={index === 0}>
                ↑
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand" onClick={() => reorderArrayItem("education", index, 1)} disabled={index === data.education.length - 1}>
                ↓
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeArrayItem("education", index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) =>
                    updateArrayItem("education", index, { ...edu, institution: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) =>
                    updateArrayItem("education", index, { ...edu, degree: e.target.value })
                  }
                  placeholder="e.g. B.S."
                />
              </div>
              <div className="space-y-2">
                <Label>Field of Study</Label>
                <Input
                  value={edu.field}
                  onChange={(e) =>
                    updateArrayItem("education", index, { ...edu, field: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Score (GPA/Grade)</Label>
                <Input
                  value={edu.score}
                  onChange={(e) =>
                    updateArrayItem("education", index, { ...edu, score: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  value={edu.startDate}
                  onChange={(e) =>
                    updateArrayItem("education", index, { ...edu, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  value={edu.endDate}
                  onChange={(e) =>
                    updateArrayItem("education", index, { ...edu, endDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Details (one per line)</Label>
                <Textarea
                  rows={3}
                  value={edu.details.join("\n")}
                  onChange={(e) =>
                    updateArrayItem("education", index, {
                      ...edu,
                      details: e.target.value.split("\n"),
                    })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              addArrayItem("projects", {
                id: crypto.randomUUID(),
                name: "",
                description: "",
                technologies: "",
                link: "",
                details: [],
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        {data.projects.map((proj, index) => (
          <div
            key={proj.id}
            className="relative space-y-4 rounded-xl border border-border/50 bg-surface-2/30 p-4"
          >
            <div className="absolute right-2 top-2 flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand" onClick={() => reorderArrayItem("projects", index, -1)} disabled={index === 0}>
                ↑
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand" onClick={() => reorderArrayItem("projects", index, 1)} disabled={index === data.projects.length - 1}>
                ↓
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeArrayItem("projects", index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  value={proj.name}
                  onChange={(e) =>
                    updateArrayItem("projects", index, { ...proj, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Technologies</Label>
                <Input
                  value={proj.technologies}
                  onChange={(e) =>
                    updateArrayItem("projects", index, { ...proj, technologies: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Link</Label>
                <Input
                  value={proj.link || ""}
                  onChange={(e) =>
                    updateArrayItem("projects", index, { ...proj, link: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Short Description</Label>
                <Input
                  value={proj.description}
                  onChange={(e) =>
                    updateArrayItem("projects", index, { ...proj, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Details (one per line)</Label>
                <Textarea
                  rows={3}
                  value={proj.details.join("\n")}
                  onChange={(e) =>
                    updateArrayItem("projects", index, {
                      ...proj,
                      details: e.target.value.split("\n"),
                    })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Skills</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="skillsLanguages">Languages</Label>
            <Input
              id="skillsLanguages"
              value={data.skills.languages}
              onChange={(e) => updateSkills("languages", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skillsFrameworks">Frameworks</Label>
            <Input
              id="skillsFrameworks"
              value={data.skills.frameworks}
              onChange={(e) => updateSkills("frameworks", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skillsTools">Tools</Label>
            <Input
              id="skillsTools"
              value={data.skills.tools}
              onChange={(e) => updateSkills("tools", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skillsOther">Other</Label>
            <Input
              id="skillsOther"
              value={data.skills.other}
              onChange={(e) => updateSkills("other", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Certifications</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              addArrayItem("certifications", {
                id: crypto.randomUUID(),
                name: "",
                issuer: "",
                date: "",
                link: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        {data.certifications.map((cert, index) => (
          <div
            key={cert.id}
            className="relative space-y-4 rounded-xl border border-border/50 bg-surface-2/30 p-4"
          >
            <div className="absolute right-2 top-2 flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand" onClick={() => reorderArrayItem("certifications", index, -1)} disabled={index === 0}>
                ↑
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand" onClick={() => reorderArrayItem("certifications", index, 1)} disabled={index === data.certifications.length - 1}>
                ↓
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeArrayItem("certifications", index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={cert.name}
                  onChange={(e) =>
                    updateArrayItem("certifications", index, { ...cert, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Issuer</Label>
                <Input
                  value={cert.issuer}
                  onChange={(e) =>
                    updateArrayItem("certifications", index, { ...cert, issuer: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  value={cert.date}
                  onChange={(e) =>
                    updateArrayItem("certifications", index, { ...cert, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Link</Label>
                <Input
                  value={cert.link || ""}
                  onChange={(e) =>
                    updateArrayItem("certifications", index, { ...cert, link: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
