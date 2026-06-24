import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { LogOut, Users } from "lucide-react";

export function Navigation() {
  const { user, activeProfile, isAuthenticated, isParent, isChild, logout, switchProfile } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-card border-b px-6 py-4 flex items-center justify-between">
      <Link href={isParent ? "/parent-dashboard" : "/kid-dashboard"}>
        <span className="font-black text-lg">LearnSmarter</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {isChild && activeProfile ? activeProfile.name : `Welcome, ${user?.firstName}`}
        </span>
        {isChild && (
          <button
            onClick={async () => { await switchProfile.mutateAsync(null); setLocation("/parent-dashboard"); }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Switch to Parent"
          >
            <Users size={16} className="text-muted-foreground" />
          </button>
        )}
        {isParent && (
          <button
            onClick={() => setLocation("/profiles")}
            className="text-sm text-primary font-bold hover:underline"
          >
            Kid View
          </button>
        )}
        <button
          onClick={async () => { await logout.mutateAsync(); setLocation("/auth"); }}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut size={16} className="text-muted-foreground" />
        </button>
      </div>
    </nav>
  );
}
