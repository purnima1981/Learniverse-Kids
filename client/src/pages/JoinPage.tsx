import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { GraduationCap, Loader2, CheckCircle2, Rocket, Star, Heart, Zap, Flame, Music, Palette, ArrowLeft } from "lucide-react";

const AVATARS = [
  { id: "rocket", icon: Rocket, label: "Rocket" },
  { id: "star", icon: Star, label: "Star" },
  { id: "heart", icon: Heart, label: "Heart" },
  { id: "zap", icon: Zap, label: "Lightning" },
  { id: "flame", icon: Flame, label: "Flame" },
  { id: "music", icon: Music, label: "Music" },
  { id: "palette", icon: Palette, label: "Artist" },
  { id: "graduation", icon: GraduationCap, label: "Scholar" },
];

export default function JoinPage() {
  const params = useParams<{ code?: string }>();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"code" | "profile" | "done">(params.code ? "profile" : "code");
  const [code, setCode] = useState(params.code?.toUpperCase() || "");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [avatar, setAvatar] = useState("rocket");
  const [state, setState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdName, setCreatedName] = useState("");

  async function validateCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      toast({ title: "Code must be 6 characters", variant: "destructive" });
      return;
    }
    setStep("profile");
  }

  async function createProfile(e: React.FormEvent) {
    e.preventDefault();
    if (pin !== pinConfirm) {
      return toast({ title: "PINs don't match", variant: "destructive" });
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return toast({ title: "PIN must be exactly 4 digits", variant: "destructive" });
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/invite/join", {
        code: code.toUpperCase(), name,
        grade: Number(grade), pin, avatar,
        state: state || null,
      });
      const data = await res.json();
      setCreatedName(data.profile.name);
      setStep("done");
    } catch (err: any) {
      const msg = err.message?.includes(":")
        ? err.message.split(":").slice(1).join(":").trim()
        : "Failed to create profile";
      let parsed = msg;
      try { parsed = JSON.parse(msg).message; } catch {}
      toast({ title: "Error", description: parsed, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-hero animate-scale-in">
        <Card className="w-full max-w-md text-center shadow-elevated">
          <CardContent className="py-10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, {createdName}!</h2>
            <p className="text-muted-foreground">
              Your profile has been created. Ask your parent for their email to log in.
            </p>
            <Button onClick={() => setLocation("/auth")} className="bg-gradient-primary shadow-primary mt-2">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-hero">
      <div className="w-full max-w-md animate-scale-in">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Join Learniverse 🚀</h1>
        </div>

        {step === "code" && (
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>Enter Invite Code</CardTitle>
              <CardDescription>Ask your parent for the 6-character code</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={validateCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code" value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-widest"
                    placeholder="ABCDEF" required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary shadow-primary">
                  Next
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "profile" && (
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>Create Your Profile</CardTitle>
              <CardDescription>Tell us about yourself!</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="child-name">Your Name</Label>
                  <Input id="child-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="child-grade">Your Grade</Label>
                  <Select value={grade} onValueChange={setGrade} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map((g) => (
                        <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="child-state">Your State (optional)</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {["TX","CA","NY","FL","IL","PA","OH","GA","NC","MI"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Choose Your Avatar</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATARS.map(({ id, icon: Icon, label }) => (
                      <button key={id} type="button" onClick={() => setAvatar(id)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          avatar === id ? "border-primary bg-primary/10" : "border-transparent hover:border-border hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="child-pin">4-Digit PIN</Label>
                    <Input id="child-pin" type="password" value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4} placeholder="****" inputMode="numeric" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="child-pin-confirm">Confirm PIN</Label>
                    <Input id="child-pin-confirm" type="password" value={pinConfirm}
                      onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4} placeholder="****" inputMode="numeric" required />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep("code")} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-gradient-primary shadow-primary" disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Create Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
