import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Target,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildPageHead } from "@/lib/seo";
import { readJsonFromStorage, writeJsonToStorage } from "@/lib/storage";
import { calculatePrediction, getGradeFromPercentage } from "@/lib/grades/calculator";
import type { GradeComponent, GradeScale } from "@/lib/grades/types";

const STORAGE_KEY = "campusai:gradepredictor:v1";

type HistoryState = {
  components: GradeComponent[];
  finalExamWeight: number;
  finalExamMaxScore: number;
  simulatedFinalScore: number;
};

const defaultComponents: GradeComponent[] = [
  { id: "1", name: "Midterm", weight: 30, score: 24, maxScore: 30 },
  { id: "2", name: "Assignments", weight: 20, score: 18, maxScore: 20 },
];

export const Route = createFileRoute("/tools/grade-predictor")({
  head: () => ({
    ...buildPageHead({
      title: "Grade Predictor — CampusAI Tools",
      description:
        "Calculate your current standing and predict what you need on the final exam to reach your target grade.",
      path: "/tools/grade-predictor",
      keywords: "grade predictor, grade calculator, final exam calculator, target grade",
    }),
  }),
  component: GradePredictorPage,
});

function GradePredictorPage() {
  const [components, setComponents] = useState<GradeComponent[]>(defaultComponents);
  const [finalExamWeight, setFinalExamWeight] = useState<number>(50);
  const [finalExamMaxScore, setFinalExamMaxScore] = useState<number>(100);
  const [simulatedFinalScore, setSimulatedFinalScore] = useState<number>(80);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = readJsonFromStorage<HistoryState>(STORAGE_KEY);
    if (stored) {
      if (stored.components) setComponents(stored.components);
      if (stored.finalExamWeight !== undefined) setFinalExamWeight(stored.finalExamWeight);
      if (stored.finalExamMaxScore !== undefined) setFinalExamMaxScore(stored.finalExamMaxScore);
      if (stored.simulatedFinalScore !== undefined)
        setSimulatedFinalScore(stored.simulatedFinalScore);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJsonToStorage(STORAGE_KEY, {
      components,
      finalExamWeight,
      finalExamMaxScore,
      simulatedFinalScore,
    });
  }, [loaded, components, finalExamWeight, finalExamMaxScore, simulatedFinalScore]);

  const addComponent = () => {
    setComponents([
      ...components,
      { id: crypto.randomUUID(), name: "New Component", weight: 10, score: 0, maxScore: 10 },
    ]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
  };

  const updateComponent = (id: string, field: keyof GradeComponent, value: string | number) => {
    setComponents(
      components.map((c) => {
        if (c.id === id) {
          const numValue = field === "name" ? value : Number(value) || 0;
          return { ...c, [field]: numValue };
        }
        return c;
      }),
    );
  };

  const handleReset = () => {
    setComponents(defaultComponents);
    setFinalExamWeight(50);
    setFinalExamMaxScore(100);
    setSimulatedFinalScore(80);
  };

  const totalCompletedWeight = components.reduce((acc, c) => acc + c.weight, 0);
  const totalWeight = totalCompletedWeight + finalExamWeight;
  const weightError = totalWeight !== 100;

  const result = calculatePrediction(components, finalExamWeight);

  // What-if simulator specific logic
  const simulatedFinalContributed =
    (simulatedFinalScore / Math.max(finalExamMaxScore, 1)) * finalExamWeight;
  const simulatedTotalPercentage = result.worstCasePercentage + simulatedFinalContributed;

  return (
    <ToolShell
      eyebrow="Academic"
      title={
        <>
          Grade <span className="text-gradient">Predictor</span>
        </>
      }
      description="Input your current scores to see your standing and exactly what you need on the final exam to secure your target grade."
    >
      {weightError && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>
            Warning: Your total weights sum to <strong>{totalWeight}%</strong>. It should equal 100%
            for accurate predictions.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Col: Inputs */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <div className="rounded-2xl glass p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Completed Components</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={addComponent}
                className="h-8 gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {components.map((comp) => (
                <div
                  key={comp.id}
                  className="relative flex flex-col gap-4 rounded-xl border border-border/50 bg-surface-2/30 p-4 sm:flex-row sm:items-end"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeComponent(comp.id)}
                    className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive sm:relative sm:right-auto sm:top-auto sm:h-9 sm:w-9 sm:shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid flex-1 gap-3 sm:grid-cols-4">
                    <div className="space-y-1.5 sm:col-span-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">Name</Label>
                      <Input
                        value={comp.name}
                        onChange={(e) => updateComponent(comp.id, "name", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Weight %
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={comp.weight || ""}
                        onChange={(e) => updateComponent(comp.id, "weight", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Your Score
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={comp.score || ""}
                        onChange={(e) => updateComponent(comp.id, "score", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Max Score
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={comp.maxScore || ""}
                        onChange={(e) => updateComponent(comp.id, "maxScore", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {components.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No components added. Click "Add Item" to start.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl glass p-6 shadow-card border-l-4 border-l-brand">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Final Exam Details</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Final Exam Weight (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={finalExamWeight || ""}
                  onChange={(e) => setFinalExamWeight(Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Final Exam Max Marks</Label>
                <Input
                  type="number"
                  min="1"
                  value={finalExamMaxScore || ""}
                  onChange={(e) => setFinalExamMaxScore(Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" onClick={handleReset} className="text-muted-foreground">
              Reset All
            </Button>
          </div>
        </div>

        {/* Right Col: Output & Predictions */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl glass p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Current Grade
                </span>
                <Target className="h-4 w-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-brand">
                  {result.currentGrade}
                </span>
                <span className="text-sm font-medium">
                  ({result.currentPercentage.toFixed(1)}%)
                </span>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                Based solely on the {totalCompletedWeight}% you have completed.
              </p>
            </div>

            <div className="rounded-2xl glass p-5 shadow-card bg-surface-2/30">
              <div className="mb-2 flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Best / Worst</span>
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                    <TrendingUp className="h-3 w-3" /> Best
                  </span>
                  <span className="text-sm font-bold">
                    {result.bestCaseGrade} ({result.bestCasePercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <TrendingDown className="h-3 w-3" /> Worst
                  </span>
                  <span className="text-sm font-bold">
                    {result.worstCaseGrade} ({result.worstCasePercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl glass p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Required for Target Grade</h2>
            <div className="space-y-3">
              {(["S", "A", "B", "C", "D", "E"] as GradeScale[]).map((grade) => {
                const reqPercent = result.requiredForTarget[grade];
                let label = "";
                let colorClass = "";

                if (reqPercent === null) {
                  label = "Impossible";
                  colorClass = "text-muted-foreground";
                } else if (reqPercent === 0) {
                  label = "Secured";
                  colorClass = "text-emerald-500 font-medium";
                } else {
                  const requiredMarks = (reqPercent / 100) * finalExamMaxScore;
                  label = `${requiredMarks.toFixed(1)} / ${finalExamMaxScore} marks`;
                  colorClass = reqPercent > 85 ? "text-amber-500" : "text-foreground";
                }

                return (
                  <div
                    key={grade}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-surface-2/20 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-md bg-background font-bold shadow-sm">
                        {grade}
                      </div>
                      <span className="text-xs text-muted-foreground">Target</span>
                    </div>
                    <span className={`text-sm ${colorClass}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl glass p-6 shadow-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent pointer-events-none" />
            <h2 className="mb-4 text-lg font-semibold tracking-tight">What-If Simulator</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Expected Final Marks</Label>
                  <span className="text-sm font-medium">
                    {simulatedFinalScore} / {finalExamMaxScore}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={finalExamMaxScore}
                  value={simulatedFinalScore}
                  onChange={(e) => setSimulatedFinalScore(Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer"
                />
              </div>

              <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Simulated Final Grade
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold">
                    {getGradeFromPercentage(simulatedTotalPercentage)}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  If you score {simulatedFinalScore} on the final, your overall percentage will be{" "}
                  <strong>{simulatedTotalPercentage.toFixed(1)}%</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
