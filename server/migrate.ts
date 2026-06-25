import { pool } from "./db";

export async function migrate() {
  const client = await pool.connect();
  try {
    // Auth tables
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

    // Content tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS topics (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        subject VARCHAR(50) NOT NULL DEFAULT 'math',
        category VARCHAR(50) NOT NULL,
        grade_level INTEGER NOT NULL,
        difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
        icon_name VARCHAR(50) DEFAULT 'Calculator',
        total_questions INTEGER NOT NULL DEFAULT 0,
        is_adventure BOOLEAN NOT NULL DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        type VARCHAR(30) NOT NULL DEFAULT 'multiple-choice',
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
        explanation TEXT,
        sort_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS quiz_sessions (
        id SERIAL PRIMARY KEY,
        child_profile_id INTEGER NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
        topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        difficulty VARCHAR(20),
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        score INTEGER,
        total_questions INTEGER
      );

      CREATE TABLE IF NOT EXISTS question_responses (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        child_profile_id INTEGER NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
        user_answer JSONB,
        is_correct BOOLEAN NOT NULL,
        time_taken INTEGER,
        attempts INTEGER NOT NULL DEFAULT 1,
        hints_used INTEGER NOT NULL DEFAULT 0,
        difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
        bloom_level VARCHAR(20) NOT NULL DEFAULT 'understand',
        answered_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS topic_progress (
        id SERIAL PRIMARY KEY,
        child_profile_id INTEGER NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
        topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        questions_attempted INTEGER NOT NULL DEFAULT 0,
        questions_correct INTEGER NOT NULL DEFAULT 0,
        best_score INTEGER,
        total_sessions INTEGER NOT NULL DEFAULT 0,
        last_practiced_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add new columns if they don't exist (safe for existing deployments)
    const safeAlters = [
      "ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS state VARCHAR(2)",
      "ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS invite_code VARCHAR(6)",
      "ALTER TABLE topics ADD COLUMN IF NOT EXISTS subject VARCHAR(50) NOT NULL DEFAULT 'math'",
      "ALTER TABLE topics ADD COLUMN IF NOT EXISTS is_adventure BOOLEAN NOT NULL DEFAULT false",
      "ALTER TABLE questions ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0",
    ];
    for (const sql of safeAlters) {
      try { await client.query(sql); } catch {}
    }

    // Create indexes (IF NOT EXISTS)
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_child_profiles_parent ON child_profiles(parent_id)",
      "CREATE INDEX IF NOT EXISTS idx_topics_grade ON topics(grade_level)",
      "CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category)",
      "CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject)",
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_topics_title_grade ON topics(title, grade_level)",
      "CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id)",
      "CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty)",
      "CREATE INDEX IF NOT EXISTS idx_sessions_child ON quiz_sessions(child_profile_id)",
      "CREATE INDEX IF NOT EXISTS idx_sessions_topic ON quiz_sessions(topic_id)",
      "CREATE INDEX IF NOT EXISTS idx_sessions_date ON quiz_sessions(started_at)",
      "CREATE INDEX IF NOT EXISTS idx_responses_child ON question_responses(child_profile_id)",
      "CREATE INDEX IF NOT EXISTS idx_responses_session ON question_responses(session_id)",
      "CREATE INDEX IF NOT EXISTS idx_responses_date ON question_responses(answered_at)",
      "CREATE INDEX IF NOT EXISTS idx_progress_child ON topic_progress(child_profile_id)",
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_child_topic ON topic_progress(child_profile_id, topic_id)",
    ];
    for (const sql of indexes) {
      try { await client.query(sql); } catch {}
    }

    console.log("Database schema ready.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
  }
}
