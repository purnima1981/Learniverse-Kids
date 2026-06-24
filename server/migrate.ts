import { pool } from "./db";

export async function migrate() {
  const client = await pool.connect();
  try {
    // Keep users and child_profiles (auth data), drop and recreate everything else
    // These tables have wrong columns from the old schema (chapter_id vs topic_id)
    await client.query(`
      DROP TABLE IF EXISTS question_responses CASCADE;
      DROP TABLE IF EXISTS quiz_sessions CASCADE;
      DROP TABLE IF EXISTS topic_progress CASCADE;
      DROP TABLE IF EXISTS questions CASCADE;
      DROP TABLE IF EXISTS topics CASCADE;
      DROP TABLE IF EXISTS child_progress CASCADE;
      DROP TABLE IF EXISTS chapters CASCADE;
      DROP TABLE IF EXISTS stories CASCADE;
    `);

    // Ensure auth tables exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'parent',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS child_profiles (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER NOT NULL REFERENCES users(id),
        name VARCHAR(100) NOT NULL,
        grade INTEGER NOT NULL,
        pin TEXT NOT NULL,
        avatar VARCHAR(50) DEFAULT 'default',
        state VARCHAR(2),
        invite_code VARCHAR(6),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS invite_codes (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER NOT NULL REFERENCES users(id),
        code VARCHAR(6) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_by_profile_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create fresh data tables with correct schema
    await client.query(`
      CREATE TABLE topics (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        grade_level INTEGER NOT NULL,
        difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
        icon_name VARCHAR(50) DEFAULT 'Calculator',
        total_questions INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE questions (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER NOT NULL REFERENCES topics(id),
        type VARCHAR(30) NOT NULL,
        text TEXT NOT NULL,
        image_url TEXT,
        diagram JSONB,
        options JSONB,
        answer JSONB NOT NULL,
        difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
        bloom_level VARCHAR(20) NOT NULL DEFAULT 'understand',
        topic VARCHAR(100),
        tags JSONB,
        hints JSONB,
        explanation TEXT
      );

      CREATE TABLE quiz_sessions (
        id SERIAL PRIMARY KEY,
        child_profile_id INTEGER NOT NULL REFERENCES child_profiles(id),
        topic_id INTEGER NOT NULL REFERENCES topics(id),
        difficulty VARCHAR(20),
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        score INTEGER,
        total_questions INTEGER
      );

      CREATE TABLE question_responses (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES quiz_sessions(id),
        question_id INTEGER NOT NULL REFERENCES questions(id),
        child_profile_id INTEGER NOT NULL REFERENCES child_profiles(id),
        user_answer JSONB,
        is_correct BOOLEAN NOT NULL,
        time_taken INTEGER,
        attempts INTEGER NOT NULL DEFAULT 1,
        hints_used INTEGER NOT NULL DEFAULT 0,
        difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
        bloom_level VARCHAR(20) NOT NULL DEFAULT 'understand',
        answered_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE topic_progress (
        id SERIAL PRIMARY KEY,
        child_profile_id INTEGER NOT NULL REFERENCES child_profiles(id),
        topic_id INTEGER NOT NULL REFERENCES topics(id),
        questions_attempted INTEGER NOT NULL DEFAULT 0,
        questions_correct INTEGER NOT NULL DEFAULT 0,
        best_score INTEGER,
        total_sessions INTEGER NOT NULL DEFAULT 0,
        last_practiced_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add missing columns to auth tables (in case they were created with old schema)
    const alters = [
      "ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS state VARCHAR(2)",
      "ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS invite_code VARCHAR(6)",
    ];
    for (const sql of alters) {
      try { await client.query(sql); } catch {}
    }

    console.log("Database tables ready (fresh).");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
  }
}
