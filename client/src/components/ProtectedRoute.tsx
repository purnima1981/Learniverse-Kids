import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireParent?: boolean;
  requireChild?: boolean;
}

export function ProtectedRoute({ children, requireParent, requireChild }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isParent, isChild } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  if (requireParent && !isParent) {
    return <Redirect to="/kid-dashboard" />;
  }

  if (requireChild && !isChild) {
    return <Redirect to="/parent-dashboard" />;
  }

  return <>{children}</>;
}
