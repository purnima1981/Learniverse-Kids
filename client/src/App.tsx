import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import ParentDashboard from "@/pages/ParentDashboard";
import JoinPage from "@/pages/JoinPage";
import ProfileSelect from "@/pages/ProfileSelect";
import KidDashboard from "@/pages/KidDashboard";
import PracticePage from "@/pages/PracticePage";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";

function Router() {
  const { isAuthenticated, isLoading, isParent } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

      {/* Fallback */}
      <Route>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-muted-foreground mt-2">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Router />
      <Toaster />
    </div>
  );
}
