import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Brain,
  Loader2,
  Trophy,
  Target,
  Flame,
  Clock,
  Play,
  ChevronRight,
} from "lucide-react";
import { TopicQuestions } from "@/components/TopicQuestions";
import type { Topic, TopicProgress } from "@shared/schema";

export default function KidDashboard() {
  const { activeProfile } = useAuth();
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  const { data: topicList = [], isLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics", activeProfile?.grade],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeProfile?.grade) params.set("grade", String(activeProfile.grade));
      const res = await fetch(`/api/topics?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load topics");
      return res.json();
    },
  });

  const { data: progressList = [] } = useQuery<TopicProgress[]>({
    queryKey: [`/api/progress/${activeProfile?.id}`],
    queryFn: async () => {
      const res = await fetch(`/api/progress/${activeProfile?.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load progress");
      return res.json();
    },
    enabled: !!activeProfile?.id,
  });

  // Stats
  const totalCorrect = progressList.reduce((sum, p) => sum + (p.questionsCorrect ?? 0), 0);
  const totalAttempted = progressList.reduce((sum, p) => sum + (p.questionsAttempted ?? 0), 0);
  const totalSessions = progressList.reduce((sum, p) => sum + (p.totalSessions ?? 0), 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Pick a random topic for practice
  function startPractice() {
    if (topicList.length === 0) return;
    const randomTopic = topicList[Math.floor(Math.random() * topicList.length)];
    setSelectedTopicId(randomTopic.id);
    setPracticeMode(true);
  }

  function handleComplete(score: number, total: number) {
    setPracticeMode(false);
    setSelectedTopicId(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Practice mode — show questions with timer
  if (practiceMode && selectedTopicId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="ghost" onClick={() => { setPracticeMode(false); setSelectedTopicId(null); }} className="mb-4">
          Back to Dashboard
        </Button>
        <TopicQuestions
          topicId={selectedTopicId}
          profileId={activeProfile?.id ?? 0}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border p-8">
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground mb-1">Grade {activeProfile?.grade}</p>
          <h1 className="text-3xl font-bold">
            Hey {activeProfile?.name}, ready to practice?
          </h1>
          <p className="text-muted-foreground mt-2 mb-6">
            Each session gives you 10-15 questions with a timer. Let's go!
          </p>
          <Button size="lg" className="text-lg h-14 px-8" onClick={startPractice} disabled={topicList.length === 0}>
            <Play className="h-5 w-5 mr-2" /> Start Practice
          </Button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Calculator className="h-40 w-40" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="Sessions" value={totalSessions} />
        <StatCard icon={<Target className="h-5 w-5 text-blue-500" />} label="Questions Solved" value={totalAttempted} />
        <StatCard icon={<Trophy className="h-5 w-5 text-yellow-500" />} label="Correct" value={totalCorrect} />
        <StatCard icon={<Brain className="h-5 w-5 text-purple-500" />} label="Accuracy" value={`${overallAccuracy}%`} />
      </div>

      {/* Recent Topics */}
      {topicList.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Topics</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {topicList.slice(0, 8).map((topic) => {
              const progress = progressList.find((p) => p.topicId === topic.id);
              const attempted = progress?.questionsAttempted ?? 0;
              const correct = progress?.questionsCorrect ?? 0;
              const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

              return (
                <Card
                  key={topic.id}
                  className="cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => { setSelectedTopicId(topic.id); setPracticeMode(true); }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{topic.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">{topic.difficulty}</Badge>
                        <Badge variant="secondary" className="text-xs capitalize">{topic.category}</Badge>
                      </div>
                    </div>
                    {attempted > 0 ? (
                      <div className="text-right">
                        <p className="text-sm font-bold">{accuracy}%</p>
                        <p className="text-xs text-muted-foreground">{correct}/{attempted}</p>
                      </div>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {topicList.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No topics available for Grade {activeProfile?.grade} yet</p>
            <p className="text-muted-foreground">Check back soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="p-2.5 rounded-lg bg-card border">{icon}</div>
        <div>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
