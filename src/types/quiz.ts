// Quiz API types and interfaces
// Following API-first design pattern

export type QuizCategory =
  | 'players_legends'
  | 'teams_clubs'
  | 'competitions'
  | 'historical_moments'
  | 'records_stats'

export type QuizDifficulty = 'easy' | 'medium' | 'hard'

export interface QuizQuestion {
  id: string
  category: QuizCategory
  difficulty: QuizDifficulty
  question: string
  options: string[] // Always 4 options
  correct_answer: number // Index of correct option (0-3)
  fun_fact: string
  created_at: string
}

export interface QuizSession {
  id: string
  user_id: string | null // Null for anonymous users
  total_questions: number
  current_question_index: number
  score: number
  streak: number
  started_at: string
  completed_at: string | null
  time_limit_per_question: number // seconds
}

export interface QuizSessionAnswer {
  id: string
  session_id: string
  question_id: string
  user_answer: number | null // Index selected (0-3), null if timeout
  is_correct: boolean
  time_taken: number // milliseconds
  points_earned: number
  answered_at: string
}

export interface QuizLeaderboardEntry {
  id: string
  user_id: string | null
  username: string | null
  total_score: number
  total_sessions: number
  average_accuracy: number
  best_streak: number
  rank: number
  last_played: string
}

// API Request/Response types

export interface StartQuizRequest {
  category?: QuizCategory
  difficulty?: QuizDifficulty
  user_id?: string
  total_questions?: number // Default 10
}

export interface StartQuizResponse {
  session: QuizSession
  question: QuizQuestion
}

export interface SubmitAnswerRequest {
  session_id: string
  question_id: string
  answer: number | null // null for timeout
  time_taken: number // milliseconds
}

export interface SubmitAnswerResponse {
  is_correct: boolean
  correct_answer: number
  fun_fact: string
  points_earned: number
  current_score: number
  current_streak: number
  next_question: QuizQuestion | null // null if quiz complete
}

export interface CompleteQuizResponse {
  session: QuizSession
  total_score: number
  accuracy: number
  time_taken: number // total milliseconds
  rank: number | null
  answers: QuizSessionAnswer[]
}

export interface GetCategoriesResponse {
  categories: Array<{
    id: QuizCategory
    name: string
    description: string
    question_count: number
  }>
}

export interface GetLeaderboardRequest {
  category?: QuizCategory
  limit?: number // Default 10
  timeframe?: 'all_time' | 'week' | 'month'
}

export interface GetLeaderboardResponse {
  entries: QuizLeaderboardEntry[]
  user_rank: number | null
}
