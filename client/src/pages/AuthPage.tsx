import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { login, register, kidLogin, isAuthenticated, isParent } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "signup" | "kid">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [childName, setChildName] = useState("");
  const [pin, setPin] = useState("");

  if (isAuthenticated) {
    setLocation(isParent ? "/parent-dashboard" : "/kid-dashboard");
    return null;
  }

  async function handleSubmit() {
    try {
      if (mode === "login") {
        await login.mutateAsync({ email, password });
        setLocation("/parent-dashboard");
      } else if (mode === "signup") {
        await register.mutateAsync({ email, password, firstName, lastName });
        setLocation("/parent-dashboard");
      } else {
        await kidLogin.mutateAsync({ email, childName, pin });
        setLocation("/kid-dashboard");
      }
    } catch {
      toast({ title: mode === "kid" ? "Check your email, name, and PIN" : "Invalid credentials", variant: "destructive" });
    }
  }

  const isLoading = login.isPending || register.isPending || kidLogin.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6ee] to-[#fff7ed] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl border border-[rgba(120,90,50,0.1)] p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black mt-2 text-[#1e1a14]">LearnSmarter</h2>
          <p className="text-[#7c6a55] text-sm mt-1">
            {mode === "kid" ? "Student Portal" : "Parent Portal"}
          </p>
        </div>

        <div className="flex bg-[#f5ede0] rounded-xl p-1 mb-6">
          {([["login", "Sign In"], ["signup", "Register"], ["kid", "Kid Login"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === key ? "bg-white shadow text-[#1e1a14]" : "text-[#7c6a55]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-[#1e1a14] block mb-1.5">First Name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#fef9f3] border border-[rgba(120,90,50,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f97316]/30" />
              </div>
              <div>
                <label className="text-sm font-bold text-[#1e1a14] block mb-1.5">Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#fef9f3] border border-[rgba(120,90,50,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f97316]/30" />
              </div>
            </div>
          )}

          {mode === "kid" ? (
            <>
              <div>
                <label className="text-sm font-bold text-[#1e1a14] block mb-1.5">Parent's Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                  className="w-full bg-[#fef9f3] border border-[rgba(120,90,50,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f97316]/30" />
              </div>
              <div>
                <label className="text-sm font-bold text-[#1e1a14] block mb-1.5">Your Name</label>
                <input value={childName} onChange={(e) => setChildName(e.target.value)}
                  className="w-full bg-[#fef9f3] border border-[rgba(120,90,50,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f97316]/30" />
              </div>
              <div>
                <label className="text-sm font-bold text-[#1e1a14] block mb-1.5">PIN</label>
                <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" maxLength={4} placeholder="4-digit PIN"
                  className="w-full bg-[#fef9f3] border border-[rgba(120,90,50,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f97316]/30 text-center tracking-[0.3em]" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-bold text-[#1e1a14] block mb-1.5">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                  className="w-full bg-[#fef9f3] border border-[rgba(120,90,50,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f97316]/30" />
              </div>
              <div>
                <label className="text-sm font-bold text-[#1e1a14] block mb-1.5">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
                  className="w-full bg-[#fef9f3] border border-[rgba(120,90,50,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f97316]/30" />
              </div>
            </>
          )}

          <button onClick={handleSubmit} disabled={isLoading}
            className="w-full bg-[#f97316] text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Start Learning"}
          </button>
        </div>
      </div>
    </div>
  );
}
