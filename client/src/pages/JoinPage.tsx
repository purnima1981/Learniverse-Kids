import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { GraduationCap, Loader2, CheckCircle2, Rocket, Star, Heart, Zap, Flame, Music, Palette } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [createdName, setCreatedName] = useState("");

  async function validateCode() {
    if (code.length !== 6) {
      toast({ title: "Code must be 6 characters", variant: "destructive" });
      return;
    }
    setStep("profile");
  }

  async function createProfile() {
    if (pin !== pinConfirm) {
      toast({ title: "PINs don't match", variant: "destructive" });
      return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({ title: "PIN must be 4 digits", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/invite/join", {
        code: code.toUpperCase(),
        name,
        grade: Number(grade),
        pin,
        avatar,
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
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Welcome, {createdName}!</h2>
            <p className="text-muted-foreground">
              Your profile has been created. Ask your parent for their email to log in.
            </p>
            <Button onClick={() => setLocation("/auth")} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <GraduationCap className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold">Join LearnSmarter</h1>
        </div>

        {step === "code" && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Invite Code</CardTitle>
              <CardDescription>Ask your parent for the 6-character code</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  validateCode();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-widest"
                    placeholder="ABCDEF"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Next
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Profile</CardTitle>
              <CardDescription>Tell us about yourself!</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createProfile();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="child-name">Your Name</Label>
                  <Input id="child-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child-grade">Your Grade</Label>
                  <Select value={grade} onValueChange={setGrade} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                        <SelectItem key={g} value={g.toString()}>
                          Grade {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Choose Your Avatar</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATARS.map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setAvatar(id)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          avatar === id
                            ? "border-primary bg-primary/10"
                            : "border-transparent hover:border-muted"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child-pin">Create a 4-digit PIN</Label>
                  <Input
                    id="child-pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={4}
                    pattern="\d{4}"
                    placeholder="****"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child-pin-confirm">Confirm PIN</Label>
                  <Input
                    id="child-pin-confirm"
                    type="password"
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value)}
                    maxLength={4}
                    pattern="\d{4}"
                    placeholder="****"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep("code")} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
