import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft, Loader2, UserPlus, TrendingUp, TrendingDown,
  Clock, Brain, Lightbulb, Target, AlertTriangle, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Minus, Trash2, Key,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from "recharts";

interface ChildProfile { id: number; name: string; grade: number; avatar: string; createdAt: string; }
interface BloomStat { bloomLevel: string; total: number; correct: number; avgTime: number; }
interface CategoryStat { category: string; total: number; correct: number; avgTime: number; }
interface SessionRecord { id: number; score: number; totalQuestions: number; startedAt: string; }

const BLOOM_LABELS: Record<string, string> = {
  remember: "Recall", understand: "Comprehension", apply: "Application",
  analyze: "Analysis", evaluate: "Evaluation", create: "Creation",
};
const BLOOM_DESC: Record<string, string> = {
  remember: "Recalling facts and basic concepts",
  understand: "Explaining ideas in their own words",
  apply: "Using knowledge in new situations",
  analyze: "Breaking problems into parts",
  evaluate: "Making judgments and decisions",
  create: "Producing original solutions",
};
const CAT_LABELS: Record<string, string> = {
  arithmetic: "Arithmetic", algebra: "Algebra", geometry: "Geometry",
  "number-theory": "Number Theory", combinatorics: "Combinatorics",
  "logical-reasoning": "Logical Reasoning", "data-handling": "Data Handling",
  adventure: "Adventures",
};

