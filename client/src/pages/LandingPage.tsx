import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Timer, Brain, BarChart2, Trophy, ArrowRight, Sparkles, GraduationCap, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Timer, label: "Timed Tests", desc: "Per-question countdown builds exam readiness", color: "bg-primary/10 text-primary" },
  { icon: Brain, label: "Bloom's Taxonomy", desc: "6 cognitive levels from recall to creation", color: "bg-accent/10 text-accent" },
  { icon: BarChart2, label: "Parent Analytics", desc: "Granular insights into every session", color: "bg-secondary/10 text-secondary" },
  { icon: Trophy, label: "Progress Tracking", desc: "Watch skills grow over time", color: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]" },
];

const TRUST_POINTS = [
  { icon: Shield, text: "Safe & private - no ads, no data selling" },
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
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-xl text-foreground tracking-tight">LearnVerse</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/auth")}>
            Sign In
          </Button>
          <Button size="sm" onClick={() => setLocation("/auth")} className="bg-gradient-primary shadow-primary">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-8 pb-20 gap-10 animate-slide-up">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={14} /> Grades 1-8 &middot; Olympiad & Competitive Exams
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 text-foreground">
            Where Learning Meets{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Adventure
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Timed practice tests designed for competitive exam preparation.
            Parents track every detail. Kids level up with every attempt.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            onClick={() => setLocation("/auth")}
            className="bg-gradient-primary shadow-primary text-base px-8 h-12"
          >
            Start for Free <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 max-w-3xl w-full">
          {FEATURES.map(({ icon: Icon, label, desc, color }, i) => (
            <div
              key={label}
              className={`bg-white rounded-xl p-4 border border-border text-left shadow-soft hover-lift animate-slide-up animate-stagger-${i + 1}`}
              style={{ animationFillMode: "both" }}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon size={20} />
              </div>
              <p className="font-semibold text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
          {TRUST_POINTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={14} className="text-secondary" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
