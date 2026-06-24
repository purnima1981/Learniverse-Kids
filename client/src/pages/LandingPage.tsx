import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Timer, Brain, BarChart2, Trophy, ArrowRight, Sparkles, GraduationCap, Shield, Users } from "lucide-react";

const FEATURES = [
  { icon: Timer, label: "Timed Tests", desc: "Per-question countdown builds exam readiness" },
  { icon: Brain, label: "Bloom's Taxonomy", desc: "6 cognitive levels from recall to creation" },
  { icon: BarChart2, label: "Parent Analytics", desc: "Granular insights into every session" },
  { icon: Trophy, label: "Progress Tracking", desc: "Watch skills grow over time" },
];

const TRUST_POINTS = [
  { icon: Shield, text: "Safe & private — no ads, no data selling" },
  { icon: Users, text: "Built for families with multiple children" },
  { icon: GraduationCap, text: "Aligned to Olympiad & competitive exam prep" },
];

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isParent } = useAuth();

  if (isAuthenticated) {
    setLocation(isParent ? "/parent-dashboard" : "/kid-dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl" style={{ color: "hsl(var(--grape))", letterSpacing: "-0.4px" }}>
            LearnSmarter
          </span>
          <span className="text-xs text-muted-foreground font-body">pilot</span>
        </div>
        <div className="flex items-center gap-3 font-body">
          <button
            onClick={() => setLocation("/auth")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => setLocation("/auth")}
            className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl shadow-primary transition-all hover:opacity-90"
            style={{ background: "hsl(var(--grape))" }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-8 pb-20 gap-10 animate-slide-up">
        <div className="max-w-2xl">
          <div className="pill pill-grape text-sm font-semibold mb-6 inline-flex">
            <Sparkles size={14} /> Grades 1–8 · Olympiad & Competitive Exams
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-5 text-foreground" style={{ letterSpacing: "-0.5px" }}>
            Learn Smarter,{" "}
            <span style={{ color: "hsl(var(--grape))" }}>Compete Better</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed font-body">
            Timed practice tests designed for competitive exam preparation.
            Parents track every detail. Kids level up with every attempt.
          </p>
        </div>

        <button
          onClick={() => setLocation("/auth")}
          className="flex items-center gap-2 text-white px-8 py-4 rounded-2xl text-base font-semibold shadow-primary transition-all hover:opacity-90 font-body"
          style={{ background: "hsl(var(--grape))" }}
        >
          Start for Free <ArrowRight size={18} />
        </button>

        {/* Feature cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 max-w-3xl w-full">
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className={`bg-white rounded-2xl p-4 text-left shadow-soft hover-lift animate-slide-up animate-stagger-${i + 1}`}
              style={{ animationFillMode: "both", border: "1px solid hsl(var(--border))" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "hsl(var(--grape-soft))", color: "hsl(var(--grape))" }}
              >
                <Icon size={20} />
              </div>
              <p className="font-display font-semibold text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-body">{desc}</p>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm text-muted-foreground font-body">
          {TRUST_POINTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={14} style={{ color: "hsl(var(--leaf))" }} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
