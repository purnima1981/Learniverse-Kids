import { Switch, Route, Redirect, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import ParentDashboard from "@/pages/ParentDashboard";
import JoinPage from "@/pages/JoinPage";
import ProfileSelect from "@/pages/ProfileSelect";
import KidDashboard from "@/pages/KidDashboard";
import PracticePage from "@/pages/PracticePage";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";

function NotFoundPage() {
  const { isAuthenticated, isParent } = useAuth();
  const homeLink = !isAuthenticated ? "/" : isParent ? "/parent-dashboard" : "/kid-dashboard";

  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-fade-in">
      <div className="text-center max-w-sm">
        <div className="text-6xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          404
        </div>
        <h1 className="text-lg font-semibold text-foreground mb-1">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft size={14} className="mr-1.5" /> Go Back
          </Button>
          <Link href={homeLink}>
            <Button size="sm" className="bg-gradient-primary">
              <Home size={14} className="mr-1.5" /> Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading, isParent } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/join/:code?" component={JoinPage} />

      {/* Parent */}
      <Route path="/parent-dashboard">
        <ProtectedRoute requireParent><ParentDashboard /></ProtectedRoute>
      </Route>
      <Route path="/profiles">
        <ProtectedRoute requireParent><ProfileSelect /></ProtectedRoute>
      </Route>
      <Route path="/analytics/:profileId">
        <ProtectedRoute requireParent><AnalyticsDashboard /></ProtectedRoute>
      </Route>

      {/* Kid */}
      <Route path="/kid-dashboard">
        <ProtectedRoute requireChild><KidDashboard /></ProtectedRoute>
      </Route>
      <Route path="/practice/:topicId">
        <ProtectedRoute requireChild><PracticePage /></ProtectedRoute>
      </Route>

      {/* 404 */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Router />
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
