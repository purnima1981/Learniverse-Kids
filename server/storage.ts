import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  childProfiles,
  inviteCodes,
  topics,
  questions,
  quizSessions,
  questionResponses,
  topicProgress,
  streaks,
  type User,
  type InsertUser,
  type ChildProfile,
  type InsertChildProfile,
  type InviteCode,
  type Topic,
  type Question,
  type QuizSession,
  type InsertQuizSession,
  type QuestionResponse,
  type InsertQuestionResponse,
  type TopicProgress,
  type InsertTopicProgress,
} from "@shared/schema";
import bcrypt from "bcryptjs";

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUserByEmail(
  email: string
): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function createUser(data: InsertUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

// ─── Child Profiles ──────────────────────────────────────────────────────────

export async function getChildProfilesByParent(
  parentId: number
): Promise<ChildProfile[]> {
  return db
    .select()
    .from(childProfiles)
    .where(eq(childProfiles.parentId, parentId));
}

export async function getChildProfileById(
  id: number
): Promise<ChildProfile | undefined> {
  const [profile] = await db
    .select()
    .from(childProfiles)
    .where(eq(childProfiles.id, id));
  return profile;
}

export async function getChildProfileByNameAndParent(
  name: string,
  parentId: number
): Promise<ChildProfile | undefined> {
  const [profile] = await db
    .select()
    .from(childProfiles)
    .where(
      and(
        eq(childProfiles.name, name),
        eq(childProfiles.parentId, parentId)
      )
    );
  return profile;
}

export async function createChildProfile(
  data: InsertChildProfile
): Promise<ChildProfile> {
  const [profile] = await db
    .insert(childProfiles)
    .values(data)
    .returning();
  return profile;
}

export async function verifyChildPin(
  profileId: number,
  pin: string
): Promise<boolean> {
  const profile = await getChildProfileById(profileId);
  if (!profile) return false;
  return bcrypt.compare(pin, profile.pin);
}

// ─── Invite Codes ────────────────────────────────────────────────────────────

export async function createInviteCode(
  parentId: number
): Promise<InviteCode> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [invite] = await db
    .insert(inviteCodes)
    .values({ parentId, code, expiresAt })
    .returning();
  return invite;
}

export async function getInviteCodeByCode(
  code: string
): Promise<InviteCode | undefined> {
  const [invite] = await db
    .select()
    .from(inviteCodes)
    .where(eq(inviteCodes.code, code.toUpperCase()));
  return invite;
}

export async function markInviteCodeUsed(
  codeId: number,
  profileId: number
): Promise<void> {
  await db
    .update(inviteCodes)
    .set({ usedByProfileId: profileId })
    .where(eq(inviteCodes.id, codeId));
}

// ─── Topics ──────────────────────────────────────────────────────────────────

export async function getTopics(gradeLevel?: number, category?: string): Promise<Topic[]> {
  const conditions = [];
  if (gradeLevel) {
    conditions.push(eq(topics.gradeLevel, gradeLevel));
  }
  if (category) {
    conditions.push(eq(topics.category, category));
  }
  if (conditions.length > 0) {
    return db.select().from(topics).where(and(...conditions));
  }
  return db.select().from(topics);
}

export async function getTopicById(id: number): Promise<Topic | undefined> {
  const [topic] = await db
    .select()
    .from(topics)
    .where(eq(topics.id, id));
  return topic;
}

// ─── Questions ───────────────────────────────────────────────────────────────

export async function getQuestionsByTopic(
  topicId: number,
  difficulty?: string
): Promise<Question[]> {
  const conditions = [eq(questions.topicId, topicId)];
  if (difficulty) {
    conditions.push(eq(questions.difficulty, difficulty));
  }
  return db
    .select()
    .from(questions)
    .where(and(...conditions));
}

// ─── Quiz Sessions ───────────────────────────────────────────────────────────

export async function createQuizSession(
  data: InsertQuizSession
): Promise<QuizSession> {
  const [session] = await db
    .insert(quizSessions)
    .values(data)
    .returning();
  return session;
}

export async function completeQuizSession(
  sessionId: number,
  score: number,
  totalQuestions: number
): Promise<QuizSession> {
  const [session] = await db
    .update(quizSessions)
    .set({ completedAt: new Date(), score, totalQuestions })
    .where(eq(quizSessions.id, sessionId))
    .returning();
  return session;
}

export async function getQuizSessionsByProfile(
  profileId: number
): Promise<QuizSession[]> {
  return db
    .select()
    .from(quizSessions)
    .where(eq(quizSessions.childProfileId, profileId))
    .orderBy(desc(quizSessions.startedAt));
}

// ─── Question Responses ──────────────────────────────────────────────────────

export async function createQuestionResponse(
  data: InsertQuestionResponse
): Promise<QuestionResponse> {
  const [response] = await db
    .insert(questionResponses)
    .values(data)
    .returning();
  return response;
}

