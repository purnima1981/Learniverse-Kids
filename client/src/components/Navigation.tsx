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
import { LogOut, Users, ChevronDown } from "lucide-react";

export function Navigation() {
  const { user, activeProfile, isAuthenticated, isParent, isChild, logout, switchProfile } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={isParent ? "/parent-dashboard" : "/kid-dashboard"}>
          <span className="font-bold text-lg">LearnSmarter</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
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
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="font-medium">
                {isChild && activeProfile ? activeProfile.name : `${user?.firstName} ${user?.lastName}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {isChild ? `Grade ${activeProfile?.grade}` : user?.email}
              </div>
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
                <Users className="h-4 w-4 mr-2" /> Switch to Kid View
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
    </nav>
  );
}
