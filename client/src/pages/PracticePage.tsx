import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { TopicQuestions } from "@/components/TopicQuestions";
import {
  ArrowLeft,
  Loader2,
  Calculator,
  Zap,
  Target,
  Brain,
} from "lucide-react";
import type { Topic } from "@shared/schema";

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All Levels", icon: <Target className="h-4 w-4" />, desc: "Mix of all difficulty levels" },
  { value: "easy", label: "Easy", icon: <Zap className="h-4 w-4" />, desc: "Build your foundation" },
  { value: "medium", label: "Medium", icon: <Calculator className="h-4 w-4" />, desc: "Strengthen core skills" },
  { value: "hard", label: "Hard", icon: <Brain className="h-4 w-4" />, desc: "Challenge yourself" },
  { value: "olympiad", label: "Olympiad", icon: <Brain className="h-4 w-4" />, desc: "Competition-level problems" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "border-green-500/50 bg-green-500/5 hover:bg-green-500/10",
  medium: "border-yellow-500/50 bg-yellow-500/5 hover:bg-yellow-500/10",
  hard: "border-orange-500/50 bg-orange-500/5 hover:bg-orange-500/10",
  olympiad: "border-red-500/50 bg-red-500/5 hover:bg-red-500/10",
  all: "border-primary/50 bg-primary/5 hover:bg-primary/10",
};

export default function PracticePage() {
  const params = useParams<{ topicId: string }>();
  const topicId = Number(params.topicId);
  const { activeProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [practicing, setPracticing] = useState(false);

  const { data: topic, isLoading } = useQuery<Topic>({
    queryKey: [`/api/topics/${topicId}`],
    queryFn: async () => {
      const res = await fetch(`/api/topics/${topicId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load topic");
      return res.json();
    },
  });

  const updateProgress = useMutation({
    mutationFn: async (data: {
      childProfileId: number;
      topicId: number;
      questionsAttempted: number;
      questionsCorrect: number;
      bestScore: number;
      totalSessions: number;
    }) => {
      await apiRequest("POST", "/api/progress/update", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/progress/${activeProfile?.id}`],
      });
    },
  });

  function handleQuizComplete(score: number, total: number) {
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

    toast({
      title: `Practice Complete! ${score}/${total}`,
      description: accuracy >= 80
        ? "Excellent work! You're mastering this topic!"
        : accuracy >= 50
        ? "Good effort! Keep practicing to improve."
        : "Don't give up! Review the explanations and try again.",
    });

    if (activeProfile) {
      updateProgress.mutate({
        childProfileId: activeProfile.id,
        topicId,
        questionsAttempted: total,
        questionsCorrect: score,
        bestScore: score,
        totalSessions: 1,
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-muted-foreground">Topic not found</p>
        <Button className="mt-4" onClick={() => setLocation("/kid-dashboard")}>
          Back to Topics
        </Button>
      </div>
    );
  }

  // Practice mode — show questions
  if (practicing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="ghost" onClick={() => setPracticing(false)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Topic
        </Button>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{topic.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{topic.category}</Badge>
            {selectedDifficulty && selectedDifficulty !== "all" && (
              <Badge variant="secondary">{selectedDifficulty}</Badge>
            )}
          </div>
        </div>
        <TopicQuestions
          topicId={topicId}
          profileId={activeProfile?.id ?? 0}
          difficulty={selectedDifficulty === "all" ? undefined : selectedDifficulty ?? undefined}
          onComplete={handleQuizComplete}
        />
      </div>
    );
  }

  // Topic overview — select difficulty
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => setLocation("/kid-dashboard")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Topics
      </Button>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{topic.title}</h1>
            <p className="text-muted-foreground">{topic.description}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className="capitalize">{topic.category}</Badge>
          <Badge variant="secondary">Grade {topic.gradeLevel}</Badge>
          <Badge variant="secondary">{topic.totalQuestions} questions</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Choose Difficulty Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedDifficulty(opt.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                selectedDifficulty === opt.value
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : DIFFICULTY_COLORS[opt.value] ?? "border-border"
              }`}
            >
              <div className="p-2 rounded-lg bg-background border">{opt.icon}</div>
              <div className="flex-1">
                <p className="font-semibold">{opt.label}</p>
                <p className="text-sm text-muted-foreground">{opt.desc}</p>
              </div>
              {selectedDifficulty === opt.value && (
                <div className="h-3 w-3 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full text-lg h-14"
        disabled={!selectedDifficulty}
        onClick={() => setPracticing(true)}
      >
        Start Practice
      </Button>
    </div>
  );
}
