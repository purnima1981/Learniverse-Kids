import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRight, Timer, Brain, BarChart3, Trophy, Shield,
  Zap, BookOpen, Star, Users, ChevronRight, Sparkles,
  Target, Palette, Gamepad2,
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isParent } = useAuth();

  if (isAuthenticated) {
    setLocation(isParent ? "/parent-dashboard" : "/kid-dashboard");
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>

      {/* ── HERO with gradient bg ─────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #1a1040 0%, #2d1b69 40%, #4a2c8a 70%, #6c3fa0 100%)" }}>
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-6xl mx-auto animate-fade-in">
          <span className="font-display font-bold text-2xl lg:text-3xl text-white">
            Learn<span style={{ color: "#f093fb" }}>Smarter</span>
          </span>
          <div className="flex items-center gap-3 font-body">
            <button onClick={() => setLocation("/auth")}
              className="text-sm font-semibold text-white/70 hover:text-white transition-colors px-3 py-2">
              Sign In
            </button>
            <button onClick={() => setLocation("/auth")}
              className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              Get Started
            </button>
          </div>
        </nav>

        <section className="max-w-6xl mx-auto px-6 lg:px-12 pt-12 pb-20 lg:pt-16 lg:pb-28 animate-slide-up">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 font-body"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <Sparkles size={14} /> For grades 1 to 8
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-5 text-white">
                Learn Smarter,<br />
                <span style={{ color: "#f093fb" }}>Compete Better</span>
              </h1>
              <p className="text-lg leading-relaxed font-body mb-8 max-w-lg" style={{ color: "rgba(255,255,255,0.65)" }}>
                Timed challenges designed for Olympiads and competitive exams. Kids play, parents track — everyone wins.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 font-body">
                <button onClick={() => setLocation("/auth")}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:shadow-lg hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "#fff", boxShadow: "0 4px 20px rgba(240,147,251,0.3)" }}>
                  Get Started Free <ArrowRight size={20} />
                </button>
                <button onClick={() => setLocation("/auth")}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold transition-all text-white"
                  style={{ border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.05)" }}>
                  I'm a Student <ChevronRight size={16} />
                </button>
              </div>
            </div>

          {/* Product preview mockup */}
          <div className="relative hidden lg:block">
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.3), 0 0 80px rgba(240,147,251,0.15)" }}>
              {/* Mock question card */}
              <div className="flex items-center gap-2 mb-3 font-body">
                <span className="pill pill-grape text-xs font-semibold">Medium</span>
                <span className="pill pill-grape text-xs">Geometry</span>
              </div>
              <div className="timer-track mb-4"><div className="timer-fill" style={{ width: "65%" }} /></div>
              <p className="font-display font-semibold text-foreground mb-4">A rectangle has length 12cm and width 8cm. What is its perimeter?</p>
              <div className="grid grid-cols-2 gap-2 font-body">
                {["32 cm", "40 cm", "96 cm", "20 cm"].map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm"
                    style={{
                      border: i === 1 ? "1.5px solid hsl(var(--grape))" : "1.5px solid hsl(var(--border))",
                      background: i === 1 ? "hsl(var(--grape-soft))" : "#fff",
                    }}>
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                      style={{
                        background: i === 1 ? "hsl(var(--grape))" : "hsl(var(--background))",
                        color: i === 1 ? "#fff" : "hsl(var(--muted-foreground))",
                      }}>{"ABCD"[i]}</span>
                    <span className="font-medium">{opt}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white font-body"
                style={{ background: "hsl(var(--grape))" }}>Confirm Answer</button>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-3 -right-3 bg-white rounded-xl px-3 py-2 shadow-elevated font-body text-xs font-bold flex items-center gap-1.5"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--grape))" }}>
              <Star size={14} /> Level 3: Scholar
            </div>
            <div className="absolute -bottom-3 -left-3 bg-white rounded-xl px-3 py-2 shadow-elevated font-body text-xs font-bold flex items-center gap-1.5"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--leaf))" }}>
              <Trophy size={14} /> 85% Accuracy
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20" style={{ background: "hsl(var(--card))" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <h2 className="font-display font-bold text-2xl lg:text-3xl text-center text-foreground mb-3">How it works</h2>
          <p className="text-center text-muted-foreground font-body mb-12 max-w-lg mx-auto">Three steps to better exam preparation</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Gamepad2, title: "Kids play challenges", desc: "Timed questions across topics and difficulty levels. Feels like a game — not homework.", color: "var(--grape)" },
              { step: "2", icon: Trophy, title: "Earn badges & level up", desc: "Every correct answer earns points. Unlock achievements, climb levels, customize your avatar.", color: "var(--coral)" },
              { step: "3", icon: BarChart3, title: "Parents see everything", desc: "Detailed progress tracking — accuracy, thinking skills, strengths, and areas to improve.", color: "var(--leaf)" },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `hsl(${color} / 0.1)`, color: `hsl(${color})` }}>
                  <Icon size={26} />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold text-white font-body"
                  style={{ background: `hsl(${color})` }}>{step}</div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <h2 className="font-display font-bold text-2xl lg:text-3xl text-center text-foreground mb-3">Built for real results</h2>
        <p className="text-center text-muted-foreground font-body mb-12 max-w-lg mx-auto">Everything kids and parents need in one place</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Timer, title: "Timed challenges", desc: "Per-question countdown builds exam speed and focus", color: "var(--grape)" },
            { icon: Brain, title: "6 thinking levels", desc: "Based on Bloom's Taxonomy — from recall to creative problem solving", color: "var(--coral)" },
            { icon: Target, title: "Adaptive difficulty", desc: "Easy, medium, hard, and Olympiad level questions", color: "var(--amber)" },
            { icon: Palette, title: "Personalization", desc: "Kids choose their avatar, theme color, and customize their page", color: "var(--leaf)" },
            { icon: Zap, title: "Adventure mode", desc: "Story-driven challenges — treasure hunts, escape rooms, space missions", color: "var(--grape)" },
            { icon: Shield, title: "Safe & private", desc: "No ads, no data selling. Built for families.", color: "var(--coral)" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-5 hover-lift transition-all font-body"
              style={{ border: "1px solid hsl(var(--border))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `hsl(${color} / 0.1)`, color: `hsl(${color})` }}>
                <Icon size={20} />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOR KIDS vs FOR PARENTS ───────────────────────────────────── */}
      <section className="py-16 lg:py-20" style={{ background: "hsl(var(--card))" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Kids */}
            <div className="rounded-2xl p-6 lg:p-8" style={{ background: "hsl(var(--grape-soft))" }}>
              <h3 className="font-display font-bold text-xl mb-4" style={{ color: "hsl(var(--grape))" }}>For Students</h3>
              <ul className="space-y-3 font-body">
                {[
                  "Pick topics and difficulty levels you want",
                  "Earn points and climb from Starter to Legend",
                  "Unlock badges like Sharpshooter and Champion",
                  "Play adventure modes — treasure hunts and escape rooms",
                  "Customize your avatar and page theme",
                  "Track your own accuracy and progress",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Star size={14} className="mt-0.5 shrink-0" style={{ color: "hsl(var(--grape))" }} />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Parents */}
            <div className="rounded-2xl p-6 lg:p-8" style={{ background: "hsl(var(--leaf-soft))" }}>
              <h3 className="font-display font-bold text-xl mb-4" style={{ color: "hsl(var(--leaf))" }}>For Parents</h3>
              <ul className="space-y-3 font-body">
                {[
                  "See accuracy, speed, and session history at a glance",
                  "Track thinking skills with Bloom's Taxonomy levels",
                  "Switch between children with one click",
                  "Know strengths and areas that need practice",
                  "Get narrative insights — not just numbers",
                  "Safe environment — no ads, no distractions",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Star size={14} className="mt-0.5 shrink-0" style={{ color: "hsl(var(--leaf))" }} />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 py-16 lg:py-20 text-center">
        <h2 className="font-display font-bold text-2xl lg:text-3xl text-foreground mb-3">Ready to start?</h2>
        <p className="text-muted-foreground font-body mb-8 max-w-md mx-auto">
          Join families preparing smarter for competitive exams. Free to get started.
        </p>
        <button onClick={() => setLocation("/auth")}
          className="inline-flex items-center gap-2 text-white px-10 py-4 rounded-2xl text-lg font-bold bg-gradient-fun shadow-fun transition-all hover:shadow-lg hover:scale-[1.02] font-body">
          Create Free Account <ArrowRight size={20} />
        </button>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="py-8 text-center font-body text-sm text-muted-foreground" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <span className="font-display font-bold">
          <span style={{ color: "hsl(var(--grape))" }}>Learn</span><span style={{ color: "hsl(var(--coral))" }}>Smarter</span>
        </span>
        <span className="mx-2">·</span>
        Built for families
        <span className="mx-2">·</span>
        Grades 1–8
      </footer>
    </div>
  );
}
