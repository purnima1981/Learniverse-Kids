import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, X, ChevronLeft, ChevronRight, Check, Clock, ArrowRight, BookOpen, RotateCcw, Eye } from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";
import type { Question } from "@shared/schema";

// ─── Research-backed time limits (practice = 1.5x competition time) ─────────
// Based on Math Kangaroo (~3 min/q G1-4, ~2.5 min/q G5-8) and AMC 8 (~1.6 min/q)
const TIME_TABLE: Record<string, Record<string, number>> = {
  "1": { easy: 90, medium: 120, hard: 150, olympiad: 180 },
  "2": { easy: 90, medium: 120, hard: 150, olympiad: 180 },
  "3": { easy: 75, medium: 90,  hard: 120, olympiad: 150 },
  "4": { easy: 75, medium: 90,  hard: 120, olympiad: 150 },
  "5": { easy: 60, medium: 75,  hard: 105, olympiad: 120 },
  "6": { easy: 60, medium: 75,  hard: 105, olympiad: 120 },
  "7": { easy: 45, medium: 60,  hard: 90,  olympiad: 105 },
  "8": { easy: 45, medium: 60,  hard: 90,  olympiad: 105 },
};

// Timer visibility by grade (Boaler 2014, Ramirez 2013)
// G1-2: hidden (anxiety risk), G3-4: bar only (no numbers), G5+: full
type TimerMode = "hidden" | "bar-only" | "full";

function getTimerMode(grade: number): TimerMode {
  if (grade <= 2) return "hidden";
  if (grade <= 4) return "bar-only";
  return "full";
}

