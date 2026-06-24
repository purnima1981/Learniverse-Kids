import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calculator, Loader2, Zap, Check } from "lucide-react";
import { useLocation } from "wouter";
import { TopicQuestions } from "@/components/TopicQuestions";
import type { Topic, TopicProgress } from "@shared/schema";

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  arithmetic: { label: "Arithmetic", color: "#f97316", bg: "bg-orange-50" },
  algebra: { label: "Algebra", color: "#8b5cf6", bg: "bg-purple-50" },
  geometry: { label: "Geometry", color: "#06b6d4", bg: "bg-cyan-50" },
  "number-theory": { label: "Number Theory", color: "#22c55e", bg: "bg-green-50" },
  combinatorics: { label: "Combinatorics", color: "#ec4899", bg: "bg-pink-50" },
  "logical-reasoning": { label: "Logical Reasoning", color: "#f59e0b", bg: "bg-yellow-50" },
  "data-handling": { label: "Data Handling", color: "#06b6d4", bg: "bg-cyan-50" },
};

export default function KidDashboard() {
  const { activeProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [practiceTopicId, setPracticeTopicId] = useState<number | null>(null);

  const { data: topicList = [], isLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics", activeProfile?.grade],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeProfile?.grade) params.set("grade", String(activeProfile.grade));
      const res = await fetch(`/api/topics?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
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

  const totalSessions = progressList.reduce((s, p) => s + (p.totalSessions ?? 0), 0);
  const totalCorrect = progressList.reduce((s, p) => s + (p.questionsCorrect ?? 0), 0);
  const totalAttempted = progressList.reduce((s, p) => s + (p.questionsAttempted ?? 0), 0);
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-[#f97316]" /></div>;
  }

  if (practiceTopicId) {
    return (
      <div className="min-h-screen bg-[#fdf6ee]">
        <TopicQuestions topicId={practiceTopicId} profileId={activeProfile?.id ?? 0}
          onComplete={() => setPracticeTopicId(null)} />
      </div>
    );
  }

  // Group topics by category
  const grouped = topicList.reduce<Record<string, Topic[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7ed] to-[#fdf6ee]">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)" }}>
        <button onClick={() => setLocation("/profiles")} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
          <ChevronLeft size={18} className="text-white" />
        </button>
        <div className="text-center">
          <p className="text-white/80 text-xs font-bold tracking-widest uppercase">Grade {activeProfile?.grade}</p>
          <p className="text-white font-black text-xl">Hey, {activeProfile?.name}!</p>
        </div>
        <div className="flex items-center gap-1 bg-white/20 rounded-xl px-3 py-1.5">
          <Zap size={14} className="text-yellow-200" />
          <span className="text-white text-sm font-black">{totalSessions * 50 + totalCorrect * 10}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 border border-[rgba(120,90,50,0.1)]">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Tests", value: totalSessions },
              { label: "Accuracy", value: `${accuracy}%` },
              { label: "Correct", value: totalCorrect },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-[#7c6a55] mb-0.5">{label}</p>
                <p className="font-black text-lg text-[#1e1a14]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pick a challenge */}
        <div>
          <h3 className="font-black text-lg text-[#1e1a14] mb-3">Pick a Challenge</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(grouped).map(([category, topics]) => {
              const cfg = CATEGORY_CONFIG[category] ?? { label: category, color: "#f97316", bg: "bg-orange-50" };
              return (
                <button
                  key={category}
                  onClick={() => {
                    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
                    setPracticeTopicId(randomTopic.id);
                  }}
                  className={`${cfg.bg} rounded-2xl p-5 text-left border border-[rgba(120,90,50,0.08)] hover:shadow-md transition-shadow`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${cfg.color}20` }}>
                    <Calculator size={22} style={{ color: cfg.color }} />
                  </div>
                  <p className="font-black text-sm text-[#1e1a14]">{cfg.label}</p>
                  <p className="text-xs text-[#7c6a55] mt-0.5">{topics.length} topics</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold" style={{ color: cfg.color }}>
                    Start <ChevronRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {topicList.length === 0 && (
          <div className="bg-white rounded-2xl border border-[rgba(120,90,50,0.1)] p-12 text-center">
            <p className="font-bold text-[#1e1a14]">No topics for Grade {activeProfile?.grade} yet</p>
            <p className="text-sm text-[#7c6a55] mt-1">Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
