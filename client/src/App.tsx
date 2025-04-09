import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ThemeSelection from "@/pages/ThemeSelection";
import Dashboard from "@/pages/Dashboard";
import StoryReader from "@/pages/StoryReader";
import ReadingCoach from "@/pages/ReadingCoach";
import AuthPage from "@/pages/auth-page";
import RegionalStoriesPage from "@/pages/RegionalStoriesPage";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function App() {
  return (
    <AuthProvider>
      <Switch>
        {/* Public routes */}
        <Route path="/auth" component={AuthPage} />
        
        {/* Protected routes */}
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/theme-selection" component={ThemeSelection} />
        <ProtectedRoute path="/regional-stories/:themeId" component={RegionalStoriesPage} />
        <ProtectedRoute path="/story/:id/:chapter" component={StoryReader} />
        <ProtectedRoute path="/reading-coach" component={ReadingCoach} />
        
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
        
        {/* Default route - redirect to auth page */}
        <Route path="/">
          <Redirect to="/auth" />
        </Route>
        
        {/* 404 Route */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