function getTimeLimit(grade: number, difficulty: string): number {
  const g = String(Math.min(Math.max(grade, 1), 8));
  return TIME_TABLE[g]?.[difficulty] ?? 75;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

interface TopicQuestionsProps {
  topicId: number;
  profileId: number;
  difficulty?: string;
  grade?: number;
  onComplete: (score: number, total: number) => void;
}

export function TopicQuestions({ topicId, profileId, grade = 5, onComplete }: TopicQuestionsProps) {
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: [`/api/topics/${topicId}/questions`],
    queryFn: async () => {
      const res = await fetch(`/api/topics/${topicId}/questions`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(var(--grape))" }} /></div>;
  if (questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-5 py-12 text-center animate-fade-in">
        <BookOpen size={24} className="text-muted-foreground mx-auto mb-3" />
        <p className="font-display font-semibold text-foreground">No questions available yet</p>
        <p className="text-sm text-muted-foreground mt-1 font-body">Check back soon!</p>
      </div>
    );
  }
  return <PracticeTest questions={questions} profileId={profileId} topicId={topicId} grade={grade} onComplete={onComplete} />;
}

// ─── Practice Test ──────────────────────────────────────────────────────────

interface TestResult {
  questionId: number; selected: number | null; correct: boolean;
  timeTaken: number; topic: string; bloomLevel: string; usedReveal: boolean; hintsUsed: number;
}

function PracticeTest({ questions, profileId, topicId, grade, onComplete }: {
  questions: Question[]; profileId: number; topicId: number; grade: number;
  onComplete: (score: number, total: number) => void;
}) {
  const timerMode = getTimerMode(grade);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState(false); // Track if they got it wrong once

  const q = questions[current];
  const tl = getTimeLimit(grade, q.difficulty ?? "medium");
  const [timeLeft, setTimeLeft] = useState(tl);
  const [timeLimit, setTimeLimit] = useState(tl);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [results, setResults] = useState<TestResult[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  // Hint system: 4-level progressive scaffold (Kapur's productive failure)
  const [hintLevel, setHintLevel] = useState(0); // 0 = none shown
  const hints = (q.hints as string[]) ?? [];
  const explanation = q.explanation ?? "";
  const options: string[] = (q.options as { choices?: string[] })?.choices ?? [];
  const correctIndex = ["a", "b", "c", "d"].indexOf(q.answer as string);

  const hintSteps = useMemo(() => {
    const steps: { text: string; type: "prompt" | "hint" | "example" | "solution" }[] = [];
    steps.push({ text: "Take a moment — what do you already know about this?", type: "prompt" });
    if (hints[0]) steps.push({ text: hints[0], type: "hint" });
    if (hints[1]) steps.push({ text: hints[1], type: "example" });
    if (explanation) steps.push({ text: explanation, type: "solution" });
    return steps;
  }, [hints, explanation]);

  const startSession = useMutation({
    mutationFn: async () => { const res = await apiRequest("POST", "/api/quiz/start", { childProfileId: profileId, topicId }); return res.json(); },
    onSuccess: (data) => setSessionId(data.id),
  });
  useEffect(() => { startSession.mutate(); }, []);

  const submitResponse = useMutation({
    mutationFn: async (data: any) => { if (!sessionId) return; await apiRequest("POST", "/api/quiz/respond", { sessionId, childProfileId: profileId, ...data }); },
  });
  const completeSession = useMutation({
    mutationFn: async (data: { score: number; totalQuestions: number }) => { if (!sessionId) return; await apiRequest("POST", "/api/quiz/complete", { sessionId, ...data }); },
  });

  const handleNext = useCallback((chosenOption: number | null) => {
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = chosenOption === correctIndex;

    submitResponse.mutate({
      questionId: q.id,
      userAnswer: chosenOption !== null ? ["a", "b", "c", "d"][chosenOption] : null,
      isCorrect, timeTaken, attempts: wrongAttempt ? 2 : 1,
      hintsUsed: hintLevel,
      difficulty: q.difficulty ?? "medium",
      bloomLevel: q.bloomLevel ?? "understand",
    });

    const newResults = [...results, {
      questionId: q.id, selected: chosenOption, correct: isCorrect,
      timeTaken, topic: q.topic ?? "", bloomLevel: q.bloomLevel ?? "understand",
      usedReveal: hintLevel > 0, hintsUsed: hintLevel,
    }];

    if (current + 1 < questions.length) {
      setResults(newResults); setCurrent(current + 1);
      setSelected(null); setConfirmed(false); setWrongAttempt(false); setHintLevel(0);
      const nextQ = questions[current + 1];
      const nt = getTimeLimit(grade, nextQ.difficulty ?? "medium");
      setTimeLeft(nt); setTimeLimit(nt); setQuestionStartTime(Date.now());
    } else {
      const score = newResults.filter(r => r.correct).length;
      setResults(newResults); setFinished(true);
      completeSession.mutate({ score, totalQuestions: questions.length });
    }
  }, [current, q, questionStartTime, questions, results, correctIndex, wrongAttempt, hintLevel, grade]);

  // Timer (only counts down if timerMode !== "hidden")
  useEffect(() => {
    if (confirmed || finished) return;
    if (timeLeft <= 0) { handleNext(selected); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, confirmed, finished, selected, handleNext]);

  if (finished) {
    return <ResultsScreen results={results} questions={questions} grade={grade} onRetry={() => {
      setResults([]); setCurrent(0); setSelected(null); setConfirmed(false); setWrongAttempt(false); setHintLevel(0);
      const nt = getTimeLimit(grade, questions[0].difficulty ?? "medium");
      setTimeLeft(nt); setTimeLimit(nt); setQuestionStartTime(Date.now()); setFinished(false);
      startSession.mutate();
    }} onComplete={onComplete} />;
  }

  // ─── Question UI ──────────────────────────────────────────────────────
  const timerPct = timeLeft / timeLimit;
  const isUrgent = timerPct < 0.3;

  function handleConfirm() {
    if (selected === null) return;
    if (selected === correctIndex) {
      setConfirmed(true);
    } else {
      // Wrong answer — mark attempt, don't advance yet
      setWrongAttempt(true);
      setSelected(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col animate-fade-in" style={{ background: "hsl(var(--background))" }}>
      {/* Top bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10" style={{ borderColor: "hsl(var(--border))" }}>
        <button onClick={() => onComplete(results.filter(r => r.correct).length, results.length)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium font-body"
          style={{ color: "hsl(var(--grape))" }}>
          <ChevronLeft size={16} /> Exit
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 font-body">
            <span className="font-medium">Question {current + 1} of {questions.length}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((current + (confirmed ? 1 : 0)) / questions.length) * 100}%`, background: "hsl(var(--grape))" }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col max-w-2xl mx-auto w-full px-4 py-5 gap-4">

        {/* Timer — adaptive by grade */}
        {timerMode === "full" && (
          <div className="flex items-center gap-3">
            <div className="flex-1 timer-track">
              <div className={`timer-fill ${isUrgent ? "urgent" : ""}`} style={{ width: `${timerPct * 100}%` }} />
            </div>
            <div className="text-xs text-muted-foreground font-body tabular-nums min-w-[70px] text-right">
              <b className="text-foreground">{timeLeft}s</b> / {timeLimit}s
            </div>
          </div>
        )}
        {timerMode === "bar-only" && (
          <div className="timer-track">
            <div className={`timer-fill ${isUrgent ? "urgent" : ""}`} style={{ width: `${timerPct * 100}%` }} />
          </div>
        )}
        {/* G1-2: no timer shown at all */}

        {/* Question card */}
        <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="flex gap-2 flex-wrap font-body mb-3">
            <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 capitalize"
              style={{ background: "hsl(var(--grape-soft))", color: "hsl(var(--grape))" }}>{q.difficulty ?? "medium"}</span>
            {q.topic && <span className="text-xs rounded-full px-2.5 py-0.5" style={{ background: "hsl(var(--background))", color: "hsl(var(--muted-foreground))" }}>{q.topic}</span>}
          </div>
          <p className="font-display text-lg font-semibold text-foreground leading-snug">
            <MathRenderer text={q.text} />
          </p>
        </div>

        {/* Wrong attempt feedback */}
        {wrongAttempt && !confirmed && (
          <div className="rounded-xl p-3 text-sm font-body animate-fade-in" style={{ background: "hsl(var(--coral-soft))", color: "hsl(var(--coral))" }}>
            Not quite — try again! {hintLevel === 0 && "You can also use a hint below."}
          </div>
        )}

        {/* Options grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {options.map((opt, i) => {
            let state: "default" | "selected" | "correct" | "wrong" = "default";
            if (confirmed) {
              if (i === correctIndex) state = "correct";
            } else if (i === selected) {
              state = "selected";
            }

            const border = { default: "hsl(var(--border))", selected: "hsl(var(--grape))", correct: "hsl(var(--leaf))", wrong: "hsl(var(--coral))" }[state];
            const bg = { default: "#fff", selected: "hsl(var(--grape-soft))", correct: "hsl(var(--leaf-soft))", wrong: "hsl(var(--coral-soft))" }[state];
            const keyBg = { default: "hsl(var(--background))", selected: "hsl(var(--grape))", correct: "hsl(var(--leaf))", wrong: "hsl(var(--coral))" }[state];
            const keyColor = state === "default" ? "hsl(var(--muted-foreground))" : "#fff";
            const isLastOdd = options.length % 2 === 1 && i === options.length - 1;

            return (
              <button key={i} disabled={confirmed} onClick={() => setSelected(i)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all font-body ${isLastOdd ? "col-span-2" : ""}`}
                style={{ border: `1.5px solid ${border}`, background: bg }}>
                <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0" style={{ background: keyBg, color: keyColor }}>{"ABCD"[i]}</span>
                <span className="text-sm font-medium text-foreground"><MathRenderer text={opt} /></span>
                {state === "correct" && <Check size={16} style={{ color: "hsl(var(--leaf))", marginLeft: "auto", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Hints — progressive, only after wrong attempt (productive failure) */}
        {wrongAttempt && !confirmed && hintLevel < hintSteps.length && (
          <div className="space-y-2 animate-slide-up">
            {hintSteps.slice(0, hintLevel).map((step, i) => (
              <div key={i} className="rounded-xl p-3 text-sm font-body" style={{ background: "hsl(var(--grape-soft))" }}>
                {step.type === "solution" ? <b><MathRenderer text={step.text} /></b> : <MathRenderer text={step.text} />}
              </div>
            ))}
            <button onClick={() => setHintLevel(hintLevel + 1)}
              className="flex items-center gap-2 text-sm font-semibold font-body px-3 py-2 rounded-lg transition-colors"
              style={{ color: "hsl(var(--grape))", background: "hsl(var(--grape-soft))" }}>
              <Eye size={14} /> {hintLevel === 0 ? "Get a hint" : hintLevel < hintSteps.length - 1 ? "Next hint" : "Show solution"}
            </button>
          </div>
        )}

        {/* Confirmed correct: show explanation */}
        {confirmed && explanation && (
          <div className="rounded-xl p-3 text-sm font-body animate-fade-in" style={{ background: "hsl(var(--leaf-soft))", color: "hsl(var(--foreground))" }}>
            <b style={{ color: "hsl(var(--leaf))" }}>Correct!</b> <MathRenderer text={explanation} />
          </div>
        )}

        {/* Action button */}
        <div>
          {!confirmed ? (
            <button onClick={handleConfirm} disabled={selected === null}
              className="w-full rounded-xl py-3.5 font-body text-sm font-semibold transition-all"
              style={{ background: selected !== null ? "hsl(var(--grape))" : "hsl(var(--muted))", color: selected !== null ? "#fff" : "hsl(var(--muted-foreground))", cursor: selected !== null ? "pointer" : "not-allowed" }}>
              {wrongAttempt ? "Try Again" : "Confirm Answer"}
            </button>
          ) : (
            <button onClick={() => handleNext(selected)}
              className="w-full rounded-xl py-3.5 font-body text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))" }}>
              {current + 1 < questions.length ? "Next Question" : "See Results"} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Results Screen ─────────────────────────────────────────────────────────

function ResultsScreen({ results, questions, grade, onRetry, onComplete }: {
  results: TestResult[]; questions: Question[]; grade: number;
  onRetry: () => void; onComplete: (score: number, total: number) => void;
}) {
  const correct = results.filter(r => r.correct).length;
  const score = Math.round((correct / results.length) * 100);
  const totalTime = results.reduce((a, r) => a + r.timeTaken, 0);
  const avgTime = Math.round(totalTime / results.length);
  const hintsUsedCount = results.filter(r => r.hintsUsed > 0).length;

  const message = score >= 90 ? "Outstanding!" : score >= 70 ? "Great job!" : score >= 50 ? "Good effort!" : "Keep practicing!";

  return (
    <div className="min-h-screen animate-slide-up" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Score */}
        <div className="rounded-2xl p-6 text-center text-white" style={{ background: "hsl(var(--grape))" }}>
          <p className="text-sm font-body opacity-70 mb-1">{message}</p>
          <div className="font-display font-bold text-5xl mb-1">{score}%</div>
          <p className="text-sm font-body opacity-70">{correct} / {results.length} correct</p>
          <div className="grid grid-cols-3 gap-2 mt-5">
            <div className="rounded-lg py-2 px-1" style={{ background: "rgba(255,255,255,0.15)" }}>
              <p className="text-xs opacity-60 font-body">Time</p><p className="font-semibold text-sm font-body">{formatTime(totalTime)}</p>
            </div>
            <div className="rounded-lg py-2 px-1" style={{ background: "rgba(255,255,255,0.15)" }}>
              <p className="text-xs opacity-60 font-body">Avg/Q</p><p className="font-semibold text-sm font-body">{formatTime(avgTime)}</p>
            </div>
            <div className="rounded-lg py-2 px-1" style={{ background: "rgba(255,255,255,0.15)" }}>
              <p className="text-xs opacity-60 font-body">Hints</p><p className="font-semibold text-sm font-body">{hintsUsedCount}/{results.length}</p>
            </div>
          </div>
        </div>

        {/* Question review */}
        <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
          <p className="font-display font-semibold text-sm text-foreground mb-4">Review</p>
          <div className="space-y-2.5 font-body">
            {results.map((r, i) => {
              const rq = questions.find(qq => qq.id === r.questionId)!;
              return (
                <div key={r.questionId} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: r.correct ? "hsl(var(--leaf))" : "hsl(var(--coral))" }}>
                    {r.correct ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">Q{i + 1}: {rq.text}</p>
                    {r.hintsUsed > 0 && <span className="text-xs text-muted-foreground">{r.hintsUsed} hint{r.hintsUsed > 1 ? "s" : ""} used</span>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0"><Clock size={10} className="inline mr-0.5" />{r.timeTaken}s</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pb-4 font-body">
          <button onClick={onRetry} className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
            style={{ background: "hsl(var(--grape))" }}>
            <RotateCcw size={16} /> Try Again
          </button>
          <button onClick={() => onComplete(correct, results.length)}
            className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
            style={{ background: "#fff", border: "1.5px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
            <ArrowRight size={16} /> Done
          </button>
        </div>
      </div>
    </div>
  );
}
