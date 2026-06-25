import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight, Loader2, Star,
  Calculator, Shapes, Hash, Lightbulb, PieChart, Puzzle, BookOpen,
  Palette, Trophy, Flame, Target, Zap, CheckCircle2,
} from "lucide-react";
import { TopicQuestions } from "@/components/TopicQuestions";
import type { Topic, TopicProgress } from "@shared/schema";

const AVATARS = ["🦊", "🐱", "🦄", "🐉", "⚡", "🌟", "🎮", "🏆", "🦁", "🐼", "🦋", "🎨", "🔥", "💎", "🐸", "🐧"];
const THEMES = [
  { name: "Violet", bg: "#6c5ce7", light: "#ede9fc" },
  { name: "Ocean", bg: "#0984e3", light: "#dfe6e9" },
  { name: "Emerald", bg: "#00b894", light: "#dff9e8" },
  { name: "Sunset", bg: "#e17055", light: "#fdeee8" },
  { name: "Rose", bg: "#e84393", light: "#fce4ec" },
  { name: "Midnight", bg: "#2d3436", light: "#e8e8e8" },
];
const CATEGORIES: Record<string, { label: string; icon: typeof Calculator; color: string }> = {
  arithmetic: { label: "Arithmetic", icon: Calculator, color: "#6c5ce7" },
  algebra: { label: "Algebra", icon: Hash, color: "#0984e3" },
  geometry: { label: "Geometry", icon: Shapes, color: "#00b894" },
  "number-theory": { label: "Number Theory", icon: BookOpen, color: "#e17055" },
  combinatorics: { label: "Combinatorics", icon: Puzzle, color: "#e84393" },
  "logical-reasoning": { label: "Logical Reasoning", icon: Lightbulb, color: "#fdcb6e" },
  "data-handling": { label: "Data Handling", icon: PieChart, color: "#00cec9" },
  adventure: { label: "Adventures", icon: Zap, color: "#6c5ce7" },
};

function getLevel(pts: number) {
  if (pts >= 5000) return { n: 5, name: "Legend", next: null, pct: 100 };
  if (pts >= 2000) return { n: 4, name: "Expert", next: 5000, pct: ((pts - 2000) / 3000) * 100 };
  if (pts >= 800) return { n: 3, name: "Scholar", next: 2000, pct: ((pts - 800) / 1200) * 100 };
  if (pts >= 200) return { n: 2, name: "Explorer", next: 800, pct: ((pts - 200) / 600) * 100 };
  return { n: 1, name: "Starter", next: 200, pct: (pts / 200) * 100 };
}

const BADGES = [
  { icon: Star, label: "First Step", desc: "Complete 1 session", test: (s: number, a: number, c: number, t: number) => s >= 1 },
  { icon: Flame, label: "On Fire", desc: "Complete 5 sessions", test: (s: number) => s >= 5 },
  { icon: Target, label: "Sharpshooter", desc: "70%+ accuracy", test: (s: number, a: number) => a >= 70 && s > 0 },
  { icon: Trophy, label: "Champion", desc: "90%+ accuracy", test: (s: number, a: number) => a >= 90 && s > 0 },
  { icon: Zap, label: "Speed Demon", desc: "20+ correct", test: (s: number, a: number, c: number) => c >= 20 },
  { icon: BookOpen, label: "Scholar", desc: "50+ problems", test: (s: number, a: number, c: number, t: number) => t >= 50 },
];

