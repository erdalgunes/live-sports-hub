-- Add session questions table to track question order for each session
CREATE TABLE IF NOT EXISTS quiz_session_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_order),
  UNIQUE(session_id, question_id)
);

CREATE INDEX idx_quiz_session_questions_session ON quiz_session_questions(session_id);
CREATE INDEX idx_quiz_session_questions_order ON quiz_session_questions(session_id, question_order);
