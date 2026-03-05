import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { requireAuth, requireParent } from "./auth";
import * as storage from "./storage";

export function registerRoutes(app: Express) {
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
      const { code, name, grade, pin, avatar } = req.body;

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
            createdAt: p.createdAt,
          }))
        );
      } catch (err) {
        console.error("Get profiles error:", err);
        res.status(500).json({ message: "Failed to get profiles" });
      }
    }
  );

  // ── Stories ────────────────────────────────────────────────────────────────

  app.get("/api/stories", requireAuth, async (req: Request, res: Response) => {
    try {
      const grade = req.query.grade ? Number(req.query.grade) : undefined;
      const storyList = await storage.getStories(grade);
      res.json(storyList);
    } catch (err) {
      console.error("Get stories error:", err);
      res.status(500).json({ message: "Failed to get stories" });
    }
  });

  app.get(
    "/api/stories/:id/chapters/:num",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const chapter = await storage.getChapter(
          Number(req.params.id),
          Number(req.params.num)
        );
        if (!chapter) {
          return res.status(404).json({ message: "Chapter not found" });
        }
        res.json(chapter);
      } catch (err) {
        console.error("Get chapter error:", err);
        res.status(500).json({ message: "Failed to get chapter" });
      }
    }
  );

  // ── Questions ──────────────────────────────────────────────────────────────

  app.get(
    "/api/chapters/:id/questions",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const questionList = await storage.getQuestionsByChapter(
          Number(req.params.id)
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
        const { childProfileId, chapterId } = req.body;
        if (!childProfileId || !chapterId) {
          return res
            .status(400)
            .json({ message: "childProfileId and chapterId required" });
        }
        const session = await storage.createQuizSession({
          childProfileId,
          chapterId,
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
          bloomLevel,
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
    "/api/analytics/:profileId/themes",
    requireAuth,
    requireParent,
    async (req: Request, res: Response) => {
      try {
        const profileId = Number(req.params.profileId);
        const profile = await storage.getChildProfileById(profileId);
        if (!profile || profile.parentId !== req.user!.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        const themes = await storage.getThemeStats(profileId);
        res.json(themes);
      } catch (err) {
        console.error("Theme stats error:", err);
        res.status(500).json({ message: "Failed to get theme stats" });
      }
    }
  );

  // ── Progress ───────────────────────────────────────────────────────────────

  app.get(
    "/api/progress/:profileId/:storyId",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const progress = await storage.getChildProgressRecord(
          Number(req.params.profileId),
          Number(req.params.storyId)
        );
        res.json(progress || { currentChapter: 1, completedChapters: [] });
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
        const { childProfileId, storyId, currentChapter, completedChapters } =
          req.body;
        const progress = await storage.upsertChildProgress({
          childProfileId,
          storyId,
          currentChapter,
          completedChapters,
        });
        res.json(progress);
      } catch (err) {
        console.error("Update progress error:", err);
        res.status(500).json({ message: "Failed to update progress" });
      }
    }
  );
}
