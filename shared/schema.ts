import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Enums / Constants ────────────────────────────────────────────────────────

export const BLOOM_LEVELS = [
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
] as const;

export const QUESTION_TYPES = [
  "multiple-choice",
  "matching",
  "fill-blank",
  "unscramble",
  "hidden-word",
  "word-sequence",
  "true-false",
] as const;

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("parent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const childProfiles = pgTable("child_profiles", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  grade: integer("grade").notNull(),
  pin: text("pin").notNull(),
  avatar: varchar("avatar", { length: 50 }).default("default"),
  inviteCode: varchar("invite_code", { length: 6 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inviteCodes = pgTable("invite_codes", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id")
    .notNull()
    .references(() => users.id),
  code: varchar("code", { length: 6 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedByProfileId: integer("used_by_profile_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  gradeLevel: integer("grade_level").notNull(),
  totalChapters: integer("total_chapters").notNull().default(1),
  imageUrl: text("image_url"),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id")
    .notNull()
    .references(() => stories.id),
  chapterNumber: integer("chapter_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id")
    .notNull()
    .references(() => chapters.id),
  type: varchar("type", { length: 30 }).notNull(),
  text: text("text").notNull(),
  options: jsonb("options"),
  answer: jsonb("answer").notNull(),
  bloomLevel: varchar("bloom_level", { length: 20 }).notNull(),
  difficulty: varchar("difficulty", { length: 10 }).notNull().default("medium"),
  theme: varchar("theme", { length: 50 }),
  tags: jsonb("tags"),
  hints: jsonb("hints"),
  explanation: text("explanation"),
});

export const quizSessions = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  childProfileId: integer("child_profile_id")
    .notNull()
    .references(() => childProfiles.id),
  chapterId: integer("chapter_id")
    .notNull()
    .references(() => chapters.id),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  totalQuestions: integer("total_questions"),
});

export const questionResponses = pgTable("question_responses", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => quizSessions.id),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
  childProfileId: integer("child_profile_id")
    .notNull()
    .references(() => childProfiles.id),
  userAnswer: jsonb("user_answer"),
  isCorrect: boolean("is_correct").notNull(),
  timeTaken: integer("time_taken"),
  attempts: integer("attempts").notNull().default(1),
  hintsUsed: integer("hints_used").notNull().default(0),
  bloomLevel: varchar("bloom_level", { length: 20 }).notNull(),
  answeredAt: timestamp("answered_at").defaultNow(),
});

export const childProgress = pgTable("child_progress", {
  id: serial("id").primaryKey(),
  childProfileId: integer("child_profile_id")
    .notNull()
    .references(() => childProfiles.id),
  storyId: integer("story_id")
    .notNull()
    .references(() => stories.id),
  currentChapter: integer("current_chapter").notNull().default(1),
  completedChapters: jsonb("completed_chapters"),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
});

// ─── Zod Insert Schemas ──────────────────────────────────────────────────────

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertChildProfileSchema = createInsertSchema(childProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertInviteCodeSchema = createInsertSchema(inviteCodes).omit({
  id: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
  startedAt: true,
});

export const insertQuestionResponseSchema = createInsertSchema(
  questionResponses
).omit({
  id: true,
  answeredAt: true,
});

export const insertChildProgressSchema = createInsertSchema(childProgress).omit(
  { id: true }
);

// ─── TypeScript Types ────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertChildProfile = z.infer<typeof insertChildProfileSchema>;

export type InviteCode = typeof inviteCodes.$inferSelect;
export type InsertInviteCode = z.infer<typeof insertInviteCodeSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type QuizSession = typeof quizSessions.$inferSelect;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;

export type QuestionResponse = typeof questionResponses.$inferSelect;
export type InsertQuestionResponse = z.infer<
  typeof insertQuestionResponseSchema
>;

export type ChildProgress = typeof childProgress.$inferSelect;
export type InsertChildProgress = z.infer<typeof insertChildProgressSchema>;
