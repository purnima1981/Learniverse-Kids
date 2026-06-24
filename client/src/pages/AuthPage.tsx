import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { toast } from "@/components/ui/use-toast";
import { Loader2, GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "signup" | "kid";

export default function AuthPage() {
  const { login, register, kidLogin, isAuthenticated, isParent } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<AuthMode>("login");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login.mutateAsync({ email, password });
        setLocation("/parent-dashboard");
      } else if (mode === "signup") {
        if (!firstName.trim() || !lastName.trim()) {
          return toast({ title: "Please fill in your name", variant: "destructive" });
        }
        if (password.length < 6) {
          return toast({ title: "Password must be at least 6 characters", variant: "destructive" });
        }
        await register.mutateAsync({ email, password, firstName, lastName });
        setLocation("/parent-dashboard");
      } else {
        if (pin.length !== 4) {
          return toast({ title: "PIN must be exactly 4 digits", variant: "destructive" });
        }
        await kidLogin.mutateAsync({ email, childName, pin });
        setLocation("/kid-dashboard");
      }
    } catch {
      const messages: Record<AuthMode, string> = {
        login: "Invalid email or password. Please try again.",
        signup: "Could not create account. Email may already be in use.",
        kid: "Login failed. Check the email, name, and PIN.",
      };
      toast({ title: "Authentication Failed", description: messages[mode], variant: "destructive" });
    }
  }

  const isLoading = login.isPending || register.isPending || kidLogin.isPending;

  const tabs: { key: AuthMode; label: string }[] = [
    { key: "login", label: "Sign In" },
    { key: "signup", label: "Register" },
    { key: "kid", label: "Student" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Back to landing */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 font-body">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="bg-white rounded-2xl shadow-elevated p-6 sm:p-8" style={{ border: "1px solid hsl(var(--border))" }}>
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🚀</div>
            <span className="font-display font-bold text-xl">
              <span style={{ color: "hsl(var(--grape))" }}>Learni</span><span style={{ color: "hsl(var(--coral))" }}>verse</span>
            </span>
            <h1 className="text-lg font-display font-semibold text-foreground mt-2">
              {mode === "kid" ? "Hey there! 👋" : "Welcome Back"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              {mode === "kid" ? "Enter your details to start playing" : "Sign in to see your children's progress"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl p-1 mb-6 font-body" style={{ background: "hsl(var(--grape-soft))" }}>
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: mode === key ? "#fff" : "transparent",
                  color: mode === key ? "hsl(var(--foreground))" : "hsl(var(--grape))",
                  boxShadow: mode === key ? "0 2px 8px rgba(40,30,80,0.07)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ravi" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sharma" required />
                </div>
              </div>
            )}

            {mode === "kid" ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="parentEmail">Parent's Email</Label>
                  <Input id="parentEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="childName">Your Name</Label>
                  <Input id="childName" value={childName} onChange={(e) => setChildName(e.target.value)}
                    placeholder="Riya" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pin">4-Digit PIN</Label>
                  <Input id="pin" type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="****" maxLength={4} className="text-center tracking-[0.3em] text-lg"
                    inputMode="numeric" pattern="\d{4}" required />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "Min 6 characters" : "Enter password"} required />
                </div>
              </>
            )}

            <Button type="submit" className="w-full h-11 text-white font-body font-semibold" style={{ background: "hsl(var(--grape))", boxShadow: "0 4px 14px hsl(var(--grape) / 0.25)" }} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Start Learning"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
