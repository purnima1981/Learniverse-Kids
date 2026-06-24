import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, ChevronRight, Timer, Check, Clock, Zap, ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";
import type { Question } from "@shared/schema";

const BLOOM_COLORS: Record<string, string> = {
  remember: "hsl(var(--info))", understand: "hsl(var(--secondary))", apply: "hsl(var(--primary))",
  analyze: "hsl(var(--accent))", evaluate: "hsl(var(--warning))", create: "hsl(var(--kid-pink))",
};

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-5 py-12 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
          <BookOpen size={24} className="text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground">No questions available yet</p>
        <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
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

  const q = questions[current];
  const options = (q.options as { choices?: string[] })?.choices ?? [];
  const correctIndex = ["a","b","c","d"].indexOf(q.answer as string);

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
      isCorrect, timeTaken, attempts: 1, hintsUsed: 0,
      difficulty: q.difficulty ?? "medium",
      bloomLevel: q.bloomLevel ?? "understand",
    });

    const newResults = [...results, {
      questionId: q.id, selected: chosenOption, correct: isCorrect,
      timeTaken, topic: q.topic ?? "", bloomLevel: q.bloomLevel ?? "understand",
    }];

    if (current + 1 < questions.length) {
      setResults(newResults);
      setCurrent(current + 1);
      setSelected(null);
      setConfirmed(false);
      setTimeLeft(60);
      setQuestionStartTime(Date.now());
    } else {
      const score = newResults.filter(r => r.correct).length;
      setResults(newResults);
      setFinished(true);
      completeSession.mutate({ score, totalQuestions: questions.length });
    }
  }, [current, q, questionStartTime, questions, results, correctIndex]);

  // Timer
  useEffect(() => {
    if (confirmed || finished) return;
    if (timeLeft <= 0) { handleNext(selected); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, confirmed, finished, selected, handleNext]);

  // ─── Results Screen ─────────────────────────────────────────────────────

  if (finished) {
    return <ResultsScreen results={results} questions={questions} onRetry={() => {
      setResults([]); setCurrent(0); setSelected(null); setConfirmed(false);
      setTimeLeft(60); setQuestionStartTime(Date.now()); setFinished(false);
      startSession.mutate();
    }} onComplete={onComplete} />;
  }

  // ─── Question UI ────────────────────────────────────────────────────────

  const pct = (timeLeft / 60) * 100;
  const timerUrgency = pct > 50 ? "text-secondary bg-secondary/10" : pct > 25 ? "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10" : "text-destructive bg-destructive/10";

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-in">
      {/* Top bar */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => onComplete(results.filter(r => r.correct).length, results.length)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Exit practice"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium">Question {current + 1} of {questions.length}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all duration-300"
              style={{ width: `${((current + (confirmed ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm tabular-nums ${timerUrgency}`}>
          <Timer size={14} />
          {timeLeft}s
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-5 gap-4">
        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          {q.topic && <Badge variant="outline" className="text-xs">{q.topic}</Badge>}
          <Badge variant="secondary" className="text-xs capitalize">{q.bloomLevel ?? "understand"}</Badge>
          <Badge variant="outline" className="text-xs capitalize">{q.difficulty ?? "medium"}</Badge>
        </div>

        {/* Question */}
        <Card className="shadow-soft">
          <CardContent className="p-5">
            <p className="text-base font-medium text-foreground leading-relaxed">
              <MathRenderer text={q.text} />
            </p>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="space-y-2.5 flex-1">
          {options.map((opt, i) => {
            let optState: "default" | "selected" | "correct" | "wrong" = "default";
            if (confirmed) {
              if (i === correctIndex) optState = "correct";
              else if (i === selected && selected !== correctIndex) optState = "wrong";
            } else if (i === selected) {
              optState = "selected";
            }

            const styles = {
              default: "bg-white border-border hover:border-primary/40 hover:bg-primary/5",
              selected: "bg-primary/5 border-primary",
              correct: "bg-secondary/5 border-secondary",
              wrong: "bg-destructive/5 border-destructive",
            }[optState];

            const letterStyles = {
              default: "bg-muted text-muted-foreground",
              selected: "bg-primary text-white",
              correct: "bg-secondary text-white",
              wrong: "bg-destructive text-white",
            }[optState];

            return (
              <button
                key={i} disabled={confirmed} onClick={() => setSelected(i)}
                className={`w-full flex items-center gap-3 border-2 rounded-xl px-4 py-3 text-left transition-all ${styles}`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${letterStyles}`}>
                  {["A","B","C","D"][i]}
                </span>
                <span className="font-medium text-sm text-foreground flex-1"><MathRenderer text={opt} /></span>
                {optState === "correct" && <Check size={16} className="text-secondary shrink-0" />}
                {optState === "wrong" && <X size={16} className="text-destructive shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Action button */}
        <div>
          {!confirmed ? (
            <Button
              onClick={() => { if (selected !== null) setConfirmed(true); }}
              disabled={selected === null}
              className="w-full h-12 bg-gradient-primary shadow-primary text-base"
            >
              Confirm Answer
            </Button>
          ) : (
            <Button
              onClick={() => handleNext(selected)}
              className="w-full h-12 text-base"
              variant="default"
            >
              {current + 1 < questions.length ? "Next Question" : "See Results"}
              <ChevronRight size={18} className="ml-1" />
            </Button>
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
    <div className="min-h-screen bg-background animate-slide-up">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Score hero */}
        <div className="rounded-2xl p-6 text-center text-white bg-gradient-primary shadow-primary">
          <div className="text-5xl font-extrabold mb-1">{score}%</div>
          <p className="text-white/70 text-sm">{correct} / {results.length} correct</p>
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { label: "Total Time", value: formatTime(totalTime) },
              { label: "Avg / Q", value: formatTime(avgTime) },
              { label: "Accuracy", value: `${score}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 rounded-lg py-2 px-1">
                <p className="text-xs text-white/60">{label}</p>
                <p className="font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Topic breakdown */}
        {Object.keys(topicBreakdown).length > 0 && (
          <Card className="shadow-soft">
            <CardContent className="p-5">
              <p className="font-semibold text-sm text-foreground mb-4">Topic Breakdown</p>
              <div className="space-y-3">
                {Object.entries(topicBreakdown).map(([topic, data]) => {
                  const pct = Math.round((data.correct / data.total) * 100);
                  const barColor = pct >= 80 ? "bg-secondary" : pct >= 60 ? "bg-[hsl(var(--warning))]" : "bg-destructive";
                  return (
                    <div key={topic}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-foreground">{topic}</span>
                        <span className="font-bold text-foreground">{pct}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bloom performance */}
        {Object.keys(bloomBreakdown).length > 0 && (
          <Card className="shadow-soft">
            <CardContent className="p-5">
              <p className="font-semibold text-sm text-foreground mb-4">Bloom's Taxonomy</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(bloomBreakdown).map(([level, data]) => {
                  const pct = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={level} className="flex-1 min-w-[80px] rounded-lg p-3 text-center bg-muted/50">
                      <p className="text-xs font-semibold capitalize" style={{ color: BLOOM_COLORS[level] }}>{level}</p>
                      <p className="text-lg font-bold text-foreground">{pct}%</p>
                      <p className="text-xs text-muted-foreground">{data.correct}/{data.total}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question review */}
        <Card className="shadow-soft">
          <CardContent className="p-5">
            <p className="font-semibold text-sm text-foreground mb-4">Question Review</p>
            <div className="space-y-2.5">
              {results.map((r, i) => {
                const rq = questions.find((qq) => qq.id === r.questionId)!;
                return (
                  <div key={r.questionId} className="flex items-start gap-2.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      r.correct ? "bg-secondary" : "bg-destructive"
                    }`}>
                      {r.correct ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">Q{i + 1}: {rq.text}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock size={10} /> {r.timeTaken}s
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <Button onClick={onRetry} className="bg-gradient-primary shadow-primary h-11">
            <RotateCcw size={16} className="mr-1.5" /> Try Again
          </Button>
          <Button variant="outline" onClick={() => onComplete(correct, results.length)} className="h-11">
            <ArrowRight size={16} className="mr-1.5" /> Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
