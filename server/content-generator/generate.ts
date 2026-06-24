/**
 * Offline Math Olympiad Question Generator
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx server/content-generator/generate.ts
 *
 * This generates ~5000+ questions across all grades, categories, and difficulties,
 * saves them to server/content-generator/generated-questions.json.
 *
 * Then run the seed to load them into the database:
 *   npx tsx server/content-generator/seed-generated.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import { TOPIC_MATRIX, type TopicDefinition } from "./topic-matrix";

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

const BLOOM_LEVELS = ["remember", "understand", "apply", "analyze", "evaluate", "create"] as const;

const QUESTION_TYPES = ["multiple-choice", "true-false", "fill-blank"] as const;

interface GeneratedQuestion {
  type: string;
  text: string;
  diagram?: unknown;
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

const OUTPUT_PATH = path.join(__dirname, "generated-questions.json");

// How many questions per topic per difficulty
const QUESTIONS_PER_DIFFICULTY = 10;

function buildPrompt(topic: TopicDefinition, difficulty: string, batchSize: number): string {
  const bloomDistribution = difficulty === "easy"
    ? "mostly 'remember' and 'understand', some 'apply'"
    : difficulty === "medium"
    ? "mostly 'apply' and 'analyze', some 'understand'"
    : "mostly 'analyze', 'evaluate', and 'create', some 'apply'";

  return `Generate exactly ${batchSize} math olympiad practice questions for:

TOPIC: ${topic.title}
DESCRIPTION: ${topic.description}
GRADE LEVEL: ${topic.gradeLevel}
CATEGORY: ${topic.category}
DIFFICULTY: ${difficulty}
SUBTOPICS TO COVER: ${topic.subtopics.join(", ")}

BLOOM'S TAXONOMY DISTRIBUTION: ${bloomDistribution}
Available bloom levels: remember, understand, apply, analyze, evaluate, create

QUESTION TYPE RULES:
- Use a mix of: "multiple-choice", "true-false", "fill-blank"
- About 60% multiple-choice, 20% fill-blank, 20% true-false
- For multiple-choice: provide exactly 4 choices, answer is "a", "b", "c", or "d"
- For true-false: answer is "true" or "false"
- For fill-blank: answer is a string (the correct answer, number or short text)

CONTENT RULES:
- Questions should be at grade ${topic.gradeLevel} level, difficulty "${difficulty}"
- Use clear, concise language appropriate for children
- For math expressions, use LaTeX notation with $ delimiters (e.g., $\\frac{1}{2}$, $x^2 + 3x$)
- Each question MUST have 1-3 helpful hints (progressive, not giving away the answer)
- Each question MUST have a clear explanation of the solution
- The "topic" field should be a specific subtopic from: ${topic.subtopics.join(", ")}
- Questions should be similar to Math Kangaroo, AMC 8, or SOF IMO style
- Make questions interesting and varied — avoid repetitive formats
- Ensure answers are unambiguous and correct

Return ONLY a valid JSON array. No markdown, no explanation outside JSON.
Each element must have this exact structure:
[
  {
    "type": "multiple-choice",
    "text": "question text here with $math$ if needed",
    "options": { "choices": ["option A", "option B", "option C", "option D"] },
    "answer": "a",
    "difficulty": "${difficulty}",
    "bloomLevel": "apply",
    "topic": "specific subtopic",
    "hints": ["hint 1", "hint 2"],
    "explanation": "detailed solution explanation"
  },
  {
    "type": "true-false",
    "text": "statement here",
    "options": null,
    "answer": "true",
    "difficulty": "${difficulty}",
    "bloomLevel": "understand",
    "topic": "specific subtopic",
    "hints": ["hint 1"],
    "explanation": "explanation here"
  },
  {
    "type": "fill-blank",
    "text": "What is the value of ___?",
    "options": null,
    "answer": "42",
    "difficulty": "${difficulty}",
    "bloomLevel": "apply",
    "topic": "specific subtopic",
    "hints": ["hint 1", "hint 2"],
    "explanation": "explanation here"
  }
]`;
}

async function generateBatch(
  client: Anthropic,
  topic: TopicDefinition,
  difficulty: string,
  batchSize: number,
  retries = 2
): Promise<GeneratedQuestion[]> {
  const prompt = buildPrompt(topic, difficulty, batchSize);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);

      // Validate each question
      const valid = questions.filter((q) => {
        if (!q.type || !q.text || !q.answer || !q.difficulty || !q.bloomLevel) return false;
        if (!q.hints || !Array.isArray(q.hints) || q.hints.length === 0) return false;
        if (!q.explanation) return false;
        if (q.type === "multiple-choice") {
          const opts = q.options as { choices?: string[] } | null;
          if (!opts?.choices || opts.choices.length !== 4) return false;
          if (!["a", "b", "c", "d"].includes(q.answer as string)) return false;
        }
        if (q.type === "true-false") {
          if (!["true", "false"].includes(q.answer as string)) return false;
        }
        return true;
      });

      if (valid.length < batchSize * 0.5) {
        throw new Error(`Only ${valid.length}/${batchSize} questions valid`);
      }

      return valid;
    } catch (err) {
      console.error(`  Attempt ${attempt + 1} failed for ${topic.title}/${difficulty}:`, (err as Error).message);
      if (attempt === retries) {
        console.error(`  Skipping this batch after ${retries + 1} attempts`);
        return [];
      }
      // Wait before retry
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return [];
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ERROR: Set ANTHROPIC_API_KEY environment variable");
    console.error("Usage: ANTHROPIC_API_KEY=sk-... npx tsx server/content-generator/generate.ts");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  // Load existing progress if any (for resumability)
  let results: GeneratedTopic[] = [];
  const completedKeys = new Set<string>();

  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      results = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
      for (const t of results) {
        completedKeys.add(`${t.title}::${t.gradeLevel}`);
      }
      console.log(`Resuming: ${results.length} topics already generated`);
    } catch {
      console.log("Could not parse existing file, starting fresh");
      results = [];
    }
  }

  const totalTopics = TOPIC_MATRIX.length;
  const totalBatches = totalTopics * DIFFICULTIES.length;
  let completedBatches = 0;
  let totalQuestions = results.reduce((sum, t) => sum + t.questions.length, 0);

  console.log(`\nGenerating questions for ${totalTopics} topics x ${DIFFICULTIES.length} difficulties = ${totalBatches} batches`);
  console.log(`Target: ~${totalTopics * DIFFICULTIES.length * QUESTIONS_PER_DIFFICULTY} questions\n`);

  for (const topic of TOPIC_MATRIX) {
    const key = `${topic.title}::${topic.gradeLevel}`;

    // Find or create the topic entry
    let topicEntry = results.find((t) => t.title === topic.title && t.gradeLevel === topic.gradeLevel);
    if (!topicEntry) {
      topicEntry = {
        title: topic.title,
        description: topic.description,
        category: topic.category,
        gradeLevel: topic.gradeLevel,
        questions: [],
      };
      results.push(topicEntry);
    }

    for (const difficulty of DIFFICULTIES) {
      completedBatches++;

      // Check if we already have enough questions for this difficulty
      const existingForDifficulty = topicEntry.questions.filter((q) => q.difficulty === difficulty).length;
      if (existingForDifficulty >= QUESTIONS_PER_DIFFICULTY) {
        console.log(`[${completedBatches}/${totalBatches}] SKIP ${topic.title} / ${difficulty} (${existingForDifficulty} exist)`);
        continue;
      }

      const needed = QUESTIONS_PER_DIFFICULTY - existingForDifficulty;
      console.log(`[${completedBatches}/${totalBatches}] Generating ${needed} ${difficulty} questions for "${topic.title}" (Grade ${topic.gradeLevel})...`);

      const questions = await generateBatch(client, topic, difficulty, needed);
      topicEntry.questions.push(...questions);
      totalQuestions += questions.length;

      console.log(`  Got ${questions.length} questions (total: ${totalQuestions})`);

      // Save progress after each batch
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));

      // Rate limiting: pause between API calls
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\nDone! Generated ${totalQuestions} total questions across ${results.length} topics`);
  console.log(`Output saved to: ${OUTPUT_PATH}`);
  console.log(`\nNext step: run 'npx tsx server/content-generator/seed-generated.ts' to load into database`);
}

main().catch(console.error);
