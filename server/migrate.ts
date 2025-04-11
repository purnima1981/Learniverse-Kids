import { db } from './db';
import { sql } from 'drizzle-orm';
import * as schema from '@shared/schema';

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Create questions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        text TEXT NOT NULL,
        options JSONB,
        items JSONB,
        answer JSONB NOT NULL,
        theme TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        tags JSONB,
        is_flagged BOOLEAN DEFAULT false,
        is_skipped BOOLEAN DEFAULT false,
        letters TEXT,
        grid JSONB,
        words JSONB,
        word_sequence JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Questions table created');
    
    // Create user_question_responses table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_question_responses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        user_answer JSONB NOT NULL,
        is_correct BOOLEAN NOT NULL,
        time_taken INTEGER,
        is_flagged BOOLEAN DEFAULT false,
        is_skipped BOOLEAN DEFAULT false,
        attempted_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ User question responses table created');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration().catch(console.error);