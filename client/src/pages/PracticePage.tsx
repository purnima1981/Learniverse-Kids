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
  ArrowLeft, Loader2, Calculator, Zap, Target, Brain, CheckCircle2,
} from "lucide-react";
import type { Topic } from "@shared/schema";

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All Levels", icon: Target, desc: "Mix of all difficulty levels", color: "primary" },
  { value: "easy", label: "Easy", icon: Zap, desc: "Build your foundation", color: "secondary" },
  { value: "medium", label: "Medium", icon: Calculator, desc: "Strengthen core skills", color: "warning" },
  { value: "hard", label: "Hard", icon: Brain, desc: "Challenge yourself", color: "accent" },
  { value: "olympiad", label: "Olympiad", icon: Brain, desc: "Competition-level problems", color: "destructive" },
];

const COLOR_MAP: Record<string, string> = {
  primary: "border-primary/30 bg-primary/5 hover:bg-primary/10",
  secondary: "border-secondary/30 bg-secondary/5 hover:bg-secondary/10",
  warning: "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 hover:bg-[hsl(var(--warning))]/10",
  accent: "border-accent/30 bg-accent/5 hover:bg-accent/10",
  destructive: "border-destructive/30 bg-destructive/5 hover:bg-destructive/10",
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
      childProfileId: number; topicId: number;
      questionsAttempted: number; questionsCorrect: number;
      bestScore: number; totalSessions: number;
    }) => {
      await apiRequest("POST", "/api/progress/update", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${activeProfile?.id}`] });
    },
  });

  function handleQuizComplete(score: number, total: number) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    toast({
      title: `Practice Complete! ${score}/${total}`,
      description: pct >= 80 ? "Excellent work!" : pct >= 50 ? "Good effort! Keep practicing." : "Don't give up! Review and try again.",
    });
    if (activeProfile) {
      updateProgress.mutate({
        childProfileId: activeProfile.id, topicId,
        questionsAttempted: total, questionsCorrect: score,
        bestScore: score, totalSessions: 1,
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
      <div className="max-w-3xl mx-auto p-6 text-center animate-fade-in">
        <p className="text-muted-foreground mb-4">Topic not found</p>
        <Button onClick={() => setLocation("/kid-dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  if (practicing) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-6 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">{topic.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{topic.category}</Badge>
            {selectedDifficulty && selectedDifficulty !== "all" && (
              <Badge variant="secondary" className="capitalize">{selectedDifficulty}</Badge>
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

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6 animate-slide-up">
      {/* Topic info */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl shrink-0" style={{ background: "hsl(var(--grape))" }}>
          <Calculator className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{topic.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{topic.description}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="capitalize">{topic.category}</Badge>
            <Badge variant="secondary">Grade {topic.gradeLevel}</Badge>
            <Badge variant="secondary">{topic.totalQuestions} questions</Badge>
          </div>
        </div>
      </div>

      {/* Difficulty selector */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Choose Difficulty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DIFFICULTY_OPTIONS.map((opt, i) => {
            const isActive = selectedDifficulty === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedDifficulty(opt.value)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-lg border-2 transition-all text-left ${
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : COLOR_MAP[opt.color] ?? "border-border"
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? "bg-primary/10" : "bg-muted"}`}>
                  <Icon size={18} className={isActive ? "text-primary" : "text-muted-foreground"} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${isActive ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                {isActive && <CheckCircle2 size={18} className="text-primary" />}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full h-12 bg-gradient-primary shadow-primary text-base"
        disabled={!selectedDifficulty}
        onClick={() => setPracticing(true)}
      >
        Start Practice
      </Button>
    </div>
  );
}
