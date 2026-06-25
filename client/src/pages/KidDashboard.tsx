import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2, Star, Trophy, Flame, Target, Zap, BookOpen,
  Palette, CheckCircle2, ChevronRight, Play, Snowflake,
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

function getLevel(pts: number) {
  if (pts >= 5000) return { n: 5, name: "Legend", next: null, pct: 100 };
  if (pts >= 2000) return { n: 4, name: "Expert", next: 5000, pct: ((pts - 2000) / 3000) * 100 };
  if (pts >= 800) return { n: 3, name: "Scholar", next: 2000, pct: ((pts - 800) / 1200) * 100 };
  if (pts >= 200) return { n: 2, name: "Explorer", next: 800, pct: ((pts - 200) / 600) * 100 };
  return { n: 1, name: "Starter", next: 200, pct: (pts / 200) * 100 };
}

const BADGES = [
  { icon: Star, label: "First Step", desc: "Complete 1 session", test: (s: number, a: number, c: number, t: number) => s >= 1 },
  { icon: Flame, label: "On Fire", desc: "5 sessions", test: (s: number) => s >= 5 },
  { icon: Target, label: "Sharpshooter", desc: "70%+ accuracy", test: (s: number, a: number) => a >= 70 && s > 0 },
  { icon: Trophy, label: "Champion", desc: "90%+ accuracy", test: (s: number, a: number) => a >= 90 && s > 0 },
  { icon: Zap, label: "Speed Demon", desc: "20+ correct", test: (_s: number, _a: number, c: number) => c >= 20 },
  { icon: BookOpen, label: "Scholar", desc: "50+ problems", test: (_s: number, _a: number, _c: number, t: number) => t >= 50 },
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
      if (!res.ok) throw new Error("Failed"); return res.json();
    },
  });
  const { data: progressList = [] } = useQuery<TopicProgress[]>({
    queryKey: [`/api/progress/${activeProfile?.id}`],
    queryFn: async () => {
      const res = await fetch(`/api/progress/${activeProfile?.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed"); return res.json();
    },
    enabled: !!activeProfile?.id,
  });
  const { data: streak } = useQuery<any>({
    queryKey: [`/api/streaks/${activeProfile?.id}`],
    queryFn: async () => {
      const res = await fetch(`/api/streaks/${activeProfile?.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed"); return res.json();
    },
    enabled: !!activeProfile?.id,
  });

  const recordStreak = useMutation({
    mutationFn: async () => { await apiRequest("POST", "/api/streaks/record", { childProfileId: activeProfile?.id }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/streaks/${activeProfile?.id}`] }); },
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

  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;
  const freezesAvailable = streak?.freezesAvailable ?? 1;

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.bg }} /></div>;

  // Pick a random topic for "Start Practice"
  function startRandomPractice() {
    if (topicList.length === 0) return;
    const topic = topicList[Math.floor(Math.random() * topicList.length)];
    setPracticeTopicId(topic.id);
    recordStreak.mutate();
  }

  if (practiceTopicId) {
    return <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <TopicQuestions topicId={practiceTopicId} profileId={activeProfile?.id ?? 0} grade={activeProfile?.grade ?? 5} onComplete={() => setPracticeTopicId(null)} />
    </div>;
  }

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

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      {/* Hero */}
      <div style={{ background: theme.bg }}>
        <div className="max-w-5xl mx-auto px-5 py-5">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowCustomize(true)} title="Customize"
              className="w-14 h-14 rounded-2xl text-2xl flex items-center justify-center shrink-0 transition-transform hover:scale-105"
              style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)" }}>{avatar}</button>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-xl text-white truncate">{activeProfile?.name}</h1>
              <div className="flex items-center gap-3 font-body text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                <span>Grade {activeProfile?.grade}</span>
                <span>·</span>
                <span>Lvl {level.n}: {level.name}</span>
                <span>·</span>
                <span className="font-semibold text-white">{pts} pts</span>
              </div>
            </div>
            {/* Streak display */}
            <div className="text-center shrink-0">
              <div className="flex items-center gap-1 text-white font-display font-bold text-xl">
                <Flame size={20} style={{ color: currentStreak > 0 ? "#FAC775" : "rgba(255,255,255,0.3)" }} />
                {currentStreak}
              </div>
              <p className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.5)" }}>day streak</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-5 space-y-4 animate-fade-in">

        {/* ── START PRACTICE (the main CTA) ──────────────────────────── */}
        <button onClick={startRandomPractice} disabled={topicList.length === 0}
          className="w-full flex items-center gap-4 bg-white rounded-2xl p-5 text-left hover-lift transition-all font-body"
          style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: theme.bg }}>
            <Play size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-lg text-foreground">Start Practice</p>
            <p className="text-sm text-muted-foreground">Random topic from your grade — just start solving!</p>
          </div>
          <ChevronRight size={20} className="text-muted-foreground shrink-0" />
        </button>

        {/* ── STATS ROW (if has data) ────────────────────────────────── */}
        {hasData && (
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-3 text-center" style={{ border: "1px solid hsl(var(--border))" }}>
              <p className="font-display font-bold text-xl" style={{ color: theme.bg }}>{sessions}</p>
              <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">sessions</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center" style={{ border: "1px solid hsl(var(--border))" }}>
              <p className="font-display font-bold text-xl" style={{ color: accuracy >= 70 ? "#00b894" : "#fdcb6e" }}>{accuracy}%</p>
              <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">accuracy</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center" style={{ border: "1px solid hsl(var(--border))" }}>
              <p className="font-display font-bold text-xl" style={{ color: theme.bg }}>{correct}</p>
              <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">correct</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center" style={{ border: "1px solid hsl(var(--border))" }}>
              <p className="font-display font-bold text-xl" style={{ color: "#e84393" }}>
                <Flame size={16} className="inline mr-0.5" style={{ verticalAlign: "-2px" }} />{longestStreak}
              </p>
              <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">best streak</p>
            </div>
          </div>
        )}

        {/* ── STREAK + LEVEL CARD ────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Level progress */}
          <div className="bg-white rounded-2xl p-4 font-body" style={{ border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-bold" style={{ color: theme.bg }}>
                <Star size={14} className="inline mr-1" style={{ verticalAlign: "-2px" }} />Level {level.n}: {level.name}
              </span>
              {level.next && <span className="text-muted-foreground text-xs">{level.next - pts} pts to go</span>}
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: theme.light }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(level.pct, 3)}%`, background: theme.bg }} />
            </div>
          </div>

          {/* Streak card */}
          <div className="bg-white rounded-2xl p-4 font-body flex items-center gap-3" style={{ border: "1px solid hsl(var(--border))" }}>
            <Flame size={28} style={{ color: currentStreak > 0 ? "#e17055" : "hsl(var(--muted-foreground))" }} />
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">{currentStreak} day streak</p>
              <p className="text-xs text-muted-foreground">{currentStreak > 0 ? "Practice today to keep it going!" : "Start practicing to build a streak!"}</p>
            </div>
            {freezesAvailable > 0 && (
              <div className="text-center" title="Streak freezes — skip a day without losing your streak">
                <Snowflake size={16} style={{ color: "#0984e3" }} />
                <p className="text-[10px] text-muted-foreground">{freezesAvailable}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── BADGES ─────────────────────────────────────────────────── */}
        {(earned.length > 0 || nextBadge) && (
          <div className="bg-white rounded-2xl p-4 font-body" style={{ border: "1px solid hsl(var(--border))" }}>
            <p className="font-display font-semibold text-sm text-foreground mb-3">Badges ({earned.length}/{BADGES.length})</p>
            <div className="flex gap-2 flex-wrap">
              {earned.map(b => (
                <span key={b.label} className="rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: theme.bg }}>
                  <b.icon size={12} className="inline mr-1" style={{ verticalAlign: "-1px" }} />{b.label}
                </span>
              ))}
              {nextBadge && (
                <span className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: "hsl(var(--background))", border: "1px dashed hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                  Next: {nextBadge.label} — {nextBadge.desc}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── WELCOME (new users only) ───────────────────────────────── */}
        {!hasData && (
          <div className="bg-white rounded-2xl p-5 font-body" style={{ border: "1px solid hsl(var(--border))" }}>
            <p className="font-display font-bold text-foreground mb-1">Welcome to LearnSmarter!</p>
            <p className="text-sm text-muted-foreground">Hit "Start Practice" above to begin. Every correct answer earns points. Earn enough and you'll level up and unlock badges!</p>
          </div>
        )}

        {/* Customize */}
        <button onClick={() => setShowCustomize(true)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl p-3 text-sm font-semibold text-muted-foreground font-body hover:text-foreground transition-colors"
          style={{ border: "1px dashed hsl(var(--border))" }}>
          <Palette size={14} /> Customize avatar & theme
        </button>
      </div>
    </div>
  );
}
