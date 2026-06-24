import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight, Loader2, Star,
  Calculator, Shapes, Hash, Lightbulb, PieChart, Puzzle, BookOpen,
  Palette,
} from "lucide-react";
import { TopicQuestions } from "@/components/TopicQuestions";
import type { Topic, TopicProgress } from "@shared/schema";

const AVATARS = ["🚀", "🦊", "🐱", "🦄", "🐉", "⚡", "🌟", "🎮", "🏆", "🦁", "🐼", "🦋", "🎨", "🔥", "💎", "🐸"];

const THEMES = [
  { name: "Violet", bg: "#6c5ce7", light: "#ede9fc" },
  { name: "Ocean", bg: "#0984e3", light: "#dfe6e9" },
  { name: "Emerald", bg: "#00b894", light: "#dff9e8" },
  { name: "Sunset", bg: "#e17055", light: "#fdeee8" },
  { name: "Rose", bg: "#e84393", light: "#fce4ec" },
  { name: "Midnight", bg: "#2d3436", light: "#e8e8e8" },
];

const CATEGORIES: Record<string, { label: string; icon: typeof Calculator; color: string }> = {
  arithmetic:          { label: "Arithmetic",        icon: Calculator,  color: "#6c5ce7" },
  algebra:             { label: "Algebra",            icon: Hash,        color: "#0984e3" },
  geometry:            { label: "Geometry",           icon: Shapes,      color: "#00b894" },
  "number-theory":     { label: "Number Theory",      icon: BookOpen,    color: "#e17055" },
  combinatorics:       { label: "Combinatorics",      icon: Puzzle,      color: "#e84393" },
  "logical-reasoning": { label: "Logical Reasoning",  icon: Lightbulb,   color: "#fdcb6e" },
  "data-handling":     { label: "Data Handling",       icon: PieChart,    color: "#00cec9" },
};

function getLevel(pts: number) {
  if (pts >= 5000) return { n: 5, name: "Legend", next: null, pct: 100 };
  if (pts >= 2000) return { n: 4, name: "Expert", next: 5000, pct: ((pts - 2000) / 3000) * 100 };
  if (pts >= 800)  return { n: 3, name: "Scholar", next: 2000, pct: ((pts - 800) / 1200) * 100 };
  if (pts >= 200)  return { n: 2, name: "Explorer", next: 800, pct: ((pts - 200) / 600) * 100 };
  return { n: 1, name: "Starter", next: 200, pct: (pts / 200) * 100 };
}

