import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { GetLeaderboardResponse } from '@/types/quiz'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const userId = searchParams.get('user_id')

    const supabase = await createClient()

    // Get top entries
    type LeaderboardRow = Database['public']['Tables']['quiz_leaderboard']['Row']
    const { data: entries, error } = (await supabase
      .from('quiz_leaderboard')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(limit)) as { data: LeaderboardRow[] | null; error: Error | null }

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    // Add rank to entries
    const rankedEntries = (entries || []).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

    // Find user rank if user_id provided
    let userRank = null
    if (userId) {
      const { data: userEntry } = (await supabase
        .from('quiz_leaderboard')
        .select('total_score')
        .eq('user_id', userId)
        .maybeSingle()) as { data: { total_score: number } | null; error: Error | null }

      if (userEntry) {
        const { count } = (await supabase
          .from('quiz_leaderboard')
          .select('*', { count: 'exact', head: true })
          .gt('total_score', userEntry.total_score)) as {
          count: number | null
          error: Error | null
        }

        userRank = (count || 0) + 1
      }
    }

    const response: GetLeaderboardResponse = {
      entries: rankedEntries,
      user_rank: userRank,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
