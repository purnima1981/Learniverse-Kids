import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, GraduationCap, Users } from "lucide-react";

interface ChildProfileSummary {
  id: number;
  name: string;
  grade: number;
  avatar: string;
  state: string | null;
}

export default function ProfileSelect() {
  const { switchProfile } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profiles = [], isLoading } = useQuery<ChildProfileSummary[]>({
    queryKey: ["/api/profiles"],
  });

  async function selectProfile(profileId: number) {
    await switchProfile.mutateAsync(profileId);
    setLocation("/kid-dashboard");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/parent-dashboard")} aria-label="Back to dashboard">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Who's learning today?</h1>
          <p className="text-sm text-muted-foreground">Select a profile to continue as</p>
        </div>
      </div>

      {profiles.length === 0 ? (
        <Card className="border-dashed shadow-soft">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Users size={28} className="text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">No profiles yet</p>
            <p className="text-sm text-muted-foreground mb-4">Add a child from the dashboard first.</p>
            <Button onClick={() => setLocation("/parent-dashboard")} className="bg-gradient-primary shadow-primary">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {profiles.map((profile, i) => (
            <Card
              key={profile.id}
              className="cursor-pointer hover:ring-2 hover:ring-primary/30 hover:shadow-elevated transition-all hover-lift shadow-soft animate-slide-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
              onClick={() => selectProfile(profile.id)}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {profile.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">Grade {profile.grade}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
