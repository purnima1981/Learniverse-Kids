import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  UserPlus,
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
  const [showForm, setShowForm] = useState(false);
  const [childName, setChildName] = useState("");
  const [childGrade, setChildGrade] = useState("");
  const [childPin, setChildPin] = useState("");
  const [childPinConfirm, setChildPinConfirm] = useState("");

  const { data: profiles = [], isLoading } = useQuery<ChildProfileSummary[]>({
    queryKey: ["/api/profiles"],
  });

  const createChild = useMutation({
    mutationFn: async (data: { name: string; grade: number; pin: string }) => {
      const res = await apiRequest("POST", "/api/profiles", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `${data.name}'s profile created!` });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setShowForm(false);
      setChildName("");
      setChildGrade("");
      setChildPin("");
      setChildPinConfirm("");
    },
    onError: () => {
      toast({ title: "Failed to create profile", variant: "destructive" });
    },
  });

  function handleCreateChild() {
    if (!childName || !childGrade || !childPin) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (childPin.length !== 4 || !/^\d{4}$/.test(childPin)) {
      toast({ title: "PIN must be 4 digits", variant: "destructive" });
      return;
    }
    if (childPin !== childPinConfirm) {
      toast({ title: "PINs don't match", variant: "destructive" });
      return;
    }
    createChild.mutate({ name: childName, grade: Number(childGrade), pin: childPin });
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 border border-primary/10 p-8">
        <p className="text-sm text-muted-foreground mb-1">Parent Dashboard</p>
        <h1 className="text-3xl font-extrabold text-foreground">
          Welcome, {user?.firstName}! 👋
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Manage your children's profiles and track their math olympiad preparation.
        </p>
      </div>

      {/* Children Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            👨‍👧‍👦 Your Children
          </h2>
          <div className="flex items-center gap-2">
            {profiles.length > 0 && (
              <Badge variant="secondary" className="font-normal">
                {profiles.length} profile{profiles.length !== 1 ? "s" : ""}
              </Badge>
            )}
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="font-semibold">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Add Child
            </Button>
          </div>
        </div>

        {/* Add Child Form */}
        {showForm && (
          <Card className="mb-6 border-0 shadow-lg shadow-primary/5 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" /> Add a Child
              </CardTitle>
              <CardDescription>
                Create a profile for your child. They'll use their name and PIN to log in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="child-name">Child's Name</Label>
                  <Input
                    id="child-name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Enter name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="child-grade">Grade</Label>
                  <Select value={childGrade} onValueChange={setChildGrade}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                        <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="child-pin">4-Digit PIN</Label>
                  <Input
                    id="child-pin"
                    type="password"
                    value={childPin}
                    onChange={(e) => setChildPin(e.target.value)}
                    placeholder="e.g. 1234"
                    maxLength={4}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="child-pin-confirm">Confirm PIN</Label>
                  <Input
                    id="child-pin-confirm"
                    type="password"
                    value={childPinConfirm}
                    onChange={(e) => setChildPinConfirm(e.target.value)}
                    placeholder="Repeat PIN"
                    maxLength={4}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button variant="outline" onClick={() => setShowForm(false)} className="font-medium">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateChild}
                  disabled={createChild.isPending}
                  className="font-semibold"
                >
                  {createChild.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Children List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profiles.length === 0 && !showForm ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">🎓</div>
              <p className="text-xl font-semibold">No children yet</p>
              <p className="text-muted-foreground mt-2 mb-4">
                Add your child's profile to get started with math practice.
              </p>
              <Button onClick={() => setShowForm(true)} className="font-semibold">
                <UserPlus className="h-4 w-4 mr-2" /> Add Your First Child
              </Button>
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
