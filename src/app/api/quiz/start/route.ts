import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { StartQuizRequest, StartQuizResponse } from '@/types/quiz'
import type { Database } from '@/types/database'

const startQuizSchema = z.object({
  category: z
    .enum(['players_legends', 'teams_clubs', 'competitions', 'historical_moments', 'records_stats'])
    .optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  user_id: z.string().uuid().optional(),
  total_questions: z.number().min(1).max(50).default(10),
})

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as StartQuizRequest
    const validated = startQuizSchema.parse(body)

    const supabase = await createClient()

    // Build query for random questions
    type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row']
    let query = supabase
      .from('quiz_questions')
      .select('*')
      .eq('is_active', true)
      .limit(validated.total_questions)

    if (validated.category) {
      query = query.eq('category', validated.category)
    }

    if (validated.difficulty) {
      query = query.eq('difficulty', validated.difficulty)
    }

    const { data: questions, error: questionsError } = (await query) as {
      data: QuizQuestion[] | null
      error: Error | null
    }

    if (questionsError) {
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'No questions available' }, { status: 404 })
    }

    // Shuffle questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5)

    // Create quiz session
    // Type assertion required due to Supabase PostgREST insert type inference issue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session, error: sessionError } = await (supabase.from('quiz_sessions') as any)
      .insert({
        user_id: validated.user_id || null,
        total_questions: shuffled.length,
        current_question_index: 0,
        score: 0,
        streak: 0,
        time_limit_per_question: 15,
      })
      .select()
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Store session questions with order
    const sessionQuestions = shuffled.map((q, index) => ({
      session_id: session.id,
      question_id: q.id,
      question_order: index,
    }))

    // Type assertion required due to Supabase PostgREST insert type inference issue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: sqError } = await (supabase.from('quiz_session_questions') as any).insert(
      sessionQuestions
    )

    if (sqError) {
      console.error('Failed to store session questions:', sqError)
      // Clean up session
      await supabase.from('quiz_sessions').delete().eq('id', session.id)
      return NextResponse.json({ error: 'Failed to create quiz session' }, { status: 500 })
    }

    // Return first question without revealing answer
    const firstQuestion = shuffled[0]!
    const response: StartQuizResponse = {
      session: {
        id: session.id,
        user_id: session.user_id,
        total_questions: session.total_questions,
        current_question_index: session.current_question_index,
        score: session.score,
        streak: session.streak,
        started_at: session.started_at,
        completed_at: session.completed_at,
        time_limit_per_question: session.time_limit_per_question,
      },
      question: {
        id: firstQuestion.id,
        // Type assertion needed for DB string enums -> API enums
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category: firstQuestion.category as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        difficulty: firstQuestion.difficulty as any,
        question: firstQuestion.question,
        options: firstQuestion.options as string[],
        correct_answer: -1, // Don't reveal answer yet
        fun_fact: '',
        created_at: firstQuestion.created_at,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 })
    }

    console.error('Quiz start error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
