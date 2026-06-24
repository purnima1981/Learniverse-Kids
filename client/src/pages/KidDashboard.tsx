import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight, Loader2, Zap, Trophy, Flame, Star, Target,
  Calculator, Shapes, Hash, Lightbulb, PieChart, Puzzle, BookOpen,
  TrendingUp, CheckCircle2, Sparkles,
} from "lucide-react";
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

function getLevel(points: number) {
  if (points >= 5000) return { name: "Master", next: null, pct: 100 };
  if (points >= 2000) return { name: "Expert", next: 5000, pct: ((points - 2000) / 3000) * 100 };
  if (points >= 800) return { name: "Scholar", next: 2000, pct: ((points - 800) / 1200) * 100 };
  if (points >= 200) return { name: "Explorer", next: 800, pct: ((points - 200) / 600) * 100 };
  return { name: "Beginner", next: 200, pct: (points / 200) * 100 };
}

export default function KidDashboard() {
  const { activeProfile } = useAuth();
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
  const level = getLevel(points);
  const hasData = totalSessions > 0;

  const categoryProgress = useMemo(() => {
    const grouped: Record<string, { correct: number; attempted: number }> = {};
    topicList.forEach((t) => {
      const cat = t.category;
      if (!grouped[cat]) grouped[cat] = { correct: 0, attempted: 0 };
      const prog = progressList.find(p => p.topicId === t.id);
      if (prog && (prog.totalSessions ?? 0) > 0) {
        grouped[cat].correct += prog.questionsCorrect ?? 0;
        grouped[cat].attempted += prog.questionsAttempted ?? 0;
      }
    });
    return grouped;
  }, [topicList, progressList]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(var(--grape))" }} /></div>;
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

  // ── Achievements earned
  const achievements = [
    { icon: Star, label: "First Step", unlocked: totalSessions >= 1 },
    { icon: Flame, label: "On Fire", unlocked: totalSessions >= 5 },
    { icon: Target, label: "Sharpshooter", unlocked: accuracy >= 70 && hasData },
    { icon: Trophy, label: "Champion", unlocked: accuracy >= 90 && hasData },
    { icon: Zap, label: "Speed Demon", unlocked: totalCorrect >= 20 },
    { icon: BookOpen, label: "Scholar", unlocked: totalAttempted >= 50 },
  ];
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-lg mx-auto px-5 py-5 space-y-5 animate-fade-in">

        {/* Welcome — compact, friendly */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Hey, {activeProfile?.name}!</h1>
            <p className="text-sm text-muted-foreground font-body">Grade {activeProfile?.grade} · {level.name}</p>
          </div>
          {hasData && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-sm font-semibold"
              style={{ background: "hsl(var(--grape-soft))", color: "hsl(var(--grape))" }}>
              <Zap size={13} /> {points} pts
            </div>
          )}
        </div>

        {/* If no data: fun welcome card, straight to challenges */}
        {!hasData && (
          <div className="rounded-2xl p-5 font-body" style={{ background: "hsl(var(--grape-soft))" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--grape))" }}>
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Ready to begin?</p>
                <p className="text-sm text-muted-foreground mt-0.5">Pick any topic below and start solving. You'll earn points, unlock achievements, and level up!</p>
              </div>
            </div>
          </div>
        )}

        {/* If has data: compact stats + progress */}
        {hasData && (
          <>
            {/* Stats row */}
            <div className="bg-white rounded-2xl p-4 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
              <div className="grid grid-cols-3 gap-3">
                <div className="stat-card">
                  <div className="stat-num" style={{ color: "hsl(var(--grape))" }}>{totalSessions}</div>
                  <div className="stat-label">sessions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num" style={{ color: "hsl(var(--leaf))" }}>{accuracy}%</div>
                  <div className="stat-label">accuracy</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num" style={{ color: "hsl(var(--grape))" }}>{totalCorrect}</div>
                  <div className="stat-label">correct</div>
                </div>
              </div>

              {/* Level bar */}
              <div className="mt-3 pt-3 font-body" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold flex items-center gap-1" style={{ color: "hsl(var(--grape))" }}>
                    <Star size={11} /> {level.name}
                  </span>
                  {level.next && <span className="text-muted-foreground">{points} / {level.next}</span>}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(level.pct, 100)}%`, background: "hsl(var(--grape))" }} />
                </div>
              </div>
            </div>

            {/* Achievements — compact inline */}
            {unlockedCount > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 font-body">
                <span className="text-xs text-muted-foreground shrink-0">Badges:</span>
                {achievements.filter(a => a.unlocked).map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1 shrink-0 pill pill-grape text-xs">
                    <Icon size={11} /> {label}
                  </div>
                ))}
              </div>
            )}

            {/* Category mastery bars */}
            {Object.entries(categoryProgress).some(([, d]) => d.attempted > 0) && (
              <div className="bg-white rounded-2xl p-4 shadow-soft font-body" style={{ border: "1px solid hsl(var(--border))" }}>
                <p className="font-display font-semibold text-sm text-foreground mb-3">Your Progress</p>
                <div className="space-y-2.5">
                  {Object.entries(categoryProgress).map(([cat, data]) => {
                    if (data.attempted === 0) return null;
                    const cfg = CATEGORY_CONFIG[cat];
                    if (!cfg) return null;
                    const catAcc = Math.round((data.correct / data.attempted) * 100);
                    const barColor = catAcc >= 80 ? "hsl(var(--leaf))" : catAcc >= 50 ? "hsl(var(--amber))" : "hsl(var(--coral))";
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-foreground">{cfg.label}</span>
                          <span className="font-semibold" style={{ color: barColor }}>{catAcc}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                          <div className="h-full rounded-full" style={{ width: `${catAcc}%`, background: barColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Challenges — always the hero */}
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground mb-3">
            {hasData ? "Keep Practicing" : "Pick a Challenge"}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(grouped).map(([category, topics], i) => {
              const cfg = CATEGORY_CONFIG[category] ?? { label: category, icon: Calculator, color: "var(--grape)" };
              const Icon = cfg.icon;
              const catProg = categoryProgress[category];
              const catAcc = catProg && catProg.attempted > 0 ? Math.round((catProg.correct / catProg.attempted) * 100) : null;
              return (
                <button
                  key={category}
                  onClick={() => {
                    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
                    setPracticeTopicId(randomTopic.id);
                  }}
                  className="bg-white rounded-2xl p-4 text-left hover-lift transition-all font-body animate-slide-up"
                  style={{ border: "1px solid hsl(var(--border))", animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `hsl(${cfg.color} / 0.1)`, color: `hsl(${cfg.color})` }}>
                      <Icon size={20} />
                    </div>
                    {catAcc !== null && (
                      <span className="text-xs font-semibold rounded-full px-2 py-0.5"
                        style={{
                          background: catAcc >= 70 ? "hsl(var(--leaf-soft))" : "hsl(var(--amber-soft))",
                          color: catAcc >= 70 ? "hsl(var(--leaf))" : "hsl(var(--amber))",
                        }}>{catAcc}%</span>
                    )}
                  </div>
                  <p className="font-display font-semibold text-sm text-foreground">{cfg.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{topics.length} topics</p>
                  <div className="mt-2.5 flex items-center gap-1 text-xs font-semibold" style={{ color: "hsl(var(--grape))" }}>
                    Practice <ChevronRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {topicList.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-soft font-body" style={{ border: "1px solid hsl(var(--border))" }}>
            <BookOpen size={24} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-display font-semibold text-foreground">No topics for Grade {activeProfile?.grade} yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
