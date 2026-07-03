import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CalendarCheck, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";

import { AdSlot, FaqSection, HowToSection, ShareButton } from "@/components/site/ToolExtras";
import { ToolShell } from "@/components/site/ToolShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateAttendanceResult } from "@/lib/calculators/attendance";
import { buildPageHead, jsonLdScript } from "@/lib/seo";
import { faqJsonLd, howToJsonLd, type FaqItem, type HowToStep } from "@/lib/structured-data";

const FAQ: FaqItem[] = [
  {
    q: "What is the 75% attendance rule?",
    a: "Most Indian colleges require at least 75% attendance to sit for end-semester exams. Some universities use 80% or 85%, so always verify your handbook.",
  },
  {
    q: "How many classes can I skip?",
    a: "Enter your total classes, attended classes, and target percentage. We calculate the maximum safe skips without dropping below your target.",
  },
  {
    q: "How do I recover from low attendance?",
    a: "The calculator shows how many classes you must attend in a row to climb back above your target.",
  },
  {
    q: "Does this include medical or duty leave?",
    a: "Enter attendance exactly the way your college records it. If approved leave counts as attended at your college, include it in the attended total.",
  },
  {
    q: "Is my data stored?",
    a: "No. The calculation runs locally in your browser and nothing is uploaded to our servers.",
  },
];

const STEPS: HowToStep[] = [
  { title: "Enter total classes", body: "Type the number of classes held so far." },
  { title: "Enter attended classes", body: "Type how many of those you actually attended." },
  { title: "Set your target", body: "Use your college rule, usually 75%." },
  {
    title: "Read the plan",
    body: "See your current percentage, safe skips, and recovery requirement.",
  },
];

export const Route = createFileRoute("/tools/attendance-calculator")({
  head: () => ({
    ...buildPageHead({
      title: "Attendance Calculator for College Students — 75% Rule | CampusAI Tools",
      description:
        "Free attendance calculator: see your current percentage, how many classes you need to recover, and how many you can safely skip while staying above your target.",
      path: "/tools/attendance-calculator",
      keywords:
        "attendance calculator, bunk calculator, 75 percent attendance, class attendance tracker, attendance percentage",
      scripts: [
        jsonLdScript(faqJsonLd(FAQ)),
        jsonLdScript(howToJsonLd("How to use the attendance calculator", STEPS)),
      ],
    }),
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const [total, setTotal] = useState("60");
  const [attended, setAttended] = useState("48");
  const [target, setTarget] = useState("75");

  const result = useMemo(
    () =>
      calculateAttendanceResult({
        total: Number(total),
        attended: Number(attended),
        target: Number(target),
      }),
    [attended, target, total],
  );

  return (
    <ToolShell
      eyebrow="Academic"
      title={
        <>
          Attendance <span className="text-gradient">Calculator</span>
        </>
      }
      description="Enter your total classes, how many you’ve attended, and your target percentage. We do the math instantly."
      actions={
        <ShareButton
          title="Attendance Calculator — CampusAI Tools"
          text="Know exactly how many classes you can skip without dropping below your target."
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl glass p-5 shadow-card lg:col-span-2">
          <div className="space-y-4">
            <Field id="total" label="Total classes held" value={total} onChange={setTotal} />
            <Field id="attended" label="Classes attended" value={attended} onChange={setAttended} />
            <Field
              id="target"
              label="Target attendance %"
              value={target}
              onChange={setTarget}
              suffix="%"
            />
          </div>
        </div>

        <div className="rounded-2xl glass p-5 shadow-card lg:col-span-3">
          {result.state === "error" ? (
            <div className="flex items-start gap-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="font-medium">Fix the inputs</div>
                <div className="text-destructive/80">{result.error}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Current attendance
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight tabular-nums text-gradient">
                    {result.current.toFixed(2)}%
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      result.meets ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {result.meets ? "On track" : "Below target"}
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2 transition-[width] duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, result.current))}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <StatCard
                  icon={<CalendarCheck className="h-4 w-4" />}
                  label="Classes needed to hit target"
                  value={result.meets ? "0" : String(result.needed)}
                  hint={
                    result.meets
                      ? "You are already above your target."
                      : `Attend the next ${result.needed} classes in a row.`
                  }
                />
                <StatCard
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="Classes you can safely skip"
                  value={result.meets ? String(result.canSkip) : "0"}
                  hint={result.meets ? "Without dropping below your target." : "Attend more first."}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <HowToSection title="How to use the attendance calculator" steps={STEPS} />
      <AdSlot label="Partner spotlight" />
      <FaqSection items={FAQ} />
    </ToolShell>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          inputMode="numeric"
          type="number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-2/40 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
