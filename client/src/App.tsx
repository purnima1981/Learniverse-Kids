import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ThemeSelection from "@/pages/ThemeSelection";
import Dashboard from "@/pages/Dashboard";
import StoryReader from "@/pages/StoryReader";
import AuthPage from "@/pages/auth-page";
import NewAuthPage from "@/pages/new-auth-page";
import RegionalStoriesPage from "@/pages/RegionalStoriesPage";
import ReadingCoach from "@/pages/ReadingCoach";
import TestQuestions from "@/pages/TestQuestions";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function App() {
  return (
    <AuthProvider>
      <Switch>
        {/* Test routes */}
        <Route path="/test/questions" component={TestQuestions} />
        {/* Public routes */}
        <Route path="/auth" component={NewAuthPage} />
        <Route path="/auth-old" component={AuthPage} />
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
        <ProtectedRoute path="/reading-coach" component={ReadingCoach} />
        <Route path="/challenges">
          <Redirect to="/dashboard" />
        </Route>
        
        {/* Home page - redirects directly to auth page to start with login/registration */}
        <Route path="/">
          <Redirect to="/auth" />
        </Route>
        
        {/* 404 for any other routes */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
