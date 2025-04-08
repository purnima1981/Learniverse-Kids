import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ThemeSelection from "@/pages/ThemeSelection";
import Dashboard from "@/pages/Dashboard";
import StoryReader from "@/pages/StoryReader";
import ReadingCoach from "@/pages/ReadingCoach";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import RegionalStoriesPage from "@/pages/RegionalStoriesPage";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function App() {
  return (
    <AuthProvider>
      <Switch>
        {/* Public routes */}
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        
        {/* Protected routes */}
        <ProtectedRoute path="/" component={Dashboard} />
        <ProtectedRoute path="/theme-selection" component={ThemeSelection} />
        <ProtectedRoute path="/regional-stories/:themeId" component={RegionalStoriesPage} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/story/:id/:chapter" component={StoryReader} />
        <ProtectedRoute path="/reading-coach" component={ReadingCoach} />
        
        {/* Redirects */}
        <Route path="/auth">
          <Redirect to="/login" />
        </Route>
        <Route path="/personalization">
          <Redirect to="/theme-selection" />
        </Route>
        
        {/* 404 Route */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
