import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import express from "express";
import { setupAuth } from "./auth";
import { insertUserSchema, users } from "@shared/schema";
import { analyzeReading, generateReadingPassage } from "./services/openai";
import { and, desc, eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
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
      // Mock story data for now
      const mockStory = {
        id: 1,
        title: "Journey Through the Stars",
        description: "Join the adventure as we explore the mysteries of our solar system and beyond!",
        grade: "5",
        themeId: 1,
        imageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        publishedAt: new Date(),
        subjects: [
          { id: 1, name: "Science", color: "#4F46E5" },
          { id: 2, name: "Astronomy", color: "#EC4899" }
        ],
        currentChapter: 3,
        currentChapterTitle: "The Red Planet",
        progressPercent: 60
      };
      
      res.json(mockStory);
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

  const httpServer = createServer(app);

  return httpServer;
}
