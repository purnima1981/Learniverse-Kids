import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import {
  LogOut, Users, Home, BarChart3, UserPlus, ChevronRight,
  GraduationCap, Menu, X, BookOpen,
} from "lucide-react";
import { useState } from "react";

const PARENT_NAV = [
  { href: "/parent-dashboard", label: "Dashboard", icon: Home },
  { href: "/profiles", label: "Switch Profile", icon: Users },
];

function Breadcrumb() {
  const [location] = useLocation();

  const crumbs: { label: string; href?: string }[] = [{ label: "Home" }];

  if (location.startsWith("/parent-dashboard")) {
    crumbs[0].href = "/parent-dashboard";
    crumbs.push({ label: "Dashboard" });
  } else if (location.startsWith("/analytics")) {
    crumbs[0].href = "/parent-dashboard";
    crumbs.push({ label: "Analytics" });
  } else if (location.startsWith("/profiles")) {
    crumbs[0].href = "/parent-dashboard";
    crumbs.push({ label: "Profiles" });
  } else if (location.startsWith("/kid-dashboard")) {
    crumbs.push({ label: "My Dashboard" });
  } else if (location.startsWith("/practice")) {
    crumbs[0].href = "/kid-dashboard";
    crumbs.push({ label: "Practice" });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} className="opacity-40" />}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Navigation() {
  const { user, activeProfile, isAuthenticated, isParent, isChild, logout, switchProfile } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't show on public pages
  if (!isAuthenticated || location === "/" || location === "/auth" || location.startsWith("/join")) return null;

  // Kid header — shown on kid pages (kid-dashboard has its own, but practice/other kid pages need this)
  if (isChild && location === "/kid-dashboard") return null;

  if (isChild) {
    return (
      <header className="bg-white border-b border-border px-4 py-3 flex items-center justify-between animate-slide-down">
        <Link href="/kid-dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="font-bold text-foreground">LearnVerse</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {activeProfile?.name}
          </span>
          <button
            onClick={async () => { await switchProfile.mutateAsync(null); setLocation("/parent-dashboard"); }}
            className="p-2 rounded-lg hover:bg-muted transition-colors focus-ring"
            aria-label="Switch to parent mode"
            title="Switch to Parent"
          >
            <Users size={16} className="text-muted-foreground" />
          </button>
        </div>
      </header>
    );
  }

  // Parent navigation
  return (
    <>
      <header className="bg-white border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between animate-slide-down sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors focus-ring"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link href="/parent-dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold text-foreground hidden sm:block">LearnVerse</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label="Main navigation">
            {PARENT_NAV.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Breadcrumb />
          <div className="h-5 w-px bg-border hidden lg:block" />
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user?.firstName}
          </span>
          <button
            onClick={async () => { await logout.mutateAsync(); setLocation("/auth"); }}
            className="p-2 rounded-lg hover:bg-muted transition-colors focus-ring"
            aria-label="Sign out"
            title="Sign Out"
          >
            <LogOut size={16} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-border z-50 lg:hidden animate-slide-down p-4 pt-16">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {PARENT_NAV.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <hr className="my-3 border-border" />
              <button
                onClick={async () => { await logout.mutateAsync(); setLocation("/auth"); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
