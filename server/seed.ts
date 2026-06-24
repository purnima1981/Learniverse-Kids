import { seedMathTopics } from "./seeds/math-topics";

export async function seed() {
  console.log("Seeding database...");
  try {
    await seedMathTopics();
    console.log("Seed complete.");
  } catch (err) {
    console.error("Seed error:", err);
  }
}
