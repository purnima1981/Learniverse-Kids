import { seedMathTopics } from "./seeds/math-topics";
import { db } from "./db";
import { topics, questions } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

interface GeneratedQuestion {
  type: string;
  text: string;
  options: unknown;
  answer: unknown;
  difficulty: string;
  bloomLevel: string;
  topic: string;
  hints: string[];
  explanation: string;
}

interface GeneratedTopic {
  title: string;
  description: string;
  category: string;
  gradeLevel: number;
  questions: GeneratedQuestion[];
}

async function seedGeneratedQuestions() {
  // Try multiple paths — __dirname works in dev, process.cwd() in production
  const candidates = [
    path.join(__dirname, "content-generator", "generated-questions.json"),
    path.join(process.cwd(), "server", "content-generator", "generated-questions.json"),
    path.join(process.cwd(), "dist", "content-generator", "generated-questions.json"),
    path.join(process.cwd(), "content-generator", "generated-questions.json"),
  ];
  const filePath = candidates.find(p => fs.existsSync(p));
  if (!filePath) {
    console.log("No generated-questions.json found at any path, skipping.");
    console.log("Searched:", candidates.join(", "));
    return;
  }
  console.log("Loading generated questions from:", filePath);

  const data: GeneratedTopic[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let topicsCreated = 0;
  let questionsInserted = 0;

  for (const topicData of data) {
    // Skip if topic already exists
    const existing = await db.select().from(topics)
      .where(and(eq(topics.title, topicData.title), eq(topics.gradeLevel, topicData.gradeLevel)));

    if (existing.length > 0) continue;

    const difficulty = topicData.questions.length > 0
      ? (topicData.questions.filter(q => q.difficulty === "hard").length > topicData.questions.length / 2 ? "hard" : "medium")
      : "medium";

    const [topic] = await db.insert(topics).values({
      title: topicData.title,
      description: topicData.description,
      category: topicData.category,
      gradeLevel: topicData.gradeLevel,
      difficulty,
      totalQuestions: topicData.questions.length,
    }).returning();

    topicsCreated++;

    for (const q of topicData.questions) {
      await db.insert(questions).values({
        topicId: topic.id,
        type: q.type,
        text: q.text,
        options: q.options,
        answer: q.answer,
        difficulty: q.difficulty,
        bloomLevel: q.bloomLevel,
        topic: q.topic,
        hints: q.hints,
        explanation: q.explanation,
        tags: null,
        imageUrl: null,
      });
      questionsInserted++;
    }
  }

  if (topicsCreated > 0) {
    console.log(`Generated content: ${topicsCreated} topics, ${questionsInserted} questions loaded.`);
  } else {
    console.log("Generated content: all topics already exist, skipped.");
  }
}

export async function seed() {
  console.log("Seeding database...");
  try {
    await seedMathTopics();
    await seedGeneratedQuestions();
    console.log("Seed complete.");
  } catch (err) {
    console.error("Seed error:", err);
  }
}
