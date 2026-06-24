import { useQuery } from "@tanstack/react-query";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizQuestion } from "@/components/QuizQuestion";
import { Loader2, Clock, Check, X } from "lucide-react";
import type { Question } from "@shared/schema";

interface TopicQuestionsProps {
  topicId: number;
  profileId: number;
  difficulty?: string;
  onComplete: (score: number, total: number) => void;
}

export function TopicQuestions({ topicId, profileId, difficulty, onComplete }: TopicQuestionsProps) {
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: [`/api/topics/${topicId}/questions`, difficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (difficulty) params.set("difficulty", difficulty);
      const res = await fetch(`/api/topics/${topicId}/questions?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load questions");
      return res.json();
    },
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (questions.length === 0) return <div className="bg-card rounded-2xl border p-12 text-center"><p className="font-bold">No questions available yet</p></div>;

  return <QuizContent questions={questions} profileId={profileId} topicId={topicId} onComplete={onComplete} />;
}

function QuizContent({ questions, profileId, topicId, onComplete }: {
  questions: Question[]; profileId: number; topicId: number; onComplete: (score: number, total: number) => void;
}) {
  const quiz = useQuiz(questions, profileId, topicId, onComplete);

  if (!quiz.sessionId && !quiz.startQuiz.isPending) {
    quiz.startQuiz.mutate();
    return <div className="flex items-center justify-center py-16 gap-3"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="text-muted-foreground">Loading...</span></div>;
  }

  // Results screen
  if (quiz.quizComplete) {
    const accuracy = Math.round((quiz.score / quiz.totalQuestions) * 100);
    return (
      <div className="bg-card rounded-2xl border p-8 text-center">
        <h2 className="text-2xl font-black text-foreground mb-2">Practice Complete</h2>
        <p className="text-muted-foreground mb-6">
          {accuracy >= 80 ? "Excellent work!" : accuracy >= 50 ? "Good effort, keep practicing!" : "Review the topics and try again."}
        </p>
        <div className="flex justify-center gap-8 mb-8">
          <div><p className="text-3xl font-black text-primary">{quiz.score}/{quiz.totalQuestions}</p><p className="text-xs text-muted-foreground">Score</p></div>
          <div><p className="text-3xl font-black text-foreground">{accuracy}%</p><p className="text-xs text-muted-foreground">Accuracy</p></div>
          <div><p className="text-3xl font-black text-foreground">{Math.floor(quiz.elapsed / 60)}:{String(quiz.elapsed % 60).padStart(2, "0")}</p><p className="text-xs text-muted-foreground">Time</p></div>
        </div>
        <button onClick={() => onComplete(quiz.score, quiz.totalQuestions)}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:opacity-90">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!quiz.currentQuestion) return null;
  const state = quiz.getState(quiz.currentQuestion.id);
  const timePercent = (quiz.questionTimeLeft / quiz.questionTimeLimit) * 100;
  const timeWarning = quiz.questionTimeLeft <= 10;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">
          Question {quiz.currentIndex + 1} of {quiz.totalQuestions}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {quiz.score} correct
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.floor(quiz.elapsed / 60)}:{String(quiz.elapsed % 60).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1">
        {questions.map((q, i) => {
          const s = quiz.getState(q.id);
          return (
            <div key={q.id} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i === quiz.currentIndex ? "bg-primary" :
              s.answered ? (s.isCorrect ? "bg-green-500" : "bg-red-400") : "bg-muted"
            }`} />
          );
        })}
      </div>

      {/* Per-question timer */}
      <div className="relative">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${timeWarning ? "bg-red-500" : "bg-primary"}`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
        <div className={`absolute right-0 -top-6 flex items-center gap-1 text-sm font-bold ${timeWarning ? "text-red-500" : "text-muted-foreground"}`}>
          <Clock size={14} />
          {quiz.questionTimeLeft}s
        </div>
      </div>

      {/* Question */}
      <div className="bg-card rounded-2xl border p-6">
        <QuizQuestion
          question={quiz.currentQuestion}
          hintsUsed={state.hintsUsed}
          answered={state.answered}
          isCorrect={state.isCorrect}
          onSubmit={(answer, isCorrect) => quiz.submitAnswer(quiz.currentQuestion!.id, answer, isCorrect)}
          onRequestHint={() => quiz.requestHint(quiz.currentQuestion!.id)}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={quiz.prevQuestion} disabled={quiz.currentIndex === 0}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-30">
          Previous
        </button>
        {quiz.currentIndex === quiz.totalQuestions - 1 ? (
          <button onClick={quiz.finishQuiz} disabled={!state.answered}
            className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50">
            Finish
          </button>
        ) : (
          <button onClick={quiz.nextQuestion} disabled={!state.answered}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50">
            Next
          </button>
        )}
      </div>
    </div>
  );
}
