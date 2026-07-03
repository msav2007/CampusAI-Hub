import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  History,
  MessagesSquare,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";

import { ToolShell } from "@/components/site/ToolShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeInterviewAnswer, summarizeInterviewSession } from "@/lib/interview/analyzer";
import { getInterviewQuestionById, getInterviewQuestions } from "@/lib/interview/questions";
import {
  interviewCategories,
  interviewDifficulties,
  type InterviewCategory,
  type InterviewDifficulty,
  type InterviewHistoryEntry,
  type InterviewQuestion,
  type InterviewSession,
} from "@/lib/interview/types";
import { buildPageHead } from "@/lib/seo";
import { readJsonFromStorage, writeJsonToStorage } from "@/lib/storage";

const STORAGE_KEY = "campusai:interview-ai:v1";
const DEFAULT_CATEGORY = interviewCategories[0];
const DEFAULT_DIFFICULTY = interviewDifficulties[0];

type InterviewStorageState = {
  activeSession: InterviewSession | null;
  history: InterviewHistoryEntry[];
};

const EMPTY_STORAGE_STATE: InterviewStorageState = {
  activeSession: null,
  history: [],
};

const historyDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const Route = createFileRoute("/tools/interview-ai")({
  head: () => ({
    ...buildPageHead({
      title: "Interview AI Practice Tool - Free Local Feedback | CampusAI Tools",
      description:
        "Practice realistic interview questions for software, web, data structures, and HR rounds with local feedback, progress tracking, and browser-only storage.",
      path: "/tools/interview-ai",
      keywords:
        "interview practice, mock interview questions, software engineering interview prep, hr interview practice, local answer feedback",
    }),
  }),
  component: InterviewAiPage,
});

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createInterviewSession(category: InterviewCategory, difficulty: InterviewDifficulty) {
  const questionIds = getInterviewQuestions(category, difficulty).map((question) => question.id);
  const timestamp = new Date().toISOString();

  return {
    id: `${slugifyValue(category)}-${slugifyValue(difficulty)}-${Date.now()}`,
    category,
    difficulty,
    questionIds,
    currentIndex: 0,
    answers: {},
    startedAt: timestamp,
    lastUpdatedAt: timestamp,
  } satisfies InterviewSession;
}

function getSessionQuestions(session: InterviewSession) {
  const selectedQuestions = session.questionIds
    .map((questionId) => getInterviewQuestionById(questionId))
    .filter((question): question is InterviewQuestion => question !== null);

  if (selectedQuestions.length > 0) {
    return selectedQuestions;
  }

  return getInterviewQuestions(session.category, session.difficulty);
}

function hydrateSession(session: InterviewSession | null) {
  if (!session) return null;

  const latestQuestions = getInterviewQuestions(session.category, session.difficulty);
  if (latestQuestions.length === 0) return null;

  const validQuestionIds = new Set(latestQuestions.map((question) => question.id));
  const answers = Object.fromEntries(
    Object.entries(session.answers).filter(([questionId]) => validQuestionIds.has(questionId)),
  );

  return {
    ...session,
    questionIds: latestQuestions.map((question) => question.id),
    currentIndex: Math.min(session.currentIndex, latestQuestions.length - 1),
    answers,
  } satisfies InterviewSession;
}

function buildHistoryEntry(session: InterviewSession) {
  const questions = getSessionQuestions(session);
  const entries = questions.map((question) => ({
    question,
    answer: session.answers[question.id] ?? "",
  }));
  const summary = summarizeInterviewSession(entries);

  if (summary.questionsCompleted === 0) {
    return null;
  }

  const completedAt =
    summary.questionsCompleted === questions.length ? session.lastUpdatedAt : null;

  return {
    id: session.id,
    category: session.category,
    difficulty: session.difficulty,
    startedAt: session.startedAt,
    lastUpdatedAt: session.lastUpdatedAt,
    completedAt,
    questionsCompleted: summary.questionsCompleted,
    totalQuestions: questions.length,
    averageScore: summary.averageScore,
    weakAreas: summary.weakAreas,
    recommendations: summary.recommendations,
  } satisfies InterviewHistoryEntry;
}

function upsertHistoryEntry(history: InterviewHistoryEntry[], entry: InterviewHistoryEntry | null) {
  if (!entry) return history;

  const nextHistory = history.filter((item) => item.id !== entry.id);
  nextHistory.unshift(entry);

  return nextHistory
    .sort((left, right) => {
      return new Date(right.lastUpdatedAt).getTime() - new Date(left.lastUpdatedAt).getTime();
    })
    .slice(0, 8);
}

