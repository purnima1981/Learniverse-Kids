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
import { LogOut, Users, BarChart3, Home, ChevronDown } from "lucide-react";

export function Navigation() {
  const { user, activeProfile, isAuthenticated, isParent, isChild, logout, switchProfile } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={isParent ? "/parent-dashboard" : "/kid-dashboard"} className="flex items-center gap-2.5">
          <span className="font-extrabold text-xl text-foreground">LearnSmarter</span>
        </Link>

        <div className="flex items-center gap-2">
          {isParent && (
            <>
              <Link href="/parent-dashboard">
                <Button variant="ghost" size="sm" className="gap-2 font-medium">
                  <Home className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <Link href="/profiles">
                <Button variant="ghost" size="sm" className="gap-2 font-medium">
                  <Users className="h-4 w-4" /> Kids
                </Button>
              </Link>
            </>
          )}

          {isChild && activeProfile && (
            <Link href="/kid-dashboard">
              <Button variant="ghost" size="sm" className="gap-2 font-medium">
                Practice
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {isChild && activeProfile
                      ? activeProfile.name[0].toUpperCase()
                      : user?.firstName?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">
                  {isChild && activeProfile ? activeProfile.name : user?.firstName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <div className="font-medium">{isChild && activeProfile ? activeProfile.name : `${user?.firstName} ${user?.lastName}`}</div>
                <div className="text-xs text-muted-foreground">{isChild ? `Grade ${activeProfile?.grade}` : user?.email}</div>
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
                className="text-red-600"
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
