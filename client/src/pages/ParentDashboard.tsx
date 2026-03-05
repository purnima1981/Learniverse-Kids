import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import {
  UserPlus,
  Copy,
  BarChart3,
  ArrowRight,
  Loader2,
  Users,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";

interface ChildProfileSummary {
  id: number;
  name: string;
  grade: number;
  avatar: string;
  createdAt: string;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const { data: profiles = [], isLoading } = useQuery<ChildProfileSummary[]>({
    queryKey: ["/api/profiles"],
  });

  const generateInvite = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/invite/generate");
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedCode(data.code);
      toast({ title: "Invite code generated!", description: `Code: ${data.code}` });
    },
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your children's learning profiles and track their progress.
        </p>
      </div>

      {/* Invite Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Invite Your Child
          </CardTitle>
          <CardDescription>
            Generate an invite code and share it with your child to create their learning profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => generateInvite.mutate()}
            disabled={generateInvite.isPending}
          >
            {generateInvite.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Generate Invite Code
          </Button>

          {generatedCode && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-card border">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Share this code with your child:</p>
                <p className="text-3xl font-mono font-bold tracking-widest mt-1">
                  {generatedCode}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Or share this link: <span className="text-primary">{window.location.origin}/join/{generatedCode}</span>
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  toast({ title: "Copied!" });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Children Profiles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" /> Your Children
          </h2>
          {profiles.length > 0 && (
            <Badge variant="secondary">{profiles.length} profile{profiles.length !== 1 ? "s" : ""}</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profiles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No children yet</p>
              <p className="text-muted-foreground mt-1">
                Generate an invite code above to get your child started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary text-lg">
                        {profile.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">Grade {profile.grade}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/analytics/${profile.id}`)}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" /> Analytics
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation("/profiles")}
                    >
                      View as Kid <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
