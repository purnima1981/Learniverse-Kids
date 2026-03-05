import { useQuery } from "@tanstack/react-query";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizQuestion } from "@/components/QuizQuestion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Trophy,
  Target,
  Lightbulb,
} from "lucide-react";
import type { Question } from "@shared/schema";

interface ChapterQuestionsProps {
  chapterId: number;
  profileId: number;
  onComplete: (score: number, total: number) => void;
}

export function ChapterQuestions({
  chapterId,
  profileId,
  onComplete,
}: ChapterQuestionsProps) {
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: [`/api/chapters/${chapterId}/questions`],
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
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No questions available for this chapter yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <QuizContent
      questions={questions}
      profileId={profileId}
      chapterId={chapterId}
      onComplete={onComplete}
    />
  );
}

function QuizContent({
  questions,
  profileId,
  chapterId,
  onComplete,
}: {
  questions: Question[];
  profileId: number;
  chapterId: number;
  onComplete: (score: number, total: number) => void;
}) {
  const quiz = useQuiz(questions, profileId, chapterId, onComplete);

  // Start quiz on mount
  if (!quiz.sessionId && !quiz.startQuiz.isPending) {
    quiz.startQuiz.mutate();
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Starting quiz...</span>
      </div>
    );
  }

  if (quiz.quizComplete) {
    const accuracy = Math.round((quiz.score / quiz.totalQuestions) * 100);
    return (
      <Card>
        <CardHeader className="text-center">
          <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-card border">
              <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{quiz.score}/{quiz.totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">
                {Math.floor(quiz.elapsed / 60)}:{String(quiz.elapsed % 60).padStart(2, "0")}
              </p>
              <p className="text-sm text-muted-foreground">Time</p>
            </div>
          </div>

          <div className="text-center">
            {accuracy === 100 ? (
              <p className="text-lg text-green-400">Perfect score! You've mastered this chapter!</p>
            ) : accuracy >= 70 ? (
              <p className="text-lg text-blue-400">Great work! You're understanding the key concepts.</p>
            ) : accuracy >= 50 ? (
              <p className="text-lg text-yellow-400">Good effort! Try reviewing the chapter for better results.</p>
            ) : (
              <p className="text-lg text-orange-400">Keep practicing! Re-read the chapter and try again.</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quiz.currentQuestion) return null;

  const state = quiz.getState(quiz.currentQuestion.id);
  const progressPct = ((quiz.currentIndex + 1) / quiz.totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>
            Question {quiz.currentIndex + 1} of {quiz.totalQuestions}
          </span>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              <Target className="h-3 w-3 mr-1" />
              {quiz.score} correct
            </Badge>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {Math.floor(quiz.elapsed / 60)}:{String(quiz.elapsed % 60).padStart(2, "0")}
            </span>
          </div>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      {/* Question */}
      <Card>
        <CardContent className="p-6">
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
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous
        </Button>

        {quiz.currentIndex === quiz.totalQuestions - 1 ? (
          <Button onClick={quiz.finishQuiz} disabled={!state.answered}>
            Finish Quiz <Trophy className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={quiz.nextQuestion} disabled={!state.answered}>
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
