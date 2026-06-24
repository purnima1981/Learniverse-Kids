import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus, ChevronRight, ArrowLeft, Loader2, BookOpen, Target, Clock,
  BarChart3, Users, UserPlus, Link2, Copy,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from "recharts";

interface ChildProfile {
  id: number; name: string; grade: number; avatar: string; createdAt: string;
}

const BLOOM_COLORS: Record<string, string> = {
  remember: "hsl(var(--info))", understand: "hsl(var(--secondary))", apply: "hsl(var(--primary))",
  analyze: "hsl(var(--accent))", evaluate: "hsl(var(--warning))", create: "hsl(var(--kid-pink))",
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

  // Add child form
  if (showAddKid) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader>
            <button
              onClick={() => setShowAddKid(false)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <CardTitle className="text-xl">Add a Child</CardTitle>
            <p className="text-sm text-muted-foreground">Create a profile for your child to start practicing</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddKid} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="kidName">Child's Name</Label>
                <Input id="kidName" value={kidName} onChange={(e) => setKidName(e.target.value)}
                  placeholder="e.g. Riya" required />
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <div className="flex gap-2 flex-wrap">
                  {[1,2,3,4,5,6,7,8].map((g) => (
                    <button
                      key={g} type="button"
                      onClick={() => setKidGrade(g)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                        kidGrade === g
                          ? "bg-primary text-white shadow-primary"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                      }`}
                    >
                      {g}
                    </button>
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
              <Button type="submit" className="w-full bg-gradient-primary shadow-primary" disabled={!kidName.trim() || createChild.isPending}>
                {createChild.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Child
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accuracy = stats?.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
  const bloomData = ["remember","understand","apply","analyze","evaluate","create"].map((level) => {
    const s = bloomStats.find((b: any) => b.bloomLevel === level);
    return {
      level: level.charAt(0).toUpperCase() + level.slice(1),
      score: s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      fill: BLOOM_COLORS[level],
    };
  }).filter(d => d.score > 0);

  const sessionData = sessions.slice(0, 8).reverse().map((s: any, i: number) => ({
    session: `#${i + 1}`,
    score: s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 0,
  }));

  return (
    <div className="animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Welcome back, {user?.firstName}. Here's how your children are doing.</p>
          </div>
          <Button onClick={() => setShowAddKid(true)} className="bg-gradient-primary shadow-primary">
            <UserPlus size={16} className="mr-2" /> Add Child
          </Button>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profiles.length === 0 ? (
          /* Empty state */
          <Card className="shadow-soft">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Users size={28} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">No children yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-sm">Add your child's profile to get started with practice tests and progress tracking.</p>
              <Button onClick={() => setShowAddKid(true)} className="bg-gradient-primary shadow-primary">
                <UserPlus size={16} className="mr-2" /> Add Your First Child
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Children cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((kid, i) => {
                const isSelected = selectedKid?.id === kid.id;
                return (
                  <Card
                    key={kid.id}
                    className={`cursor-pointer transition-all hover-lift animate-slide-up ${
                      isSelected ? "ring-2 ring-primary shadow-elevated" : "shadow-soft hover:shadow-elevated"
                    }`}
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                    onClick={() => setSelectedKidId(kid.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                          {kid.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{kid.name}</p>
                          <p className="text-sm text-muted-foreground">Grade {kid.grade}</p>
                        </div>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      {isSelected && stats ? (
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Tests", value: stats.totalSessions ?? 0, icon: BookOpen },
                            { label: "Accuracy", value: `${accuracy}%`, icon: Target },
                            { label: "Avg Time", value: `${stats.avgTime ?? 0}s`, icon: Clock },
                          ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="bg-muted/50 rounded-lg p-2.5 text-center">
                              <Icon size={14} className="mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{label}</p>
                              <p className="font-bold text-sm text-foreground">{value}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Click to view stats</p>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setLocation(`/analytics/${kid.id}`); }}
                        className="mt-3 flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                      >
                        View full analytics <ChevronRight size={14} />
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Analytics Preview */}
            {selectedKid && stats?.totalQuestions > 0 && (
              <div className="animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground">{selectedKid.name}'s Progress</h2>
                  <Button variant="outline" size="sm" onClick={() => setLocation(`/analytics/${selectedKid.id}`)}>
                    <BarChart3 size={14} className="mr-1.5" /> Full Analytics
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sessionData.length > 1 && (
                    <Card className="shadow-soft">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Score Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={160}>
                          <LineChart data={sessionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="session" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                  {bloomData.length > 0 && (
                    <Card className="shadow-soft">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Bloom's Taxonomy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={bloomData} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                            <YAxis dataKey="level" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={80} />
                            <Tooltip />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                              {bloomData.map((entry, index) => (
                                <rect key={index} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
