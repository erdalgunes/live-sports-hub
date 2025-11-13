import { NextRequest, NextResponse } from 'next/server'
import { getStandings } from '@/lib/api/api-football'
import { refreshTeamFixturesCache } from '@/lib/supabase/standings-cache'
import type { Standing } from '@/types/api-football'
import { logger } from '@/lib/utils/logger'

/**
 * API route to refresh standings cache in the background
 * Can be called manually or via cron job
 *
 * Usage:
 * POST /api/cache/refresh-standings
 * Body: { leagueId: 39, season: 2025 }
 * Header: Authorization: Bearer <secret>
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication
    const authHeader = request.headers.get('authorization')
    const secret = process.env.CRON_SECRET || process.env.NEXT_PUBLIC_API_SECRET

    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get league and season from request body
    const body = await request.json()
    const leagueId = body.leagueId || 39 // Default to Premier League
    const season = body.season || new Date().getFullYear()

    logger.info('Cache refresh starting', {
      leagueId,
      season,
      context: 'cache-refresh-api',
    })

    // Fetch standings to get list of teams
    const standingsData = await getStandings(leagueId, season)
    const standings = standingsData.response[0]?.league?.standings?.[0] || []

    if (standings.length === 0) {
      return NextResponse.json({ error: 'No standings found' }, { status: 404 })
    }

    // Extract team IDs
    const teamIds = standings.map((team: Standing) => team.team.id)

    logger.info('Found teams to refresh', {
      teamCount: teamIds.length,
      context: 'cache-refresh-api',
    })

    // Refresh cache for all teams with rate limiting
    const result = await refreshTeamFixturesCache(teamIds, leagueId, season)

    logger.info('Cache refresh completed', {
      success: result.success,
      failed: result.failed,
      skipped: result.skipped,
      context: 'cache-refresh-api',
    })

    return NextResponse.json({
      message: 'Cache refresh completed',
      leagueId,
      season,
      teamsProcessed: teamIds.length,
      success: result.success,
      failed: result.failed,
      skipped: result.skipped,
    })
  } catch (error) {
    logger.error('Cache refresh failed', {
      error,
      context: 'cache-refresh-api',
    })
    return NextResponse.json(
      {
        error: 'Failed to refresh cache',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for manual triggering or health check
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const leagueId = parseInt(searchParams.get('leagueId') || '39')
  const season = parseInt(searchParams.get('season') || String(new Date().getFullYear()))

  // Forward to POST handler
  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ leagueId, season }),
    })
  )
}
