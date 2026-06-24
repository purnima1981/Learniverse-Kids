import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  Loader2, Star, Flame, Trophy, Target, Zap, BookOpen,
  TrendingUp, Clock, Brain, CheckCircle2, Shield, Sparkles,
  Crown, Award, Rocket,
} from "lucide-react";

interface OverallStats {
  totalQuestions: number;
  totalCorrect: number;
  avgTime: number;
  avgHints: number;
  totalSessions: number;
}

interface BloomStat { bloomLevel: string; total: number; correct: number; avgTime: number; }
interface DifficultyStat { difficulty: string; total: number; correct: number; avgTime: number; }
interface CategoryStat { category: string; total: number; correct: number; avgTime: number; }
interface SessionRecord { id: number; score: number; totalQuestions: number; startedAt: string; }

function getLevel(points: number) {
  if (points >= 5000) return { name: "Master", emoji: "👑", next: null, pct: 100 };
  if (points >= 2000) return { name: "Expert", emoji: "🏆", next: 5000, pct: ((points - 2000) / 3000) * 100 };
  if (points >= 800) return { name: "Scholar", emoji: "📚", next: 2000, pct: ((points - 800) / 1200) * 100 };
  if (points >= 200) return { name: "Explorer", emoji: "🔍", next: 800, pct: ((points - 200) / 600) * 100 };
  return { name: "Beginner", emoji: "🌱", next: 200, pct: (points / 200) * 100 };
}

const CATEGORY_LABELS: Record<string, string> = {
  arithmetic: "Arithmetic", algebra: "Algebra", geometry: "Geometry",
  "number-theory": "Number Theory", combinatorics: "Combinatorics",
  "logical-reasoning": "Logical Reasoning", "data-handling": "Data Handling",
};

