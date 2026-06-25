import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isParent } = useAuth();

  if (isAuthenticated) {
    setLocation(isParent ? "/parent-dashboard" : "/kid-dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 animate-fade-in">
        <span className="font-display font-bold text-xl">
          <span style={{ color: "hsl(var(--grape))" }}>Learn</span><span style={{ color: "hsl(var(--coral))" }}>Smarter</span>
        </span>
        <div className="flex items-center gap-3 font-body">
          <button onClick={() => setLocation("/auth")}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
            Sign In
          </button>
          <button onClick={() => setLocation("/auth")}
            className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all hover:opacity-90 bg-gradient-fun shadow-fun">
            Get Started
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-4 pb-20 gap-8 animate-slide-up">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-4 text-foreground">
            Learn Smarter,{" "}
            <span className="bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] bg-clip-text text-transparent">
              Compete Better
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed font-body">
            Timed practice for Olympiads and competitive exams. Track progress, earn badges, and level up — grades 1 to 8.
          </p>
        </div>

        <button onClick={() => setLocation("/auth")}
          className="flex items-center gap-2 text-white px-8 py-4 rounded-2xl text-lg font-bold bg-gradient-fun shadow-fun transition-all hover:shadow-lg hover:scale-[1.02] font-body">
          Get Started <ArrowRight size={20} />
        </button>

        <div className="flex flex-wrap justify-center gap-3 mt-4 font-body text-sm text-muted-foreground">
          <span>Timed challenges</span>
          <span className="opacity-30">·</span>
          <span>Earn badges</span>
          <span className="opacity-30">·</span>
          <span>Parent insights</span>
          <span className="opacity-30">·</span>
          <span>6 thinking levels</span>
          <span className="opacity-30">·</span>
          <span>Safe & private</span>
        </div>
      </div>
    </div>
  );
}