function formatHistoryDate(value: string) {
  return historyDateFormatter.format(new Date(value));
}

function InterviewAiPage() {
  const [selectedCategory, setSelectedCategory] = useState<InterviewCategory>(DEFAULT_CATEGORY);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<InterviewDifficulty>(DEFAULT_DIFFICULTY);
  const [storageState, setStorageState] = useState<InterviewStorageState>(EMPTY_STORAGE_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = readJsonFromStorage<InterviewStorageState>(STORAGE_KEY);

    if (stored) {
      const activeSession = hydrateSession(stored.activeSession);
      setStorageState({
        activeSession,
        history: stored.history ?? [],
      });

      if (activeSession) {
        setSelectedCategory(activeSession.category);
        setSelectedDifficulty(activeSession.difficulty);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeJsonToStorage(STORAGE_KEY, storageState);
  }, [loaded, storageState]);

  const activeSession = storageState.activeSession;
  const activeQuestions = activeSession ? getSessionQuestions(activeSession) : [];
  const currentQuestion = activeSession
    ? (activeQuestions[activeSession.currentIndex] ?? null)
    : null;
  const currentAnswer =
    currentQuestion && activeSession ? (activeSession.answers[currentQuestion.id] ?? "") : "";
  const deferredAnswer = useDeferredValue(currentAnswer);
  const currentAnalysis =
    currentQuestion && deferredAnswer.trim().length > 0
      ? analyzeInterviewAnswer(currentQuestion, deferredAnswer)
      : null;
  const sessionEntries = activeQuestions.map((question) => ({
    question,
    answer: activeSession?.answers[question.id] ?? "",
  }));
  const sessionResult = summarizeInterviewSession(sessionEntries);
  const answeredCount = sessionEntries.filter((entry) => entry.answer.trim().length > 0).length;
  const totalQuestions = activeQuestions.length;
  const completionPercent = totalQuestions === 0 ? 0 : (answeredCount / totalQuestions) * 100;
  const availableQuestions = getInterviewQuestions(selectedCategory, selectedDifficulty);
  const isCurrentTrack =
    activeSession?.category === selectedCategory &&
    activeSession?.difficulty === selectedDifficulty;

  const startSession = (category: InterviewCategory, difficulty: InterviewDifficulty) => {
    setStorageState((previousState) => ({
      activeSession: createInterviewSession(category, difficulty),
      history: previousState.history,
    }));
  };

  const updateActiveSession = (updater: (session: InterviewSession) => InterviewSession) => {
    setStorageState((previousState) => {
      if (!previousState.activeSession) return previousState;

      const nextSession = updater(previousState.activeSession);
      const history = upsertHistoryEntry(previousState.history, buildHistoryEntry(nextSession));

      return {
        activeSession: nextSession,
        history,
      };
    });
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    updateActiveSession((session) => {
      const answers = { ...session.answers };

      if (answer.trim()) {
        answers[questionId] = answer;
      } else {
        delete answers[questionId];
      }

      return {
        ...session,
        answers,
        lastUpdatedAt: new Date().toISOString(),
      };
    });
  };

  const jumpToQuestion = (index: number) => {
    updateActiveSession((session) => ({
      ...session,
      currentIndex: index,
      lastUpdatedAt: new Date().toISOString(),
    }));
  };

  const goToPreviousQuestion = () => {
    if (!activeSession || activeSession.currentIndex === 0) return;
    jumpToQuestion(activeSession.currentIndex - 1);
  };

  const goToNextQuestion = () => {
    if (!activeSession || activeSession.currentIndex >= activeQuestions.length - 1) return;
    jumpToQuestion(activeSession.currentIndex + 1);
  };

  const clearCurrentAnswer = () => {
    if (!currentQuestion) return;
    handleAnswerChange(currentQuestion.id, "");
  };

  return (
    <ToolShell
      eyebrow="Career"
      title={
        <>
          Interview <span className="text-gradient">AI</span>
        </>
      }
      description="Practice realistic interview questions with browser-only scoring, keyword coverage checks, and session history saved on your device."
      actions={
        <span className="rounded-full border border-border/60 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          Local feedback only
        </span>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <section className="rounded-2xl glass p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Setup</div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Pick your interview track
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-wider text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Autosaved in this browser
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <div className="text-sm font-medium tracking-tight">Category</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {interviewCategories.map((category) => (
                    <ChoiceButton
                      key={category}
                      active={selectedCategory === category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </ChoiceButton>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium tracking-tight">Difficulty</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {interviewDifficulties.map((difficulty) => (
                    <ChoiceButton
                      key={difficulty}
                      active={selectedDifficulty === difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                    >
                      {difficulty}
                    </ChoiceButton>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-surface-2/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold tracking-tight">
                      {availableQuestions.length} curated question
                      {availableQuestions.length === 1 ? "" : "s"} in this track
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Use the setup above to start fresh anytime. Your current answers stay saved
                      until you replace the session.
                    </div>
                  </div>
                  <Button onClick={() => startSession(selectedCategory, selectedDifficulty)}>
                    <Sparkles className="h-4 w-4" />
                    {isCurrentTrack && activeSession ? "Restart session" : "Start practice"}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl glass p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Practice mode
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Work through each answer
                </h2>
              </div>
              {activeSession ? (
                <div className="rounded-full border border-border/60 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {activeSession.category} - {activeSession.difficulty}
                </div>
              ) : null}
            </div>

            {!activeSession || !currentQuestion ? (
              <div className="mt-8 grid min-h-[380px] place-items-center rounded-2xl border border-border/60 bg-surface-2/30 p-8 text-center">
                <div className="max-w-sm">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-dashed border-border/60 bg-background/30">
                    <MessagesSquare className="h-6 w-6 text-muted-foreground/70" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">
                    Start a practice session
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Choose a category and difficulty above, then start a fresh session to unlock
                    questions, progress tracking, and local feedback.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold tracking-tight">
                      Question {activeSession.currentIndex + 1} of {totalQuestions}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {answeredCount} answered so far
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(completionPercent)}% complete
                  </div>
                </div>

                <div className="mt-4 h-2 rounded-full bg-surface-2/60">
                  <div
                    className="h-full rounded-full bg-gradient-brand transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activeQuestions.map((question, index) => {
                    const isCurrent = activeSession.currentIndex === index;
                    const isAnswered = Boolean(activeSession.answers[question.id]?.trim());

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => jumpToQuestion(index)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                          isCurrent
                            ? "border-transparent bg-foreground text-background"
                            : isAnswered
                              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                              : "border-border/70 bg-background/20 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Q{index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-border/60 bg-surface-2/30 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-brand-2">
                        Current question
                      </div>
                      <h3 className="mt-2 text-lg font-semibold tracking-tight">
                        {currentQuestion.question}
                      </h3>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>

                  <Textarea
                    aria-label="Interview answer"
                    value={currentAnswer}
                    onChange={(event) => handleAnswerChange(currentQuestion.id, event.target.value)}
                    placeholder="Write your answer here. Feedback updates locally as you type, so focus on structure, specific terms, and completeness."
                    className="mt-5 min-h-[240px] resize-y rounded-2xl border-border/60 bg-background/30 p-4 leading-relaxed"
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      Answers are stored locally with no login and no API calls.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        onClick={clearCurrentAnswer}
                        disabled={!currentAnswer}
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Clear answer
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={activeSession.currentIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={goToNextQuestion}
                    disabled={activeSession.currentIndex >= activeQuestions.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl glass p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Local feedback
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">Current answer score</h2>
              </div>
              <BrainCircuit className="h-5 w-5 text-muted-foreground" />
            </div>

            {!currentAnalysis ? (
              <div className="mt-8 grid min-h-[320px] place-items-center rounded-2xl border border-border/60 bg-surface-2/30 p-8 text-center">
                <div className="max-w-sm">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-dashed border-border/60 bg-background/30">
                    <Target className="h-5 w-5 text-muted-foreground/70" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">No feedback yet</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Start writing an answer to see local scoring for keyword coverage, length,
                    clarity, and completeness.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-5">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Score
                      </div>
                      <div className="mt-2 text-5xl font-bold tracking-tight text-gradient">
                        {currentAnalysis.score}
                        <span className="text-2xl text-foreground/70">/100</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3 text-right">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Focus now
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {currentAnalysis.missingConcepts[0] ?? "Keep refining"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard
                    icon={BarChart3}
                    label="Keyword coverage"
                    value={`${currentAnalysis.metrics.keywordCoverage.score}/${currentAnalysis.metrics.keywordCoverage.maxScore}`}
                    hint={`${Math.round(currentAnalysis.metrics.keywordCoverage.coverageRatio * 100)}% of expected terms`}
                  />
                  <MetricCard
                    icon={Clock3}
                    label="Answer length"
                    value={`${currentAnalysis.metrics.answerLength.score}/${currentAnalysis.metrics.answerLength.maxScore}`}
                    hint={`${currentAnalysis.metrics.answerLength.wordCount} words`}
                  />
                  <MetricCard
                    icon={Sparkles}
                    label="Clarity"
                    value={`${currentAnalysis.metrics.clarity.score}/${currentAnalysis.metrics.clarity.maxScore}`}
                    hint={`${currentAnalysis.metrics.clarity.sentenceCount} sentence${currentAnalysis.metrics.clarity.sentenceCount === 1 ? "" : "s"}`}
                  />
                  <MetricCard
                    icon={CheckCircle2}
                    label="Completeness"
                    value={`${currentAnalysis.metrics.completeness.score}/${currentAnalysis.metrics.completeness.maxScore}`}
                    hint={`${currentAnalysis.metrics.completeness.coveredPoints}/${currentAnalysis.metrics.completeness.totalPoints} core points covered`}
                  />
                </div>

                {currentAnalysis.metrics.keywordCoverage.matchedKeywords.length > 0 ? (
                  <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-5">
                    <div className="text-sm font-semibold tracking-tight">Matched keywords</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentAnalysis.metrics.keywordCoverage.matchedKeywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <ResultList title="Strengths" items={currentAnalysis.strengths} tone="good" />
                <ResultList
                  title="Missing concepts"
                  items={currentAnalysis.missingConcepts}
                  tone="warn"
                />
                <ResultList
                  title="Improvement tips"
                  items={currentAnalysis.improvementTips}
                  tone="neutral"
                />
              </div>
            )}
          </section>

          <section className="rounded-2xl glass p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Session result
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  How this round is going
                </h2>
              </div>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>

            {!activeSession ? (
              <div className="mt-6 rounded-2xl border border-border/60 bg-surface-2/30 p-5 text-sm text-muted-foreground">
                Start a session to unlock average score, weak areas, and practice recommendations.
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard
                    icon={CheckCircle2}
                    label="Questions completed"
                    value={`${sessionResult.questionsCompleted}/${totalQuestions}`}
                    hint="Any answered question counts toward this total"
                  />
                  <MetricCard
                    icon={BarChart3}
                    label="Average score"
                    value={`${sessionResult.averageScore}/100`}
                    hint={
                      sessionResult.questionsCompleted === totalQuestions && totalQuestions > 0
                        ? "Track complete"
                        : "Updates as you answer"
                    }
                  />
                </div>

                <ResultList
                  title="Weak areas"
                  items={
                    sessionResult.weakAreas.length > 0
                      ? sessionResult.weakAreas
                      : ["Answer at least one question to surface weak areas."]
                  }
                  tone="warn"
                />

                <ResultList
                  title="Recommendations"
                  items={
                    sessionResult.recommendations.length > 0
                      ? sessionResult.recommendations
                      : [
                          "Write one answer first, then the system will suggest what to improve next.",
                        ]
                  }
                  tone="neutral"
                />
              </div>
            )}
          </section>

          <section className="rounded-2xl glass p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  History
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Recent practice rounds
                </h2>
              </div>
              <History className="h-5 w-5 text-muted-foreground" />
            </div>

            {storageState.history.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-border/60 bg-surface-2/30 p-5 text-sm text-muted-foreground">
                Your completed or in-progress rounds will show up here once you start answering
                questions.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {storageState.history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-border/60 bg-surface-2/30 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold tracking-tight">
                          {entry.category} - {entry.difficulty}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Updated {formatHistoryDate(entry.lastUpdatedAt)}
                        </div>
                      </div>
                      <div className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {entry.completedAt ? "Completed" : "In progress"}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/60 bg-background/30 p-3">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Progress
                        </div>
                        <div className="mt-2 text-lg font-semibold tracking-tight">
                          {entry.questionsCompleted}/{entry.totalQuestions}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/30 p-3">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Average score
                        </div>
                        <div className="mt-2 text-lg font-semibold tracking-tight">
                          {entry.averageScore}/100
                        </div>
                      </div>
                    </div>

                    {entry.weakAreas.length > 0 ? (
                      <p className="mt-4 text-sm text-muted-foreground">
                        Weak areas: {entry.weakAreas.join(", ")}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </ToolShell>
  );
}

function ChoiceButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
        active
          ? "border-transparent bg-foreground text-background"
          : "border-border/70 bg-background/20 text-foreground hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function ResultList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn" | "neutral";
}) {
  const toneClasses =
    tone === "good"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : tone === "warn"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
        : "border-border/60 bg-surface-2/40 text-foreground/90";

  return (
    <div className={`rounded-2xl border p-5 ${toneClasses}`}>
      <div className="text-sm font-semibold tracking-tight">{title}</div>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
