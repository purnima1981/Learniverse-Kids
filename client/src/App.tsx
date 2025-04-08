import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Register from "@/pages/Register";
import ThemeSelection from "@/pages/ThemeSelection";
import Dashboard from "@/pages/Dashboard";
import StoryReader from "@/pages/StoryReader";
import ReadingCoach from "@/pages/ReadingCoach";
import Login from "@/pages/Login";
import { useAuth } from "./lib/contexts/AuthContext";
import { useEffect } from "react";
import { useLocation } from "wouter";

function AppContent() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (!loading) {
      // Redirect based on auth state
      if (!user && !location.startsWith("/register") && !location.startsWith("/login")) {
        setLocation("/register");
      } else if (user && !user.themeId && location !== "/theme-selection") {
        setLocation("/theme-selection");
      } else if (user && user.themeId && location === "/") {
        setLocation("/dashboard");
      }
    }
  }, [user, loading, location, setLocation]);

  // Show nothing while initial loading
  if (loading) {
    return null;
  }
  
  return (
    <>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/theme-selection" component={ThemeSelection} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/story/:id/:chapter" component={StoryReader} />
        <Route path="/reading-coach" component={ReadingCoach} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
