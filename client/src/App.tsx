import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ThemeSelection from "@/pages/ThemeSelection";
import Dashboard from "@/pages/Dashboard";
import StoryReader from "@/pages/StoryReader";
import AuthPage from "@/pages/auth-page";
import RegionalStoriesPage from "@/pages/RegionalStoriesPage";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// HomePage component that handles conditional routing based on user state
function HomePage() {
  const { user } = useAuth();
  
  // If user has no theme selected, redirect to theme selection
  if (user && !user.themeId) {
    return <Redirect to="/theme-selection" />;
  }
  
  // If user is logged in and has theme, show dashboard
  if (user) {
    return <Dashboard />;
  }
  
  // Otherwise redirect to auth page
  return <Redirect to="/auth" />;
}

function App() {
  return (
    <AuthProvider>
      <Switch>
        {/* Public routes */}
        <Route path="/auth" component={AuthPage} />
        <Route path="/story/:id/:chapter" component={StoryReader} />
        
        {/* Protected routes */}
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/theme-selection" component={ThemeSelection} />
        <ProtectedRoute path="/regional-stories/:themeId" component={RegionalStoriesPage} />
        
        {/* Redirects */}
        <Route path="/login">
          <Redirect to="/auth" />
        </Route>
        <Route path="/register">
          <Redirect to="/auth" />
        </Route>
        <Route path="/personalization">
          <Redirect to="/theme-selection" />
        </Route>
        <Route path="/reading-coach">
          <Redirect to="/dashboard" />
        </Route>
        <Route path="/challenges">
          <Redirect to="/dashboard" />
        </Route>
        
        {/* Home page - decide where to direct users based on whether they have selected a theme */}
        <Route path="/" component={HomePage} />
        
        {/* 404 for any other routes */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
