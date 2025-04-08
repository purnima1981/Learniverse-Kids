import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ThemeSelection from "@/pages/ThemeSelection";
import Dashboard from "@/pages/Dashboard";
import StoryReader from "@/pages/StoryReader";
import ReadingCoach from "@/pages/ReadingCoach";
import AuthPage from "@/pages/auth-page";
import PersonalizationPage from "@/pages/PersonalizationPage";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function App() {
  return (
    <AuthProvider>
      <Switch>
        {/* Public routes */}
        <Route path="/auth" component={AuthPage} />
        
        {/* Protected routes */}
        <ProtectedRoute path="/" component={Dashboard} />
        <ProtectedRoute path="/personalization" component={PersonalizationPage} />
        <ProtectedRoute path="/theme-selection" component={ThemeSelection} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/story/:id/:chapter" component={StoryReader} />
        <ProtectedRoute path="/reading-coach" component={ReadingCoach} />
        
        {/* Redirects */}
        <Route path="/login">
          <Redirect to="/auth" />
        </Route>
        <Route path="/register">
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
