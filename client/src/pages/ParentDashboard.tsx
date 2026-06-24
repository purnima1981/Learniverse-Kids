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
} from "lucide-react";
import { useState } from "react";

interface ChildProfileSummary {
  id: number;
  name: string;
  grade: number;
  avatar: string;
  state: string | null;
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
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 border border-primary/10 p-8">
        <p className="text-sm text-muted-foreground mb-1">Parent Dashboard</p>
        <h1 className="text-3xl font-extrabold text-foreground">
          Welcome, {user?.firstName}! 👋
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Track your children's math olympiad preparation and help them excel.
        </p>
      </div>

      {/* Add Child */}
      <Card className="border-0 shadow-lg shadow-primary/5 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" /> Add Your Child
          </CardTitle>
          <CardDescription>
            Generate a code and share it with your child to create their profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => generateInvite.mutate()}
            disabled={generateInvite.isPending}
            className="h-11 font-semibold"
          >
            {generateInvite.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Generate Invite Code
          </Button>

          {generatedCode && (
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-primary/20 shadow-sm">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Share this code:</p>
                <p className="text-4xl font-mono font-extrabold tracking-[0.3em] text-primary mt-1">
                  {generatedCode}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Or link: <span className="text-primary font-medium">{window.location.origin}/join/{generatedCode}</span>
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
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

      {/* Children */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            👨‍👧‍👦 Your Children
          </h2>
          {profiles.length > 0 && (
            <Badge variant="secondary" className="font-normal">
              {profiles.length} profile{profiles.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profiles.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">🎓</div>
              <p className="text-xl font-semibold">No children yet</p>
              <p className="text-muted-foreground mt-2">
                Generate an invite code above to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Card key={profile.id} className="card-hover border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {profile.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">Grade {profile.grade}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 font-medium"
                      onClick={() => setLocation(`/analytics/${profile.id}`)}
                    >
                      <BarChart3 className="h-4 w-4 mr-1.5" /> Analytics
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 font-medium"
                      onClick={() => setLocation("/profiles")}
                    >
                      View as Kid <ArrowRight className="h-4 w-4 ml-1.5" />
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
