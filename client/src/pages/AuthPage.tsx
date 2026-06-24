import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { login, register, kidLogin, isAuthenticated, isParent } = useAuth();
  const [, setLocation] = useLocation();

  if (isAuthenticated) {
    setLocation(isParent ? "/parent-dashboard" : "/kid-dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-1 bg-hero-pattern animate-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 text-center max-w-lg text-white">
          <div className="text-7xl mb-6 animate-float">🧮</div>
          <h2 className="text-5xl font-extrabold mb-4 leading-tight">
            Master Math.<br />Win Olympiads.
          </h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Practice competition-level problems, track progress with Bloom's Taxonomy, and prepare to ace every math olympiad.
          </p>
          <div className="flex justify-center gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">8</div>
              <div className="text-sm opacity-80">Grade Levels</div>
            </div>
            <div className="w-px bg-white/30" />
            <div className="text-center">
              <div className="text-3xl font-bold">7</div>
              <div className="text-sm opacity-80">Categories</div>
            </div>
            <div className="w-px bg-white/30" />
            <div className="text-center">
              <div className="text-3xl font-bold">5K+</div>
              <div className="text-sm opacity-80">Questions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-fun-gradient">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="text-4xl">🎯</div>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">LearnSmarter</h1>
              <p className="text-sm text-muted-foreground">Math Olympiad Preparation</p>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 h-12 bg-muted/80">
              <TabsTrigger value="login" className="text-sm font-medium">Parent Login</TabsTrigger>
              <TabsTrigger value="register" className="text-sm font-medium">Register</TabsTrigger>
              <TabsTrigger value="kid" className="text-sm font-medium">Kid Login</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <ParentLoginForm
                onSubmit={async (data) => {
                  try {
                    await login.mutateAsync(data);
                    setLocation("/parent-dashboard");
                  } catch {
                    toast({ title: "Login failed", description: "Invalid email or password", variant: "destructive" });
                  }
                }}
                isLoading={login.isPending}
              />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm
                onSubmit={async (data) => {
                  try {
                    await register.mutateAsync(data);
                    setLocation("/parent-dashboard");
                  } catch {
                    toast({ title: "Registration failed", description: "Email may already be registered", variant: "destructive" });
                  }
                }}
                isLoading={register.isPending}
              />
            </TabsContent>

            <TabsContent value="kid">
              <KidLoginForm
                onSubmit={async (data) => {
                  try {
                    await kidLogin.mutateAsync(data);
                    setLocation("/kid-dashboard");
                  } catch {
                    toast({ title: "Login failed", description: "Check your email, name, and PIN", variant: "destructive" });
                  }
                }}
                isLoading={kidLogin.isPending}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ParentLoginForm({ onSubmit, isLoading }: { onSubmit: (data: { email: string; password: string }) => void; isLoading: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card className="border-0 shadow-xl shadow-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>Sign in to track your child's progress</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, password }); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@email.com" required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required className="h-11" />
          </div>
          <Button type="submit" className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (data: { email: string; password: string; firstName: string; lastName: string }) => void; isLoading: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <Card className="border-0 shadow-xl shadow-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Create Account</CardTitle>
        <CardDescription>Start your child's olympiad journey</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, password, firstName, lastName }); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
          </div>
          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function KidLoginForm({ onSubmit, isLoading }: { onSubmit: (data: { email: string; childName: string; pin: string }) => void; isLoading: boolean }) {
  const [email, setEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [pin, setPin] = useState("");

  return (
    <Card className="border-0 shadow-xl shadow-primary/5 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="pb-4">
        <div className="text-3xl mb-1">👋</div>
        <CardTitle className="text-xl">Hey there, champ!</CardTitle>
        <CardDescription>Ready to solve some cool math problems?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, childName, pin }); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kid-email">Parent's Email</Label>
            <Input id="kid-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your parent's email" required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kid-name">Your Name</Label>
            <Input id="kid-name" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="What's your name?" required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kid-pin">Your Secret PIN</Label>
            <Input id="kid-pin" type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} placeholder="4-digit PIN" required className="h-11 text-center text-xl tracking-[0.5em]" />
          </div>
          <Button type="submit" className="w-full h-12 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <span className="mr-2">🚀</span>}
            Let's Go!
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
