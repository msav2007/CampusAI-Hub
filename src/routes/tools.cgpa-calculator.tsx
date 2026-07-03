import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdSlot, FaqSection, HowToSection, ShareButton } from "@/components/site/ToolExtras";
import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateCgpaStats, gradeOptions } from "@/lib/calculators/cgpa";
import { buildPageHead, jsonLdScript } from "@/lib/seo";
import { readJsonFromStorage, removeStorageItem, writeJsonToStorage } from "@/lib/storage";
import { faqJsonLd, howToJsonLd, type FaqItem, type HowToStep } from "@/lib/structured-data";

const FAQ: FaqItem[] = [
  {
    q: "How is CGPA calculated?",
    a: "CGPA is the credit-weighted average of grade points across all semesters. We multiply credits by grade points, add everything up, and divide by total credits.",
  },
  {
    q: "What grading scale does this calculator use?",
    a: "Standard university grading: S=10, A=9, B=8, C=7, D=6, E=5, F=0. P (Pass) courses count towards total credits but do not affect your GPA.",
  },
  {
    q: "Does it work for a 4.0 GPA scale?",
    a: "The same weighted-average logic applies, but this page is optimized for 10-point grading. Convert your grades first if you need an exact 4.0 GPA.",
  },
  {
    q: "Is my data saved anywhere?",
    a: "No. Your latest calculation is stored only in local storage on this device, and nothing is uploaded to our servers.",
  },
  {
    q: "Can I add unlimited semesters and subjects?",
    a: "Yes. Add as many semesters and subjects as you need and the GPA and CGPA update in real time.",
  },
];

const STEPS: HowToStep[] = [
  { title: "Add a semester", body: "Click Add semester and rename it if needed." },
  { title: "Enter subjects", body: "List each subject with its credit value." },
  { title: "Select grades", body: "Choose the grade points you earned." },
  { title: "Read the totals", body: "See semester GPAs and the cumulative CGPA instantly." },
];

type Subject = {
  id: string;
  name: string;
  credits: number;
  grade: string;
  points?: number; // legacy
};

type Semester = {
  id: string;
  name: string;
  subjects: Subject[];
};

const STORAGE_KEY = "campusai:cgpa:v1";

const uid = () => Math.random().toString(36).slice(2, 9);

function createSubject(index: number, credits = 3, grade = "B"): Subject {
  return {
    id: uid(),
    name: `Subject ${index}`,
    credits,
    grade,
  };
}

function createSemester(index: number): Semester {
  return {
    id: uid(),
    name: `Semester ${index}`,
    subjects: [createSubject(1, 4, "A"), createSubject(2, 3, "B")],
  };
}

function createDefaultSemesters() {
  return [createSemester(1)];
}

export const Route = createFileRoute("/tools/cgpa-calculator")({
  head: () => ({
    ...buildPageHead({
      title: "Free CGPA Calculator Online — GPA & CGPA in Seconds | CampusAI Tools",
      description:
        "Free online CGPA calculator for college students. Add semesters, credits, and grades to get accurate semester GPA and cumulative CGPA on a 10-point scale.",
      path: "/tools/cgpa-calculator",
      keywords:
        "cgpa calculator, gpa calculator, sgpa to cgpa, college cgpa calculator, 10 point cgpa calculator",
      scripts: [
        jsonLdScript(faqJsonLd(FAQ)),
        jsonLdScript(howToJsonLd("How to calculate CGPA", STEPS)),
      ],
    }),
  }),
  component: CgpaPage,
});

