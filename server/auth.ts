import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import createMemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import type { Express, Request, Response, NextFunction } from "express";
import {
  getUserByEmail,
  getUserById,
  createUser,
  getChildProfilesByParent,
  getChildProfileByNameAndParent,
  getChildProfileById,
  verifyChildPin,
} from "./storage";

const MemoryStore = createMemoryStore(session);

declare module "express-session" {
  interface SessionData {
    activeProfileId: number | null;
    activeProfileType: "parent" | "child";
  }
}

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    }
  }
}

export function setupAuth(app: Express) {
  // Trust Railway's reverse proxy so secure cookies work
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "learniverse-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production",
    },
    store: new MemoryStore({ checkPeriod: 86400000 }),
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy — parent login with email + password
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await getUserByEmail(email);
          if (!user) return done(null, false, { message: "Invalid email" });

          const valid = await bcrypt.compare(password, user.password);
          if (!valid)
            return done(null, false, { message: "Invalid password" });

          return done(null, {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await getUserById(id);
      if (!user) return done(null, false);
      done(null, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (err) {
      done(err);
    }
  });

  // ── Auth Routes ──────────────────────────────────────────────────────────

  // Register (parent)
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existing = await getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "parent",
      });

      req.login(
        {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        (err) => {
          if (err) return res.status(500).json({ message: "Login failed" });
          req.session.activeProfileType = "parent";
          req.session.activeProfileId = null;
          return res.json({
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
            },
          });
        }
      );
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login (parent)
  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (err: Error | null, user: Express.User | false, info: { message: string }) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          req.session.activeProfileType = "parent";
          req.session.activeProfileId = null;
          return res.json({ user });
        });
      }
    )(req, res, next);
  });

  // Kid login (email + kid name + PIN)
  app.post("/api/auth/kid-login", async (req: Request, res: Response) => {
    try {
      const { email, childName, pin } = req.body;
      if (!email || !childName || !pin) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const parent = await getUserByEmail(email);
      if (!parent) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const profile = await getChildProfileByNameAndParent(
        childName,
        parent.id
      );
      if (!profile) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const pinValid = await verifyChildPin(profile.id, pin);
      if (!pinValid) {
        return res.status(401).json({ message: "Invalid PIN" });
      }

      // Log in as the parent user but set active profile to child
      req.login(
        {
          id: parent.id,
          email: parent.email,
          firstName: parent.firstName,
          lastName: parent.lastName,
          role: parent.role,
        },
        (err) => {
          if (err) return res.status(500).json({ message: "Login failed" });
          req.session.activeProfileType = "child";
          req.session.activeProfileId = profile.id;
          return res.json({
            user: {
              id: parent.id,
              email: parent.email,
              firstName: parent.firstName,
              lastName: parent.lastName,
              role: parent.role,
            },
            activeProfile: {
              id: profile.id,
              name: profile.name,
              grade: profile.grade,
              avatar: profile.avatar,
            },
            activeProfileType: "child",
          });
        }
      );
    } catch (err) {
      console.error("Kid login error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  // Get current session
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.json(null);
    }

    const result: Record<string, unknown> = {
      user: req.user,
      activeProfileType: req.session.activeProfileType || "parent",
      activeProfile: null,
    };

    if (
      req.session.activeProfileType === "child" &&
      req.session.activeProfileId
    ) {
      const profile = await getChildProfileById(req.session.activeProfileId);
      if (profile) {
        result.activeProfile = {
          id: profile.id,
          name: profile.name,
          grade: profile.grade,
          avatar: profile.avatar,
        };
      }
    }

    res.json(result);
  });

  // Switch active profile
  app.post("/api/auth/switch-profile", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { profileId } = req.body;

    if (!profileId) {
      // Switch back to parent mode
      req.session.activeProfileType = "parent";
      req.session.activeProfileId = null;
      return res.json({ activeProfileType: "parent", activeProfile: null });
    }

    // Verify the profile belongs to this parent
    const profile = await getChildProfileById(profileId);
    if (!profile || profile.parentId !== req.user.id) {
      return res.status(403).json({ message: "Not your child profile" });
    }

    req.session.activeProfileType = "child";
    req.session.activeProfileId = profile.id;
    res.json({
      activeProfileType: "child",
      activeProfile: {
        id: profile.id,
        name: profile.name,
        grade: profile.grade,
        avatar: profile.avatar,
      },
    });
  });
}

// ─── Middleware Helpers ─────────────────────────────────────────────────────

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function requireParent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.session.activeProfileType !== "parent") {
    return res.status(403).json({ message: "Parent access required" });
  }
  next();
}
