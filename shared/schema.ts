import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Constants ──────────────────────────────────────────────────────────────

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard", "olympiad"] as const;

export const BLOOM_LEVELS = [
  "remember", "understand", "apply", "analyze", "evaluate", "create",
] as const;

export const QUESTION_TYPES = ["multiple-choice"] as const;

// Subject-agnostic categories — not just math
export const CATEGORIES = [
  "arithmetic", "algebra", "geometry", "number-theory",
  "combinatorics", "logical-reasoning", "data-handling",
  "adventure",
  // Future: science, english, general-knowledge, etc.
] as const;

// ─── Users & Auth ───────────────────────────────────────────────────────────

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
  parentId: integer("parent_id").notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  grade: integer("grade").notNull(),
  pin: text("pin").notNull(),
  avatar: varchar("avatar", { length: 50 }).default("default"),
  state: varchar("state", { length: 2 }),
  inviteCode: varchar("invite_code", { length: 6 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_child_profiles_parent").on(table.parentId),
]);

export const inviteCodes = pgTable("invite_codes", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull().references(() => users.id),
  code: varchar("code", { length: 6 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedByProfileId: integer("used_by_profile_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Content ────────────────────────────────────────────────────────────────

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 50 }).notNull().default("math"),
  category: varchar("category", { length: 50 }).notNull(),
  gradeLevel: integer("grade_level").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull().default("medium"),
  iconName: varchar("icon_name", { length: 50 }).default("Calculator"),
  totalQuestions: integer("total_questions").notNull().default(0),
  isAdventure: boolean("is_adventure").notNull().default(false),
}, (table) => [
  index("idx_topics_grade").on(table.gradeLevel),
  index("idx_topics_category").on(table.category),
  index("idx_topics_subject").on(table.subject),
  uniqueIndex("idx_topics_title_grade").on(table.title, table.gradeLevel),
]);

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 30 }).notNull().default("multiple-choice"),
  text: text("text").notNull(),
  imageUrl: text("image_url"),
  diagram: jsonb("diagram"),
  options: jsonb("options"),
  answer: jsonb("answer").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull().default("medium"),
  bloomLevel: varchar("bloom_level", { length: 20 }).notNull().default("understand"),
  topic: varchar("topic", { length: 100 }),
  tags: jsonb("tags"),
  hints: jsonb("hints"),
  explanation: text("explanation"),
  sortOrder: integer("sort_order").default(0),
}, (table) => [
  index("idx_questions_topic").on(table.topicId),
  index("idx_questions_difficulty").on(table.difficulty),
]);

// ─── Quiz Sessions & Responses ──────────────────────────────────────────────

export const quizSessions = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  childProfileId: integer("child_profile_id").notNull().references(() => childProfiles.id, { onDelete: "cascade" }),
  topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
  difficulty: varchar("difficulty", { length: 20 }),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  totalQuestions: integer("total_questions"),
}, (table) => [
  index("idx_sessions_child").on(table.childProfileId),
  index("idx_sessions_topic").on(table.topicId),
  index("idx_sessions_date").on(table.startedAt),
]);

export const questionResponses = pgTable("question_responses", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => quizSessions.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  childProfileId: integer("child_profile_id").notNull().references(() => childProfiles.id, { onDelete: "cascade" }),
  userAnswer: jsonb("user_answer"),
  isCorrect: boolean("is_correct").notNull(),
  timeTaken: integer("time_taken"),
  attempts: integer("attempts").notNull().default(1),
  hintsUsed: integer("hints_used").notNull().default(0),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  bloomLevel: varchar("bloom_level", { length: 20 }).notNull().default("understand"),
  answeredAt: timestamp("answered_at").defaultNow(),
}, (table) => [
  index("idx_responses_child").on(table.childProfileId),
  index("idx_responses_session").on(table.sessionId),
  index("idx_responses_date").on(table.answeredAt),
]);

// ─── Progress Tracking ──────────────────────────────────────────────────────

export const topicProgress = pgTable("topic_progress", {
  id: serial("id").primaryKey(),
  childProfileId: integer("child_profile_id").notNull().references(() => childProfiles.id, { onDelete: "cascade" }),
  topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
  questionsAttempted: integer("questions_attempted").notNull().default(0),
  questionsCorrect: integer("questions_correct").notNull().default(0),
  bestScore: integer("best_score"),
  totalSessions: integer("total_sessions").notNull().default(0),
  lastPracticedAt: timestamp("last_practiced_at").defaultNow(),
}, (table) => [
  index("idx_progress_child").on(table.childProfileId),
  uniqueIndex("idx_progress_child_topic").on(table.childProfileId, table.topicId),
]);

// ─── Zod Insert Schemas ─────────────────────────────────────────────────────

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertChildProfileSchema = createInsertSchema(childProfiles).omit({ id: true, createdAt: true });
export const insertInviteCodeSchema = createInsertSchema(inviteCodes).omit({ id: true, createdAt: true });
export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({ id: true, startedAt: true });
export const insertQuestionResponseSchema = createInsertSchema(questionResponses).omit({ id: true, answeredAt: true });
export const insertTopicProgressSchema = createInsertSchema(topicProgress).omit({ id: true });

// ─── TypeScript Types ───────────────────────────────────────────────────────

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
export type InsertQuestionResponse = z.infer<typeof insertQuestionResponseSchema>;
export type TopicProgress = typeof topicProgress.$inferSelect;
export type InsertTopicProgress = z.infer<typeof insertTopicProgressSchema>;
