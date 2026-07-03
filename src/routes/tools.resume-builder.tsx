import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { buildPageHead } from "@/lib/seo";
import { readJsonFromStorage, writeJsonToStorage } from "@/lib/storage";

import { ResumeForm } from "@/components/resume/ResumeForm";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { createDefaultResume } from "@/lib/resume/default-data";
import type { ResumeData } from "@/lib/resume/types";

const STORAGE_KEY = "campusai:resumebuilder:v1";

export const Route = createFileRoute("/tools/resume-builder")({
  head: () => ({
    ...buildPageHead({
      title: "Free Resume Builder Online — ATS-Friendly & Professional | CampusAI Tools",
      description:
        "Create recruiter-ready, ATS-friendly resumes in minutes. Completely free, no sign-up required. Your data is stored locally on your device for privacy.",
      path: "/tools/resume-builder",
      keywords: "resume builder, free resume maker, ATS resume, local resume builder",
    }),
  }),
  component: ResumeBuilderPage,
});

function ResumeBuilderPage() {
  const [data, setData] = useState<ResumeData>(createDefaultResume);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = readJsonFromStorage<ResumeData>(STORAGE_KEY);
    if (stored && stored.personalInfo) {
      setData(stored);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJsonToStorage(STORAGE_KEY, data);
  }, [loaded, data]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style suppressHydrationWarning>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #resume-preview-container, #resume-preview-container * {
              visibility: visible;
            }
            #resume-preview-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              transform: none !important;
            }
            @page {
              size: auto;
              margin: 0mm;
            }
          }
        `}
      </style>
      <div className="print:hidden">
        <ToolShell
          eyebrow="Career"
          title={
            <>
              Resume <span className="text-gradient">Builder</span>
            </>
          }
          description="Build a professional, ATS-friendly resume locally. No sign-ups. Your data stays on your device."
          actions={
            <Button onClick={handlePrint} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          }
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="h-[80vh] overflow-y-auto rounded-2xl glass p-5 shadow-card">
              <ResumeForm data={data} onChange={setData} />
            </div>

            <div className="flex h-[80vh] items-start justify-center overflow-auto rounded-2xl glass p-5 shadow-card bg-surface-2/30">
              <div
                className="origin-top transition-transform sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.55] xl:scale-[0.7]"
                id="resume-preview-container"
              >
                <ResumePreview data={data} />
              </div>
            </div>
          </div>
        </ToolShell>
      </div>
    </>
  );
}
