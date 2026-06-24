import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight, Loader2, Zap, Check, Users,
  Calculator, Shapes, Hash, Lightbulb, PieChart, Puzzle, BookOpen,
  GraduationCap,
} from "lucide-react";
import { useLocation } from "wouter";
import { TopicQuestions } from "@/components/TopicQuestions";
import type { Topic, TopicProgress } from "@shared/schema";

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Calculator; gradient: string; bg: string }> = {
  arithmetic:         { label: "Arithmetic",        icon: Calculator,  gradient: "from-primary to-primary/80",       bg: "bg-primary/5 border-primary/15 hover:bg-primary/10" },
  algebra:            { label: "Algebra",            icon: Hash,        gradient: "from-accent to-accent/80",         bg: "bg-accent/5 border-accent/15 hover:bg-accent/10" },
  geometry:           { label: "Geometry",           icon: Shapes,      gradient: "from-secondary to-secondary/80",   bg: "bg-secondary/5 border-secondary/15 hover:bg-secondary/10" },
  "number-theory":    { label: "Number Theory",      icon: BookOpen,    gradient: "from-[hsl(var(--info))] to-[hsl(var(--info))]/80", bg: "bg-[hsl(var(--info))]/5 border-[hsl(var(--info))]/15 hover:bg-[hsl(var(--info))]/10" },
  combinatorics:      { label: "Combinatorics",      icon: Puzzle,      gradient: "from-[hsl(var(--kid-pink))] to-[hsl(var(--kid-pink))]/80", bg: "bg-[hsl(var(--kid-pink))]/5 border-[hsl(var(--kid-pink))]/15 hover:bg-[hsl(var(--kid-pink))]/10" },
  "logical-reasoning":{ label: "Logical Reasoning",  icon: Lightbulb,   gradient: "from-[hsl(var(--warning))] to-[hsl(var(--warning))]/80", bg: "bg-[hsl(var(--warning))]/5 border-[hsl(var(--warning))]/15 hover:bg-[hsl(var(--warning))]/10" },
  "data-handling":    { label: "Data Handling",       icon: PieChart,    gradient: "from-secondary to-[hsl(var(--info))]", bg: "bg-secondary/5 border-secondary/15 hover:bg-secondary/10" },
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (practiceTopicId) {
    return (
      <div className="min-h-screen bg-background">
        <TopicQuestions
          topicId={practiceTopicId}
          profileId={activeProfile?.id ?? 0}
          onComplete={() => setPracticeTopicId(null)}
        />
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
    <div className="min-h-screen bg-gradient-surface">
      {/* Kid Header */}
      <header className="bg-gradient-primary px-5 py-5 animate-slide-down">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="font-bold text-white/90 text-sm">LearnVerse</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
                <Zap size={14} className="text-yellow-300" />
                <span className="text-white text-sm font-bold">{points.toLocaleString()}</span>
              </div>
              <button
                onClick={async () => { await switchProfile.mutateAsync(null); setLocation("/parent-dashboard"); }}
                className="p-2 bg-white/15 rounded-lg hover:bg-white/25 transition-colors"
                aria-label="Switch to parent mode"
                title="Parent Mode"
              >
                <Users size={16} className="text-white" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-white/60 text-xs font-semibold tracking-wider uppercase">Grade {activeProfile?.grade}</p>
            <h1 className="text-white font-extrabold text-2xl mt-0.5">Hey, {activeProfile?.name}!</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6 animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
        {/* Stats Bar */}
        <div className="bg-white rounded-xl p-4 border border-border shadow-soft">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Tests Taken", value: totalSessions, color: "text-primary" },
              { label: "Accuracy", value: `${accuracy}%`, color: "text-secondary" },
              { label: "Correct", value: totalCorrect, color: "text-accent" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className={`font-extrabold text-lg ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Grid */}
        <div>
          <h2 className="font-bold text-lg text-foreground mb-3">Pick a Challenge</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(grouped).map(([category, topics], i) => {
              const cfg = CATEGORY_CONFIG[category] ?? {
                label: category, icon: Calculator,
                gradient: "from-primary to-primary/80",
                bg: "bg-primary/5 border-primary/15",
              };
              const Icon = cfg.icon;
              return (
                <button
                  key={category}
                  onClick={() => {
                    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
                    setPracticeTopicId(randomTopic.id);
                  }}
                  className={`rounded-xl p-4 text-left border transition-all hover-lift ${cfg.bg} animate-slide-up`}
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center mb-3`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">{cfg.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{topics.length} topics</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                    Start <ChevronRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {topicList.length === 0 && (
          <div className="bg-white rounded-xl border border-border p-12 text-center shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} className="text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No topics for Grade {activeProfile?.grade} yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon — new content is on the way!</p>
          </div>
        )}
      </div>
    </div>
  );
}