export default function KidDashboard() {
  const { activeProfile } = useAuth();
  const [practiceTopicId, setPracticeTopicId] = useState<number | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);

  const key = `ls-kid-${activeProfile?.id}`;
  const [avatar, setAvatar] = useState(() => localStorage.getItem(`${key}-av`) || "🦊");
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

  const earned = BADGES.filter(b => b.test(sessions, accuracy, correct, attempted));
  const nextBadge = BADGES.find(b => !b.test(sessions, accuracy, correct, attempted));

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

  if (showCustomize) {
    return (
      <div className="min-h-screen animate-fade-in" style={{ background: "hsl(var(--background))" }}>
        <div className="max-w-3xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display font-bold text-2xl text-foreground">Customize</h1>
            <button onClick={() => setShowCustomize(false)} className="text-sm font-bold px-5 py-2 rounded-xl text-white font-body" style={{ background: theme.bg }}>Done</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid hsl(var(--border))" }}>
              <h3 className="font-display font-semibold mb-3">Avatar</h3>
              <div className="grid grid-cols-8 gap-2">
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatar(a)} className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                    style={{ background: avatar === a ? theme.bg : "hsl(var(--background))", border: avatar === a ? "none" : "1px solid hsl(var(--border))", transform: avatar === a ? "scale(1.1)" : "" }}>{a}</button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid hsl(var(--border))" }}>
              <h3 className="font-display font-semibold mb-3">Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((t, i) => (
                  <button key={t.name} onClick={() => setThemeIdx(i)} className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold font-body transition-all"
                    style={{ background: themeIdx === i ? t.bg : "hsl(var(--background))", color: themeIdx === i ? "#fff" : "hsl(var(--foreground))", border: themeIdx === i ? "none" : "1px solid hsl(var(--border))" }}>
                    <div className="w-5 h-5 rounded-full shrink-0" style={{ background: t.bg }} />{t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN DASHBOARD ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>

      {/* Hero banner */}
      <div style={{ background: theme.bg }}>
        <div className="max-w-5xl mx-auto px-5 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowCustomize(true)} title="Customize"
              className="w-16 h-16 rounded-2xl text-3xl flex items-center justify-center shrink-0 transition-transform hover:scale-105"
              style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)" }}>{avatar}</button>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-2xl text-white truncate">{activeProfile?.name}</h1>
              <p className="text-sm font-body" style={{ color: "rgba(255,255,255,0.6)" }}>Grade {activeProfile?.grade} · Level {level.n}: {level.name}</p>
              {/* Level bar */}
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.max(level.pct, 3)}%`, background: "rgba(255,255,255,0.8)" }} />
                </div>
                <span className="text-xs font-semibold text-white font-body">{pts} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-5">

        {/* ── NEW USER: Welcome + Quick Start ────────────────────────── */}
        {!hasData && (
          <div className="grid md:grid-cols-3 gap-4 mb-6 animate-slide-up">
            <div className="md:col-span-2 bg-white rounded-2xl p-6" style={{ border: "1px solid hsl(var(--border))" }}>
              <h2 className="font-display font-bold text-xl text-foreground mb-2">Welcome to LearnSmarter!</h2>
              <p className="text-sm text-muted-foreground font-body mb-4">
                Pick any topic below and start solving. Every correct answer earns you points. Earn enough and you'll level up and unlock badges!
              </p>
              <div className="flex gap-2 flex-wrap font-body">
                <span className="pill pill-grape text-xs"><Star size={12} /> Earn points</span>
                <span className="pill pill-grape text-xs"><Trophy size={12} /> Unlock badges</span>
                <span className="pill pill-grape text-xs"><Palette size={12} /> Customize your page</span>
              </div>
            </div>
            {nextBadge && (
              <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center text-center" style={{ border: "1px solid hsl(var(--border))" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2" style={{ background: theme.light }}>
                  <nextBadge.icon size={24} style={{ color: theme.bg }} />
                </div>
                <p className="font-display font-bold text-sm text-foreground">First badge</p>
                <p className="text-xs text-muted-foreground font-body">{nextBadge.desc}</p>
              </div>
            )}
          </div>
        )}

        {/* ── RETURNING USER: Stats + Badges ─────────────────────────── */}
        {hasData && (
          <div className="grid md:grid-cols-4 gap-3 mb-6 animate-slide-up">
            <StatCard value={String(sessions)} label="Sessions" color={theme.bg} />
            <StatCard value={`${accuracy}%`} label="Accuracy" color={accuracy >= 70 ? "#00b894" : "#fdcb6e"} />
            <StatCard value={String(correct)} label="Correct" color={theme.bg} />
            <StatCard value={String(earned.length)} label={`Badge${earned.length !== 1 ? "s" : ""}`} color="#e84393" />
          </div>
        )}

        {/* Badges row (if earned) */}
        {earned.length > 0 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 font-body animate-fade-in">
            {earned.map(b => (
              <span key={b.label} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: theme.bg }}>
                <b.icon size={12} className="inline mr-1" style={{ verticalAlign: "-1px" }} />{b.label}
              </span>
            ))}
            {nextBadge && (
              <span className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold font-body" style={{ background: "hsl(var(--background))", border: "1px dashed hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                Next: {nextBadge.label} — {nextBadge.desc}
              </span>
            )}
          </div>
        )}

        {/* ── TOPICS GRID ────────────────────────────────────────────── */}
        <h2 className="font-display font-bold text-lg text-foreground mb-3">{hasData ? "Keep going" : "Pick a topic"}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
          {Object.entries(grouped).map(([cat, topics], i) => {
            const cfg = CATEGORIES[cat] ?? { label: cat, icon: Calculator, color: theme.bg };
            const Icon = cfg.icon;
            const cp = catProgress[cat];
            const catAcc = cp && cp.a > 0 ? Math.round((cp.c / cp.a) * 100) : null;
            return (
              <button key={cat} onClick={() => setPracticeTopicId(topics[Math.floor(Math.random() * topics.length)].id)}
                className="bg-white rounded-2xl p-4 text-left hover-lift transition-all font-body animate-slide-up"
                style={{ border: "1px solid hsl(var(--border))", animationDelay: `${i * 40}ms`, animationFillMode: "both" }}>
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

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 text-center" style={{ border: "1px solid hsl(var(--border))" }}>
      <p className="font-display font-bold text-2xl" style={{ color }}>{value}</p>
      <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