export default function AnalyticsDashboard() {
  const params = useParams<{ profileId: string }>();
  const profileId = params.profileId;

  const { data: stats, isLoading } = useQuery<OverallStats>({ queryKey: [`/api/analytics/${profileId}`] });
  const { data: bloomStats = [] } = useQuery<BloomStat[]>({ queryKey: [`/api/analytics/${profileId}/bloom`] });
  const { data: difficultyStats = [] } = useQuery<DifficultyStat[]>({ queryKey: [`/api/analytics/${profileId}/difficulty`] });
  const { data: sessions = [] } = useQuery<SessionRecord[]>({ queryKey: [`/api/analytics/${profileId}/sessions`] });
  const { data: categoryData = [] } = useQuery<CategoryStat[]>({ queryKey: [`/api/analytics/${profileId}/categories`] });

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(var(--grape))" }} /></div>;
  }

  const totalQ = stats?.totalQuestions ?? 0;
  const totalCorrect = stats?.totalCorrect ?? 0;
  const totalSessions = stats?.totalSessions ?? 0;
  const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
  const points = totalSessions * 50 + totalCorrect * 10;
  const level = getLevel(points);

  if (totalQ === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
        <Sparkles size={32} className="mx-auto mb-3" style={{ color: "hsl(var(--grape))" }} />
        <h2 className="font-display font-bold text-xl text-foreground mb-2">No practice data yet</h2>
        <p className="text-sm text-muted-foreground font-body">Analytics will appear here once your child starts solving problems.</p>
      </div>
    );
  }

  // ── Badges / Achievements ─────────────────────────────────────────────
  const badges = [
    { icon: Star, label: "First Step", desc: "Complete 1 session", unlocked: totalSessions >= 1 },
    { icon: Flame, label: "Warming Up", desc: "Complete 3 sessions", unlocked: totalSessions >= 3 },
    { icon: Rocket, label: "On Fire", desc: "Complete 5 sessions", unlocked: totalSessions >= 5 },
    { icon: Zap, label: "Dedicated", desc: "Complete 10 sessions", unlocked: totalSessions >= 10 },
    { icon: Target, label: "Sharpshooter", desc: "70%+ accuracy", unlocked: accuracy >= 70 },
    { icon: Trophy, label: "Champion", desc: "90%+ accuracy", unlocked: accuracy >= 90 },
    { icon: BookOpen, label: "Problem Solver", desc: "Solve 25+ problems", unlocked: totalQ >= 25 },
    { icon: Crown, label: "Century", desc: "Solve 100+ problems", unlocked: totalQ >= 100 },
    { icon: Shield, label: "Independent", desc: "Low hint usage", unlocked: Number(stats?.avgHints ?? 1) < 0.5 },
    { icon: Award, label: "Speed Star", desc: "Under 20s avg time", unlocked: (stats?.avgTime ?? 60) < 20 },
    { icon: Brain, label: "Deep Thinker", desc: "Master analyze+ levels", unlocked: bloomStats.filter(b => ["analyze","evaluate","create"].includes(b.bloomLevel) && b.total > 0 && (b.correct/b.total) >= 0.7).length >= 2 },
    { icon: TrendingUp, label: "Improver", desc: "Improving over sessions", unlocked: sessions.length >= 3 && sessions.slice(0, 3).every((s, i) => i === 0 || (s.totalQuestions > 0 && (s.score / s.totalQuestions) >= (sessions[i-1].totalQuestions > 0 ? sessions[i-1].score / sessions[i-1].totalQuestions : 0))) },
  ];
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  // ── Difficulty mastery ────────────────────────────────────────────────
  const diffMastery = ["easy", "medium", "hard", "olympiad"].map(d => {
    const s = difficultyStats.find(ds => ds.difficulty === d);
    const acc = s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    return { level: d.charAt(0).toUpperCase() + d.slice(1), total: s?.total ?? 0, acc, mastered: acc >= 70 && (s?.total ?? 0) >= 3 };
  });

  // ── Category strength ─────────────────────────────────────────────────
  const catStrength = categoryData
    .filter(c => c.total > 0)
    .map(c => ({
      name: CATEGORY_LABELS[c.category] ?? c.category,
      acc: Math.round((c.correct / c.total) * 100),
      total: c.total,
    }))
    .sort((a, b) => b.acc - a.acc);

  // ── Streak (consecutive sessions) ─────────────────────────────────────
  const streak = sessions.length;

  // ── Bloom thinking levels ─────────────────────────────────────────────
  const bloomLevels = ["remember", "understand", "apply", "analyze", "evaluate", "create"].map(lvl => {
    const s = bloomStats.find(b => b.bloomLevel === lvl);
    const acc = s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    return { name: lvl.charAt(0).toUpperCase() + lvl.slice(1), acc, total: s?.total ?? 0, mastered: acc >= 70 && (s?.total ?? 0) >= 2 };
  });

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-5 animate-fade-in">

      {/* Level card */}
      <div className="rounded-2xl p-5 text-white" style={{ background: "hsl(var(--grape))" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider font-body">Level</p>
            <h2 className="font-display font-bold text-2xl">{level.emoji} {level.name}</h2>
          </div>
          <div className="text-right font-body">
            <p className="text-2xl font-bold font-display">{points}</p>
            <p className="text-white/60 text-xs">total points</p>
          </div>
        </div>
        {level.next && (
          <div className="font-body">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{level.name}</span>
              <span>{level.next} pts to next level</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(level.pct, 100)}%`, background: "linear-gradient(90deg, #FAC775, #f6d365)" }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="bg-white rounded-2xl p-4 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
        <div className="grid grid-cols-4 gap-2">
          <div className="stat-card"><div className="stat-num" style={{ color: "hsl(var(--grape))", fontSize: "20px" }}>{totalSessions}</div><div className="stat-label">sessions</div></div>
          <div className="stat-card"><div className="stat-num" style={{ color: "hsl(var(--leaf))", fontSize: "20px" }}>{accuracy}%</div><div className="stat-label">accuracy</div></div>
          <div className="stat-card"><div className="stat-num" style={{ color: "hsl(var(--grape))", fontSize: "20px" }}>{totalCorrect}</div><div className="stat-label">correct</div></div>
          <div className="stat-card"><div className="stat-num" style={{ color: "hsl(var(--amber))", fontSize: "20px" }}>{stats?.avgTime ?? 0}s</div><div className="stat-label">avg time</div></div>
        </div>
      </div>

      {/* Badges earned */}
      <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
        <h3 className="font-display font-semibold text-foreground mb-4">Badges Earned ({unlockedBadges.length}/{badges.length})</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 font-body">
          {unlockedBadges.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--grape-soft))", border: "1px solid hsl(var(--grape) / 0.15)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ background: "hsl(var(--grape))" }}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground">{desc}</p>
            </div>
          ))}
          {lockedBadges.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-xl p-3 text-center opacity-40" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ background: "hsl(var(--muted))" }}>
                <Icon size={18} className="text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty mastery */}
      <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
        <h3 className="font-display font-semibold text-foreground mb-4">Difficulty Mastery</h3>
        <div className="grid grid-cols-4 gap-2 font-body">
          {diffMastery.map(d => (
            <div key={d.level} className="text-center rounded-xl p-3"
              style={{ background: d.mastered ? "hsl(var(--leaf-soft))" : "hsl(var(--background))", border: `1px solid ${d.mastered ? "hsl(var(--leaf) / 0.2)" : "hsl(var(--border))"}` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1.5"
                style={{ background: d.mastered ? "hsl(var(--leaf))" : "hsl(var(--muted))", color: d.mastered ? "#fff" : "hsl(var(--muted-foreground))" }}>
                {d.mastered ? <CheckCircle2 size={16} /> : <Target size={16} />}
              </div>
              <p className="text-xs font-semibold">{d.level}</p>
              {d.total > 0 ? <p className="text-[10px] text-muted-foreground">{d.acc}% · {d.total} solved</p> : <p className="text-[10px] text-muted-foreground">Not tried</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Thinking skills (Bloom's — but presented as unlockable levels) */}
      <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
        <h3 className="font-display font-semibold text-foreground mb-1">Thinking Skills</h3>
        <p className="text-xs text-muted-foreground font-body mb-4">From basic recall to creative problem-solving</p>
        <div className="space-y-2 font-body">
          {bloomLevels.map((bl, i) => (
            <div key={bl.name} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-bold"
                style={{
                  background: bl.mastered ? "hsl(var(--grape))" : bl.total > 0 ? "hsl(var(--grape-soft))" : "hsl(var(--muted))",
                  color: bl.mastered ? "#fff" : bl.total > 0 ? "hsl(var(--grape))" : "hsl(var(--muted-foreground))",
                }}>{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{bl.name}</p>
                  {bl.total > 0 && <span className="text-xs font-semibold" style={{ color: bl.acc >= 70 ? "hsl(var(--leaf))" : "hsl(var(--amber))" }}>{bl.acc}%</span>}
                </div>
                {bl.total > 0 && (
                  <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: "hsl(var(--border))" }}>
                    <div className="h-full rounded-full" style={{ width: `${bl.acc}%`, background: bl.acc >= 70 ? "hsl(var(--leaf))" : "hsl(var(--amber))" }} />
                  </div>
                )}
              </div>
              {bl.mastered && <CheckCircle2 size={16} style={{ color: "hsl(var(--leaf))" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Category strengths */}
      {catStrength.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
          <h3 className="font-display font-semibold text-foreground mb-4">Strongest Topics</h3>
          <div className="space-y-2 font-body">
            {catStrength.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-xs font-semibold w-5 text-center text-muted-foreground">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="font-semibold" style={{ color: c.acc >= 70 ? "hsl(var(--leaf))" : "hsl(var(--amber))" }}>{c.acc}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: "hsl(var(--border))" }}>
                    <div className="h-full rounded-full" style={{ width: `${c.acc}%`, background: c.acc >= 70 ? "hsl(var(--leaf))" : "hsl(var(--amber))" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="insight-box font-body">
        {accuracy >= 80
          ? <span>Excellent performance! <b style={{ color: "hsl(var(--grape))" }}>{accuracy}%</b> accuracy with {totalCorrect} correct answers. {unlockedBadges.length >= 8 ? "Nearly all badges unlocked — a true champion!" : `${badges.length - unlockedBadges.length} more badges to unlock.`}</span>
          : accuracy >= 50
          ? <span>Making solid progress with <b style={{ color: "hsl(var(--grape))" }}>{accuracy}%</b> accuracy. {lockedBadges.length > 0 ? `Next badge to earn: "${lockedBadges[0].label}" — ${lockedBadges[0].desc}.` : ""}</span>
          : <span>Building foundations with <b style={{ color: "hsl(var(--grape))" }}>{totalSessions}</b> sessions completed. Each practice session builds understanding!</span>
        }
      </div>
    </div>
  );
}
