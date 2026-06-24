import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, X, ChevronLeft, ChevronRight, Check, Clock, Zap, ArrowRight, BookOpen, RotateCcw, Eye, Timer } from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";
import type { Question } from "@shared/schema";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

interface TopicQuestionsProps {
  topicId: number;
  profileId: number;
  difficulty?: string;
  onComplete: (score: number, total: number) => void;
}

export function TopicQuestions({ topicId, profileId, onComplete }: TopicQuestionsProps) {
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: [`/api/topics/${topicId}/questions`],
    queryFn: async () => {
      const res = await fetch(`/api/topics/${topicId}/questions`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(var(--grape))" }} />
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-5 py-12 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
          <BookOpen size={24} className="text-muted-foreground" />
        </div>
        <p className="font-display font-semibold text-foreground">No questions available yet</p>
        <p className="text-sm text-muted-foreground mt-1 font-body">Check back soon!</p>
      </div>
    );
  }

  return <PracticeTest questions={questions} profileId={profileId} topicId={topicId} onComplete={onComplete} />;
}

// ─── Practice Test ──────────────────────────────────────────────────────────

interface TestResult {
  questionId: number;
  selected: number | null;
  correct: boolean;
  timeTaken: number;
  topic: string;
  bloomLevel: string;
  usedReveal: boolean;
}

