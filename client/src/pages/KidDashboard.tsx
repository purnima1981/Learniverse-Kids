import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { TopicQuestions } from "@/components/TopicQuestions";
import type { Topic, TopicProgress } from "@shared/schema";

const CATEGORY_EMOJI: Record<string, string> = {
  arithmetic: "🔢",
  algebra: "📐",
  geometry: "📏",
  "number-theory": "🧮",
  combinatorics: "🎲",
  "logical-reasoning": "🧠",
  "data-handling": "📊",
};

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  easy: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Easy" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium" },
  hard: { bg: "bg-orange-100", text: "text-orange-700", label: "Hard" },
  olympiad: { bg: "bg-red-100", text: "text-red-700", label: "Olympiad" },
};

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

  const totalCorrect = progressList.reduce((sum, p) => sum + (p.questionsCorrect ?? 0), 0);
  const totalAttempted = progressList.reduce((sum, p) => sum + (p.questionsAttempted ?? 0), 0);
  const totalSessions = progressList.reduce((sum, p) => sum + (p.totalSessions ?? 0), 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  function startPractice() {
    if (topicList.length === 0) return;
    const randomTopic = topicList[Math.floor(Math.random() * topicList.length)];
    setSelectedTopicId(randomTopic.id);
    setPracticeMode(true);
  }

  function handleComplete() {
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

  if (practiceMode && selectedTopicId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="ghost" onClick={() => { setPracticeMode(false); setSelectedTopicId(null); }} className="mb-4">
          ← Back to Dashboard
        </Button>
        <TopicQuestions
          topicId={selectedTopicId}
          profileId={activeProfile?.id ?? 0}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  // Group by category
  const grouped = topicList.reduce<Record<string, Topic[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  const progressMap = new Map(progressList.map((p) => [p.topicId, p]));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-hero-pattern animate-gradient p-8 text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium mb-1">Grade {activeProfile?.grade}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              Hey {activeProfile?.name}! 👋
            </h1>
            <p className="text-white/80 text-lg mb-6">
              Ready to solve some awesome math problems?
            </p>
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-bold bg-white text-primary hover:bg-white/90 shadow-lg animate-pulse-ring"
              onClick={startPractice}
              disabled={topicList.length === 0}
            >
              🚀 Start Practice
            </Button>
          </div>

          {/* Stats circles */}
          <div className="flex gap-4 md:gap-6">
            <StatCircle value={totalSessions} label="Sessions" color="bg-white/20" />
            <StatCircle value={totalAttempted} label="Solved" color="bg-white/20" />
            <StatCircle value={`${overallAccuracy}%`} label="Accuracy" color="bg-white/20" />
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 text-[150px] opacity-10 select-none">🧮</div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <QuickStat emoji="🔥" value={totalSessions} label="Sessions" />
        <QuickStat emoji="✅" value={totalCorrect} label="Correct" />
        <QuickStat emoji="📝" value={totalAttempted} label="Attempted" />
        <QuickStat emoji="🎯" value={`${overallAccuracy}%`} label="Accuracy" />
      </div>

      {/* Topics by Category */}
      {topicList.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl font-semibold">No topics for Grade {activeProfile?.grade} yet</p>
            <p className="text-muted-foreground mt-2">Check back soon for new practice problems!</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([category, topics]) => {
          const emoji = CATEGORY_EMOJI[category] || "📐";
          const label = category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          return (
            <div key={category} className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                {label}
                <Badge variant="secondary" className="ml-1 font-normal">{topics.length}</Badge>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic) => {
                  const prog = progressMap.get(topic.id);
                  const attempted = prog?.questionsAttempted ?? 0;
                  const correct = prog?.questionsCorrect ?? 0;
                  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
                  const diff = DIFFICULTY_STYLE[topic.difficulty] ?? DIFFICULTY_STYLE.medium;

                  return (
                    <Card
                      key={topic.id}
                      className="card-hover cursor-pointer border-0 shadow-md hover:shadow-xl"
                      onClick={() => { setSelectedTopicId(topic.id); setPracticeMode(true); }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-2xl">{emoji}</span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${diff.bg} ${diff.text}`}>
                            {diff.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm mb-1">{topic.title}</h3>
                        {topic.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{topic.description}</p>
                        )}
                        {attempted > 0 ? (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{correct}/{attempted} correct</span>
                              <span className="font-bold text-primary">{accuracy}%</span>
                            </div>
                            <Progress value={accuracy} className="h-2" />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                            <span>✨</span> Not started yet — give it a try!
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function StatCircle({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-4 text-center min-w-[80px] backdrop-blur-sm`}>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

function QuickStat({ emoji, value, label }: { emoji: string; value: string | number; label: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <div className="text-lg font-extrabold leading-tight">{value}</div>
          <div className="text-[11px] text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
