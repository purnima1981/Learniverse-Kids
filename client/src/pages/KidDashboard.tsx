import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Calculator, ChevronRight } from "lucide-react";
import { TopicQuestions } from "@/components/TopicQuestions";
import type { Topic, TopicProgress } from "@shared/schema";

export default function KidDashboard() {
  const { activeProfile } = useAuth();
  const [practiceTopicId, setPracticeTopicId] = useState<number | null>(null);

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
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!activeProfile?.id,
  });

  const totalCorrect = progressList.reduce((s, p) => s + (p.questionsCorrect ?? 0), 0);
  const totalAttempted = progressList.reduce((s, p) => s + (p.questionsAttempted ?? 0), 0);
  const totalSessions = progressList.reduce((s, p) => s + (p.totalSessions ?? 0), 0);
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (practiceTopicId) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={() => setPracticeTopicId(null)} className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
          &larr; Back
        </button>
        <TopicQuestions topicId={practiceTopicId} profileId={activeProfile?.id ?? 0} onComplete={() => setPracticeTopicId(null)} />
      </div>
    );
  }

  const grouped = topicList.reduce<Record<string, Topic[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});
  const progressMap = new Map(progressList.map((p) => [p.topicId, p]));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Grade {activeProfile?.grade}</p>
        <h1 className="text-2xl font-black text-foreground">Hi {activeProfile?.name}, let's practice!</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Sessions", value: totalSessions },
          { label: "Attempted", value: totalAttempted },
          { label: "Correct", value: totalCorrect },
          { label: "Accuracy", value: `${accuracy}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card rounded-xl border p-3 text-center">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-black text-lg text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick Start */}
      <button
        onClick={() => {
          if (topicList.length === 0) return;
          setPracticeTopicId(topicList[Math.floor(Math.random() * topicList.length)].id);
        }}
        disabled={topicList.length === 0}
        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity mb-8 disabled:opacity-50"
      >
        Start Practice Test
      </button>

      {/* Topics */}
      {Object.entries(grouped).map(([category, topics]) => {
        const label = category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        return (
          <div key={category} className="mb-6">
            <h3 className="font-bold text-foreground mb-3">{label}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {topics.map((topic) => {
                const prog = progressMap.get(topic.id);
                const att = prog?.questionsAttempted ?? 0;
                const cor = prog?.questionsCorrect ?? 0;
                const acc = att > 0 ? Math.round((cor / att) * 100) : 0;
                return (
                  <div
                    key={topic.id}
                    onClick={() => setPracticeTopicId(topic.id)}
                    className="bg-card rounded-2xl border p-4 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Calculator size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{topic.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {att > 0 ? `${cor}/${att} correct · ${acc}%` : topic.difficulty}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {topicList.length === 0 && (
        <div className="bg-card rounded-2xl border p-12 text-center">
          <p className="font-bold text-foreground">No topics for Grade {activeProfile?.grade} yet</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
        </div>
      )}
    </div>
  );
}
