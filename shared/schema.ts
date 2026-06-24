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

export const DIFFICULTY_LEVELS = [
  "easy",
  "medium",
  "hard",
  "olympiad",
] as const;

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
  "true-false",
  "fill-blank",
  "matching",
  "word-sequence",
] as const;

export const MATH_CATEGORIES = [
  "arithmetic",
  "algebra",
  "geometry",
  "number-theory",
  "combinatorics",
  "logical-reasoning",
  "data-handling",
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
  state: varchar("state", { length: 2 }),
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

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  gradeLevel: integer("grade_level").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull().default("medium"),
  iconName: varchar("icon_name", { length: 50 }).default("Calculator"),
  totalQuestions: integer("total_questions").notNull().default(0),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topics.id),
  type: varchar("type", { length: 30 }).notNull(),
  text: text("text").notNull(),
  imageUrl: text("image_url"),
  options: jsonb("options"),
  answer: jsonb("answer").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull().default("medium"),
  bloomLevel: varchar("bloom_level", { length: 20 }).notNull().default("understand"),
  topic: varchar("topic", { length: 100 }),
  tags: jsonb("tags"),
  hints: jsonb("hints"),
  explanation: text("explanation"),
});

export const quizSessions = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  childProfileId: integer("child_profile_id")
    .notNull()
    .references(() => childProfiles.id),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topics.id),
  difficulty: varchar("difficulty", { length: 20 }),
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
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  bloomLevel: varchar("bloom_level", { length: 20 }).notNull().default("understand"),
  answeredAt: timestamp("answered_at").defaultNow(),
});

export const topicProgress = pgTable("topic_progress", {
  id: serial("id").primaryKey(),
  childProfileId: integer("child_profile_id")
    .notNull()
    .references(() => childProfiles.id),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topics.id),
  questionsAttempted: integer("questions_attempted").notNull().default(0),
  questionsCorrect: integer("questions_correct").notNull().default(0),
  bestScore: integer("best_score"),
  totalSessions: integer("total_sessions").notNull().default(0),
  lastPracticedAt: timestamp("last_practiced_at").defaultNow(),
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

export const insertTopicSchema = createInsertSchema(topics).omit({
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

export const insertTopicProgressSchema = createInsertSchema(topicProgress).omit(
  { id: true }
);

// ─── TypeScript Types ────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertChildProfile = z.infer<typeof insertChildProfileSchema>;

export type InviteCode = typeof inviteCodes.$inferSelect;
export type InsertInviteCode = z.infer<typeof insertInviteCodeSchema>;

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type QuizSession = typeof quizSessions.$inferSelect;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;

export type QuestionResponse = typeof questionResponses.$inferSelect;
export type InsertQuestionResponse = z.infer<
  typeof insertQuestionResponseSchema
>;

export type TopicProgress = typeof topicProgress.$inferSelect;
export type InsertTopicProgress = z.infer<typeof insertTopicProgressSchema>;