export default function KidDashboard() {
  const { activeProfile } = useAuth();
  const [practiceTopicId, setPracticeTopicId] = useState<number | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);

  const key = `ls-kid-${activeProfile?.id}`;
  const [avatar, setAvatar] = useState(() => localStorage.getItem(`${key}-av`) || "🚀");
  const [themeIdx, setThemeIdx] = useState(() => Number(localStorage.getItem(`${key}-th`) || "0"));
  useEffect(() => { localStorage.setItem(`${key}-av`, avatar); }, [avatar, key]);
  useEffect(() => { localStorage.setItem(`${key}-th`, String(themeIdx)); }, [themeIdx, key]);

  const theme = THEMES[themeIdx] || THEMES[0];

  const { data: topicList = [], isLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics", activeProfile?.grade],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeProfile?.grade) params.set("grade", String(activeProfile.grade));
      const res = await fetch(`/api/topics?${params}`, { credentials: "include" });
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

  const sessions = progressList.reduce((s, p) => s + (p.totalSessions ?? 0), 0);
  const correct = progressList.reduce((s, p) => s + (p.questionsCorrect ?? 0), 0);
  const attempted = progressList.reduce((s, p) => s + (p.questionsAttempted ?? 0), 0);
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const pts = sessions * 50 + correct * 10;
  const level = getLevel(pts);
  const hasData = sessions > 0;

  const catProgress = useMemo(() => {
    const m: Record<string, { c: number; a: number }> = {};
    topicList.forEach(t => {
      if (!m[t.category]) m[t.category] = { c: 0, a: 0 };
      const p = progressList.find(x => x.topicId === t.id);
      if (p && (p.totalSessions ?? 0) > 0) { m[t.category].c += p.questionsCorrect ?? 0; m[t.category].a += p.questionsAttempted ?? 0; }
    });
    return m;
  }, [topicList, progressList]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.bg }} /></div>;

  if (practiceTopicId) {
    return <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <TopicQuestions topicId={practiceTopicId} profileId={activeProfile?.id ?? 0} onComplete={() => setPracticeTopicId(null)} />
    </div>;
  }

  const grouped = topicList.reduce<Record<string, Topic[]>>((a, t) => { if (!a[t.category]) a[t.category] = []; a[t.category].push(t); return a; }, {});

  // ── Customize ─────────────────────────────────────────────────────────
  if (showCustomize) {
    return (
      <div className="min-h-screen animate-fade-in" style={{ background: "hsl(var(--background))" }}>
        <div className="max-w-2xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display font-bold text-2xl text-foreground">Customize</h1>
            <button onClick={() => setShowCustomize(false)} className="text-sm font-bold px-5 py-2 rounded-xl text-white font-body" style={{ background: theme.bg }}>Done</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid hsl(var(--border))" }}>
              <h3 className="font-display font-semibold mb-3">Avatar</h3>
              <div className="grid grid-cols-8 gap-2">
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatar(a)}
                    className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                    style={{ background: avatar === a ? theme.bg : "hsl(var(--background))", border: avatar === a ? "none" : "1px solid hsl(var(--border))", transform: avatar === a ? "scale(1.1)" : "" }}>{a}</button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid hsl(var(--border))" }}>
              <h3 className="font-display font-semibold mb-3">Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((t, i) => (
                  <button key={t.name} onClick={() => setThemeIdx(i)}
                    className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold font-body transition-all"
                    style={{ background: themeIdx === i ? t.bg : "hsl(var(--background))", color: themeIdx === i ? "#fff" : "hsl(var(--foreground))", border: themeIdx === i ? "none" : "1px solid hsl(var(--border))" }}>
                    <div className="w-5 h-5 rounded-full shrink-0" style={{ background: t.bg }} />{t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-2xl p-6 text-center text-white" style={{ background: theme.bg }}>
            <span className="text-4xl block mb-2">{avatar}</span>
            <p className="font-display font-bold text-xl">{activeProfile?.name}</p>
            <p className="text-sm opacity-70 font-body">Level {level.n} · {level.name}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-3xl mx-auto px-5 py-5 animate-fade-in">

        {/* Profile bar */}
        <div className="flex items-center gap-4 mb-5">
          <button onClick={() => setShowCustomize(true)} title="Customize"
            className="w-14 h-14 rounded-2xl text-2xl flex items-center justify-center shrink-0 transition-transform hover:scale-105"
            style={{ background: theme.light, border: `2px solid ${theme.bg}` }}>{avatar}</button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-xl text-foreground truncate">{activeProfile?.name}</h1>
            <p className="text-sm text-muted-foreground font-body">Grade {activeProfile?.grade}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display font-bold text-lg" style={{ color: theme.bg }}>{pts}</p>
            <p className="text-xs text-muted-foreground font-body">points</p>
          </div>
        </div>

        {/* Level + stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Level */}
          <div className="bg-white rounded-2xl p-4 font-body" style={{ border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-bold" style={{ color: theme.bg }}>
                <Star size={14} className="inline mr-1" style={{ verticalAlign: "-2px" }} />Level {level.n}: {level.name}
              </span>
              {level.next && <span className="text-muted-foreground text-xs">{level.next - pts} to next</span>}
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: theme.light }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(level.pct, 4)}%`, background: theme.bg }} />
            </div>
          </div>

          {/* Quick stats */}
          {hasData ? (
            <div className="bg-white rounded-2xl p-4 font-body flex items-center justify-around" style={{ border: "1px solid hsl(var(--border))" }}>
              <div className="text-center"><p className="font-display font-bold text-lg" style={{ color: theme.bg }}>{sessions}</p><p className="text-[10px] text-muted-foreground uppercase tracking-wide">sessions</p></div>
              <div className="w-px h-8" style={{ background: "hsl(var(--border))" }} />
              <div className="text-center"><p className="font-display font-bold text-lg" style={{ color: theme.bg }}>{accuracy}%</p><p className="text-[10px] text-muted-foreground uppercase tracking-wide">accuracy</p></div>
              <div className="w-px h-8" style={{ background: "hsl(var(--border))" }} />
              <div className="text-center"><p className="font-display font-bold text-lg" style={{ color: theme.bg }}>{correct}</p><p className="text-[10px] text-muted-foreground uppercase tracking-wide">correct</p></div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-4 font-body flex items-center gap-3" style={{ border: "1px solid hsl(var(--border))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: theme.light }}>
                <Star size={18} style={{ color: theme.bg }} />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Ready to start?</p>
                <p className="text-xs text-muted-foreground">Pick a topic below to earn your first points</p>
              </div>
            </div>
          )}
        </div>

        {/* Badges (only if earned) */}
        {hasData && (() => {
          const badges = [
            sessions >= 1 && { label: "First Step", icon: "⭐" },
            sessions >= 5 && { label: "On Fire", icon: "🔥" },
            accuracy >= 70 && { label: "Sharpshooter", icon: "🎯" },
            accuracy >= 90 && { label: "Champion", icon: "🏆" },
            correct >= 20 && { label: "Speed Demon", icon: "⚡" },
            attempted >= 50 && { label: "Scholar", icon: "📚" },
          ].filter(Boolean) as { label: string; icon: string }[];
          if (!badges.length) return null;
          return (
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 font-body">
              {badges.map(b => (
                <span key={b.label} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: theme.bg }}>
                  {b.icon} {b.label}
                </span>
              ))}
            </div>
          );
        })()}

        {/* Topics */}
        <h2 className="font-display font-bold text-lg text-foreground mb-3">{hasData ? "Keep going" : "Pick a topic"}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {Object.entries(grouped).map(([cat, topics], i) => {
            const cfg = CATEGORIES[cat] ?? { label: cat, icon: Calculator, color: theme.bg };
            const Icon = cfg.icon;
            const cp = catProgress[cat];
            const catAcc = cp && cp.a > 0 ? Math.round((cp.c / cp.a) * 100) : null;
            return (
              <button key={cat} onClick={() => setPracticeTopicId(topics[Math.floor(Math.random() * topics.length)].id)}
                className="bg-white rounded-2xl p-4 text-left hover-lift transition-all font-body animate-slide-up"
                style={{ border: "1px solid hsl(var(--border))", animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cfg.color}18`, color: cfg.color }}>
                    <Icon size={20} />
                  </div>
                  {catAcc !== null && (
                    <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-white" style={{ background: catAcc >= 70 ? "#00b894" : "#fdcb6e", color: catAcc >= 70 ? "#fff" : "#2d3436" }}>
                      {catAcc}%
                    </span>
                  )}
                </div>
                <p className="font-display font-bold text-sm text-foreground leading-tight">{cfg.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{topics.length} {topics.length === 1 ? "topic" : "topics"}</p>
                <div className="mt-2 flex items-center gap-0.5 text-xs font-bold" style={{ color: cfg.color }}>
                  Play <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </div>

        {topicList.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center font-body" style={{ border: "1px solid hsl(var(--border))" }}>
            <p className="font-display font-bold text-foreground">No topics for Grade {activeProfile?.grade} yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
          </div>
        )}

        {/* Customize link */}
        <button onClick={() => setShowCustomize(true)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl p-3 text-sm font-semibold text-muted-foreground font-body hover:text-foreground transition-colors"
          style={{ border: "1px dashed hsl(var(--border))" }}>
          <Palette size={14} /> Customize avatar & theme
        </button>
      </div>
    </div>
  );
}