function PracticeTest({ questions, profileId, topicId, onComplete }: {
  questions: Question[]; profileId: number; topicId: number;
  onComplete: (score: number, total: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [results, setResults] = useState<TestResult[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  // Show Me reveal state
  const [revealStep, setRevealStep] = useState(-1); // -1 = not started
  const [revealUsed, setRevealUsed] = useState(false);

  const q = questions[current];
  const isTrueFalse = q.type === "true-false" || (!(q.options as any)?.choices && ["true","false"].includes(String(q.answer).toLowerCase()));
  const options: string[] = isTrueFalse
    ? ["True", "False"]
    : ((q.options as { choices?: string[] })?.choices ?? []);
  const correctIndex = isTrueFalse
    ? (String(q.answer).toLowerCase() === "true" ? 0 : 1)
    : ["a","b","c","d"].indexOf(q.answer as string);
  const hints = (q.hints as string[]) ?? [];
  const explanation = q.explanation ?? "";

  // Build reveal steps from hints + explanation
  const revealSteps = useMemo(() => {
    const steps: string[] = [];
    hints.forEach(h => steps.push(h));
    if (explanation) steps.push(explanation);
    if (steps.length === 0) steps.push("The correct answer is " + ["A","B","C","D"][correctIndex] + ".");
    return steps;
  }, [hints, explanation, correctIndex]);

  const startSession = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/quiz/start", { childProfileId: profileId, topicId });
      return res.json();
    },
    onSuccess: (data) => setSessionId(data.id),
  });

  useEffect(() => { startSession.mutate(); }, []);

  const submitResponse = useMutation({
    mutationFn: async (data: any) => {
      if (!sessionId) return;
      await apiRequest("POST", "/api/quiz/respond", { sessionId, childProfileId: profileId, ...data });
    },
  });

  const completeSession = useMutation({
    mutationFn: async (data: { score: number; totalQuestions: number }) => {
      if (!sessionId) return;
      await apiRequest("POST", "/api/quiz/complete", { sessionId, ...data });
    },
  });

  const handleNext = useCallback((chosenOption: number | null) => {
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = chosenOption === correctIndex;

    submitResponse.mutate({
      questionId: q.id,
      userAnswer: chosenOption !== null ? ["a","b","c","d"][chosenOption] : null,
      isCorrect, timeTaken, attempts: 1,
      hintsUsed: revealUsed ? revealStep + 1 : 0,
      difficulty: q.difficulty ?? "medium",
      bloomLevel: q.bloomLevel ?? "understand",
    });

    const newResults = [...results, {
      questionId: q.id, selected: chosenOption, correct: isCorrect,
      timeTaken, topic: q.topic ?? "", bloomLevel: q.bloomLevel ?? "understand",
      usedReveal: revealUsed,
    }];

    if (current + 1 < questions.length) {
      setResults(newResults);
      setCurrent(current + 1);
      setSelected(null);
      setConfirmed(false);
      setTimeLeft(60);
      setQuestionStartTime(Date.now());
      setRevealStep(-1);
      setRevealUsed(false);
    } else {
      const score = newResults.filter(r => r.correct).length;
      setResults(newResults);
      setFinished(true);
      completeSession.mutate({ score, totalQuestions: questions.length });
    }
  }, [current, q, questionStartTime, questions, results, correctIndex, revealUsed, revealStep]);

  // Timer
  useEffect(() => {
    if (confirmed || finished) return;
    if (timeLeft <= 0) { handleNext(selected); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, confirmed, finished, selected, handleNext]);

  function startReveal() {
    setRevealUsed(true);
    setRevealStep(0);
  }

  function nextRevealStep() {
    if (revealStep < revealSteps.length - 1) {
      setRevealStep(revealStep + 1);
    }
  }

  // ─── Results ────────────────────────────────────────────────────────────

  if (finished) {
    return <ResultsScreen results={results} questions={questions} onRetry={() => {
      setResults([]); setCurrent(0); setSelected(null); setConfirmed(false);
      setTimeLeft(60); setQuestionStartTime(Date.now()); setFinished(false);
      setRevealStep(-1); setRevealUsed(false);
      startSession.mutate();
    }} onComplete={onComplete} />;
  }

  // ─── Question UI (Learniversal style) ─────────────────────────────────

  const timerPct = timeLeft / 60;
  const isUrgent = timerPct < 0.3;

  return (
    <div className="min-h-screen flex flex-col animate-fade-in" style={{ background: "hsl(var(--background))" }}>
      {/* Top bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10" style={{ borderColor: "hsl(var(--border))" }}>
        <button
          onClick={() => onComplete(results.filter(r => r.correct).length, results.length)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium font-body"
          style={{ color: "hsl(var(--grape))" }}
        >
          <ChevronLeft size={16} /> Exit
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 font-body">
            <span className="font-medium">Question {current + 1} of {questions.length}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((current + (confirmed ? 1 : 0)) / questions.length) * 100}%`,
                background: `hsl(var(--grape))`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-5 gap-4">
        {/* Tags */}
        <div className="flex gap-2 flex-wrap font-body">
          <span className="pill pill-grape text-xs font-semibold capitalize">{q.difficulty ?? "medium"} · {q.bloomLevel ?? "understand"}</span>
          {q.topic && <span className="pill pill-grape text-xs">{q.topic}</span>}
        </div>

        {/* Timer bar (reference style) */}
        <div className="flex items-center gap-3">
          <div className="flex-1 timer-track">
            <div
              className={`timer-fill ${isUrgent ? "urgent" : ""}`}
              style={{ width: `${timerPct * 100}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground font-body tabular-nums min-w-[70px] text-right">
            <b className="text-foreground">{timeLeft}s</b> / 60s
          </div>
        </div>

        {/* Question text */}
        <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
          <p className="font-display text-lg font-semibold text-foreground leading-snug">
            <MathRenderer text={q.text} />
          </p>
        </div>

        {/* Options — 2-column grid (reference style) */}
        <div className={`grid gap-2.5 flex-1 ${options.length <= 4 ? "grid-cols-2" : "grid-cols-2"}`}>
          {options.map((opt, i) => {
            let optState: "default" | "selected" | "correct" | "wrong" = "default";
            if (confirmed) {
              if (i === correctIndex) optState = "correct";
              else if (i === selected && selected !== correctIndex) optState = "wrong";
            } else if (i === selected) {
              optState = "selected";
            }

            const borderColor = {
              default: "hsl(var(--border))",
              selected: "hsl(var(--grape))",
              correct: "hsl(var(--leaf))",
              wrong: "hsl(var(--coral))",
            }[optState];

            const bgColor = {
              default: "#fff",
              selected: "hsl(var(--grape-soft))",
              correct: "hsl(var(--leaf-soft))",
              wrong: "hsl(var(--coral-soft))",
            }[optState];

            const keyBg = {
              default: "hsl(var(--grape-soft))",
              selected: "hsl(var(--grape))",
              correct: "hsl(var(--leaf))",
              wrong: "hsl(var(--coral))",
            }[optState];

            const keyColor = optState === "default" ? "hsl(var(--grape))" : "#fff";

            const isLastOdd = options.length % 2 === 1 && i === options.length - 1;

            return (
              <button
                key={i}
                disabled={confirmed}
                onClick={() => setSelected(i)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all font-body ${isLastOdd ? "col-span-2" : ""}`}
                style={{
                  border: `1.5px solid ${borderColor}`,
                  background: bgColor,
                  cursor: confirmed ? "default" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!confirmed && optState === "default") {
                    e.currentTarget.style.borderColor = "hsl(var(--grape))";
                    e.currentTarget.style.background = "hsl(var(--grape-soft))";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!confirmed && optState === "default") {
                    e.currentTarget.style.borderColor = "hsl(var(--border))";
                    e.currentTarget.style.background = "#fff";
                  }
                }}
              >
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ background: keyBg, color: keyColor }}
                >
                  {["A","B","C","D","E"][i]}
                </span>
                <span className="text-sm font-medium text-foreground"><MathRenderer text={opt} /></span>
                {optState === "correct" && <Check size={16} style={{ color: "hsl(var(--leaf))", marginLeft: "auto", flexShrink: 0 }} />}
                {optState === "wrong" && <X size={16} style={{ color: "hsl(var(--coral))", marginLeft: "auto", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Show Me reveal button + steps */}
        {!confirmed && revealStep === -1 && (
          <button
            onClick={startReveal}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-body text-sm font-semibold transition-colors"
            style={{
              border: "1.5px solid hsl(var(--grape))",
              background: "#fff",
              color: "hsl(var(--grape))",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(var(--grape-soft))"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
          >
            <Eye size={16} /> Show me how to think about it
          </button>
        )}

        {/* Reveal steps (progressive) */}
        {revealStep >= 0 && (
          <div className="space-y-2 animate-slide-up">
            {revealSteps.slice(0, revealStep + 1).map((step, i) => (
              <div
                key={i}
                className="rounded-xl p-3 text-sm font-body leading-relaxed animate-fade-in"
                style={{
                  background: "hsl(var(--grape-soft))",
                  color: "hsl(var(--foreground))",
                }}
              >
                <MathRenderer text={step} />
              </div>
            ))}
            {revealStep < revealSteps.length - 1 && (
              <button
                onClick={nextRevealStep}
                className="text-xs font-semibold font-body px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "hsl(var(--grape))", background: "hsl(var(--grape-soft))" }}
              >
                Show next step...
              </button>
            )}
          </div>
        )}

        {/* Caption area */}
        {confirmed && (
          <div
            className="text-center text-sm font-body py-2 animate-fade-in"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {selected === correctIndex ? (
              <span><b style={{ color: "hsl(var(--leaf))" }}>Correct!</b> {explanation && <MathRenderer text={explanation} />}</span>
            ) : (
              <span>The answer is <b>{["A","B","C","D"][correctIndex]}</b>. {explanation && <MathRenderer text={explanation} />}</span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div>
          {!confirmed ? (
            <button
              onClick={() => { if (selected !== null) setConfirmed(true); }}
              disabled={selected === null}
              className="w-full rounded-xl py-3.5 font-body text-sm font-semibold transition-all"
              style={{
                background: selected !== null ? "hsl(var(--grape))" : "hsl(var(--muted))",
                color: selected !== null ? "#fff" : "hsl(var(--muted-foreground))",
                cursor: selected !== null ? "pointer" : "not-allowed",
                boxShadow: selected !== null ? "0 4px 14px hsl(var(--grape) / 0.25)" : "none",
              }}
            >
              Confirm Answer
            </button>
          ) : (
            <button
              onClick={() => handleNext(selected)}
              className="w-full rounded-xl py-3.5 font-body text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: "hsl(var(--foreground))",
                color: "hsl(var(--background))",
                cursor: "pointer",
              }}
            >
              {current + 1 < questions.length ? "Next Question" : "See Results"}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Results Screen ─────────────────────────────────────────────────────────

function ResultsScreen({ results, questions, onRetry, onComplete }: {
  results: TestResult[]; questions: Question[];
  onRetry: () => void;
  onComplete: (score: number, total: number) => void;
}) {
  const correct = results.filter(r => r.correct).length;
  const score = Math.round((correct / results.length) * 100);
  const totalTime = results.reduce((a, r) => a + r.timeTaken, 0);
  const avgTime = Math.round(totalTime / results.length);
  const revealCount = results.filter(r => r.usedReveal).length;

  const topicBreakdown = useMemo(() => {
    const breakdown: Record<string, { correct: number; total: number; time: number }> = {};
    results.forEach((r) => {
      if (!breakdown[r.topic]) breakdown[r.topic] = { correct: 0, total: 0, time: 0 };
      breakdown[r.topic].total++;
      breakdown[r.topic].time += r.timeTaken;
      if (r.correct) breakdown[r.topic].correct++;
    });
    return breakdown;
  }, [results]);

  const bloomBreakdown = useMemo(() => {
    const breakdown: Record<string, { correct: number; total: number }> = {};
    results.forEach((r) => {
      if (!breakdown[r.bloomLevel]) breakdown[r.bloomLevel] = { correct: 0, total: 0 };
      breakdown[r.bloomLevel].total++;
      if (r.correct) breakdown[r.bloomLevel].correct++;
    });
    return breakdown;
  }, [results]);

  return (
    <div className="min-h-screen animate-slide-up" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Score hero */}
        <div className="rounded-2xl p-6 text-center text-white bg-gradient-primary shadow-primary">
          <div className="font-display text-5xl font-bold mb-1">{score}%</div>
          <p className="text-white/70 text-sm font-body">{correct} / {results.length} correct</p>
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { label: "Total Time", value: formatTime(totalTime) },
              { label: "Avg / Q", value: formatTime(avgTime) },
              { label: "Reveal used", value: `${revealCount}/${results.length}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 rounded-lg py-2 px-1">
                <p className="text-xs text-white/60 font-body">{label}</p>
                <p className="font-semibold text-sm font-body">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Insight */}
        {revealCount > 0 && (
          <div className="insight-box font-body animate-fade-in">
            You used the "Show me" reveal on <b style={{ color: "hsl(var(--grape))" }}>{revealCount}</b> of {results.length} questions.
            {revealCount <= results.length / 2
              ? " Great independence — you're learning to picture it on your own!"
              : " Keep practicing — you'll need the reveal less over time."}
          </div>
        )}

        {/* Topic breakdown */}
        {Object.keys(topicBreakdown).length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
            <p className="font-display font-semibold text-sm text-foreground mb-4">Topic Breakdown</p>
            <div className="space-y-3 font-body">
              {Object.entries(topicBreakdown).map(([topic, data]) => {
                const pct = Math.round((data.correct / data.total) * 100);
                const barColor = pct >= 80 ? "hsl(var(--leaf))" : pct >= 60 ? "hsl(var(--amber))" : "hsl(var(--coral))";
                return (
                  <div key={topic}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{topic}</span>
                      <span className="font-semibold text-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bloom performance */}
        {Object.keys(bloomBreakdown).length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
            <p className="font-display font-semibold text-sm text-foreground mb-4">Bloom's Taxonomy</p>
            <div className="flex gap-2 flex-wrap font-body">
              {Object.entries(bloomBreakdown).map(([level, data]) => {
                const pct = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={level} className="flex-1 min-w-[80px] stat-card">
                    <p className="text-xs font-semibold capitalize" style={{ color: "hsl(var(--grape))" }}>{level}</p>
                    <p className="stat-num" style={{ color: "hsl(var(--foreground))" }}>{pct}%</p>
                    <p className="stat-label">{data.correct}/{data.total}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Question review */}
        <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
          <p className="font-display font-semibold text-sm text-foreground mb-4">Question Review</p>
          <div className="space-y-2.5 font-body">
            {results.map((r, i) => {
              const rq = questions.find((qq) => qq.id === r.questionId)!;
              return (
                <div key={r.questionId} className="flex items-start gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: r.correct ? "hsl(var(--leaf))" : "hsl(var(--coral))" }}
                  >
                    {r.correct ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">Q{i + 1}: {rq.text}</p>
                    {r.usedReveal && (
                      <span className="text-xs" style={{ color: "hsl(var(--amber))" }}>
                        <Eye size={10} className="inline mr-1" />used reveal
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock size={10} /> {r.timeTaken}s
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pb-4 font-body">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
            style={{ background: "hsl(var(--grape))", boxShadow: "0 4px 14px hsl(var(--grape) / 0.25)" }}
          >
            <RotateCcw size={16} /> Try Again
          </button>
          <button
            onClick={() => onComplete(correct, results.length)}
            className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
            style={{ background: "#fff", border: "1.5px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          >
            <ArrowRight size={16} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
