import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Register from "@/pages/Register";
import ThemeSelection from "@/pages/ThemeSelection";
import Dashboard from "@/pages/Dashboard";
import StoryReader from "@/pages/StoryReader";
import ReadingCoach from "@/pages/ReadingCoach";
import Login from "@/pages/Login";

// Simple App component that just renders routes
function App() {
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

export default App;
