import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { SubmitAnswerRequest, SubmitAnswerResponse } from '@/types/quiz'
import type { Database } from '@/types/database'

const submitAnswerSchema = z.object({
  session_id: z.string().uuid(),
  question_id: z.string().uuid(),
  answer: z.number().min(0).max(3).nullable(),
  time_taken: z.number().min(0),
})

// Points calculation
const calculatePoints = (
  isCorrect: boolean,
  timeTaken: number,
  timeLimit: number,
  streak: number
): number => {
  if (!isCorrect) return 0

  const basePoints = 100
  const timeBonus = Math.max(
    0,
    Math.floor(((timeLimit * 1000 - timeTaken) / (timeLimit * 1000)) * 50)
  )
  const streakBonus = Math.min(streak * 10, 50)

  return basePoints + timeBonus + streakBonus
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubmitAnswerRequest
    const validated = submitAnswerSchema.parse(body)

    const supabase = await createClient()

    // Get session with typed query
    type QuizSession = Database['public']['Tables']['quiz_sessions']['Row']
    const { data: session, error: sessionError } = (await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', validated.session_id)
      .maybeSingle()) as { data: QuizSession | null; error: Error | null }

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.completed_at) {
      return NextResponse.json({ error: 'Session already completed' }, { status: 400 })
    }

    // Get question with typed query
    type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row']
    const { data: question, error: questionError } = (await supabase
      .from('quiz_questions')
      .select('*')
      .eq('id', validated.question_id)
      .maybeSingle()) as { data: QuizQuestion | null; error: Error | null }

    if (questionError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Check answer
    const isCorrect = validated.answer === question.correct_answer
    const newStreak = isCorrect ? session.streak + 1 : 0
    const points = calculatePoints(
      isCorrect,
      validated.time_taken,
      session.time_limit_per_question,
      session.streak
    )
    const newScore = session.score + points

    // Save answer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: answerError } = await (supabase.from('quiz_session_answers') as any).insert({
      session_id: validated.session_id,
      question_id: validated.question_id,
      user_answer: validated.answer,
      is_correct: isCorrect,
      time_taken: validated.time_taken,
      points_earned: points,
    })

    if (answerError) {
      console.error('Failed to save answer:', answerError)
    }

    // Update session
    const nextQuestionIndex = session.current_question_index + 1
    const isComplete = nextQuestionIndex >= session.total_questions

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('quiz_sessions') as any)
      .update({
        current_question_index: nextQuestionIndex,
        score: newScore,
        streak: newStreak,
        completed_at: isComplete ? new Date().toISOString() : null,
      })
      .eq('id', validated.session_id)

    // Get next question if not complete
    let nextQuestion = null
    if (!isComplete) {
      // Get next question from session questions
      type DBQuestion = Database['public']['Tables']['quiz_questions']['Row']
      const { data: sessionQuestions } = (await supabase
        .from('quiz_session_questions')
        .select('question_id, quiz_questions(*)')
        .eq('session_id', validated.session_id)
        .eq('question_order', nextQuestionIndex)
        .single()) as {
        data: { question_id: string; quiz_questions: DBQuestion } | null
        error: Error | null
      }

      if (sessionQuestions && sessionQuestions.quiz_questions) {
        const q = sessionQuestions.quiz_questions
        // Type assertion needed for DB string enums -> API enums
        nextQuestion = {
          id: q.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          category: q.category as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          difficulty: q.difficulty as any,
          question: q.question,
          options: q.options as string[],
          correct_answer: -1, // Don't reveal
          fun_fact: '',
          created_at: q.created_at,
        }
      }
    }

    const response = {
      is_correct: isCorrect,
      correct_answer: question.correct_answer,
      fun_fact: question.fun_fact,
      points_earned: points,
      current_score: newScore,
      current_streak: newStreak,
      next_question: nextQuestion,
    } as SubmitAnswerResponse

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 })
    }

    console.error('Submit answer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
