import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight, Loader2, Zap, Users,
  Calculator, Shapes, Hash, Lightbulb, PieChart, Puzzle, BookOpen,
  TrendingUp, Target, Clock,
} from "lucide-react";
import { useLocation } from "wouter";
import { TopicQuestions } from "@/components/TopicQuestions";
import type { Topic, TopicProgress } from "@shared/schema";

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Calculator; color: string }> = {
  arithmetic:         { label: "Arithmetic",        icon: Calculator,  color: "var(--grape)" },
  algebra:            { label: "Algebra",            icon: Hash,        color: "var(--grape)" },
  geometry:           { label: "Geometry",           icon: Shapes,      color: "var(--leaf)" },
  "number-theory":    { label: "Number Theory",      icon: BookOpen,    color: "var(--amber)" },
  combinatorics:      { label: "Combinatorics",      icon: Puzzle,      color: "var(--coral)" },
  "logical-reasoning":{ label: "Logical Reasoning",  icon: Lightbulb,   color: "var(--amber)" },
  "data-handling":    { label: "Data Handling",       icon: PieChart,    color: "var(--leaf)" },
};

export default function KidDashboard() {
  const { activeProfile, switchProfile } = useAuth();
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
  const points = totalSessions * 50 + totalCorrect * 10;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(var(--grape))" }} />
      </div>
    );
  }

  if (practiceTopicId) {
    return (
      <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
        <TopicQuestions topicId={practiceTopicId} profileId={activeProfile?.id ?? 0}
          onComplete={() => setPracticeTopicId(null)} />
      </div>
    );
  }

  const grouped = topicList.reduce<Record<string, Topic[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      {/* Header */}
      <header className="px-5 py-5 animate-slide-down" style={{ background: "hsl(var(--grape))" }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white/90 text-sm">LearnSmarter</span>
              <span className="text-xs font-body" style={{ color: "rgba(255,255,255,0.5)" }}>pilot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body" style={{ background: "rgba(255,255,255,0.15)" }}>
                <Zap size={13} style={{ color: "#FAC775" }} />
                <span className="text-white text-sm font-semibold">{points.toLocaleString()}</span>
              </div>
              <button
                onClick={async () => { await switchProfile.mutateAsync(null); setLocation("/parent-dashboard"); }}
                className="p-2 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.15)" }}
                aria-label="Switch to parent mode"
              >
                <Users size={14} className="text-white" />
              </button>
            </div>
          </div>
          <p className="text-xs font-semibold tracking-wider uppercase font-body" style={{ color: "rgba(255,255,255,0.5)" }}>
            Grade {activeProfile?.grade}
          </p>
          <h1 className="text-white font-display font-bold text-2xl mt-0.5">
            Hey, {activeProfile?.name}!
          </h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-5 space-y-5 animate-slide-up" style={{ animationDelay: "80ms", animationFillMode: "both" }}>
        {/* Stats row (reference style) */}
        <div className="bg-white rounded-2xl p-4 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card">
              <div className="stat-num" style={{ color: "hsl(var(--grape))" }}>{totalSessions}</div>
              <div className="stat-label">tests taken</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: "hsl(var(--leaf))" }}>{accuracy}%</div>
              <div className="stat-label">accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: "hsl(var(--leaf))" }}>{totalCorrect}</div>
              <div className="stat-label">correct</div>
            </div>
          </div>
        </div>

        {/* Insight (if they have data) */}
        {totalSessions > 0 && (
          <div className="insight-box font-body">
            {accuracy >= 80 ? (
              <span>You're doing <b style={{ color: "hsl(var(--grape))" }}>great</b> — {accuracy}% accuracy across {totalSessions} sessions. Ready for harder challenges?</span>
            ) : accuracy >= 50 ? (
              <span>Good progress! Your accuracy is <b style={{ color: "hsl(var(--grape))" }}>{accuracy}%</b>. Keep practicing — each session builds your skills.</span>
            ) : (
              <span>You've completed <b style={{ color: "hsl(var(--grape))" }}>{totalSessions}</b> sessions. Don't worry about the score — the more you practice, the better you'll get!</span>
            )}
          </div>
        )}

        {/* Category Grid */}
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground mb-3">Pick a Challenge</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(grouped).map(([category, topics], i) => {
              const cfg = CATEGORY_CONFIG[category] ?? { label: category, icon: Calculator, color: "var(--grape)" };
              const Icon = cfg.icon;
              return (
                <button
                  key={category}
                  onClick={() => {
                    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
                    setPracticeTopicId(randomTopic.id);
                  }}
                  className={`bg-white rounded-2xl p-4 text-left hover-lift transition-all font-body animate-slide-up`}
                  style={{
                    border: "1px solid hsl(var(--border))",
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `hsl(${cfg.color} / 0.1)`, color: `hsl(${cfg.color})` }}
                  >
                    <Icon size={20} />
                  </div>
                  <p className="font-display font-semibold text-sm text-foreground">{cfg.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{topics.length} topics</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{ color: "hsl(var(--grape))" }}>
                    Start <ChevronRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {topicList.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "hsl(var(--muted))" }}>
              <BookOpen size={24} className="text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-foreground">No topics for Grade {activeProfile?.grade} yet</p>
            <p className="text-sm text-muted-foreground mt-1 font-body">Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
