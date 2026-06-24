import express from "express";
import path from "path";
import { setupAuth } from "./auth";
import { registerRoutes } from "./routes";
import { migrate } from "./migrate";
import { seed } from "./seed";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

setupAuth(app);
registerRoutes(app);

(async () => {
  // Create tables if they don't exist
  await migrate();

  // Seed sample data
  try {
    await seed();
  } catch (err) {
    console.error("Seed failed:", err);
  }

  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(process.cwd(), "dist", "public");
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(app);
  }

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();
