import { pool } from "./db";

export async function migrate() {
  const client = await pool.connect();
  try {
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

      CREATE TABLE IF NOT EXISTS topics (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        grade_level INTEGER NOT NULL,
        difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
        icon_name VARCHAR(50) DEFAULT 'Calculator',
        total_questions INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS questions (
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

      CREATE TABLE IF NOT EXISTS quiz_sessions (
        id SERIAL PRIMARY KEY,
        child_profile_id INTEGER NOT NULL REFERENCES child_profiles(id),
        topic_id INTEGER NOT NULL REFERENCES topics(id),
        difficulty VARCHAR(20),
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        score INTEGER,
        total_questions INTEGER
      );

      CREATE TABLE IF NOT EXISTS question_responses (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES quiz_sessions(id),
        question_id INTEGER NOT NULL REFERENCES questions(id),
        child_profile_id INTEGER NOT NULL REFERENCES child_profiles(id),
        user_answer JSONB,
        is_correct BOOLEAN NOT NULL,
        time_taken INTEGER,
        attempts INTEGER NOT NULL DEFAULT 1,
        hints_used INTEGER NOT NULL DEFAULT 0,
        difficulty VARCHAR(20) NOT NULL,
        bloom_level VARCHAR(20) NOT NULL DEFAULT 'understand',
        answered_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS topic_progress (
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
    // Add missing columns to existing tables
    const alterStatements = [
      "ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS state VARCHAR(2)",
      "ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS invite_code VARCHAR(6)",
      "ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT",
      "ALTER TABLE questions ADD COLUMN IF NOT EXISTS diagram JSONB",
      "ALTER TABLE questions ADD COLUMN IF NOT EXISTS bloom_level VARCHAR(20) NOT NULL DEFAULT 'understand'",
      "ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic VARCHAR(100)",
      "ALTER TABLE question_responses ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) NOT NULL DEFAULT 'medium'",
      "ALTER TABLE question_responses ADD COLUMN IF NOT EXISTS bloom_level VARCHAR(20) NOT NULL DEFAULT 'understand'",
      "ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20)",
    ];
    for (const sql of alterStatements) {
      try { await client.query(sql); } catch {}
    }

    console.log("Database tables ready.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
  }
}
