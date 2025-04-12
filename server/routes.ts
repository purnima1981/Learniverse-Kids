import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import express from "express";
import { setupAuth } from "./auth";
import { insertUserSchema, insertUserGameResultSchema, insertProfileSchema, users } from "@shared/schema";
import { analyzeReading, generateReadingPassage } from "./services/openai";
import { and, desc, eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Redirect root path to auth page
  app.get("/", (req, res) => {
    res.redirect("/auth");
  });
  
  // Setup authentication
  setupAuth(app);

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // These routes are now handled in auth.ts

  // Set theme preference
  app.post("/api/user/theme", requireAuth, async (req, res) => {
    try {
      const { themeId } = z.object({
        themeId: z.number().int().positive(),
      }).parse(req.body);
      
      // Check if theme exists
      const theme = await storage.getTheme(themeId);
      if (!theme) {
        return res.status(404).json({ message: "Theme not found" });
      }
      
      // Update user
      const userId = req.user!.id;
      await storage.updateUserTheme(userId, themeId);
      
      res.json({ message: "Theme updated successfully" });
    } catch (error) {
      console.error("Update theme error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all themes
  app.get("/api/themes", async (req, res) => {
    try {
      const themes = await storage.getAllThemes();
      res.json(themes);
    } catch (error) {
      console.error("Error fetching themes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user progress
  app.get("/api/user/progress", async (req, res) => {
    try {
      // Mock user progress for now
      const mockProgress = {
        storyProgressPercent: 60,
        completedChapters: 3,
        totalChapters: 5,
        daysActive: 3,
        vocabularyLearned: 25,
        vocabularyGoal: 50
      };
      
      res.json(mockProgress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current story
  app.get("/api/user/current-story", async (req, res) => {
    try {
      // Return "A Walk to Remember" story data from the Family Adventures theme
      const walkToRememberStory = {
        id: 8001,
        title: "A Walk to Remember",
        description: "Join a family on their nature walk as they discover how math, science, and language connect with the world around them.",
        grade: "5",
        themeId: 8,
        imageUrl: "/stories/a-walk-to-remember.png",
        publishedAt: new Date(),
        subjects: [
          { id: 1, name: "Science", color: "#4F46E5" },
          { id: 6, name: "Mathematics", color: "#16A34A" },
          { id: 7, name: "Language Arts", color: "#FB7185" }
        ],
        progressPercent: 40
      };
      
      res.json(walkToRememberStory);
    } catch (error) {
      console.error("Error fetching current story:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get recommended stories
  app.get("/api/stories/recommended", async (req, res) => {
    try {
      // Mock recommended stories for now
      const mockRecommendedStories = [
        {
          id: 2,
          title: "Ancient Maya Civilization",
          description: "Discover the fascinating world of the Maya and their remarkable achievements.",
          grade: "5",
          themeId: 2,
          imageUrl: "https://images.unsplash.com/photo-1531835551805-16d864c8d311?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
          publishedAt: new Date(),
          subjects: [
            { id: 3, name: "History", color: "#0EA5E9" },
            { id: 4, name: "Culture", color: "#F59E0B" }
          ],
          currentChapter: 1,
          currentChapterTitle: "Origins",
          progressPercent: 20
        },
        {
          id: 3,
          title: "Amazing Animal Adaptations",
          description: "Learn how different animals have adapted to survive in their environments.",
          grade: "5",
          themeId: 3,
          imageUrl: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
          publishedAt: new Date(),
          subjects: [
            { id: 1, name: "Science", color: "#4F46E5" },
            { id: 5, name: "Biology", color: "#10B981" }
          ],
          currentChapter: 1,
          currentChapterTitle: "Survival Techniques",
          progressPercent: 0
        }
      ];
      
      res.json(mockRecommendedStories);
    } catch (error) {
      console.error("Error fetching recommended stories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get specific story
  app.get("/api/stories/:id", requireAuth, async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      if (isNaN(storyId)) {
        return res.status(400).json({ message: "Invalid story ID" });
      }
      
      const story = await storage.getStory(storyId);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      res.json(story);
    } catch (error) {
      console.error("Error fetching story:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete user account
  app.delete("/api/user", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.deleteUser(userId);
      
      // Logout the user after deletion
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging out after account deletion" });
        }
        res.status(200).json({ message: "Account successfully deleted" });
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user account" });
    }
  });

  // Get specific chapter
  app.get("/api/stories/:id/chapters/:chapter", requireAuth, async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const chapterNumber = parseInt(req.params.chapter);
      
      if (isNaN(storyId) || isNaN(chapterNumber)) {
        return res.status(400).json({ message: "Invalid story or chapter ID" });
      }
      
      const chapter = await storage.getChapter(storyId, chapterNumber);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      // Update user progress when accessing a chapter
      const userId = req.user!.id;
      await storage.updateUserStoryProgress(userId, storyId, chapterNumber);
      
      res.json(chapter);
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed initial data for testing (themes, subjects, stories, chapters)
  app.post("/api/seed", async (req, res) => {
    try {
      await storage.seedInitialData();
      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Reading Coach - Analyze Reading
  app.post("/api/reading-coach/analyze", async (req, res) => {
    try {
      const { audio, text } = z.object({
        audio: z.string(),
        text: z.string(),
      }).parse(req.body);
      
      // Analyze the reading with OpenAI
      const result = await analyzeReading(audio, text);
      
      res.json(result);
    } catch (error) {
      console.error("Error analyzing reading:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      res.status(500).json({ 
        message: "Error analyzing reading", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // AI Reading Coach - Get Sample Text
  app.get("/api/reading-coach/sample", async (req, res) => {
    try {
      // Default to grade 5 when user isn't available
      const defaultGrade = "5";
      
      // Generate a reading passage based on default grade
      const passage = await generateReadingPassage(defaultGrade);
      
      res.json({ text: passage });
    } catch (error) {
      console.error("Error generating sample text:", error);
      
      res.status(500).json({ 
        message: "Error generating sample text", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Microgames API endpoints
  
  // Get a random microgame based on grade and optional subject
  app.get("/api/microgames/random", requireAuth, async (req, res) => {
    try {
      const grade = req.query.grade as string || req.user!.grade;
      const subject = req.query.subject as string || undefined;
      
      const microgame = await storage.getRandomMicrogame(grade, subject);
      
      if (!microgame) {
        return res.status(404).json({ message: "No microgames found for the specified criteria" });
      }
      
      res.json(microgame);
    } catch (error) {
      console.error("Error fetching random microgame:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get microgames by subject
  app.get("/api/microgames/subject/:subject", requireAuth, async (req, res) => {
    try {
      const subject = req.params.subject;
      
      const microgames = await storage.getMicrogamesBySubject(subject);
      
      res.json(microgames);
    } catch (error) {
      console.error(`Error fetching microgames for subject ${req.params.subject}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get microgames by grade
  app.get("/api/microgames/grade/:grade", requireAuth, async (req, res) => {
    try {
      const grade = req.params.grade;
      
      const microgames = await storage.getMicrogamesByGrade(grade);
      
      res.json(microgames);
    } catch (error) {
      console.error(`Error fetching microgames for grade ${req.params.grade}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get specific microgame by ID
  app.get("/api/microgames/:id", requireAuth, async (req, res) => {
    try {
      const microgameId = parseInt(req.params.id);
      
      if (isNaN(microgameId)) {
        return res.status(400).json({ message: "Invalid microgame ID" });
      }
      
      const microgame = await storage.getMicrogame(microgameId);
      
      if (!microgame) {
        return res.status(404).json({ message: "Microgame not found" });
      }
      
      res.json(microgame);
    } catch (error) {
      console.error(`Error fetching microgame ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Save user game result
  app.post("/api/microgames/:id/results", requireAuth, async (req, res) => {
    try {
      const microgameId = parseInt(req.params.id);
      
      if (isNaN(microgameId)) {
        return res.status(400).json({ message: "Invalid microgame ID" });
      }
      
      const userId = req.user!.id;
      
      const data = insertUserGameResultSchema.parse({
        ...req.body,
        userId,
        microgameId
      });
      
      const result = await storage.saveUserGameResult(data);
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error saving game result:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get user's game results
  app.get("/api/user/game-results", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const results = await storage.getUserGameResults(userId);
      
      res.json(results);
    } catch (error) {
      console.error("Error fetching user game results:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get user's game results for a specific microgame
  app.get("/api/user/game-results/:microgameId", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const microgameId = parseInt(req.params.microgameId);
      
      if (isNaN(microgameId)) {
        return res.status(400).json({ message: "Invalid microgame ID" });
      }
      
      const results = await storage.getUserGameResultsByMicrogame(userId, microgameId);
      
      res.json(results);
    } catch (error) {
      console.error(`Error fetching user results for microgame ${req.params.microgameId}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile Management API Routes

  // Get all profiles for the current user
  app.get("/api/profiles", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const profiles = await storage.getProfilesByUserId(userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get a specific profile
  app.get("/api/profiles/:id", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Check that the profile belongs to the current user
      if (profile.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error(`Error fetching profile ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new profile
  app.post("/api/profiles", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const data = insertProfileSchema.parse({
        ...req.body,
        userId,
        isDefault: false
      });
      
      const profile = await storage.createProfile(data);
      
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update a profile
  app.patch("/api/profiles/:id", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Check that the profile belongs to the current user
      if (profile.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.updateProfile(profileId, req.body);
      
      const updatedProfile = await storage.getProfile(profileId);
      
      res.json(updatedProfile);
    } catch (error) {
      console.error(`Error updating profile ${req.params.id}:`, error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a profile
  app.delete("/api/profiles/:id", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Check that the profile belongs to the current user
      if (profile.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteProfile(profileId);
      
      res.status(204).end();
    } catch (error) {
      console.error(`Error deleting profile ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Set a profile as default
  app.post("/api/profiles/:id/default", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Check that the profile belongs to the current user
      if (profile.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.setDefaultProfile(profileId);
      
      res.json({ message: "Profile set as default" });
    } catch (error) {
      console.error(`Error setting profile ${req.params.id} as default:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get progress data for a specific profile
  app.get("/api/profiles/:id/progress", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Check that the profile belongs to the current user
      if (profile.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get user progress for the profile
      const progress = await storage.getUserProgress(profile.userId);
      
      res.json(progress);
    } catch (error) {
      console.error(`Error fetching progress for profile ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get question responses for a specific profile
  app.get("/api/profiles/:id/question-responses", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Check that the profile belongs to the current user
      if (profile.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // For now, we'll use mock data
      res.json([]);
    } catch (error) {
      console.error(`Error fetching question responses for profile ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get game results for a specific profile
  app.get("/api/profiles/:id/game-results", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Check that the profile belongs to the current user
      if (profile.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get game results for the profile
      const results = await storage.getUserGameResults(profile.userId);
      
      res.json(results);
    } catch (error) {
      console.error(`Error fetching game results for profile ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
