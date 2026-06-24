import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight, Loader2, Zap, Trophy, Flame, Star, Target,
  Calculator, Shapes, Hash, Lightbulb, PieChart, Puzzle, BookOpen,
  TrendingUp, CheckCircle2, Sparkles, Settings,
} from "lucide-react";
import { TopicQuestions } from "@/components/TopicQuestions";
import type { Topic, TopicProgress } from "@shared/schema";

const AVATARS = ["🚀", "🦊", "🐱", "🦄", "🐉", "🎯", "⚡", "🌟", "🎮", "🏆", "🦁", "🐼", "🦋", "🎨", "🔥", "💎"];

const THEME_COLORS = [
  { name: "Purple", value: "grape", bg: "#5b4bc4" },
  { name: "Ocean", value: "sky", bg: "#0ea5e9" },
  { name: "Sunset", value: "coral", bg: "#e8674e" },
  { name: "Forest", value: "leaf", bg: "#2f9e6f" },
  { name: "Gold", value: "amber", bg: "#f6a623" },
  { name: "Rose", value: "pink", bg: "#db2777" },
];

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Calculator; emoji: string }> = {
  arithmetic:         { label: "Arithmetic",        icon: Calculator,  emoji: "🧮" },
  algebra:            { label: "Algebra",            icon: Hash,        emoji: "✖️" },
  geometry:           { label: "Geometry",           icon: Shapes,      emoji: "📐" },
  "number-theory":    { label: "Number Theory",      icon: BookOpen,    emoji: "🔢" },
  combinatorics:      { label: "Combinatorics",      icon: Puzzle,      emoji: "🧩" },
  "logical-reasoning":{ label: "Logical Reasoning",  icon: Lightbulb,   emoji: "🧠" },
  "data-handling":    { label: "Data Handling",       icon: PieChart,    emoji: "📊" },
};

function getLevel(points: number) {
  if (points >= 5000) return { name: "Legend", emoji: "👑", next: null, pct: 100, num: 5 };
  if (points >= 2000) return { name: "Expert", emoji: "🏆", next: 5000, pct: ((points - 2000) / 3000) * 100, num: 4 };
  if (points >= 800) return { name: "Scholar", emoji: "📚", next: 2000, pct: ((points - 800) / 1200) * 100, num: 3 };
  if (points >= 200) return { name: "Explorer", emoji: "🔍", next: 800, pct: ((points - 200) / 600) * 100, num: 2 };
  return { name: "Starter", emoji: "🌱", next: 200, pct: (points / 200) * 100, num: 1 };
}

const GREETINGS = ["Let's crush it!", "Ready to level up?", "Time to shine!", "Let's go!", "You've got this!"];

