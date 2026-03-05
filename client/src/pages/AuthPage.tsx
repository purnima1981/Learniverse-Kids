import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { GraduationCap, Loader2, BookOpen, Users } from "lucide-react";

export default function AuthPage() {
  const { login, register, kidLogin, isAuthenticated, isParent } = useAuth();
  const [, setLocation] = useLocation();

  if (isAuthenticated) {
    setLocation(isParent ? "/parent-dashboard" : "/kid-dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">Learniverse</h1>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Parent Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="kid">Kid Login</TabsTrigger>
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
                    toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
                  }
                }}
                isLoading={kidLogin.isPending}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right: Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-primary/10 to-background items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="flex justify-center gap-4 mb-8">
            <BookOpen className="h-16 w-16 text-primary" />
            <Users className="h-16 w-16 text-primary/70" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Learn Through Stories</h2>
          <p className="text-lg text-muted-foreground">
            An educational platform where kids explore interactive stories,
            take quizzes tagged with Bloom's Taxonomy, and parents track their learning journey.
          </p>
        </div>
      </div>
    </div>
  );
}

function ParentLoginForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: { email: string; password: string }) => void;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your parent account</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ email, password });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: { email: string; password: string; firstName: string; lastName: string }) => void;
  isLoading: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Sign up as a parent to manage your kids' learning</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password !== confirm) {
              toast({ title: "Passwords don't match", variant: "destructive" });
              return;
            }
            onSubmit({ email, password, firstName, lastName });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reg-first">First Name</Label>
              <Input id="reg-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-last">Last Name</Label>
              <Input id="reg-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-confirm">Confirm Password</Label>
            <Input id="reg-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function KidLoginForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: { email: string; childName: string; pin: string }) => void;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [pin, setPin] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kid Login</CardTitle>
        <CardDescription>Enter your parent's email, your name, and your PIN</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ email, childName, pin });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="kid-email">Parent's Email</Label>
            <Input id="kid-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kid-name">Your Name</Label>
            <Input id="kid-name" value={childName} onChange={(e) => setChildName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kid-pin">Your PIN</Label>
            <Input id="kid-pin" type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} pattern="\d{4}" required placeholder="4-digit PIN" />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Let's Go!
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
