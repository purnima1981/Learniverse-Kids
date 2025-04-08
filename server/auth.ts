import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as AppleStrategy } from "passport-apple";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, insertUserSchema } from "@shared/schema";

// Social login callback URL
const CALLBACK_URL = process.env.NODE_ENV === "production" 
  ? "https://yourapp.replit.app" 
  : "http://localhost:5000";

declare global {
  namespace Express {
    // Extend Express.User interface to include our User type properties
    interface User {
      id: number;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
      grade: string;
      gender: string;
      themeId: number | null;
      createdAt: Date | null;
      lastActive: Date | null;
      googleId: string | null;
      facebookId: string | null;
      appleId: string | null;
      avatar: string | null;
    }
  }
}

// Declare the properties we'll attach to the session
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Helper function to create or find user from social provider
async function handleSocialAuth(profile: any, provider: 'google' | 'facebook' | 'apple') {
  try {
    // Get provider ID field name (googleId, facebookId, or appleId)
    const providerIdField = `${provider}Id` as 'googleId' | 'facebookId' | 'appleId';
    
    // Try to find user by provider ID
    let user: User | undefined;
    
    if (provider === 'google') {
      user = await storage.getUserByGoogleId(profile.id);
    } else if (provider === 'facebook') {
      user = await storage.getUserByFacebookId(profile.id);
    } else if (provider === 'apple') {
      user = await storage.getUserByAppleId(profile.id);
    }
    
    // If user exists, return it
    if (user) {
      return user;
    }
    
    // If not, check if email already exists
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    if (email) {
      user = await storage.getUserByEmail(email);
      
      // If user exists with this email, link social account
      if (user) {
        // Update user with social ID and save
        const updates: Partial<User> = {};
        updates[providerIdField] = profile.id;
        
        // If user has no avatar but profile does, use it
        if (!user.avatar && profile.photos && profile.photos[0] && profile.photos[0].value) {
          updates.avatar = profile.photos[0].value;
        }
        
        // Update user in database
        await storage.updateUser(user.id, updates);
        
        // Get updated user
        user = await storage.getUser(user.id);
        return user;
      }
    }
    
    // No existing user, create a new one
    // Generate a random secure password for the user (they'll never use it directly)
    const password = await hashPassword(randomBytes(16).toString('hex'));
    
    // Create user with social provider data
    const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
    const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
    
    // Create new user record
    const newUserData: any = {
      email: email || `${profile.id}@${provider}.user`, // Fallback email if none provided
      password, // Random password
      firstName,
      lastName,
      grade: "5", // Default grade for parent
      gender: "other", // Default gender
      role: 'parent', // Default role
      [providerIdField]: profile.id
    };
    
    // If profile has photo, use as avatar
    if (profile.photos && profile.photos[0] && profile.photos[0].value) {
      newUserData.avatar = profile.photos[0].value;
    }
    
    // Create user
    const newUser = await storage.createUser(newUserData);
    return newUser;
  } catch (error) {
    console.error(`Error in ${provider} authentication:`, error);
    throw error;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "learniverse-app-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  
  // Google Strategy (will be activated when you provide credentials)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${CALLBACK_URL}/api/auth/google/callback`,
          scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await handleSocialAuth(profile, 'google');
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
  
  // Facebook Strategy (will be activated when you provide credentials)
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: `${CALLBACK_URL}/api/auth/facebook/callback`,
          profileFields: ['id', 'displayName', 'photos', 'email', 'first_name', 'last_name']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await handleSocialAuth(profile, 'facebook');
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
  
  // Apple Strategy (will be activated when you provide credentials)
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
    passport.use(
      new AppleStrategy(
        {
          clientID: process.env.APPLE_CLIENT_ID,
          teamID: process.env.APPLE_TEAM_ID,
          keyID: process.env.APPLE_KEY_ID,
          privateKeyString: process.env.APPLE_PRIVATE_KEY,
          callbackURL: `${CALLBACK_URL}/api/auth/apple/callback`,
          scope: ['name', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await handleSocialAuth(profile, 'apple');
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Hash password
      const hashedPassword = await hashPassword(req.body.password);

      // Create user
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      // Log the user in
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid email or password" });
      }
      req.login(user, (err: any) => {
        if (err) {
          return next(err);
        }
        
        // Set userId in session
        req.session.userId = user.id;
        
        // Update last active
        storage.updateUserLastActive(user.id).catch(console.error);
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ message: "Failed to destroy session" });
        }
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  });

  // Get current user
  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated() || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update last active
      storage.updateUserLastActive(user.id).catch(console.error);
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Social login routes
  
  // Google auth
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    
    app.get('/api/auth/google/callback', 
      passport.authenticate('google', { failureRedirect: '/auth?error=google-auth-failed' }),
      (req, res) => {
        // Successful authentication
        if (req.user) {
          req.session.userId = req.user.id;
          
          // Check if user needs to set up a profile for a child
          return res.redirect('/personalization');
        } else {
          res.redirect('/auth?error=google-login-failed');
        }
      }
    );
  }
  
  // Facebook auth
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
    
    app.get('/api/auth/facebook/callback',
      passport.authenticate('facebook', { failureRedirect: '/auth?error=facebook-auth-failed' }),
      (req, res) => {
        // Successful authentication
        if (req.user) {
          req.session.userId = req.user.id;
          
          // Check if user needs to set up a profile for a child
          return res.redirect('/personalization');
        } else {
          res.redirect('/auth?error=facebook-login-failed');
        }
      }
    );
  }
  
  // Apple auth  
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID) {
    app.get('/api/auth/apple', passport.authenticate('apple'));
    
    app.get('/api/auth/apple/callback',
      passport.authenticate('apple', { failureRedirect: '/auth?error=apple-auth-failed' }),
      (req, res) => {
        // Successful authentication
        if (req.user) {
          req.session.userId = req.user.id;
          
          // Check if user needs to set up a profile for a child
          return res.redirect('/personalization');
        } else {
          res.redirect('/auth?error=apple-login-failed');
        }
      }
    );
  }
}