export default function KidDashboard() {
  const { activeProfile } = useAuth();
  const [practiceTopicId, setPracticeTopicId] = useState<number | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);

  // Persist avatar & theme in localStorage
  const storageKey = `learniverse-kid-${activeProfile?.id}`;
  const [avatar, setAvatar] = useState(() => localStorage.getItem(`${storageKey}-avatar`) || "🚀");
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem(`${storageKey}-theme`) || "grape");

  useEffect(() => { localStorage.setItem(`${storageKey}-avatar`, avatar); }, [avatar, storageKey]);
  useEffect(() => { localStorage.setItem(`${storageKey}-theme`, themeColor); }, [themeColor, storageKey]);

  const themeBg = THEME_COLORS.find(t => t.value === themeColor)?.bg || "#5b4bc4";
  const greeting = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], []);

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
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" style={{ color: themeBg }} /></div>;
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

  // ── Customize panel ───────────────────────────────────────────────────
  if (showCustomize) {
    return (
      <div className="min-h-screen animate-fade-in" style={{ background: "hsl(var(--background))" }}>
        <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-bold text-2xl text-foreground">Customize ✨</h1>
            <button onClick={() => setShowCustomize(false)}
              className="text-sm font-semibold px-4 py-2 rounded-xl font-body" style={{ background: themeBg, color: "#fff" }}>
              Done
            </button>
          </div>

          {/* Avatar */}
          <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
            <h3 className="font-display font-semibold text-foreground mb-3">Choose Your Avatar</h3>
            <div className="grid grid-cols-8 gap-2">
              {AVATARS.map((a) => (
                <button key={a} onClick={() => setAvatar(a)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{
                    background: avatar === a ? themeBg : "hsl(var(--background))",
                    border: avatar === a ? "none" : "1px solid hsl(var(--border))",
                    transform: avatar === a ? "scale(1.15)" : "scale(1)",
                  }}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Theme color */}
          <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
            <h3 className="font-display font-semibold text-foreground mb-3">Choose Your Color</h3>
            <div className="grid grid-cols-3 gap-2">
              {THEME_COLORS.map((t) => (
                <button key={t.value} onClick={() => setThemeColor(t.value)}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all font-body"
                  style={{
                    background: themeColor === t.value ? t.bg : "hsl(var(--background))",
                    color: themeColor === t.value ? "#fff" : "hsl(var(--foreground))",
                    border: themeColor === t.value ? "none" : "1px solid hsl(var(--border))",
                  }}>
                  <div className="w-6 h-6 rounded-full" style={{ background: t.bg, border: themeColor === t.value ? "2px solid rgba(255,255,255,0.5)" : "none" }} />
                  <span className="text-sm font-semibold">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl p-5 text-center text-white" style={{ background: themeBg }}>
            <span className="text-4xl">{avatar}</span>
            <p className="font-display font-bold text-lg mt-2">{activeProfile?.name}</p>
            <p className="text-sm opacity-70">This is how your profile looks!</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main dashboard ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-lg mx-auto px-5 py-5 space-y-4 animate-fade-in">

        {/* Welcome header */}
        <div className="rounded-2xl p-5 text-white" style={{ background: themeBg }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowCustomize(true)}
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)" }}
                title="Customize">
                {avatar}
              </button>
              <div>
                <h1 className="font-display font-bold text-xl">{activeProfile?.name}</h1>
                <p className="text-sm opacity-70 font-body">Grade {activeProfile?.grade} · {greeting}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-lg">{points}</p>
              <p className="text-xs opacity-60 font-body">points</p>
            </div>
          </div>

          {/* Level bar */}
          <div className="mt-3 rounded-xl p-2.5 font-body" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold">{level.emoji} Lvl {level.num}: {level.name}</span>
              {level.next && <span className="opacity-60">{level.next - points} pts to next</span>}
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(level.pct, 100)}%`, background: "rgba(255,255,255,0.8)" }} />
            </div>
          </div>
        </div>

        {/* Quick stats (only if has data) */}
        {hasData && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: "🎯", value: `${accuracy}%`, label: "accuracy" },
              { emoji: "✅", value: totalCorrect, label: "correct" },
              { emoji: "📝", value: totalSessions, label: "sessions" },
            ].map(({ emoji, value, label }) => (
              <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
                <span className="text-lg">{emoji}</span>
                <p className="font-display font-bold text-lg text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Welcome message for new users */}
        {!hasData && (
          <div className="bg-white rounded-2xl p-5 shadow-soft font-body" style={{ border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-foreground">Welcome to Learniverse!</p>
                <p className="text-sm text-muted-foreground mt-0.5">Pick a topic below to start your journey. Earn points, collect badges, and level up!</p>
              </div>
            </div>
          </div>
        )}

        {/* Badges earned (if any) */}
        {hasData && (() => {
          const earned = [
            totalSessions >= 1 && "⭐ First Step",
            totalSessions >= 5 && "🔥 On Fire",
            accuracy >= 70 && "🎯 Sharpshooter",
            accuracy >= 90 && "🏆 Champion",
            totalCorrect >= 20 && "⚡ Speed Demon",
            totalAttempted >= 50 && "📚 Scholar",
          ].filter(Boolean) as string[];
          if (earned.length === 0) return null;
          return (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {earned.map(b => (
                <span key={b} className="shrink-0 bg-white rounded-full px-3 py-1.5 text-xs font-semibold font-body shadow-soft"
                  style={{ border: "1px solid hsl(var(--border))" }}>
                  {b}
                </span>
              ))}
            </div>
          );
        })()}

        {/* Topics grid */}
        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-3">
            {hasData ? "Keep Going 💪" : "Pick a Topic 👇"}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(grouped).map(([category, topics], i) => {
              const cfg = CATEGORY_CONFIG[category] ?? { label: category, icon: Calculator, emoji: "📘" };
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
                  style={{ border: "1px solid hsl(var(--border))", animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{cfg.emoji}</span>
                    {catAcc !== null && (
                      <span className="text-xs font-bold rounded-full px-2 py-0.5"
                        style={{
                          background: catAcc >= 70 ? "hsl(var(--leaf-soft))" : "hsl(var(--amber-soft))",
                          color: catAcc >= 70 ? "hsl(var(--leaf))" : "hsl(var(--amber))",
                        }}>{catAcc}%</span>
                    )}
                  </div>
                  <p className="font-display font-bold text-sm text-foreground">{cfg.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{topics.length} topics</p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold" style={{ color: themeBg }}>
                    Play <ChevronRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {topicList.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-soft font-body" style={{ border: "1px solid hsl(var(--border))" }}>
            <span className="text-3xl">📭</span>
            <p className="font-display font-bold text-foreground mt-3">No topics for Grade {activeProfile?.grade} yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
          </div>
        )}

        {/* Customize button */}
        <button onClick={() => setShowCustomize(true)}
          className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl p-3.5 text-sm font-semibold text-muted-foreground font-body hover-lift shadow-soft"
          style={{ border: "1px solid hsl(var(--border))" }}>
          <Settings size={16} /> Customize Your Page
        </button>
      </div>
    </div>
  );
}
