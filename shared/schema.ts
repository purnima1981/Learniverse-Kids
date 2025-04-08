import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  grade: text("grade").notNull(),
  gender: text("gender").notNull(),
  themeId: integer("theme_id"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});

// Themes table
export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
});

// Subjects table
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
});

// Stories table
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  themeId: integer("theme_id").notNull(),
  gradeLevel: text("grade_level").notNull(),
  totalChapters: integer("total_chapters").notNull(),
});

// Story Subjects junction table
export const storySubjects = pgTable("story_subjects", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  subjectId: integer("subject_id").notNull(),
});

// Chapters table
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  question: jsonb("question"),
  vocabularyWords: jsonb("vocabulary_words"),
});

// User Progress table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  storyId: integer("story_id").notNull(),
  currentChapter: integer("current_chapter").notNull().default(1),
  completedChapters: jsonb("completed_chapters"),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
});

// Flashcards table
export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  word: text("word").notNull(),
  definition: text("definition").notNull(),
  storyId: integer("story_id"),
  chapterId: integer("chapter_id"),
  masteryLevel: integer("mastery_level").default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastActive: true });
export const insertThemeSchema = createInsertSchema(themes).omit({ id: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const insertStorySchema = createInsertSchema(stories).omit({ id: true });
export const insertChapterSchema = createInsertSchema(chapters).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, lastAccessedAt: true });
export const insertFlashcardSchema = createInsertSchema(flashcards).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Theme = typeof themes.$inferSelect;
export type InsertTheme = z.infer<typeof insertThemeSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Story = typeof stories.$inferSelect & {
  subjects: Subject[];
  currentChapter?: number;
  currentChapterTitle?: string;
  progressPercent: number;
};
export type InsertStory = z.infer<typeof insertStorySchema>;

export type Chapter = typeof chapters.$inferSelect & {
  previousChapter?: number;
  nextChapter?: number;
  question?: {
    title: string;
    description: string;
    hint?: string;
    answer: string;
  };
  vocabularyWords?: {
    word: string;
    definition: string;
    context: string;
  }[];
};
export type InsertChapter = z.infer<typeof insertChapterSchema>;

export type UserProgress = {
  storyProgressPercent: number;
  completedChapters: number;
  totalChapters: number;
  daysActive: number;
  vocabularyLearned: number;
  vocabularyGoal: number;
};
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
