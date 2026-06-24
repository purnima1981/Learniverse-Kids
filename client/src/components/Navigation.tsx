import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { LogOut, Users } from "lucide-react";

export function Navigation() {
  const { user, activeProfile, isAuthenticated, isParent, isChild, logout, switchProfile } = useAuth();
  const [location, setLocation] = useLocation();

  // Don't show nav on landing, auth, or kid-dashboard (has its own header)
  if (!isAuthenticated || location === "/" || location === "/auth" || (isChild && location === "/kid-dashboard")) return null;

  return (
    <div className="bg-white border-b border-[rgba(120,90,50,0.1)] px-6 py-4 flex items-center justify-between">
      <Link href={isParent ? "/parent-dashboard" : "/kid-dashboard"}>
        <span className="font-black text-lg text-[#1e1a14]">LearnSmarter</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#7c6a55]">
          {isChild && activeProfile ? activeProfile.name : `Welcome, ${user?.firstName}`}
        </span>
        {isChild && (
          <button onClick={async () => { await switchProfile.mutateAsync(null); setLocation("/parent-dashboard"); }}
            className="p-2 hover:bg-[#f5ede0] rounded-lg transition-colors" title="Switch to Parent">
            <Users size={16} className="text-[#7c6a55]" />
          </button>
        )}
        <button onClick={async () => { await logout.mutateAsync(); setLocation("/auth"); }}
          className="p-2 hover:bg-[#f5ede0] rounded-lg transition-colors" title="Logout">
          <LogOut size={16} className="text-[#7c6a55]" />
        </button>
      </div>
    </div>
  );
}
