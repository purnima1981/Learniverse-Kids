import express from "express";
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
    const { serveStatic } = await import("./vite");
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(app);
  }

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();
