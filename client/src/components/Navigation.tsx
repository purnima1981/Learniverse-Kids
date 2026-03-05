import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, LogOut, Users, BarChart3, BookOpen, Home } from "lucide-react";

export function Navigation() {
  const { user, activeProfile, isAuthenticated, isParent, isChild, logout, switchProfile } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) return null;

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={isParent ? "/parent-dashboard" : "/kid-dashboard"} className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Learniverse</span>
        </Link>

        <div className="flex items-center gap-4">
          {isParent && (
            <>
              <Link href="/parent-dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <Link href="/profiles">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Users className="h-4 w-4" /> Kids
                </Button>
              </Link>
            </>
          )}

          {isChild && activeProfile && (
            <>
              <Link href="/kid-dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" /> Stories
                </Button>
              </Link>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {isChild && activeProfile
                      ? activeProfile.name[0].toUpperCase()
                      : user?.firstName?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                {isChild && activeProfile ? activeProfile.name : `${user?.firstName} ${user?.lastName}`}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {isChild && (
                <DropdownMenuItem
                  onClick={async () => {
                    await switchProfile.mutateAsync(null);
                    setLocation("/parent-dashboard");
                  }}
                >
                  <Users className="h-4 w-4 mr-2" /> Switch to Parent
                </DropdownMenuItem>
              )}

              {isParent && (
                <DropdownMenuItem onClick={() => setLocation("/profiles")}>
                  <Users className="h-4 w-4 mr-2" /> View as Kid
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await logout.mutateAsync();
                  setLocation("/auth");
                }}
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