export async function getResponsesBySession(
  sessionId: number
): Promise<QuestionResponse[]> {
  return db
    .select()
    .from(questionResponses)
    .where(eq(questionResponses.sessionId, sessionId));
}

export async function getResponsesByProfile(
  profileId: number
): Promise<QuestionResponse[]> {
  return db
    .select()
    .from(questionResponses)
    .where(eq(questionResponses.childProfileId, profileId));
}

// ─── Topic Progress ─────────────────────────────────────────────────────────

export async function getTopicProgressRecord(
  profileId: number,
  topicId: number
): Promise<TopicProgress | undefined> {
  const [progress] = await db
    .select()
    .from(topicProgress)
    .where(
      and(
        eq(topicProgress.childProfileId, profileId),
        eq(topicProgress.topicId, topicId)
      )
    );
  return progress;
}

export async function upsertTopicProgress(
  data: InsertTopicProgress
): Promise<TopicProgress> {
  const existing = await getTopicProgressRecord(
    data.childProfileId,
    data.topicId
  );
  if (existing) {
    const [updated] = await db
      .update(topicProgress)
      .set({
        questionsAttempted: data.questionsAttempted,
        questionsCorrect: data.questionsCorrect,
        bestScore: data.bestScore,
        totalSessions: data.totalSessions,
        lastPracticedAt: new Date(),
      })
      .where(eq(topicProgress.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(topicProgress)
    .values(data)
    .returning();
  return created;
}

export async function getAllTopicProgress(
  profileId: number
): Promise<TopicProgress[]> {
  return db
    .select()
    .from(topicProgress)
    .where(eq(topicProgress.childProfileId, profileId));
}

// ─── Analytics Queries ───────────────────────────────────────────────────────

export async function getWeeklyStats(profileId: number) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [stats] = await db
    .select({
      totalQuestions: sql<number>`count(*)::int`,
      totalCorrect: sql<number>`sum(case when ${questionResponses.isCorrect} then 1 else 0 end)::int`,
      avgTime: sql<number>`round(avg(${questionResponses.timeTaken}))::int`,
      totalSessions: sql<number>`count(distinct ${questionResponses.sessionId})::int`,
    })
    .from(questionResponses)
    .where(
      and(
        eq(questionResponses.childProfileId, profileId),
        sql`${questionResponses.answeredAt} >= ${oneWeekAgo}`
      )
    );
  return stats;
}

export async function getWeeklyDailyBreakdown(profileId: number) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return db
    .select({
      day: sql<string>`to_char(${questionResponses.answeredAt}, 'Dy')`,
      date: sql<string>`to_char(${questionResponses.answeredAt}, 'YYYY-MM-DD')`,
      total: sql<number>`count(*)::int`,
      correct: sql<number>`sum(case when ${questionResponses.isCorrect} then 1 else 0 end)::int`,
    })
    .from(questionResponses)
    .where(
      and(
        eq(questionResponses.childProfileId, profileId),
        sql`${questionResponses.answeredAt} >= ${oneWeekAgo}`
      )
    )
    .groupBy(
      sql`to_char(${questionResponses.answeredAt}, 'Dy')`,
      sql`to_char(${questionResponses.answeredAt}, 'YYYY-MM-DD')`
    )
    .orderBy(sql`to_char(${questionResponses.answeredAt}, 'YYYY-MM-DD')`);
}

export async function getBloomLevelStats(
  profileId: number
): Promise<
  { bloomLevel: string; total: number; correct: number; avgTime: number }[]
> {
  const rows = await db
    .select({
      bloomLevel: questionResponses.bloomLevel,
      total: sql<number>`count(*)::int`,
      correct: sql<number>`sum(case when ${questionResponses.isCorrect} then 1 else 0 end)::int`,
      avgTime: sql<number>`round(avg(${questionResponses.timeTaken}))::int`,
    })
    .from(questionResponses)
    .where(eq(questionResponses.childProfileId, profileId))
    .groupBy(questionResponses.bloomLevel);
  return rows;
}

export async function getDifficultyStats(
  profileId: number
): Promise<
  { difficulty: string; total: number; correct: number; avgTime: number }[]
> {
  const rows = await db
    .select({
      difficulty: questionResponses.difficulty,
      total: sql<number>`count(*)::int`,
      correct: sql<number>`sum(case when ${questionResponses.isCorrect} then 1 else 0 end)::int`,
      avgTime: sql<number>`round(avg(${questionResponses.timeTaken}))::int`,
    })
    .from(questionResponses)
    .where(eq(questionResponses.childProfileId, profileId))
    .groupBy(questionResponses.difficulty);
  return rows;
}

export async function getSessionHistory(profileId: number) {
  return db
    .select({
      id: quizSessions.id,
      topicId: quizSessions.topicId,
      difficulty: quizSessions.difficulty,
      startedAt: quizSessions.startedAt,
      completedAt: quizSessions.completedAt,
      score: quizSessions.score,
      totalQuestions: quizSessions.totalQuestions,
    })
    .from(quizSessions)
    .where(
      and(
        eq(quizSessions.childProfileId, profileId),
        sql`${quizSessions.completedAt} is not null`
      )
    )
    .orderBy(desc(quizSessions.startedAt));
}

export async function getOverallStats(profileId: number) {
  const [stats] = await db
    .select({
      totalQuestions: sql<number>`count(*)::int`,
      totalCorrect: sql<number>`sum(case when ${questionResponses.isCorrect} then 1 else 0 end)::int`,
      avgTime: sql<number>`round(avg(${questionResponses.timeTaken}))::int`,
      avgHints: sql<number>`round(avg(${questionResponses.hintsUsed})::numeric, 1)`,
      totalSessions: sql<number>`count(distinct ${questionResponses.sessionId})::int`,
    })
    .from(questionResponses)
    .where(eq(questionResponses.childProfileId, profileId));
  return stats;
}

export async function getHintUsageBySession(profileId: number) {
  return db
    .select({
      sessionId: questionResponses.sessionId,
      hintsZero: sql<number>`sum(case when ${questionResponses.hintsUsed} = 0 then 1 else 0 end)::int`,
      hintsOne: sql<number>`sum(case when ${questionResponses.hintsUsed} = 1 then 1 else 0 end)::int`,
      hintsTwo: sql<number>`sum(case when ${questionResponses.hintsUsed} = 2 then 1 else 0 end)::int`,
      hintsThree: sql<number>`sum(case when ${questionResponses.hintsUsed} >= 3 then 1 else 0 end)::int`,
    })
    .from(questionResponses)
    .where(eq(questionResponses.childProfileId, profileId))
    .groupBy(questionResponses.sessionId);
}

export async function getTopicStats(profileId: number) {
  return db
    .select({
      topicName: sql<string>`coalesce(${questions.topic}, 'other')`,
      total: sql<number>`count(*)::int`,
      correct: sql<number>`sum(case when ${questionResponses.isCorrect} then 1 else 0 end)::int`,
    })
    .from(questionResponses)
    .innerJoin(
      questions,
      eq(questionResponses.questionId, questions.id)
    )
    .where(eq(questionResponses.childProfileId, profileId))
    .groupBy(questions.topic);
}

export async function getCategoryStats(profileId: number) {
  return db
    .select({
      category: topics.category,
      total: sql<number>`count(*)::int`,
      correct: sql<number>`sum(case when ${questionResponses.isCorrect} then 1 else 0 end)::int`,
      avgTime: sql<number>`round(avg(${questionResponses.timeTaken}))::int`,
    })
    .from(questionResponses)
    .innerJoin(quizSessions, eq(questionResponses.sessionId, quizSessions.id))
    .innerJoin(topics, eq(quizSessions.topicId, topics.id))
    .where(eq(questionResponses.childProfileId, profileId))
    .groupBy(topics.category);
}

// ── Streaks ─────────────────────────────────────────────────────────────────

export async function getStreak(childProfileId: number) {
  const [streak] = await db.select().from(streaks).where(eq(streaks.childProfileId, childProfileId));
  return streak || null;
}

export async function recordPracticeDay(childProfileId: number) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let [streak] = await db.select().from(streaks).where(eq(streaks.childProfileId, childProfileId));

  if (!streak) {
    // First time
    const [created] = await db.insert(streaks).values({
      childProfileId,
      currentStreak: 1,
      longestStreak: 1,
      lastPracticeDate: today,
      freezesAvailable: 1,
    }).returning();
    return created;
  }

  // Already practiced today
  if (streak.lastPracticeDate === today) return streak;

  let newStreak = streak.currentStreak;

  if (streak.lastPracticeDate === yesterday) {
    // Consecutive day
    newStreak = streak.currentStreak + 1;
  } else if (streak.freezeUsedDate === yesterday) {
    // Used a freeze yesterday, still counts
    newStreak = streak.currentStreak + 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  const longestStreak = Math.max(newStreak, streak.longestStreak);
  // Award a new freeze every 7 days of streak
  const freezes = newStreak > 0 && newStreak % 7 === 0 ? streak.freezesAvailable + 1 : streak.freezesAvailable;

  const [updated] = await db.update(streaks)
    .set({ currentStreak: newStreak, longestStreak, lastPracticeDate: today, freezesAvailable: freezes })
    .where(eq(streaks.childProfileId, childProfileId))
    .returning();
  return updated;
}

export async function useStreakFreeze(childProfileId: number) {
  const today = new Date().toISOString().split("T")[0];
  const [streak] = await db.select().from(streaks).where(eq(streaks.childProfileId, childProfileId));

  if (!streak || streak.freezesAvailable <= 0) {
    throw new Error("No freezes available");
  }

  const [updated] = await db.update(streaks)
    .set({ freezesAvailable: streak.freezesAvailable - 1, freezeUsedDate: today })
    .where(eq(streaks.childProfileId, childProfileId))
    .returning();
  return updated;
}
