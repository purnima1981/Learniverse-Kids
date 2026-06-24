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
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">LearnSmarter</h1>
          <p className="text-muted-foreground mt-1">Prepare smarter. Compete stronger.</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-11">
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
  );
}

function ParentLoginForm({ onSubmit, isLoading }: { onSubmit: (data: { email: string; password: string }) => void; isLoading: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Welcome back</CardTitle>
        <CardDescription>Sign in to manage your children's learning</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, password }); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-10" />
          </div>
          <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Create account</CardTitle>
        <CardDescription>Get started with your children's preparation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, password, firstName, lastName }); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-10" />
          </div>
          <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Kid login</CardTitle>
        <CardDescription>Use your parent's email, your name, and your PIN</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, childName, pin }); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kid-email">Parent's email</Label>
            <Input id="kid-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kid-name">Your name</Label>
            <Input id="kid-name" value={childName} onChange={(e) => setChildName(e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kid-pin">PIN</Label>
            <Input id="kid-pin" type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} placeholder="4-digit PIN" required className="h-10 text-center tracking-[0.3em]" />
          </div>
          <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Start Learning
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
