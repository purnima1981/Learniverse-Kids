import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft, ChevronRight, Loader2, UserPlus, TrendingUp, Zap, BarChart3,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from "recharts";

interface ChildProfile {
  id: number; name: string; grade: number; avatar: string; createdAt: string;
}

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
  const selectedKid = profiles.find((p) => p.id === selectedKidId) ?? profiles[0] ?? null;

  const { data: stats } = useQuery<any>({
    queryKey: [`/api/analytics/${selectedKid?.id}`],
    enabled: !!selectedKid,
  });
  const { data: bloomStats = [] } = useQuery<any[]>({
    queryKey: [`/api/analytics/${selectedKid?.id}/bloom`],
    enabled: !!selectedKid,
  });
  const { data: sessions = [] } = useQuery<any[]>({
    queryKey: [`/api/analytics/${selectedKid?.id}/sessions`],
    enabled: !!selectedKid,
  });

  const createChild = useMutation({
    mutationFn: async (data: { name: string; grade: number; pin: string }) => {
      const res = await apiRequest("POST", "/api/profiles", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `${data.name}'s profile created!` });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setShowAddKid(false);
      setKidName(""); setKidPin(""); setKidPinConfirm("");
    },
    onError: (err: any) => toast({ title: "Error", description: err?.message, variant: "destructive" }),
  });

  function handleAddKid(e: React.FormEvent) {
    e.preventDefault();
    if (!kidName.trim()) return;
    if (kidPin.length !== 4 || !/^\d{4}$/.test(kidPin)) {
      return toast({ title: "PIN must be exactly 4 digits", variant: "destructive" });
    }
    if (kidPin !== kidPinConfirm) {
      return toast({ title: "PINs don't match", variant: "destructive" });
    }
    createChild.mutate({ name: kidName.trim(), grade: kidGrade, pin: kidPin });
  }

  // ── Add child form ────────────────────────────────────────────────────
  if (showAddKid) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-elevated p-6 sm:p-8" style={{ border: "1px solid hsl(var(--border))" }}>
          <button onClick={() => setShowAddKid(false)}
            className="flex items-center gap-1 text-sm font-medium mb-4 font-body"
            style={{ color: "hsl(var(--grape))" }}>
            <ChevronLeft size={16} /> Back
          </button>
          <h2 className="font-display font-bold text-xl text-foreground mb-1">Add a Child</h2>
          <p className="text-sm text-muted-foreground font-body mb-6">Create a profile for your child to start practicing</p>
          <form onSubmit={handleAddKid} className="space-y-5 font-body">
            <div className="space-y-1.5">
              <Label htmlFor="kidName">Child's Name</Label>
              <Input id="kidName" value={kidName} onChange={(e) => setKidName(e.target.value)} placeholder="e.g. Riya" required />
            </div>
            <div className="space-y-2">
              <Label>Grade</Label>
              <div className="flex gap-2 flex-wrap">
                {[1,2,3,4,5,6,7,8].map((g) => (
                  <button key={g} type="button" onClick={() => setKidGrade(g)}
                    className="w-10 h-10 rounded-lg font-semibold text-sm transition-all"
                    style={{
                      background: kidGrade === g ? "hsl(var(--grape))" : "hsl(var(--muted))",
                      color: kidGrade === g ? "#fff" : "hsl(var(--muted-foreground))",
                    }}>{g}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="kidPin">4-Digit PIN</Label>
                <Input id="kidPin" type="password" value={kidPin}
                  onChange={(e) => setKidPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4} placeholder="1234" inputMode="numeric" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kidPinConfirm">Confirm PIN</Label>
                <Input id="kidPinConfirm" type="password" value={kidPinConfirm}
                  onChange={(e) => setKidPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4} placeholder="1234" inputMode="numeric" required />
              </div>
            </div>
            <button type="submit" disabled={!kidName.trim() || createChild.isPending}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40"
              style={{ background: "hsl(var(--grape))" }}>
              {createChild.isPending && <Loader2 className="h-4 w-4 animate-spin inline mr-2" />}
              Add Child
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Data ───────────────────────────────────────────────────────────────
  const accuracy = stats?.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
  const hasData = stats && stats.totalQuestions > 0;

  const sessionData = sessions.slice(0, 10).reverse().map((s: any, i: number) => ({
    session: `${i + 1}`,
    score: s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 0,
  }));

  const bloomData = ["remember","understand","apply","analyze","evaluate","create"].map((level) => {
    const s = bloomStats.find((b: any) => b.bloomLevel === level);
    return { level: level.charAt(0).toUpperCase() + level.slice(1), score: s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0 };
  }).filter(d => d.score > 0);

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(var(--grape))" }} /></div>;
  }

  // ── No children ────────────────────────────────────────────────────────
  if (profiles.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
        <h2 className="font-display font-bold text-xl text-foreground mb-2">Welcome to LearnSmarter</h2>
        <p className="text-sm text-muted-foreground mb-6 font-body">Add your child to get started with practice tests and progress tracking.</p>
        <button onClick={() => setShowAddKid(true)}
          className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-semibold font-body"
          style={{ background: "hsl(var(--grape))" }}>
          <UserPlus size={16} /> Add Your First Child
        </button>
      </div>
    );
  }

  // ── Main page ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 animate-fade-in">
      {/* Kid tabs + add button — inline */}
      <div className="flex items-center gap-3 mb-6">
        {profiles.map((kid) => {
          const isActive = selectedKid?.id === kid.id;
          return (
            <button key={kid.id} onClick={() => setSelectedKidId(kid.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all shrink-0 font-body text-sm font-semibold"
              style={{
                background: isActive ? "hsl(var(--grape))" : "#fff",
                color: isActive ? "#fff" : "hsl(var(--foreground))",
                border: isActive ? "none" : "1px solid hsl(var(--border))",
              }}>
              <span className="w-7 h-7 rounded-md flex items-center justify-center font-display font-bold text-xs"
                style={{ background: isActive ? "rgba(255,255,255,0.2)" : "hsl(var(--grape-soft))", color: isActive ? "#fff" : "hsl(var(--grape))" }}>
                {kid.name[0]}
              </span>
              {kid.name}
            </button>
          );
        })}
        <button onClick={() => setShowAddKid(true)}
          className="p-2.5 rounded-xl transition-colors font-body"
          style={{ border: "1px dashed hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
          title="Add child">
          <UserPlus size={16} />
        </button>
      </div>

      {/* Selected kid content */}
      {selectedKid && !hasData && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-soft font-body" style={{ border: "1px solid hsl(var(--border))" }}>
          <h3 className="font-display font-semibold text-lg text-foreground mb-2">{selectedKid.name}'s Progress</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            No practice data yet. Once {selectedKid.name} starts solving problems, you'll see accuracy, speed, thinking skills, and more right here.
          </p>
        </div>
      )}

      {selectedKid && hasData && (
        <div className="space-y-5">
          {/* Stats + insight in one card */}
          <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
            <h3 className="font-display font-semibold text-lg text-foreground mb-4">{selectedKid.name}'s Progress</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="stat-card">
                <div className="stat-num" style={{ color: "hsl(var(--grape))" }}>{stats.totalSessions}</div>
                <div className="stat-label">sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: "hsl(var(--leaf))" }}>{accuracy}%</div>
                <div className="stat-label">accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: "hsl(var(--leaf))" }}>{stats.avgTime ?? 0}s</div>
                <div className="stat-label">avg time</div>
              </div>
            </div>
            <div className="insight-box font-body">
              {accuracy >= 80
                ? <span>{selectedKid.name} is doing excellent — <b style={{ color: "hsl(var(--grape))" }}>{accuracy}%</b> accuracy across {stats.totalSessions} sessions. Consider harder difficulty.</span>
                : accuracy >= 50
                ? <span>{selectedKid.name} is making good progress — <b style={{ color: "hsl(var(--grape))" }}>{accuracy}%</b> accuracy. Consistent practice is building real skills.</span>
                : <span>{selectedKid.name} has completed <b style={{ color: "hsl(var(--grape))" }}>{stats.totalSessions}</b> sessions. Every attempt builds understanding.</span>
              }
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessionData.length > 1 && (
              <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
                <p className="font-display font-semibold text-sm text-foreground mb-4">Score Trend</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="session" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--grape))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--grape))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {bloomData.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-soft" style={{ border: "1px solid hsl(var(--border))" }}>
                <p className="font-display font-semibold text-sm text-foreground mb-4">Thinking Skills</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={bloomData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                    <YAxis dataKey="level" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={80} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: "12px" }} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} fill="hsl(var(--grape))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
