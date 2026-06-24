import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { requireAuth, requireParent } from "./auth";
import * as storage from "./storage";

export function registerRoutes(app: Express) {
  // ── Debug ──────────────────────────────────────────────────────────────────
  app.get("/api/debug/db", async (_req: Request, res: Response) => {
    try {
      const topicCount = await storage.getTopics();
      res.json({
        topicCount: topicCount.length,
        topics: topicCount.map(t => ({ id: t.id, title: t.title, grade: t.gradeLevel, questions: t.totalQuestions })),
      });
    } catch (err: any) {
      res.json({ error: err.message });
    }
  });

  // ── Invite Codes ───────────────────────────────────────────────────────────

  app.post(
    "/api/invite/generate",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const invite = await storage.createInviteCode(req.user!.id);
        res.json({ code: invite.code, expiresAt: invite.expiresAt });
      } catch (err) {
        console.error("Generate invite error:", err);
        res.status(500).json({ message: "Failed to generate invite code" });
      }
    }
  );

  app.post("/api/invite/join", async (req: Request, res: Response) => {
    try {
      const { code, name, grade, pin, avatar, state } = req.body;

      if (!code || !name || !grade || !pin) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ message: "PIN must be 4 digits" });
      }

      const invite = await storage.getInviteCodeByCode(code);
      if (!invite) {
        return res.status(404).json({ message: "Invalid invite code" });
      }
      if (invite.usedByProfileId) {
        return res
          .status(400)
          .json({ message: "Invite code already used" });
      }
      if (new Date(invite.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Invite code expired" });
      }

      const hashedPin = await bcrypt.hash(pin, 10);
      const profile = await storage.createChildProfile({
        parentId: invite.parentId,
        name,
        grade: Number(grade),
        pin: hashedPin,
        avatar: avatar || "default",
        state: state || null,
        inviteCode: invite.code,
      });

      await storage.markInviteCodeUsed(invite.id, profile.id);

      res.json({
        message: "Profile created",
        profile: {
          id: profile.id,
          name: profile.name,
          grade: profile.grade,
          avatar: profile.avatar,
        },
      });
    } catch (err) {
      console.error("Join error:", err);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  // ── Create Child Profile (parent directly) ────────────────────────────────

  app.post(
    "/api/profiles",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const { name, grade, pin, avatar } = req.body;

        if (!name || !grade || !pin) {
          return res.status(400).json({ message: "Name, grade, and PIN are required" });
        }
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
          return res.status(400).json({ message: "PIN must be 4 digits" });
        }

        const hashedPin = await bcrypt.hash(pin, 10);
        const profileData: Record<string, unknown> = {
          parentId: req.user!.id,
          name,
          grade: Number(grade),
          pin: hashedPin,
          avatar: avatar || "default",
        };
        const profile = await storage.createChildProfile(profileData as any);

        res.json({
          id: profile.id,
          name: profile.name,
          grade: profile.grade,
          avatar: profile.avatar,
        });
      } catch (err: any) {
        console.error("Create profile error:", err);
        res.status(500).json({ message: err?.message || "Failed to create profile" });
      }
    }
  );

  // ── Profiles ───────────────────────────────────────────────────────────────

  app.get(
    "/api/profiles",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const profiles = await storage.getChildProfilesByParent(
          req.user!.id
        );
        res.json(
          profiles.map((p) => ({
            id: p.id,
            name: p.name,
            grade: p.grade,
            avatar: p.avatar,
            state: p.state,
            createdAt: p.createdAt,
          }))
        );
      } catch (err) {
        console.error("Get profiles error:", err);
        res.status(500).json({ message: "Failed to get profiles" });
      }
    }
  );

  // ── Topics ─────────────────────────────────────────────────────────────────

  app.get("/api/topics", requireAuth, async (req: Request, res: Response) => {
    try {
      const grade = req.query.grade ? Number(req.query.grade) : undefined;
      const category = req.query.category ? String(req.query.category) : undefined;
      const topicList = await storage.getTopics(grade, category);
      res.json(topicList);
    } catch (err) {
      console.error("Get topics error:", err);
      res.status(500).json({ message: "Failed to get topics" });
    }
  });

  app.get("/api/topics/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const topic = await storage.getTopicById(Number(req.params.id));
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      res.json(topic);
    } catch (err) {
      console.error("Get topic error:", err);
      res.status(500).json({ message: "Failed to get topic" });
    }
  });

  // ── Questions ──────────────────────────────────────────────────────────────

  app.get(
    "/api/topics/:id/questions",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const difficulty = req.query.difficulty ? String(req.query.difficulty) : undefined;
        const questionList = await storage.getQuestionsByTopic(
          Number(req.params.id),
          difficulty
        );
        res.json(questionList);
      } catch (err) {
        console.error("Get questions error:", err);
        res.status(500).json({ message: "Failed to get questions" });
      }
    }
  );

  // ── Quiz Sessions ─────────────────────────────────────────────────────────

  app.post(
    "/api/quiz/start",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { childProfileId, topicId, difficulty } = req.body;
        if (!childProfileId || !topicId) {
          return res
            .status(400)
            .json({ message: "childProfileId and topicId required" });
        }
        const session = await storage.createQuizSession({
          childProfileId,
          topicId,
          difficulty: difficulty || null,
        });
        res.json(session);
      } catch (err) {
        console.error("Start quiz error:", err);
        res.status(500).json({ message: "Failed to start quiz" });
      }
    }
  );

  app.post(
    "/api/quiz/respond",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const {
          sessionId,
          questionId,
          childProfileId,
          userAnswer,
          isCorrect,
          timeTaken,
          attempts,
          hintsUsed,
          difficulty,
          bloomLevel,
        } = req.body;

        const response = await storage.createQuestionResponse({
          sessionId,
          questionId,
          childProfileId,
          userAnswer,
          isCorrect,
          timeTaken,
          attempts: attempts || 1,
          hintsUsed: hintsUsed || 0,
          difficulty: difficulty || "medium",
          bloomLevel: bloomLevel || "understand",
        });
        res.json(response);
      } catch (err) {
        console.error("Submit response error:", err);
        res.status(500).json({ message: "Failed to save response" });
      }
    }
  );

  app.post(
    "/api/quiz/complete",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { sessionId, score, totalQuestions } = req.body;
        const session = await storage.completeQuizSession(
          sessionId,
          score,
          totalQuestions
        );
        res.json(session);
      } catch (err) {
        console.error("Complete quiz error:", err);
        res.status(500).json({ message: "Failed to complete quiz" });
      }
    }
  );

  // ── Analytics (parent only) ────────────────────────────────────────────────

  app.get(
    "/api/analytics/:profileId",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const profileId = Number(req.params.profileId);
        const profile = await storage.getChildProfileById(profileId);
        if (!profile || profile.parentId !== req.user!.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        const stats = await storage.getOverallStats(profileId);
        res.json(stats);
      } catch (err) {
        console.error("Analytics error:", err);
        res.status(500).json({ message: "Failed to get analytics" });
      }
    }
  );

  app.get(
    "/api/analytics/:profileId/bloom",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const profileId = Number(req.params.profileId);
        const profile = await storage.getChildProfileById(profileId);
        if (!profile || profile.parentId !== req.user!.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        const stats = await storage.getBloomLevelStats(profileId);
        res.json(stats);
      } catch (err) {
        console.error("Bloom stats error:", err);
        res.status(500).json({ message: "Failed to get bloom stats" });
      }
    }
  );

  app.get(
    "/api/analytics/:profileId/difficulty",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const profileId = Number(req.params.profileId);
        const profile = await storage.getChildProfileById(profileId);
        if (!profile || profile.parentId !== req.user!.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        const stats = await storage.getDifficultyStats(profileId);
        res.json(stats);
      } catch (err) {
        console.error("Difficulty stats error:", err);
        res.status(500).json({ message: "Failed to get difficulty stats" });
      }
    }
  );

  app.get(
    "/api/analytics/:profileId/sessions",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const profileId = Number(req.params.profileId);
        const profile = await storage.getChildProfileById(profileId);
        if (!profile || profile.parentId !== req.user!.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        const sessions = await storage.getSessionHistory(profileId);
        res.json(sessions);
      } catch (err) {
        console.error("Session history error:", err);
        res.status(500).json({ message: "Failed to get sessions" });
      }
    }
  );

  app.get(
    "/api/analytics/:profileId/hints",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const profileId = Number(req.params.profileId);
        const profile = await storage.getChildProfileById(profileId);
        if (!profile || profile.parentId !== req.user!.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        const hints = await storage.getHintUsageBySession(profileId);
        res.json(hints);
      } catch (err) {
        console.error("Hint stats error:", err);
        res.status(500).json({ message: "Failed to get hint stats" });
      }
    }
  );

  app.get(
    "/api/analytics/:profileId/topics",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const profileId = Number(req.params.profileId);
        const profile = await storage.getChildProfileById(profileId);
        if (!profile || profile.parentId !== req.user!.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        const topicStats = await storage.getTopicStats(profileId);
        res.json(topicStats);
      } catch (err) {
        console.error("Topic stats error:", err);
        res.status(500).json({ message: "Failed to get topic stats" });
      }
    }
  );

  app.get(
    "/api/analytics/:profileId/categories",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const profileId = Number(req.params.profileId);
        const profile = await storage.getChildProfileById(profileId);
        if (!profile || profile.parentId !== req.user!.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        const categoryStats = await storage.getCategoryStats(profileId);
        res.json(categoryStats);
      } catch (err) {
        console.error("Category stats error:", err);
        res.status(500).json({ message: "Failed to get category stats" });
      }
    }
  );

  // ── Weekly Summary ─────────────────────────────────────────────────────────

  app.get(
    "/api/analytics/:profileId/weekly",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const profileId = Number(req.params.profileId);
        const profile = await storage.getChildProfileById(profileId);
        if (!profile || profile.parentId !== req.user!.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        const stats = await storage.getWeeklyStats(profileId);
        res.json(stats);
      } catch (err) {
        console.error("Weekly stats error:", err);
        res.status(500).json({ message: "Failed to get weekly stats" });
      }
    }
  );

  app.get(
    "/api/analytics/:profileId/weekly-daily",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const profileId = Number(req.params.profileId);
        const profile = await storage.getChildProfileById(profileId);
        if (!profile || profile.parentId !== req.user!.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        const breakdown = await storage.getWeeklyDailyBreakdown(profileId);
        res.json(breakdown);
      } catch (err) {
        console.error("Weekly daily error:", err);
        res.status(500).json({ message: "Failed to get weekly breakdown" });
      }
    }
  );

  // ── Progress ───────────────────────────────────────────────────────────────

  app.get(
    "/api/progress/:profileId",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const progress = await storage.getAllTopicProgress(
          Number(req.params.profileId)
        );
        res.json(progress);
      } catch (err) {
        console.error("Get progress error:", err);
        res.status(500).json({ message: "Failed to get progress" });
      }
    }
  );

  app.get(
    "/api/progress/:profileId/:topicId",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const progress = await storage.getTopicProgressRecord(
          Number(req.params.profileId),
          Number(req.params.topicId)
        );
        res.json(progress || { questionsAttempted: 0, questionsCorrect: 0, bestScore: null, totalSessions: 0 });
      } catch (err) {
        console.error("Get progress error:", err);
        res.status(500).json({ message: "Failed to get progress" });
      }
    }
  );

  app.post(
    "/api/progress/update",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { childProfileId, topicId, questionsAttempted, questionsCorrect, bestScore, totalSessions } =
          req.body;
        const progress = await storage.upsertTopicProgress({
          childProfileId,
          topicId,
          questionsAttempted,
          questionsCorrect,
          bestScore,
          totalSessions,
        });
        res.json(progress);
      } catch (err) {
        console.error("Update progress error:", err);
        res.status(500).json({ message: "Failed to update progress" });
      }
    }
  );
}
