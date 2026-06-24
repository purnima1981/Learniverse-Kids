import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import {
  LogOut, Users, Home, ChevronLeft,
  Menu, X, BarChart3,
} from "lucide-react";
import { useState } from "react";

const PARENT_NAV = [
  { href: "/parent-dashboard", label: "Dashboard", icon: Home },
  { href: "/profiles", label: "Switch Profile", icon: Users },
];

export function Navigation() {
  const { user, activeProfile, isAuthenticated, isParent, isChild, logout, switchProfile } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't show on public pages
  if (!isAuthenticated || location === "/" || location === "/auth" || location.startsWith("/join")) return null;

  // ── CHILD NAVIGATION ──────────────────────────────────────────────────
  if (isChild) {
    const isOnDashboard = location === "/kid-dashboard";
    return (
      <header
        className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-50"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <div className="flex items-center gap-3">
          {!isOnDashboard && (
            <button
              onClick={() => setLocation("/kid-dashboard")}
              className="flex items-center gap-1.5 text-sm font-medium hover:text-foreground transition-colors font-body"
              style={{ color: "hsl(var(--grape))" }}
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <span className="font-display font-bold text-base" style={{ color: "hsl(var(--grape))", letterSpacing: "-0.3px" }}>
            LearnSmarter
          </span>
        </div>
        <div className="flex items-center gap-2 font-body">
          <span className="text-sm text-muted-foreground">{activeProfile?.name}</span>
          <button
            onClick={async () => { await switchProfile.mutateAsync(null); setLocation("/parent-dashboard"); }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Switch to parent mode"
            title="Parent Mode"
          >
            <Users size={14} className="text-muted-foreground" />
          </button>
          <button
            onClick={async () => { await logout.mutateAsync(); setLocation("/auth"); }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Sign out"
            title="Sign Out"
          >
            <LogOut size={14} className="text-muted-foreground" />
          </button>
        </div>
      </header>
    );
  }

  // ── PARENT NAVIGATION ─────────────────────────────────────────────────
  const isOnDashboard = location === "/parent-dashboard";

  return (
    <>
      <header
        className="bg-white px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-50"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Back button on sub-pages, brand on dashboard */}
          {!isOnDashboard ? (
            <button
              onClick={() => setLocation("/parent-dashboard")}
              className="flex items-center gap-1.5 text-sm font-medium hover:text-foreground transition-colors font-body"
              style={{ color: "hsl(var(--grape))" }}
            >
              <ChevronLeft size={16} /> Back to Dashboard
            </button>
          ) : (
            <span className="font-display font-bold text-base" style={{ color: "hsl(var(--grape))", letterSpacing: "-0.3px" }}>
              LearnSmarter
            </span>
          )}

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 ml-3 font-body" aria-label="Main navigation">
            {PARENT_NAV.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: isActive ? "hsl(var(--grape-soft))" : "transparent",
                    color: isActive ? "hsl(var(--grape))" : "hsl(var(--muted-foreground))",
                  }}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 font-body">
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.firstName}</span>
          <button
            onClick={async () => { await logout.mutateAsync(); setLocation("/auth"); }}
            className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground"
            aria-label="Sign out"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 lg:hidden p-4 pt-16 animate-fade-in font-body" style={{ borderRight: "1px solid hsl(var(--border))" }}>
            <div className="mb-4">
              <span className="font-display font-bold text-lg" style={{ color: "hsl(var(--grape))" }}>LearnSmarter</span>
            </div>
            <nav className="space-y-1" aria-label="Mobile navigation">
              {PARENT_NAV.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: isActive ? "hsl(var(--grape-soft))" : "transparent",
                      color: isActive ? "hsl(var(--grape))" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <hr style={{ borderColor: "hsl(var(--border))", margin: "12px 0" }} />
              <button
                onClick={async () => { await logout.mutateAsync(); setLocation("/auth"); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full"
                style={{ color: "hsl(var(--coral))" }}
              >
                <LogOut size={18} /> Sign Out
              </button>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
