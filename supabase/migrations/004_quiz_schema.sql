-- Quiz system tables migration
-- API-first design for football quiz functionality

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN (
    'players_legends',
    'teams_clubs',
    'competitions',
    'historical_moments',
    'records_stats'
  )),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 options
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  fun_fact TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Nullable for anonymous users
  total_questions INTEGER NOT NULL DEFAULT 10,
  current_question_index INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  time_limit_per_question INTEGER NOT NULL DEFAULT 15, -- seconds
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz session answers table
CREATE TABLE IF NOT EXISTS quiz_session_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_answer INTEGER CHECK (user_answer BETWEEN 0 AND 3), -- Null for timeout
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER NOT NULL, -- milliseconds
  points_earned INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz leaderboard table
CREATE TABLE IF NOT EXISTS quiz_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Nullable for anonymous users
  username TEXT,
  total_score INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  average_accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_played TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX idx_quiz_questions_active ON quiz_questions(is_active);
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_completed ON quiz_sessions(completed_at);
CREATE INDEX idx_quiz_session_answers_session ON quiz_session_answers(session_id);
CREATE INDEX idx_quiz_leaderboard_score ON quiz_leaderboard(total_score DESC);
CREATE INDEX idx_quiz_leaderboard_user ON quiz_leaderboard(user_id);

-- Function to update leaderboard after session completion
CREATE OR REPLACE FUNCTION update_quiz_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
  v_total_score INTEGER;
  v_total_sessions INTEGER;
  v_avg_accuracy DECIMAL(5,2);
  v_best_streak INTEGER;
BEGIN
  -- Only process completed sessions
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    -- Calculate aggregated stats
    SELECT
      COALESCE(SUM(score), 0) + NEW.score,
      COUNT(*) + 1,
      ROUND(AVG(
        CASE
          WHEN total_questions > 0 THEN (score::DECIMAL / (total_questions * 100)) * 100
          ELSE 0
        END
      )::NUMERIC, 2),
      GREATEST(COALESCE(MAX(streak), 0), NEW.streak)
    INTO v_total_score, v_total_sessions, v_avg_accuracy, v_best_streak
    FROM quiz_sessions
    WHERE user_id = NEW.user_id
      AND completed_at IS NOT NULL
      AND id != NEW.id;

    -- Upsert leaderboard entry
    INSERT INTO quiz_leaderboard (
      user_id,
      username,
      total_score,
      total_sessions,
      average_accuracy,
      best_streak,
      last_played,
      updated_at
    )
    VALUES (
      NEW.user_id,
      COALESCE(NEW.user_id::TEXT, 'Anonymous'),
      v_total_score,
      v_total_sessions,
      v_avg_accuracy,
      v_best_streak,
      NEW.completed_at,
      NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      total_score = EXCLUDED.total_score,
      total_sessions = EXCLUDED.total_sessions,
      average_accuracy = EXCLUDED.average_accuracy,
      best_streak = EXCLUDED.best_streak,
      last_played = EXCLUDED.last_played,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leaderboard
CREATE TRIGGER trigger_update_quiz_leaderboard
  AFTER UPDATE ON quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_leaderboard();

-- Function to clean up old incomplete sessions (older than 24 hours)
CREATE OR REPLACE FUNCTION clean_incomplete_quiz_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM quiz_sessions
  WHERE completed_at IS NULL
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint for leaderboard user_id
CREATE UNIQUE INDEX idx_quiz_leaderboard_user_unique ON quiz_leaderboard(user_id)
  WHERE user_id IS NOT NULL;
