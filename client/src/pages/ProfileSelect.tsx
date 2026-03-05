import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, ArrowLeft } from "lucide-react";

interface ChildProfileSummary {
  id: number;
  name: string;
  grade: number;
  avatar: string;
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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/parent-dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Who's learning today?</h1>
          <p className="text-muted-foreground">Select a profile to continue as</p>
        </div>
      </div>

      {profiles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No child profiles yet. Generate an invite code from the dashboard.</p>
            <Button className="mt-4" onClick={() => setLocation("/parent-dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
              onClick={() => selectProfile(profile.id)}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {profile.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <p className="text-muted-foreground">Grade {profile.grade}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
