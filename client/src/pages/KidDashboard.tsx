import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight, Loader2, Zap, Trophy, Flame, Star, Target,
  Calculator, Shapes, Hash, Lightbulb, PieChart, Puzzle, BookOpen,
  TrendingUp, Clock, CheckCircle2,
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

function getMotivation(accuracy: number, sessions: number) {
  if (sessions === 0) return "Start your first challenge to begin your learning journey!";
  if (accuracy >= 90) return "Outstanding! You're a math superstar. Try Olympiad level!";
  if (accuracy >= 75) return "You're crushing it! Keep this momentum going.";
  if (accuracy >= 50) return "Great progress! Every session makes you stronger.";
  return "Keep going! Practice makes perfect — you'll get there.";
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

  // Category mastery
  const categoryProgress = useMemo(() => {
    const grouped = topicList.reduce<Record<string, { total: number; practiced: number; correct: number; attempted: number }>>((acc, t) => {
      const cat = t.category;
      if (!acc[cat]) acc[cat] = { total: 0, practiced: 0, correct: 0, attempted: 0 };
      acc[cat].total++;
      const prog = progressList.find(p => p.topicId === t.id);
      if (prog && (prog.totalSessions ?? 0) > 0) {
        acc[cat].practiced++;
        acc[cat].correct += prog.questionsCorrect ?? 0;
        acc[cat].attempted += prog.questionsAttempted ?? 0;
      }
      return acc;
    }, {});
    return grouped;
  }, [topicList, progressList]);

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
      {/* Welcome banner */}
      <div className="px-5 py-5" style={{ background: "hsl(var(--grape))" }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase font-body" style={{ color: "rgba(255,255,255,0.5)" }}>
                Grade {activeProfile?.grade}
              </p>
              <h1 className="text-white font-display font-bold text-2xl mt-0.5">
                Hey, {activeProfile?.name}!
              </h1>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Zap size={13} style={{ color: "#FAC775" }} />
              <span className="text-white text-sm font-semibold">{points.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Level progress bar */}
          <div className="rounded-xl p-3 font-body" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white font-semibold flex items-center gap-1">
                <Star size={12} style={{ color: "#FAC775" }} /> Level: {level.name}
              </span>
              {level.next && (
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{points} / {level.next} pts</span>
              )}
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(level.pct, 100)}%`, background: "linear-gradient(90deg, #FAC775, #f6d365)" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-5 space-y-5 animate-slide-up" style={{ animationDelay: "80ms", animationFillMode: "both" }}>

        {/* Stats overview */}
        <div className="bg-white rounded-2xl p-4 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="grid grid-cols-4 gap-2">
            <div className="stat-card">
              <div className="stat-num" style={{ color: "hsl(var(--grape))", fontSize: "20px" }}>{totalSessions}</div>
              <div className="stat-label">sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: "hsl(var(--leaf))", fontSize: "20px" }}>{accuracy}%</div>
              <div className="stat-label">accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: "hsl(var(--grape))", fontSize: "20px" }}>{totalCorrect}</div>
              <div className="stat-label">correct</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: "hsl(var(--amber))", fontSize: "20px" }}>{totalAttempted}</div>
              <div className="stat-label">attempted</div>
            </div>
          </div>
        </div>

        {/* Motivation / insight */}
        <div className="insight-box font-body flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "hsl(var(--grape))", color: "#fff" }}>
            {accuracy >= 75 ? <Trophy size={16} /> : totalSessions > 0 ? <Flame size={16} /> : <Target size={16} />}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground mb-0.5">{getMotivation(accuracy, totalSessions)}</p>
            {totalSessions > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {accuracy >= 70 && <span className="pill pill-leaf text-xs"><CheckCircle2 size={11} /> Strong accuracy</span>}
                {totalSessions >= 5 && <span className="pill pill-grape text-xs"><Flame size={11} /> {totalSessions} sessions</span>}
                {totalCorrect >= 20 && <span className="pill pill-leaf text-xs"><TrendingUp size={11} /> {totalCorrect} correct</span>}
              </div>
            )}
          </div>
        </div>

        {/* Category mastery (only if has progress) */}
        {Object.keys(categoryProgress).length > 0 && totalSessions > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
            <h3 className="font-display font-semibold text-foreground mb-3">Your Progress</h3>
            <div className="space-y-3 font-body">
              {Object.entries(categoryProgress).map(([cat, data]) => {
                const cfg = CATEGORY_CONFIG[cat];
                if (!cfg || data.attempted === 0) return null;
                const catAcc = Math.round((data.correct / data.attempted) * 100);
                const barColor = catAcc >= 80 ? "hsl(var(--leaf))" : catAcc >= 50 ? "hsl(var(--amber))" : "hsl(var(--coral))";
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{cfg.label}</span>
                      <span className="font-semibold" style={{ color: barColor }}>{catAcc}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${catAcc}%`, background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Achievements (fun badges) */}
        {totalSessions > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
            <h3 className="font-display font-semibold text-foreground mb-3">Achievements</h3>
            <div className="grid grid-cols-3 gap-2 font-body">
              {[
                { icon: Star, label: "First Step", desc: "Complete 1 session", unlocked: totalSessions >= 1 },
                { icon: Flame, label: "On Fire", desc: "Complete 5 sessions", unlocked: totalSessions >= 5 },
                { icon: Target, label: "Sharpshooter", desc: "70%+ accuracy", unlocked: accuracy >= 70 && totalSessions > 0 },
                { icon: Trophy, label: "Champion", desc: "90%+ accuracy", unlocked: accuracy >= 90 && totalSessions > 0 },
                { icon: Zap, label: "Speed Demon", desc: "20+ correct", unlocked: totalCorrect >= 20 },
                { icon: BookOpen, label: "Scholar", desc: "50+ problems", unlocked: totalAttempted >= 50 },
              ].map(({ icon: Icon, label, desc, unlocked }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center transition-all"
                  style={{
                    background: unlocked ? "hsl(var(--grape-soft))" : "hsl(var(--background))",
                    opacity: unlocked ? 1 : 0.45,
                    border: unlocked ? "1px solid hsl(var(--grape) / 0.2)" : "1px solid hsl(var(--border))",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                    style={{
                      background: unlocked ? "hsl(var(--grape))" : "hsl(var(--muted))",
                      color: unlocked ? "#fff" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pick a Challenge */}
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground mb-3">Pick a Challenge</h2>
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
                  style={{
                    border: "1px solid hsl(var(--border))",
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `hsl(${cfg.color} / 0.1)`, color: `hsl(${cfg.color})` }}
                    >
                      <Icon size={20} />
                    </div>
                    {catAcc !== null && (
                      <span
                        className="text-xs font-semibold rounded-full px-2 py-0.5"
                        style={{
                          background: catAcc >= 70 ? "hsl(var(--leaf-soft))" : "hsl(var(--amber-soft))",
                          color: catAcc >= 70 ? "hsl(var(--leaf))" : "hsl(var(--amber))",
                        }}
                      >
                        {catAcc}%
                      </span>
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
