import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  childProfiles,
  inviteCodes,
  stories,
  chapters,
  questions,
  quizSessions,
  questionResponses,
  childProgress,
  type User,
  type InsertUser,
  type ChildProfile,
  type InsertChildProfile,
  type InviteCode,
  type Story,
  type Chapter,
  type Question,
  type QuizSession,
  type InsertQuizSession,
  type QuestionResponse,
  type InsertQuestionResponse,
  type ChildProgress,
  type InsertChildProgress,
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
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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

// ─── Stories ─────────────────────────────────────────────────────────────────

export async function getStories(gradeLevel?: number): Promise<Story[]> {
  if (gradeLevel) {
    return db
      .select()
      .from(stories)
      .where(eq(stories.gradeLevel, gradeLevel));
  }
  return db.select().from(stories);
}

export async function getStoryById(id: number): Promise<Story | undefined> {
  const [story] = await db
    .select()
    .from(stories)
    .where(eq(stories.id, id));
  return story;
}

export async function getChapter(
  storyId: number,
  chapterNumber: number
): Promise<Chapter | undefined> {
  const [chapter] = await db
    .select()
    .from(chapters)
    .where(
      and(
        eq(chapters.storyId, storyId),
        eq(chapters.chapterNumber, chapterNumber)
      )
    );
  return chapter;
}

export async function getChapterById(
  id: number
): Promise<Chapter | undefined> {
  const [chapter] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, id));
  return chapter;
}

// ─── Questions ───────────────────────────────────────────────────────────────

export async function getQuestionsByChapter(
  chapterId: number
): Promise<Question[]> {
  return db
    .select()
    .from(questions)
    .where(eq(questions.chapterId, chapterId));
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

// ─── Child Progress ──────────────────────────────────────────────────────────

export async function getChildProgressRecord(
  profileId: number,
  storyId: number
): Promise<ChildProgress | undefined> {
  const [progress] = await db
    .select()
    .from(childProgress)
    .where(
      and(
        eq(childProgress.childProfileId, profileId),
        eq(childProgress.storyId, storyId)
      )
    );
  return progress;
}

export async function upsertChildProgress(
  data: InsertChildProgress
): Promise<ChildProgress> {
  const existing = await getChildProgressRecord(
    data.childProfileId,
    data.storyId
  );
  if (existing) {
    const [updated] = await db
      .update(childProgress)
      .set({
        currentChapter: data.currentChapter,
        completedChapters: data.completedChapters,
        lastAccessedAt: new Date(),
      })
      .where(eq(childProgress.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(childProgress)
    .values(data)
    .returning();
  return created;
}

export async function getAllChildProgress(
  profileId: number
): Promise<ChildProgress[]> {
  return db
    .select()
    .from(childProgress)
    .where(eq(childProgress.childProfileId, profileId));
}

// ─── Analytics Queries ───────────────────────────────────────────────────────

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

export async function getSessionHistory(profileId: number) {
  return db
    .select({
      id: quizSessions.id,
      chapterId: quizSessions.chapterId,
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

export async function getThemeStats(profileId: number) {
  return db
    .select({
      theme: sql<string>`coalesce(${questions.theme}, 'other')`,
      total: sql<number>`count(*)::int`,
      correct: sql<number>`sum(case when ${questionResponses.isCorrect} then 1 else 0 end)::int`,
    })
    .from(questionResponses)
    .innerJoin(
      questions,
      eq(questionResponses.questionId, questions.id)
    )
    .where(eq(questionResponses.childProfileId, profileId))
    .groupBy(questions.theme);
}
