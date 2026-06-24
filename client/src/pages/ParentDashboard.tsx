import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { toast } from "@/components/ui/use-toast";
import { Plus, BarChart3, ChevronRight, Loader2, BookOpen, Target, Star } from "lucide-react";
import { useState } from "react";

interface ChildProfile {
  id: number;
  name: string;
  grade: number;
  avatar: string;
  createdAt: string;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(5);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  const { data: profiles = [], isLoading } = useQuery<ChildProfile[]>({ queryKey: ["/api/profiles"] });

  const createChild = useMutation({
    mutationFn: async (data: { name: string; grade: number; pin: string }) => {
      const res = await apiRequest("POST", "/api/profiles", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `${data.name}'s profile created!` });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setShowForm(false);
      setName(""); setPin(""); setPinConfirm("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed to create profile", variant: "destructive" });
    },
  });

  function handleAdd() {
    if (!name.trim()) return toast({ title: "Name is required", variant: "destructive" });
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) return toast({ title: "PIN must be 4 digits", variant: "destructive" });
    if (pin !== pinConfirm) return toast({ title: "PINs don't match", variant: "destructive" });
    createChild.mutate({ name: name.trim(), grade, pin });
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-foreground">My Children</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Child
        </button>
      </div>

      {/* Add Child Form */}
      {showForm && (
        <div className="bg-card rounded-2xl border p-6 mb-6">
          <h3 className="font-bold text-foreground mb-4">Add a Child</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-foreground block mb-1.5">Child's Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riya"
                className="w-full bg-muted/50 border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-bold text-foreground block mb-2">Grade</label>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                  <button key={g} onClick={() => setGrade(g)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      grade === g ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border"
                    }`}>{g}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">4-Digit PIN</label>
                <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} placeholder="1234"
                  className="w-full bg-muted/50 border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">Confirm PIN</label>
                <input type="password" value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)} maxLength={4} placeholder="1234"
                  className="w-full bg-muted/50 border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={createChild.isPending}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                {createChild.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Child
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Children */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : profiles.length === 0 && !showForm ? (
        <div className="bg-card rounded-2xl border p-12 text-center">
          <p className="text-lg font-bold text-foreground">No children yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Add your child to get started</p>
          <button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90">
            <Plus size={16} className="inline mr-1" /> Add Your First Child
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((kid) => (
            <div key={kid.id} className="bg-card rounded-2xl border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-lg">
                    {kid.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-lg text-foreground">{kid.name}</p>
                    <p className="text-sm text-muted-foreground">Grade {kid.grade}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setLocation(`/analytics/${kid.id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-muted/50 text-foreground px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-muted transition-colors">
                  <BarChart3 size={14} /> Analytics
                </button>
                <button onClick={() => setLocation("/profiles")}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-3 py-2.5 rounded-xl text-sm font-bold hover:opacity-90">
                  Kid View <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
