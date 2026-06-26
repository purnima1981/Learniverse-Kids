import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2, Star, Trophy, Flame, Target, Zap, BookOpen,
  Palette, Play, Snowflake, ChevronRight, Lock, CheckCircle2,
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

// Adventure themes per grade range with colors
const ADVENTURE_THEMES: Record<string, { title: string; desc: string; color: string; icon: string }[]> = {
  "1-2": [
    { title: "The Lost Toy Treasure Hunt", desc: "Follow the fairy's clues to find hidden toys!", color: "#6c5ce7", icon: "🧸" },
    { title: "The Enchanted Garden Quest", desc: "Help the gnomes find their stolen gems!", color: "#00b894", icon: "🌿" },
  ],
  "3-4": [
    { title: "Escape the Wizard's Castle", desc: "Solve puzzles to unlock rooms and escape!", color: "#e17055", icon: "🏰" },
    { title: "The Dragon's Dungeon", desc: "Navigate the maze and free the dragon egg!", color: "#e84393", icon: "🐲" },
  ],
  "5-6": [
    { title: "Space Station Rescue", desc: "Fix the station before oxygen runs out!", color: "#0984e3", icon: "🛸" },
    { title: "Mission to Mars", desc: "Calculate trajectories and land on Mars!", color: "#e17055", icon: "🔴" },
  ],
  "7-8": [
    { title: "Code Breaker Academy", desc: "Crack encrypted codes as a spy recruit!", color: "#2d3436", icon: "🔐" },
    { title: "Operation Cipher", desc: "Track a rogue agent through encrypted clues!", color: "#6c5ce7", icon: "🕵️" },
  ],
};

function getGradeRange(grade: number): string {
  if (grade <= 2) return "1-2";
  if (grade <= 4) return "3-4";
  if (grade <= 6) return "5-6";
  return "7-8";
}

function getDailyAdventures(grade: number) {
  const range = getGradeRange(grade);
  const adventures = ADVENTURE_THEMES[range] || ADVENTURE_THEMES["3-4"];
  // Use date to pick today's adventure (rotates daily)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const primary = adventures[dayOfYear % adventures.length];
  const secondary = adventures[(dayOfYear + 1) % adventures.length];
  return { primary, secondary };
}

function getLevel(pts: number) {
  if (pts >= 5000) return { n: 5, name: "Legend", next: null, pct: 100 };
  if (pts >= 2000) return { n: 4, name: "Expert", next: 5000, pct: ((pts - 2000) / 3000) * 100 };
  if (pts >= 800) return { n: 3, name: "Scholar", next: 2000, pct: ((pts - 800) / 1200) * 100 };
  if (pts >= 200) return { n: 2, name: "Explorer", next: 800, pct: ((pts - 200) / 600) * 100 };
  return { n: 1, name: "Starter", next: 200, pct: (pts / 200) * 100 };
}

const BADGES = [
  { icon: Star, label: "First Step", test: (s: number) => s >= 1 },
  { icon: Flame, label: "On Fire", test: (s: number) => s >= 5 },
  { icon: Target, label: "Sharpshooter", test: (_s: number, a: number) => a >= 70 },
  { icon: Trophy, label: "Champion", test: (_s: number, a: number) => a >= 90 },
  { icon: Zap, label: "Speed Demon", test: (_s: number, _a: number, c: number) => c >= 20 },
  { icon: BookOpen, label: "Scholar", test: (_s: number, _a: number, _c: number, t: number) => t >= 50 },
];

