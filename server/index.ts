import express from "express";
import path from "path";
import fs from "fs";
import { setupAuth } from "./auth";
import { registerRoutes } from "./routes";
import { seed } from "./seed";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Auth (sessions + passport + auth routes)
setupAuth(app);

// API routes
registerRoutes(app);

// Vite dev server or static serving
(async () => {
  // Seed database on startup
  try {
    await seed();
  } catch (err) {
    console.error("Seed failed (tables may not exist yet — run npm run db:push):", err);
  }

  if (process.env.NODE_ENV === "production") {
    // Serve static files directly — no vite import needed in production
    const distPath = path.resolve(process.cwd(), "dist", "public");
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    // Only import vite in development
    const { setupVite } = await import("./vite");
    await setupVite(app);
  }

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();
