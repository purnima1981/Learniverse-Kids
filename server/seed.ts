import { seedMathTopics } from "./seeds/math-topics";
import * as fs from "fs";
import * as path from "path";

export async function seed() {
  console.log("Checking seed data...");

  // First seed the built-in sample topics (always available)
  await seedMathTopics();

  // Check if generated content exists
  const generatedPath = path.join(
    import.meta.dirname,
    "content-generator",
    "generated-questions.json"
  );

  if (fs.existsSync(generatedPath)) {
    console.log("Generated content found — run 'npm run seed-content' to load it into the database.");
  }

  console.log("Seed check complete.");
}
