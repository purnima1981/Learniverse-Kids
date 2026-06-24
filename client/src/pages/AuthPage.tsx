import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { login, register, kidLogin, isAuthenticated, isParent } = useAuth();
  const [, setLocation] = useLocation();
  const [view, setView] = useState<"login" | "register" | "kid">("login");

  if (isAuthenticated) {
    setLocation(isParent ? "/parent-dashboard" : "/kid-dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card rounded-3xl shadow-xl border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-foreground">LearnSmarter</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {view === "kid" ? "Student Portal" : "Parent Portal"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          {([["login", "Sign In"], ["register", "Register"], ["kid", "Kid Login"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                view === key ? "bg-card shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {view === "login" && (
          <LoginForm
            onSubmit={async (data) => {
              try { await login.mutateAsync(data); setLocation("/parent-dashboard"); }
              catch { toast({ title: "Invalid email or password", variant: "destructive" }); }
            }}
            isLoading={login.isPending}
          />
        )}
        {view === "register" && (
          <RegisterForm
            onSubmit={async (data) => {
              try { await register.mutateAsync(data); setLocation("/parent-dashboard"); }
              catch { toast({ title: "Registration failed", variant: "destructive" }); }
            }}
            isLoading={register.isPending}
          />
        )}
        {view === "kid" && (
          <KidForm
            onSubmit={async (data) => {
              try { await kidLogin.mutateAsync(data); setLocation("/kid-dashboard"); }
              catch { toast({ title: "Check your email, name, and PIN", variant: "destructive" }); }
            }}
            isLoading={kidLogin.isPending}
          />
        )}
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-bold text-foreground block mb-1.5">{label}</label>
      <input
        className="w-full bg-muted/50 border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        {...props}
      />
    </div>
  );
}

function SubmitButton({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: (d: { email: string; password: string }) => void; isLoading: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, password }); }} className="space-y-4">
      <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <SubmitButton isLoading={isLoading}>Sign In</SubmitButton>
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (d: { email: string; password: string; firstName: string; lastName: string }) => void; isLoading: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, password, firstName, lastName }); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <Field label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
      <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <SubmitButton isLoading={isLoading}>Create Account</SubmitButton>
    </form>
  );
}

function KidForm({ onSubmit, isLoading }: { onSubmit: (d: { email: string; childName: string; pin: string }) => void; isLoading: boolean }) {
  const [email, setEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [pin, setPin] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, childName, pin }); }} className="space-y-4">
      <Field label="Parent's email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Field label="Your name" value={childName} onChange={(e) => setChildName(e.target.value)} required />
      <Field label="PIN" type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} placeholder="4-digit PIN" required />
      <SubmitButton isLoading={isLoading}>Start Learning</SubmitButton>
    </form>
  );
}