export default function KidDashboard() {
  const { activeProfile } = useAuth();
  const [practiceTopicId, setPracticeTopicId] = useState<number | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [todayCompleted, setTodayCompleted] = useState(false);

  const key = `ls-kid-${activeProfile?.id}`;
  const [avatar, setAvatar] = useState(() => localStorage.getItem(`${key}-av`) || "🦊");
  const [themeIdx, setThemeIdx] = useState(() => Number(localStorage.getItem(`${key}-th`) || "0"));
  useEffect(() => { localStorage.setItem(`${key}-av`, avatar); }, [avatar, key]);
  useEffect(() => { localStorage.setItem(`${key}-th`, String(themeIdx)); }, [themeIdx, key]);
  const theme = THEMES[themeIdx] || THEMES[0];

  // Check if today's challenge was already done
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayCompleted(localStorage.getItem(`${key}-done-${today}`) === "1");
  }, [key]);

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
  const currentStreak = streak?.currentStreak ?? 0;
  const freezesAvailable = streak?.freezesAvailable ?? 1;

  const grade = activeProfile?.grade ?? 5;
  const { primary: todayAdventure, secondary: tomorrowAdventure } = getDailyAdventures(grade);

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.bg }} /></div>;

  function startChallenge() {
    if (topicList.length === 0) return;
    const topic = topicList[Math.floor(Math.random() * topicList.length)];
    setPracticeTopicId(topic.id);
    recordStreak.mutate();
  }

  function onChallengeComplete() {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`${key}-done-${today}`, "1");
    setTodayCompleted(true);
    setPracticeTopicId(null);
  }

  if (practiceTopicId) {
    return <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <TopicQuestions topicId={practiceTopicId} profileId={activeProfile?.id ?? 0} grade={grade} onComplete={onChallengeComplete} />
    </div>;
  }

  // ── Customize ─────────────────────────────────────────────────────────
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
      {/* Compact profile bar */}
      <div style={{ background: theme.bg }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={() => setShowCustomize(true)}
            className="w-12 h-12 rounded-xl text-xl flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
            style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.2)" }}>{avatar}</button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-lg text-white truncate">{activeProfile?.name}</h1>
            <p className="text-xs font-body" style={{ color: "rgba(255,255,255,0.5)" }}>
              Grade {grade} · Lvl {level.n} · {pts} pts
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Streak */}
            <div className="flex items-center gap-1 text-white">
              <Flame size={18} style={{ color: currentStreak > 0 ? "#FAC775" : "rgba(255,255,255,0.3)" }} />
              <span className="font-display font-bold text-lg">{currentStreak}</span>
            </div>
            {freezesAvailable > 0 && (
              <div className="flex items-center gap-0.5" title={`${freezesAvailable} streak freeze${freezesAvailable > 1 ? "s" : ""}`}>
                <Snowflake size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
                <span className="text-xs font-body" style={{ color: "rgba(255,255,255,0.5)" }}>{freezesAvailable}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-5 space-y-4 animate-fade-in">

        {/* ── TODAY'S CHALLENGE ───────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="p-6" style={{ background: todayAdventure.color }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider font-body" style={{ color: "rgba(255,255,255,0.6)" }}>Today's Challenge</span>
              {todayCompleted && <CheckCircle2 size={14} style={{ color: "rgba(255,255,255,0.8)" }} />}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{todayAdventure.icon}</span>
              <div className="flex-1">
                <h2 className="font-display font-bold text-xl text-white">{todayAdventure.title}</h2>
                <p className="text-sm font-body" style={{ color: "rgba(255,255,255,0.7)" }}>{todayAdventure.desc}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 flex items-center justify-between">
            {todayCompleted ? (
              <>
                <p className="text-sm font-body text-muted-foreground">Completed! Come back tomorrow for a new challenge.</p>
                <button onClick={startChallenge} className="text-sm font-semibold font-body px-4 py-2 rounded-xl transition-colors"
                  style={{ color: theme.bg, background: `${theme.bg}15` }}>
                  Play Again
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-body text-muted-foreground">Complete this to keep your streak going!</p>
                <button onClick={startChallenge}
                  className="flex items-center gap-2 text-sm font-bold font-body text-white px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
                  style={{ background: todayAdventure.color }}>
                  <Play size={16} /> Start
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── TOMORROW PREVIEW ────────────────────────────────────────── */}
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 font-body" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${tomorrowAdventure.color}15` }}>{tomorrowAdventure.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tomorrow</p>
            <p className="text-sm font-semibold text-foreground truncate">{tomorrowAdventure.title}</p>
          </div>
          <Lock size={14} className="text-muted-foreground shrink-0" />
        </div>

        {/* ── FREE PRACTICE ──────────────────────────────────────────── */}
        <button onClick={startChallenge} disabled={topicList.length === 0}
          className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 text-left hover-lift transition-all font-body"
          style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: theme.light }}>
            <Play size={18} style={{ color: theme.bg }} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">Free Practice</p>
            <p className="text-xs text-muted-foreground">Random questions from all topics</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </button>

        {/* ── STATS (if has data) ─────────────────────────────────────── */}
        {hasData && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { v: sessions, l: "sessions", c: theme.bg },
              { v: `${accuracy}%`, l: "accuracy", c: accuracy >= 70 ? "#00b894" : "#fdcb6e" },
              { v: correct, l: "correct", c: theme.bg },
              { v: streak?.longestStreak ?? 0, l: "best streak", c: "#e84393" },
            ].map(({ v, l, c }) => (
              <div key={l} className="bg-white rounded-xl p-3 text-center" style={{ border: "1px solid hsl(var(--border))" }}>
                <p className="font-display font-bold text-lg" style={{ color: c }}>{v}</p>
                <p className="text-[9px] text-muted-foreground font-body uppercase tracking-wider">{l}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── LEVEL + BADGES ─────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 font-body" style={{ border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-bold" style={{ color: theme.bg }}>
                <Star size={14} className="inline mr-1" style={{ verticalAlign: "-2px" }} />Level {level.n}: {level.name}
              </span>
              {level.next && <span className="text-xs text-muted-foreground">{level.next - pts} to go</span>}
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: theme.light }}>
              <div className="h-full rounded-full" style={{ width: `${Math.max(level.pct, 3)}%`, background: theme.bg }} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 font-body" style={{ border: "1px solid hsl(var(--border))" }}>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Badges ({earned.length}/{BADGES.length})</p>
            <div className="flex gap-1.5 flex-wrap">
              {BADGES.map((b, i) => {
                const got = earned.includes(b);
                return (
                  <div key={i} className="w-7 h-7 rounded-md flex items-center justify-center" title={b.label}
                    style={{ background: got ? theme.bg : "hsl(var(--muted))", color: got ? "#fff" : "hsl(var(--muted-foreground))", opacity: got ? 1 : 0.4 }}>
                    <b.icon size={14} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Customize */}
        <button onClick={() => setShowCustomize(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl p-3 text-sm text-muted-foreground font-body hover:text-foreground transition-colors"
          style={{ border: "1px dashed hsl(var(--border))" }}>
          <Palette size={14} /> Customize
        </button>
      </div>
    </div>
  );
}
