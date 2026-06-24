import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Timer, Brain, BarChart2, Trophy, ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isParent } = useAuth();

  if (isAuthenticated) {
    setLocation(isParent ? "/parent-dashboard" : "/kid-dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6ee] via-[#fff7ed] to-[#eff6ff] flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="font-black text-xl tracking-tight text-[#1e1a14]">LearnSmarter</span>
        <button
          onClick={() => setLocation("/auth")}
          className="bg-[#f97316] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition-colors"
        >
          Sign In
        </button>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-8 pb-16 gap-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <Sparkles size={14} /> For Grades 1–8 · Olympiad & Competitive Exams
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4 text-[#1e1a14]">
            Learn Smarter,<br />
            <span className="text-[#f97316]">Compete Better</span>
          </h1>
          <p className="text-lg text-[#7c6a55] max-w-xl mx-auto leading-relaxed">
            Timed practice tests aligned to Olympiad & competitive exam preparation.
            Parents track every detail. Kids level up with every attempt.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setLocation("/auth")}
            className="flex items-center gap-2 bg-[#f97316] text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
          >
            Start for Free <ArrowRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 max-w-3xl w-full">
          {[
            { icon: Timer, label: "Timed Tests", desc: "Per-question countdown", color: "bg-orange-100 text-orange-600" },
            { icon: Brain, label: "Bloom's Taxonomy", desc: "6 thinking levels", color: "bg-purple-100 text-purple-600" },
            { icon: BarChart2, label: "Parent Dashboard", desc: "Granular analytics", color: "bg-cyan-100 text-cyan-600" },
            { icon: Trophy, label: "Achievements", desc: "Track improvement", color: "bg-yellow-100 text-yellow-600" },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-[rgba(120,90,50,0.1)] text-left">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="font-bold text-sm text-[#1e1a14]">{label}</p>
              <p className="text-xs text-[#7c6a55] mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