export default function ParentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showAddKid, setShowAddKid] = useState(false);
  const [selectedKidId, setSelectedKidId] = useState<number | null>(null);
  const [kidName, setKidName] = useState("");
  const [kidGrade, setKidGrade] = useState(5);
  const [kidPin, setKidPin] = useState("");
  const [kidPinConfirm, setKidPinConfirm] = useState("");

  const { data: profiles = [], isLoading } = useQuery<ChildProfile[]>({ queryKey: ["/api/profiles"] });
  const selectedKid = profiles.find(p => p.id === selectedKidId) ?? profiles[0] ?? null;

  // All analytics for selected kid
  const { data: stats } = useQuery<any>({ queryKey: [`/api/analytics/${selectedKid?.id}`], enabled: !!selectedKid });
  const { data: bloomStats = [] } = useQuery<BloomStat[]>({ queryKey: [`/api/analytics/${selectedKid?.id}/bloom`], enabled: !!selectedKid });
  const { data: sessions = [] } = useQuery<SessionRecord[]>({ queryKey: [`/api/analytics/${selectedKid?.id}/sessions`], enabled: !!selectedKid });
  const { data: categoryData = [] } = useQuery<CategoryStat[]>({ queryKey: [`/api/analytics/${selectedKid?.id}/categories`], enabled: !!selectedKid });
  const { data: weeklyStats } = useQuery<any>({ queryKey: [`/api/analytics/${selectedKid?.id}/weekly`], enabled: !!selectedKid });

  const createChild = useMutation({
    mutationFn: async (data: { name: string; grade: number; pin: string }) => {
      const res = await apiRequest("POST", "/api/profiles", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `${data.name}'s profile created!` });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setShowAddKid(false); setKidName(""); setKidPin(""); setKidPinConfirm("");
    },
    onError: (err: any) => toast({ title: "Error", description: err?.message, variant: "destructive" }),
  });

  const deleteChild = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/profiles/${id}`); },
    onSuccess: () => {
      toast({ title: "Profile deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setSelectedKidId(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err?.message, variant: "destructive" }),
  });

  function handleAddKid(e: React.FormEvent) {
    e.preventDefault();
    if (!kidName.trim()) return;
    if (kidPin.length !== 4 || !/^\d{4}$/.test(kidPin)) return toast({ title: "PIN must be exactly 4 digits", variant: "destructive" });
    if (kidPin !== kidPinConfirm) return toast({ title: "PINs don't match", variant: "destructive" });
    createChild.mutate({ name: kidName.trim(), grade: kidGrade, pin: kidPin });
  }

  // ── Add child ─────────────────────────────────────────────────────────
  if (showAddKid) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-elevated p-6 sm:p-8" style={{ border: "1px solid hsl(var(--border))" }}>
          <button onClick={() => setShowAddKid(false)} className="flex items-center gap-1 text-sm font-semibold mb-4 font-body" style={{ color: "hsl(var(--grape))" }}>
            <ChevronLeft size={16} /> Back
          </button>
          <h2 className="font-display font-bold text-xl text-foreground mb-1">Add a Child</h2>
          <p className="text-sm text-muted-foreground font-body mb-6">Create a profile for your child to start practicing</p>
          <form onSubmit={handleAddKid} className="space-y-5 font-body">
            <div className="space-y-1.5"><Label htmlFor="kidName">Child's Name</Label><Input id="kidName" value={kidName} onChange={e => setKidName(e.target.value)} placeholder="e.g. Riya" required /></div>
            <div className="space-y-2">
              <Label>Grade</Label>
              <div className="flex gap-2 flex-wrap">
                {[1,2,3,4,5,6,7,8].map(g => (
                  <button key={g} type="button" onClick={() => setKidGrade(g)} className="w-10 h-10 rounded-lg font-semibold text-sm transition-all"
                    style={{ background: kidGrade === g ? "hsl(var(--grape))" : "hsl(var(--muted))", color: kidGrade === g ? "#fff" : "hsl(var(--muted-foreground))" }}>{g}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor="kidPin">4-Digit PIN</Label><Input id="kidPin" type="password" value={kidPin} onChange={e => setKidPin(e.target.value.replace(/\D/g,"").slice(0,4))} maxLength={4} placeholder="1234" inputMode="numeric" required /></div>
              <div className="space-y-1.5"><Label htmlFor="kidPinConfirm">Confirm PIN</Label><Input id="kidPinConfirm" type="password" value={kidPinConfirm} onChange={e => setKidPinConfirm(e.target.value.replace(/\D/g,"").slice(0,4))} maxLength={4} placeholder="1234" inputMode="numeric" required /></div>
            </div>
            <button type="submit" disabled={!kidName.trim() || createChild.isPending} className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40" style={{ background: "hsl(var(--grape))" }}>
              {createChild.isPending && <Loader2 className="h-4 w-4 animate-spin inline mr-2" />}Add Child
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Data ───────────────────────────────────────────────────────────────
  const accuracy = stats?.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
  const hasData = stats && stats.totalQuestions > 0;
  const avgTime = stats?.avgTime ?? 0;
  const avgHints = Number(stats?.avgHints ?? 0);

  // Session trend (last 10)
  const sessionTrend = sessions.slice(0, 10).reverse().map((s: any, i: number) => ({
    n: `${i + 1}`,
    acc: s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 0,
  }));

  // Accuracy trend direction
  const recentAcc = sessionTrend.slice(-3).reduce((s: number, d: any) => s + d.acc, 0) / Math.max(sessionTrend.slice(-3).length, 1);
  const olderAcc = sessionTrend.slice(0, 3).reduce((s: number, d: any) => s + d.acc, 0) / Math.max(sessionTrend.slice(0, 3).length, 1);
  const accTrend = sessionTrend.length >= 4 ? (recentAcc > olderAcc + 5 ? "up" : recentAcc < olderAcc - 5 ? "down" : "stable") : "new";

  // Bloom mastery
  const bloomOrder = ["remember", "understand", "apply", "analyze", "evaluate", "create"];
  const bloomMastery = bloomOrder.map(lvl => {
    const s = bloomStats.find(b => b.bloomLevel === lvl);
    const acc = s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    return { level: lvl, label: BLOOM_LABELS[lvl], desc: BLOOM_DESC[lvl], acc, total: s?.total ?? 0, avgTime: s?.avgTime ?? 0, mastered: acc >= 70 && (s?.total ?? 0) >= 3 };
  });
  const highestBloom = [...bloomMastery].reverse().find(b => b.mastered);
  const weakestBloom = bloomMastery.filter(b => b.total > 0).sort((a, b) => a.acc - b.acc)[0];

  // Category ranking
  const catRanked = categoryData.filter(c => c.total > 0).map(c => ({
    name: CAT_LABELS[c.category] ?? c.category,
    acc: Math.round((c.correct / c.total) * 100),
    total: c.total, avgTime: c.avgTime,
  })).sort((a, b) => b.acc - a.acc);
  const strongest = catRanked[0];
  const weakest = catRanked.length > 1 ? catRanked[catRanked.length - 1] : null;

  // Speed insight
  const speedLabel = avgTime < 15 ? "Very fast" : avgTime < 30 ? "Good pace" : avgTime < 45 ? "Moderate" : "Taking time";
  const speedNote = avgTime < 15
    ? "Quick solver — check they're reading carefully, not guessing"
    : avgTime < 30 ? "Good balance of speed and accuracy"
    : avgTime < 45 ? "Thoughtful approach — encourage them to trust their instincts"
    : "May need help with fundamentals to build speed";

  // Hint insight
  const hintLabel = avgHints < 0.3 ? "Very independent" : avgHints < 0.8 ? "Occasionally uses help" : "Relies on hints";
  const hintNote = avgHints < 0.3
    ? "Solves problems on their own — a sign of real understanding"
    : avgHints < 0.8 ? "Uses hints selectively — a healthy learning approach"
    : "Encourage attempting without hints first, then checking";

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(var(--grape))" }} /></div>;

  if (profiles.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
        <h2 className="font-display font-bold text-xl text-foreground mb-2">Welcome to LearnSmarter</h2>
        <p className="text-sm text-muted-foreground mb-6 font-body">Add your child to get started with practice and progress tracking.</p>
        <button onClick={() => setShowAddKid(true)} className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-semibold font-body" style={{ background: "hsl(var(--grape))" }}>
          <UserPlus size={16} /> Add Your First Child
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 animate-fade-in">
      {/* Kid tabs */}
      <div className="flex items-center gap-3 mb-6">
        {profiles.map(kid => {
          const active = selectedKid?.id === kid.id;
          return (
            <div key={kid.id} className="flex items-center gap-1 shrink-0">
              <button onClick={() => setSelectedKidId(kid.id)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all font-body text-sm font-semibold"
                style={{ background: active ? "hsl(var(--grape))" : "#fff", color: active ? "#fff" : "hsl(var(--foreground))", border: active ? "none" : "1px solid hsl(var(--border))" }}>
                <span className="w-7 h-7 rounded-md flex items-center justify-center font-display font-bold text-xs"
                  style={{ background: active ? "rgba(255,255,255,0.2)" : "hsl(var(--grape-soft))", color: active ? "#fff" : "hsl(var(--grape))" }}>{kid.name[0]}</span>
                {kid.name}
              </button>
              {active && (
                <button onClick={() => { if (confirm(`Delete ${kid.name}'s profile? This cannot be undone.`)) deleteChild.mutate(kid.id); }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Delete profile"
                  style={{ color: "hsl(var(--coral))" }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
        <button onClick={() => setShowAddKid(true)} className="p-2.5 rounded-xl font-body" style={{ border: "1px dashed hsl(var(--border))", color: "hsl(var(--muted-foreground))" }} title="Add child"><UserPlus size={16} /></button>
      </div>

      {selectedKid && !hasData && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-soft font-body" style={{ border: "1px solid hsl(var(--border))" }}>
          <h3 className="font-display font-semibold text-lg text-foreground mb-2">{selectedKid.name}'s Progress</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">No practice data yet. Once {selectedKid.name} completes a session, you'll see detailed insights here.</p>
        </div>
      )}

      {selectedKid && hasData && (
        <div className="space-y-5">

          {/* ── PULSE: 4 key metrics ──────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard label="Accuracy" value={`${accuracy}%`} sub={accTrend === "up" ? "Improving" : accTrend === "down" ? "Declining" : "Steady"}
              icon={accTrend === "up" ? <ArrowUpRight size={16} /> : accTrend === "down" ? <ArrowDownRight size={16} /> : <Minus size={16} />}
              color={accuracy >= 70 ? "var(--leaf)" : accuracy >= 50 ? "var(--amber)" : "var(--coral)"} />
            <MetricCard label="Avg Speed" value={`${avgTime}s`} sub={speedLabel}
              icon={<Clock size={16} />} color={avgTime < 30 ? "var(--leaf)" : "var(--amber)"} />
            <MetricCard label="Independence" value={avgHints < 0.3 ? "High" : avgHints < 0.8 ? "Medium" : "Low"} sub={`${avgHints.toFixed(1)} hints/question`}
              icon={<Lightbulb size={16} />} color={avgHints < 0.5 ? "var(--leaf)" : "var(--amber)"} />
            <MetricCard label="Sessions" value={String(stats.totalSessions)} sub={`${stats.totalQuestions} problems solved`}
              icon={<Target size={16} />} color="var(--grape)" />
          </div>

          {/* ── KEY INSIGHTS (narrative) ──────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
            <h3 className="font-display font-semibold text-foreground mb-4">Key Insights</h3>
            <div className="grid sm:grid-cols-2 gap-3 font-body">

              {/* Speed */}
              <InsightRow icon={<Clock size={16} />} color="var(--grape)" title="Response Speed" headline={`${avgTime}s average — ${speedLabel}`} detail={speedNote} />

              {/* Independence */}
              <InsightRow icon={<Lightbulb size={16} />} color={avgHints < 0.5 ? "var(--leaf)" : "var(--amber)"} title="Hint Usage" headline={hintLabel} detail={hintNote} />

              {/* Strongest area */}
              {strongest && <InsightRow icon={<CheckCircle2 size={16} />} color="var(--leaf)" title="Strongest Topic"
                headline={`${strongest.name} — ${strongest.acc}%`} detail={`${strongest.total} problems solved with ${strongest.avgTime}s avg time. Consider harder difficulty here.`} />}

              {/* Needs work */}
              {weakest && weakest.name !== strongest?.name && <InsightRow icon={<AlertTriangle size={16} />} color="var(--coral)" title="Needs Practice"
                headline={`${weakest.name} — ${weakest.acc}%`} detail={`${weakest.total} problems attempted. More practice in this area will build confidence.`} />}

              {/* Bloom level */}
              {highestBloom && <InsightRow icon={<Brain size={16} />} color="var(--grape)" title="Thinking Level"
                headline={`Reached ${highestBloom.label} level`} detail={highestBloom.desc + `. Mastered at ${highestBloom.acc}% accuracy.`} />}

              {weakestBloom && weakestBloom.level !== highestBloom?.level && <InsightRow icon={<Brain size={16} />} color="var(--amber)" title="Developing Skill"
                headline={`${weakestBloom.label} — ${weakestBloom.acc}%`} detail={weakestBloom.desc + ". More exposure to these question types will help."} />}
            </div>
          </div>

          {/* ── THINKING SKILLS (Bloom's) ─────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
            <h3 className="font-display font-semibold text-foreground mb-1">Thinking Skills</h3>
            <p className="text-xs text-muted-foreground font-body mb-4">From basic recall to creative problem-solving — based on Bloom's Taxonomy</p>
            <div className="space-y-2.5 font-body">
              {bloomMastery.map((bl, i) => (
                <div key={bl.level} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{
                      background: bl.mastered ? "hsl(var(--grape))" : bl.total > 0 ? "hsl(var(--grape-soft))" : "hsl(var(--muted))",
                      color: bl.mastered ? "#fff" : bl.total > 0 ? "hsl(var(--grape))" : "hsl(var(--muted-foreground))",
                    }}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium text-foreground">{bl.label}</span>
                      <span className="text-xs" style={{ color: bl.total > 0 ? (bl.acc >= 70 ? "hsl(var(--leaf))" : "hsl(var(--amber))") : "hsl(var(--muted-foreground))" }}>
                        {bl.total > 0 ? `${bl.acc}% · ${bl.total} Qs · ${bl.avgTime}s avg` : "Not yet attempted"}
                      </span>
                    </div>
                    {bl.total > 0 && (
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                        <div className="h-full rounded-full" style={{ width: `${bl.acc}%`, background: bl.acc >= 70 ? "hsl(var(--leaf))" : "hsl(var(--amber))" }} />
                      </div>
                    )}
                  </div>
                  {bl.mastered && <CheckCircle2 size={14} style={{ color: "hsl(var(--leaf))" }} />}
                </div>
              ))}
            </div>
          </div>

          {/* ── TOPIC BREAKDOWN ───────────────────────────────────────── */}
          {catRanked.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
              <h3 className="font-display font-semibold text-foreground mb-4">Performance by Topic</h3>
              <div className="space-y-3 font-body">
                {catRanked.map(c => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.acc}% · {c.total} solved · {c.avgTime}s avg</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                      <div className="h-full rounded-full" style={{ width: `${c.acc}%`, background: c.acc >= 80 ? "hsl(var(--leaf))" : c.acc >= 50 ? "hsl(var(--amber))" : "hsl(var(--coral))" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ACCURACY OVER TIME ────────────────────────────────────── */}
          {sessionTrend.length > 1 && (
            <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
              <h3 className="font-display font-semibold text-foreground mb-1">Accuracy Over Time</h3>
              <p className="text-xs text-muted-foreground font-body mb-4">Last {sessionTrend.length} sessions</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={sessionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="n" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="acc" name="Accuracy %" stroke="hsl(var(--grape))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--grape))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── WEEKLY PULSE ──────────────────────────────────────────── */}
          {weeklyStats && weeklyStats.totalQuestions > 0 && (
            <div className="rounded-2xl p-5 font-body" style={{ background: "hsl(var(--grape-soft))" }}>
              <h3 className="font-display font-semibold text-foreground mb-2">This Week</h3>
              <p className="text-sm text-muted-foreground">
                {selectedKid.name} completed <b style={{ color: "hsl(var(--grape))" }}>{weeklyStats.totalSessions}</b> sessions,
                solving <b style={{ color: "hsl(var(--grape))" }}>{weeklyStats.totalQuestions}</b> problems
                with <b style={{ color: "hsl(var(--grape))" }}>{weeklyStats.totalQuestions > 0 ? Math.round((weeklyStats.totalCorrect / weeklyStats.totalQuestions) * 100) : 0}%</b> accuracy
                and an average time of <b style={{ color: "hsl(var(--grape))" }}>{weeklyStats.avgTime}s</b> per question.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon, color }: { label: string; value: string; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider">{label}</span>
        <span style={{ color: `hsl(${color})` }}>{icon}</span>
      </div>
      <p className="font-display font-bold text-2xl" style={{ color: `hsl(${color})` }}>{value}</p>
      <p className="text-xs text-muted-foreground font-body mt-0.5">{sub}</p>
    </div>
  );
}

// ── Insight Row ──────────────────────────────────────────────────────────────
function InsightRow({ icon, color, title, headline, detail }: { icon: React.ReactNode; color: string; title: string; headline: string; detail: string }) {
  return (
    <div className="rounded-xl p-3.5 font-body" style={{ background: "hsl(var(--background))" }}>
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: `hsl(${color})` }}>{icon}</span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{headline}</p>
      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{detail}</p>
    </div>
  );
}
