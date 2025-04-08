import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./lib/contexts/AuthContext";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Register from "@/pages/Register";
import ThemeSelection from "@/pages/ThemeSelection";
import Dashboard from "@/pages/Dashboard";
import StoryReader from "@/pages/StoryReader";
import ReadingCoach from "@/pages/ReadingCoach";
import Login from "@/pages/Login";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
    </AuthProvider>
  </QueryClientProvider>
);
