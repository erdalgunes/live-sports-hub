import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { GetCategoriesResponse } from '@/types/quiz'

const CATEGORY_INFO = {
  players_legends: {
    name: 'Players & Legends',
    description: 'Test your knowledge about football legends and iconic players',
  },
  teams_clubs: {
    name: 'Teams & Clubs',
    description: 'Questions about football clubs and their history',
  },
  competitions: {
    name: 'Competitions',
    description: 'World Cup, Champions League, and major tournaments',
  },
  historical_moments: {
    name: 'Historical Moments',
    description: 'Memorable matches and defining moments in football',
  },
  records_stats: {
    name: 'Records & Stats',
    description: 'Football records, statistics, and trivia',
  },
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get question count per category
    const { data: categoryCounts, error } = (await supabase
      .from('quiz_questions')
      .select('category')
      .eq('is_active', true)) as { data: Array<{ category: string }> | null; error: Error | null }

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    // Count questions per category
    const counts = (categoryCounts || []).reduce(
      (acc, row) => {
        acc[row.category] = (acc[row.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const response: GetCategoriesResponse = {
      categories: Object.entries(CATEGORY_INFO).map(([id, info]) => ({
        // Type assertion needed for string keys -> QuizCategory enum
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: id as any,
        name: info.name,
        description: info.description,
        question_count: counts[id] || 0,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Categories error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
