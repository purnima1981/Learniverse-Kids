import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, X, ChevronRight, Timer, Check, Clock, Zap, ArrowRight } from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";
import type { Question } from "@shared/schema";

const BLOOM_COLORS: Record<string, string> = {
  remember: "#06b6d4", understand: "#22c55e", apply: "#f97316", analyze: "#8b5cf6", evaluate: "#f59e0b", create: "#ec4899",
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: color }}>
      {label}
    </span>
  );
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

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#f97316]" /></div>;
  if (questions.length === 0) return <div className="max-w-lg mx-auto px-5 py-12 text-center"><p className="font-bold text-[#1e1a14]">No questions available yet</p></div>;

  return <PracticeTest questions={questions} profileId={profileId} topicId={topicId} onComplete={onComplete} />;
}

// ─── Practice Test (reference design) ────────────────────────────────────────

interface TestResult {
  questionId: number;
  selected: number | null;
  correct: boolean;
  timeTaken: number;
  topic: string;
  bloomLevel: string;
}

function PracticeTest({ questions, profileId, topicId, onComplete }: {
  questions: Question[]; profileId: number; topicId: number; onComplete: (score: number, total: number) => void;
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

  // Start session
  const startSession = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/quiz/start", { childProfileId: profileId, topicId });
      return res.json();
    },
    onSuccess: (data) => setSessionId(data.id),
  });

  useEffect(() => { startSession.mutate(); }, []);

  // Submit response to backend
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

    // Submit to backend
    submitResponse.mutate({
      questionId: q.id,
      userAnswer: chosenOption !== null ? ["a","b","c","d"][chosenOption] : null,
      isCorrect,
      timeTaken,
      attempts: 1,
      hintsUsed: 0,
      difficulty: q.difficulty ?? "medium",
      bloomLevel: q.bloomLevel ?? "understand",
    });

    const newResults = [...results, {
      questionId: q.id,
      selected: chosenOption,
      correct: isCorrect,
      timeTaken,
      topic: q.topic ?? "",
      bloomLevel: q.bloomLevel ?? "understand",
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

  // Timer countdown
  useEffect(() => {
    if (confirmed || finished) return;
    if (timeLeft <= 0) { handleNext(selected); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, confirmed, finished, selected, handleNext]);

  // Results screen
  if (finished) {
    const correct = results.filter(r => r.correct).length;
    const score = Math.round((correct / results.length) * 100);
    const totalTime = results.reduce((a, r) => a + r.timeTaken, 0);
    const avgTime = Math.round(totalTime / results.length);

    const topicBreakdown: Record<string, { correct: number; total: number; time: number }> = {};
    results.forEach((r) => {
      if (!topicBreakdown[r.topic]) topicBreakdown[r.topic] = { correct: 0, total: 0, time: 0 };
      topicBreakdown[r.topic].total++;
      topicBreakdown[r.topic].time += r.timeTaken;
      if (r.correct) topicBreakdown[r.topic].correct++;
    });

    const bloomBreakdown: Record<string, { correct: number; total: number }> = {};
    results.forEach((r) => {
      if (!bloomBreakdown[r.bloomLevel]) bloomBreakdown[r.bloomLevel] = { correct: 0, total: 0 };
      bloomBreakdown[r.bloomLevel].total++;
      if (r.correct) bloomBreakdown[r.bloomLevel].correct++;
    });

    return (
      <div className="min-h-screen bg-[#fdf6ee]">
        <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
          {/* Score hero */}
          <div className="rounded-3xl p-7 text-center text-white" style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
            <div className="text-6xl font-black mb-1">{score}%</div>
            <p className="text-white/80 text-sm">{correct} / {results.length} correct</p>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label: "Total Time", value: formatTime(totalTime) },
                { label: "Avg / Q", value: formatTime(avgTime) },
                { label: "Accuracy", value: `${score}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/20 rounded-xl py-2 px-1">
                  <p className="text-xs text-white/70">{label}</p>
                  <p className="font-black text-base">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Topic breakdown */}
          {Object.keys(topicBreakdown).length > 0 && (
            <div className="bg-white rounded-2xl border border-[rgba(120,90,50,0.1)] p-5">
              <p className="font-black text-sm text-[#1e1a14] mb-4">Topic Breakdown</p>
              <div className="space-y-3">
                {Object.entries(topicBreakdown).map(([topic, data]) => {
                  const pct = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={topic}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#1e1a14]">{topic}</span>
                        <span className="font-bold text-[#1e1a14]">{pct}%</span>
                      </div>
                      <div className="h-2 bg-[#f5ede0] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#dc2626" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bloom performance */}
          {Object.keys(bloomBreakdown).length > 0 && (
            <div className="bg-white rounded-2xl border border-[rgba(120,90,50,0.1)] p-5">
              <p className="font-black text-sm text-[#1e1a14] mb-4">Bloom's Taxonomy Performance</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(bloomBreakdown).map(([level, data]) => {
                  const pct = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={level} className="flex-1 min-w-[80px] rounded-xl p-3 text-center" style={{ backgroundColor: `${BLOOM_COLORS[level] ?? "#f97316"}15` }}>
                      <p className="text-xs font-bold capitalize" style={{ color: BLOOM_COLORS[level] }}>{level}</p>
                      <p className="text-xl font-black text-[#1e1a14]">{pct}%</p>
                      <p className="text-xs text-[#7c6a55]">{data.correct}/{data.total}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question review */}
          <div className="bg-white rounded-2xl border border-[rgba(120,90,50,0.1)] p-5">
            <p className="font-black text-sm text-[#1e1a14] mb-4">Question Review</p>
            <div className="space-y-3">
              {results.map((r, i) => {
                const rq = questions.find((qq) => qq.id === r.questionId)!;
                return (
                  <div key={r.questionId} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: r.correct ? "#22c55e" : "#dc2626" }}>
                      {r.correct ? <Check size={13} className="text-white" /> : <X size={13} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1e1a14] truncate">Q{i + 1}: {rq.text}</p>
                    </div>
                    <span className="text-xs text-[#7c6a55] shrink-0 flex items-center gap-1">
                      <Clock size={10} /> {r.timeTaken}s
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            <button onClick={() => { setResults([]); setCurrent(0); setSelected(null); setConfirmed(false); setTimeLeft(60); setQuestionStartTime(Date.now()); setFinished(false); startSession.mutate(); }}
              className="flex items-center justify-center gap-2 bg-[#f97316] text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-colors">
              <Zap size={16} /> Try Again
            </button>
            <button onClick={() => onComplete(results.filter(r => r.correct).length, results.length)}
              className="flex items-center justify-center gap-2 bg-white text-[#1e1a14] py-3.5 rounded-xl font-bold border border-[rgba(120,90,50,0.15)] hover:bg-orange-50 transition-colors">
              <ArrowRight size={16} /> Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test UI
  const pct = (timeLeft / 60) * 100;
  const timerColor = pct > 50 ? "#22c55e" : pct > 25 ? "#f59e0b" : "#dc2626";

  return (
    <div className="min-h-screen bg-[#fdf6ee] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-[rgba(120,90,50,0.1)] px-5 py-3 flex items-center gap-4">
        <button onClick={() => onComplete(results.filter(r => r.correct).length, results.length)} className="p-1.5 hover:bg-[#f5ede0] rounded-lg transition-colors">
          <X size={16} className="text-[#7c6a55]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-[#7c6a55] mb-1">
            <span className="font-bold">Practice</span>
            <span>{current + 1} / {questions.length}</span>
          </div>
          <div className="h-1.5 bg-[#f5ede0] rounded-full overflow-hidden">
            <div className="h-full bg-[#f97316] rounded-full transition-all" style={{ width: `${(current / questions.length) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-sm tabular-nums" style={{ backgroundColor: `${timerColor}18`, color: timerColor }}>
          <Timer size={14} />
          {timeLeft}s
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-6 gap-5">
        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          {q.topic && <Badge label={q.topic} color="#7c6a55" />}
          <Badge label={q.bloomLevel ?? "understand"} color={BLOOM_COLORS[q.bloomLevel ?? "understand"] ?? "#f97316"} />
          <Badge label={q.difficulty ?? "medium"} color={q.difficulty === "easy" ? "#22c55e" : q.difficulty === "hard" ? "#dc2626" : "#f59e0b"} />
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl border border-[rgba(120,90,50,0.1)] p-6">
          <p className="text-base font-bold text-[#1e1a14] leading-relaxed">
            <MathRenderer text={q.text} />
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 flex-1">
          {options.map((opt, i) => {
            let state: "default" | "selected" | "correct" | "wrong" = "default";
            if (confirmed) {
              if (i === correctIndex) state = "correct";
              else if (i === selected && selected !== correctIndex) state = "wrong";
            } else if (i === selected) {
              state = "selected";
            }

            const cls = {
              default: "bg-white border-[rgba(120,90,50,0.12)] hover:border-[#f97316] hover:bg-orange-50",
              selected: "bg-orange-50 border-[#f97316]",
              correct: "bg-green-50 border-green-500",
              wrong: "bg-red-50 border-red-400",
            }[state];

            return (
              <button key={i} disabled={confirmed} onClick={() => setSelected(i)}
                className={`w-full flex items-center gap-3 border-2 rounded-xl px-4 py-3.5 text-left transition-all ${cls}`}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  style={{
                    backgroundColor: state === "correct" ? "#22c55e" : state === "wrong" ? "#dc2626" : state === "selected" ? "#f97316" : "#f5ede0",
                    color: state !== "default" ? "white" : "#7c6a55",
                  }}>
                  {["A","B","C","D"][i]}
                </span>
                <span className="font-medium text-sm text-[#1e1a14]">{opt}</span>
                {state === "correct" && <Check size={16} className="ml-auto text-green-500 shrink-0" />}
                {state === "wrong" && <X size={16} className="ml-auto text-red-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Action */}
        <div>
          {!confirmed ? (
            <button onClick={() => { if (selected !== null) setConfirmed(true); }} disabled={selected === null}
              className="w-full bg-[#f97316] text-white py-4 rounded-xl font-black hover:bg-orange-600 transition-colors disabled:opacity-40">
              Confirm Answer
            </button>
          ) : (
            <button onClick={() => handleNext(selected)}
              className="w-full bg-[#1e1a14] text-white py-4 rounded-xl font-black hover:bg-[#2d2820] transition-colors flex items-center justify-center gap-2">
              {current + 1 < questions.length ? "Next Question" : "See Results"}
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
