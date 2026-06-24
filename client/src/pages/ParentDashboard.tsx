import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { toast } from "@/components/ui/use-toast";
import {
  Plus, ChevronRight, ChevronLeft, Loader2, BookOpen, Target, Star, Zap,
  BarChart2,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";

interface ChildProfile {
  id: number; name: string; grade: number; avatar: string; createdAt: string;
}

const BLOOM_COLORS: Record<string, string> = {
  remember: "#06b6d4", understand: "#22c55e", apply: "#f97316", analyze: "#8b5cf6", evaluate: "#f59e0b", create: "#ec4899",
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

  // Analytics for selected kid
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

  function handleAddKid() {
    if (!kidName.trim()) return;
    if (kidPin.length !== 4 || !/^\d{4}$/.test(kidPin)) return toast({ title: "PIN must be 4 digits", variant: "destructive" });
    if (kidPin !== kidPinConfirm) return toast({ title: "PINs don't match", variant: "destructive" });
    createChild.mutate({ name: kidName.trim(), grade: kidGrade, pin: kidPin });
  }

  if (showAddKid) {
    return (
      <div className="min-h-screen bg-[#fdf6ee] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-[rgba(120,90,50,0.1)] p-8 w-full max-w-md">
          <button onClick={() => setShowAddKid(false)} className="flex items-center gap-1 text-sm text-[#7c6a55] mb-6 hover:text-[#1e1a14]">
            <ChevronLeft size={16} /> Back
          </button>
          <h2 className="text-2xl font-black text-[#1e1a14] mb-6">Add a Child</h2>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-[#1e1a14] block mb-1.5">Child's Name</label>
              <input value={kidName} onChange={(e) => setKidName(e.target.value)} placeholder="e.g. Riya"
                className="w-full bg-[#fef9f3] border border-[rgba(120,90,50,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f97316]/30" />
            </div>
            <div>
              <label className="text-sm font-bold text-[#1e1a14] block mb-2">Grade</label>
              <div className="flex gap-2 flex-wrap">
                {[1,2,3,4,5,6,7,8].map((g) => (
                  <button key={g} onClick={() => setKidGrade(g)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      kidGrade === g ? "bg-[#f97316] text-white shadow-md" : "bg-[#fef9f3] text-[#7c6a55] border border-[rgba(120,90,50,0.15)]"
                    }`}>{g}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-[#1e1a14] block mb-1.5">4-Digit PIN</label>
                <input type="password" value={kidPin} onChange={(e) => setKidPin(e.target.value)} maxLength={4} placeholder="1234"
                  className="w-full bg-[#fef9f3] border border-[rgba(120,90,50,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f97316]/30" />
              </div>
              <div>
                <label className="text-sm font-bold text-[#1e1a14] block mb-1.5">Confirm PIN</label>
                <input type="password" value={kidPinConfirm} onChange={(e) => setKidPinConfirm(e.target.value)} maxLength={4} placeholder="1234"
                  className="w-full bg-[#fef9f3] border border-[rgba(120,90,50,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f97316]/30" />
              </div>
            </div>
            <button onClick={handleAddKid} disabled={!kidName.trim() || createChild.isPending}
              className="w-full bg-[#f97316] text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-40 mt-2 flex items-center justify-center gap-2">
              {createChild.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Child
            </button>
          </div>
        </div>
      </div>
    );
  }

  const accuracy = stats?.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
  const bloomData = ["remember","understand","apply","analyze","evaluate","create"].map((level) => {
    const s = bloomStats.find((b: any) => b.bloomLevel === level);
    return { level: level.charAt(0).toUpperCase() + level.slice(1), score: s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0 };
  }).filter(d => d.score > 0);

  const sessionData = sessions.slice(0, 8).reverse().map((s: any, i: number) => ({
    week: `#${i + 1}`,
    score: s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 0,
  }));

  return (
    <div className="min-h-screen bg-[#fdf6ee]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Kids list */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#1e1a14]">My Children</h2>
          <button onClick={() => setShowAddKid(true)}
            className="flex items-center gap-2 bg-[#f97316] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors">
            <Plus size={16} /> Add Child
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#f97316]" /></div>
        ) : profiles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[rgba(120,90,50,0.1)] p-12 text-center">
            <p className="font-bold text-[#1e1a14]">No children yet</p>
            <p className="text-sm text-[#7c6a55] mt-1 mb-4">Add your child to get started</p>
            <button onClick={() => setShowAddKid(true)} className="bg-[#f97316] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600">
              Add Your First Child
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {profiles.map((kid) => (
                <div key={kid.id}
                  className={`bg-white rounded-2xl border p-6 cursor-pointer hover:shadow-md transition-shadow ${selectedKid?.id === kid.id ? "border-[#f97316] shadow-md" : "border-[rgba(120,90,50,0.1)]"}`}
                  onClick={() => setSelectedKidId(kid.id)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#f97316] font-black text-xl">
                        {kid.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-lg text-[#1e1a14]">{kid.name}</p>
                        <p className="text-sm text-[#7c6a55]">Grade {kid.grade}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Tests", value: stats?.totalSessions ?? 0, icon: BookOpen },
                      { label: "Accuracy", value: `${accuracy}%`, icon: Target },
                      { label: "Avg Time", value: `${stats?.avgTime ?? 0}s`, icon: Star },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#fdf6ee] rounded-xl p-3 text-center">
                        <p className="text-xs text-[#7c6a55] mb-0.5">{label}</p>
                        <p className="font-black text-base text-[#1e1a14]">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-[#7c6a55]">
                    <span>View full progress</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics for selected kid */}
            {selectedKid && stats?.totalQuestions > 0 && (
              <div>
                <h3 className="text-xl font-black text-[#1e1a14] mb-5">
                  {selectedKid.name}'s Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  {sessionData.length > 1 && (
                    <div className="bg-white rounded-2xl border border-[rgba(120,90,50,0.1)] p-5">
                      <p className="font-bold text-sm text-[#1e1a14] mb-4">Score Trend</p>
                      <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={sessionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,90,50,0.1)" />
                          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {bloomData.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[rgba(120,90,50,0.1)] p-5">
                      <p className="font-bold text-sm text-[#1e1a14] mb-4">Bloom's Taxonomy Levels</p>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={bloomData} layout="vertical">
                          <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
                          <YAxis dataKey="level" type="category" tick={{ fontSize: 11 }} width={80} />
                          <Tooltip />
                          <Bar dataKey="score" radius={[0, 6, 6, 0]} fill="#f97316" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
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
