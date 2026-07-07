import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Download, LayoutTemplate, Briefcase, GraduationCap } from "lucide-react";

import { toast } from "sonner";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { buildPageHead } from "@/lib/seo";
import { readJsonFromStorage, writeJsonToStorage } from "@/lib/storage";

import { ResumeForm } from "@/components/resume/ResumeForm";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { createDefaultResume } from "@/lib/resume/default-data";
import type { ResumeData } from "@/lib/resume/types";

const STORAGE_KEY = "campusai:resumebuilder:v2";

export const Route = createFileRoute("/tools/resume-builder")({
  head: () => ({
    ...buildPageHead({
      title: "Free Resume Builder Online — ATS-Friendly & Professional | CampusAI Tools",
      description:
        "Create recruiter-ready, ATS-friendly resumes in minutes. Completely free, local, with custom themes.",
      path: "/tools/resume-builder",
      keywords: "resume builder, free resume maker, ATS resume, local resume builder",
    }),
  }),
  component: ResumeBuilderPage,
});

function ResumeBuilderPage() {
  const [data, setData] = useState<ResumeData>(createDefaultResume);
  const [loaded, setLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = readJsonFromStorage<ResumeData>(STORAGE_KEY);
    if (stored && stored.personalInfo && stored.settings) {
      setData(stored);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJsonToStorage(STORAGE_KEY, data);
  }, [loaded, data]);

  const handlePrint = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    toast.loading("Generating PDF...", { id: "pdf-export" });

    try {
      const element = previewRef.current;
      const opt = {
        margin: 0,
        filename: `${data.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set(opt).from(element).save();
      toast.success("PDF Downloaded successfully!", { id: "pdf-export" });
    } catch (err) {
      toast.error("Failed to generate PDF.", { id: "pdf-export" });
    } finally {
      setIsExporting(false);
    }
  };

  const loadTemplate = (type: "fresher" | "intern" | "pro") => {
    const newData = createDefaultResume();

    if (type === "fresher") {
      newData.personalInfo.summary =
        "Highly motivated recent Computer Science graduate with strong foundation in software engineering and algorithms. Passionate about learning new technologies and building efficient applications.";
      newData.experience = [];
      newData.projects = [
        {
          id: "p1",
          name: "E-Commerce API",
          description: "REST API built with Node.js",
          technologies: "Node.js, Express, MongoDB",
          link: "github.com/user/api",
          details: ["Built authentication and product endpoints", "Integrated Stripe for payments"],
        },
        {
          id: "p2",
          name: "Task Tracker",
          description: "React frontend for task management",
          technologies: "React, Tailwind",
          link: "github.com/user/task",
          details: ["Implemented drag-and-drop", "Used local storage for data persistence"],
        },
      ];
      newData.settings.theme = "classic";
    } else if (type === "intern") {
      newData.personalInfo.summary =
        "Enthusiastic Junior Developer seeking an internship to apply academic knowledge to real-world problems. Quick learner with experience in modern web frameworks.";
      newData.experience = [
        {
          id: "e1",
          company: "University Tech Club",
          role: "Web Lead",
          location: "Campus",
          startDate: "Jan 2022",
          endDate: "Present",
          details: [
            "Maintained club website using React",
            "Organized coding workshops for 50+ students",
          ],
        },
      ];
      newData.settings.theme = "minimal";
      newData.settings.spacing = "spacious";
    } else if (type === "pro") {
      newData.personalInfo.summary =
        "Senior Software Engineer with 5+ years of experience designing scalable web architectures and leading cross-functional teams. Proven track record of delivering high-impact products.";
      newData.experience = [
        {
          id: "e1",
          company: "Tech Solutions Inc",
          role: "Senior Developer",
          location: "New York, NY",
          startDate: "Jan 2020",
          endDate: "Present",
          details: [
            "Led migration from monolith to microservices",
            "Mentored 3 junior developers",
            "Reduced latency by 40%",
          ],
        },
        {
          id: "e2",
          company: "Startup Co",
          role: "Full Stack Engineer",
          location: "Remote",
          startDate: "Jun 2018",
          endDate: "Dec 2019",
          details: ["Built MVP from scratch using Next.js", "Implemented CI/CD pipelines"],
        },
      ];
      newData.education = [
        {
          id: "edu1",
          institution: "Tech University",
          degree: "M.S.",
          field: "Computer Science",
          startDate: "2016",
          endDate: "2018",
          score: "3.9",
          details: [],
        },
      ];
      newData.settings.theme = "professional";
    }

    setData(newData);
    toast.success(`${type} template loaded!`);
  };

  return (
    <ToolShell
      eyebrow="Career"
      title={
        <>
          Resume <span className="text-gradient">Builder</span>
        </>
      }
      description="Build a professional, ATS-friendly resume locally. No sign-ups. Your data stays on your device."
      actions={
        <Button onClick={handlePrint} className="gap-2" disabled={isExporting}>
          <Download className="h-4 w-4" />
          {isExporting ? "Generating..." : "Download PDF"}
        </Button>
      }
    >
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadTemplate("fresher")}
          className="shrink-0 gap-2"
        >
          <GraduationCap className="h-4 w-4" /> Fresher Template
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadTemplate("intern")}
          className="shrink-0 gap-2"
        >
          <LayoutTemplate className="h-4 w-4" /> Internship Template
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadTemplate("pro")}
          className="shrink-0 gap-2"
        >
          <Briefcase className="h-4 w-4" /> Professional Template
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-[75vh] overflow-y-auto rounded-2xl glass p-5 shadow-card custom-scrollbar">
          {loaded && <ResumeForm data={data} onChange={setData} />}
        </div>

        <div className="flex h-[75vh] items-start justify-center overflow-auto rounded-2xl glass p-5 shadow-card bg-surface-2/30 custom-scrollbar">
          <div className="origin-top transition-transform sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.5] xl:scale-[0.65]">
            <div ref={previewRef} className="bg-white">
              {loaded && <ResumePreview data={data} />}
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
