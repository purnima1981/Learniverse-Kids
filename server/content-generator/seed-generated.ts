/**
 * Seed the database from generated-questions.json
 *
 * Usage:
 *   npx tsx server/content-generator/seed-generated.ts
 *
 * This reads the generated JSON file and inserts topics + questions
 * into the database. It's idempotent — skips topics that already exist.
 */

import * as fs from "fs";
import * as path from "path";
import { db } from "../db";
import { topics, questions } from "@shared/schema";
import { eq, and } from "drizzle-orm";

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

const INPUT_PATH = path.join(__dirname, "generated-questions.json");

async function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`ERROR: ${INPUT_PATH} not found`);
    console.error("Run the generator first: ANTHROPIC_API_KEY=... npx tsx server/content-generator/generate.ts");
    process.exit(1);
  }

  const data: GeneratedTopic[] = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));

  let topicsCreated = 0;
  let topicsSkipped = 0;
  let questionsInserted = 0;

  console.log(`Loading ${data.length} topics from generated-questions.json...\n`);

  for (const topicData of data) {
    // Check if topic already exists
    const existing = await db
      .select()
      .from(topics)
      .where(
        and(
          eq(topics.title, topicData.title),
          eq(topics.gradeLevel, topicData.gradeLevel)
        )
      );

    if (existing.length > 0) {
      console.log(`SKIP: "${topicData.title}" (Grade ${topicData.gradeLevel}) - already exists`);
      topicsSkipped++;
      continue;
    }

    // Determine overall difficulty from questions
    const difficulties = topicData.questions.map((q) => q.difficulty);
    const hasMostly = (d: string) => difficulties.filter((x) => x === d).length > difficulties.length / 2;
    const overallDifficulty = hasMostly("hard") ? "hard" : hasMostly("easy") ? "easy" : "medium";

    // Insert topic
    const [topic] = await db
      .insert(topics)
      .values({
        title: topicData.title,
        description: topicData.description,
        category: topicData.category,
        gradeLevel: topicData.gradeLevel,
        difficulty: overallDifficulty,
        totalQuestions: topicData.questions.length,
      })
      .returning();

    topicsCreated++;

    // Insert questions
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

    console.log(`OK: "${topicData.title}" (Grade ${topicData.gradeLevel}) - ${topicData.questions.length} questions`);
  }

  console.log(`\nDone!`);
  console.log(`Topics created: ${topicsCreated}`);
  console.log(`Topics skipped: ${topicsSkipped}`);
  console.log(`Questions inserted: ${questionsInserted}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
