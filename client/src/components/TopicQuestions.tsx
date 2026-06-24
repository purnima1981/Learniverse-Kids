import { useQuery } from "@tanstack/react-query";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizQuestion } from "@/components/QuizQuestion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { Question } from "@shared/schema";

interface TopicQuestionsProps {
  topicId: number;
  profileId: number;
  difficulty?: string;
  onComplete: (score: number, total: number) => void;
}

export function TopicQuestions({
  topicId,
  profileId,
  difficulty,
  onComplete,
}: TopicQuestionsProps) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-16 text-center">
          <Loader2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold">No questions available yet</p>
          <p className="text-muted-foreground mt-1">Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <QuizContent
      questions={questions}
      profileId={profileId}
      topicId={topicId}
      onComplete={onComplete}
    />
  );
}

function QuizContent({
  questions,
  profileId,
  topicId,
  onComplete,
}: {
  questions: Question[];
  profileId: number;
  topicId: number;
  onComplete: (score: number, total: number) => void;
}) {
  const quiz = useQuiz(questions, profileId, topicId, onComplete);

  if (!quiz.sessionId && !quiz.startQuiz.isPending) {
    quiz.startQuiz.mutate();
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-muted-foreground">Loading practice session...</span>
      </div>
    );
  }

  // Completion screen
  if (quiz.quizComplete) {
    const accuracy = Math.round((quiz.score / quiz.totalQuestions) * 100);
    const isPerfect = accuracy === 100;
    const isGreat = accuracy >= 80;
    const isGood = accuracy >= 50;

    return (
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className={`h-2 ${isPerfect ? "bg-amber-400" : isGreat ? "bg-emerald-500" : isGood ? "bg-blue-500" : "bg-orange-500"}`} />
        <CardContent className="py-12 text-center">
          <div className="text-4xl font-extrabold mb-4 animate-bounce-in text-primary">
            {isPerfect ? "Perfect!" : isGreat ? "Great!" : isGood ? "Nice!" : "Keep going!"}
          </div>
          <h2 className="text-2xl font-bold mb-6">Practice Complete</h2>

          <div className="flex justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-primary">{quiz.score}/{quiz.totalQuestions}</div>
              <div className="text-sm text-muted-foreground mt-1">Score</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-4xl font-extrabold text-emerald-600">{accuracy}%</div>
              <div className="text-sm text-muted-foreground mt-1">Accuracy</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-4xl font-extrabold text-blue-600">
                {Math.floor(quiz.elapsed / 60)}:{String(quiz.elapsed % 60).padStart(2, "0")}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Time</div>
            </div>
          </div>

          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {isPerfect
              ? "You nailed every single question! You're ready for competition!"
              : isGreat
              ? "Outstanding performance! A few more sessions and you'll be unstoppable."
              : isGood
              ? "You're making progress! Review the explanations and try again."
              : "Every champion starts somewhere. Focus on the explanations and you'll improve!"}
          </p>

          <Button
            onClick={() => onComplete(quiz.score, quiz.totalQuestions)}
            size="lg"
            className="h-12 px-8 text-base font-bold"
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!quiz.currentQuestion) return null;

  const state = quiz.getState(quiz.currentQuestion.id);
  const progressPct = ((quiz.currentIndex + 1) / quiz.totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white rounded-2xl border shadow-sm p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold">
            Question {quiz.currentIndex + 1} of {quiz.totalQuestions}
          </span>
          <div className="flex items-center gap-4">
            <Badge className="bg-emerald-100 text-emerald-700 border-0 font-semibold">
              {quiz.score} correct
            </Badge>
            <span className="font-mono text-muted-foreground font-medium">
              {Math.floor(quiz.elapsed / 60)}:{String(quiz.elapsed % 60).padStart(2, "0")}
            </span>
          </div>
        </div>
        <Progress value={progressPct} className="h-2.5" />
      </div>

      {/* Question Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <QuizQuestion
            question={quiz.currentQuestion}
            hintsUsed={state.hintsUsed}
            answered={state.answered}
            isCorrect={state.isCorrect}
            onSubmit={(answer, isCorrect) =>
              quiz.submitAnswer(quiz.currentQuestion!.id, answer, isCorrect)
            }
            onRequestHint={() => quiz.requestHint(quiz.currentQuestion!.id)}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={quiz.prevQuestion}
          disabled={quiz.currentIndex === 0}
          className="h-11 font-medium"
        >
          ← Previous
        </Button>

        {quiz.currentIndex === quiz.totalQuestions - 1 ? (
          <Button onClick={quiz.finishQuiz} disabled={!state.answered} className="h-11 font-bold bg-emerald-600 hover:bg-emerald-700">
            Finish Practice
          </Button>
        ) : (
          <Button onClick={quiz.nextQuestion} disabled={!state.answered} className="h-11 font-medium">
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}