function CgpaPage() {
  const [semesters, setSemesters] = useState<Semester[]>(createDefaultSemesters);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedValue = readJsonFromStorage<Semester[]>(STORAGE_KEY);
    if (storedValue && Array.isArray(storedValue) && storedValue.length > 0) {
      setSemesters(storedValue);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJsonToStorage(STORAGE_KEY, semesters);
  }, [loaded, semesters]);

  const stats = useMemo(() => calculateCgpaStats(semesters), [semesters]);

  const addSemester = () => {
    setSemesters((current) => [
      ...current,
      {
        id: uid(),
        name: `Semester ${current.length + 1}`,
        subjects: [createSubject(1)],
      },
    ]);
  };

  const removeSemester = (semesterId: string) => {
    setSemesters((current) => current.filter((semester) => semester.id !== semesterId));
  };

  const addSubject = (semesterId: string) => {
    setSemesters((current) =>
      current.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              subjects: [...semester.subjects, createSubject(semester.subjects.length + 1)],
            }
          : semester,
      ),
    );
  };

  const updateSubject = (semesterId: string, subjectId: string, patch: Partial<Subject>) => {
    setSemesters((current) =>
      current.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              subjects: semester.subjects.map((subject) =>
                subject.id === subjectId ? { ...subject, ...patch } : subject,
              ),
            }
          : semester,
      ),
    );
  };

  const removeSubject = (semesterId: string, subjectId: string) => {
    setSemesters((current) =>
      current.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              subjects: semester.subjects.filter((subject) => subject.id !== subjectId),
            }
          : semester,
      ),
    );
  };

  const reset = () => {
    setSemesters(createDefaultSemesters());
    removeStorageItem(STORAGE_KEY);
  };

  return (
    <ToolShell
      eyebrow="Academic"
      title={
        <>
          CGPA <span className="text-gradient">Calculator</span>
        </>
      }
      description="Add semesters and subjects with credits and grades. We compute your GPA per semester and cumulative CGPA in real time, and your data stays on this device."
      actions={
        <ShareButton
          title="Free CGPA Calculator — CampusAI Tools"
          text="Calculate your semester GPA and cumulative CGPA in seconds."
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Cumulative CGPA" value={stats.cgpa.toFixed(2)} accent />
        <SummaryCard label="Total credits" value={String(stats.totalCredits)} />
        <SummaryCard label="Semesters" value={String(semesters.length)} />
      </div>

      <div className="mt-8 space-y-6">
        {semesters.map((semester, index) => {
          const gpa = stats.perSemester[index]?.gpa ?? 0;

          return (
            <div key={semester.id} className="rounded-2xl glass p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg border border-border/80 bg-surface-2">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <input
                    value={semester.name}
                    aria-label="Semester name"
                    onChange={(event) =>
                      setSemesters((current) =>
                        current.map((item) =>
                          item.id === semester.id ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                    className="border-none bg-transparent text-base font-semibold tracking-tight outline-none focus:ring-0"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      GPA
                    </div>
                    <div className="text-lg font-semibold tabular-nums">{gpa.toFixed(2)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove semester"
                    onClick={() => removeSemester(semester.id)}
                    disabled={semesters.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 hidden grid-cols-12 gap-2 px-1 text-[11px] uppercase tracking-wider text-muted-foreground sm:grid">
                <div className="col-span-6">Subject</div>
                <div className="col-span-2">Credits</div>
                <div className="col-span-3">Grade</div>
                <div className="col-span-1" />
              </div>

              <div className="mt-2 space-y-2">
                {semester.subjects.map((subject) => (
                  <div key={subject.id} className="grid grid-cols-12 gap-2">
                    <Input
                      aria-label="Subject name"
                      className="col-span-12 sm:col-span-6"
                      value={subject.name}
                      onChange={(event) =>
                        updateSubject(semester.id, subject.id, { name: event.target.value })
                      }
                      placeholder="Subject name"
                    />
                    <Input
                      aria-label="Credits"
                      className="col-span-6 tabular-nums sm:col-span-2"
                      type="number"
                      min={0}
                      max={20}
                      value={subject.credits}
                      onChange={(event) =>
                        updateSubject(semester.id, subject.id, {
                          credits: Math.max(0, Number(event.target.value) || 0),
                        })
                      }
                    />
                    <select
                      aria-label="Grade"
                      className="col-span-5 h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:col-span-3"
                      value={
                        subject.grade ??
                        (subject.points === 10
                          ? "S"
                          : subject.points === 9
                            ? "A"
                            : subject.points === 8
                              ? "B"
                              : subject.points === 7
                                ? "C"
                                : subject.points === 6
                                  ? "D"
                                  : subject.points === 5
                                    ? "E"
                                    : subject.points === 4
                                      ? "P"
                                      : subject.points === 0
                                        ? "F"
                                        : "B")
                      }
                      onChange={(event) =>
                        updateSubject(semester.id, subject.id, {
                          grade: event.target.value,
                          points: undefined,
                        })
                      }
                    >
                      {gradeOptions.map((gradeDef) => (
                        <option key={gradeDef.label} value={gradeDef.grade}>
                          {gradeDef.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove subject"
                      className="col-span-1 justify-self-end"
                      onClick={() => removeSubject(semester.id, subject.id)}
                      disabled={semester.subjects.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => addSubject(semester.id)}>
                  <Plus className="h-4 w-4" />
                  Add subject
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button onClick={addSemester}>
          <Plus className="h-4 w-4" />
          Add semester
        </Button>
        <Button variant="ghost" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <HowToSection title="How to calculate your CGPA" steps={STEPS} />
      <AdSlot label="Partner spotlight" />
      <FaqSection items={FAQ} />
    </ToolShell>
  );
}

function SummaryCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl glass p-5 shadow-card ${accent ? "ring-1 ring-brand/30" : ""}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div
        className={`mt-1 text-3xl font-bold tracking-tight tabular-nums ${
          accent ? "text-gradient" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
