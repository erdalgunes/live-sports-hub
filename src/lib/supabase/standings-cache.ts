/**
 * Supabase-based caching for team fixtures data
 * Implements stale-while-revalidate strategy for standings form indicators
 *
 * Note: This is a second-layer cache for *processed* fixture data.
 * The underlying API-Football requests use the generic cache with adaptive TTL.
 */

import { createClient as createServerClient } from './server'
import { getFixturesByTeam } from '@/lib/api-football/services'

export interface CachedFixture {
  fixtureId: number
  date: string
  homeTeamId: number
  awayTeamId: number
  homeGoals: number
  awayGoals: number
  status: string
}

export interface TeamFixturesCache {
  team_id: number
  league_id: number
  season: number
  fixtures: CachedFixture[]
  cached_at: string
  expires_at: string
}

const CACHE_DURATION_MS = 3600000 // 1 hour
const STALE_DURATION_MS = 7200000 // 2 hours (serve stale while revalidating)

/**
 * Get cached fixtures for a team from Supabase
 */
export async function getTeamFixturesFromCache(
  teamId: number,
  leagueId: number,
  season: number
): Promise<CachedFixture[] | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('team_fixtures_cache')
    .select('fixtures, expires_at')
    .eq('team_id', teamId)
    .eq('league_id', leagueId)
    .eq('season', season)
    .single() as { data: { fixtures: unknown; expires_at: string } | null; error: any }

  if (error || !data) return null

  // Check if cache is completely expired (beyond stale threshold)
  const expiresAt = new Date(data.expires_at).getTime()
  const now = Date.now()

  if (now > expiresAt + STALE_DURATION_MS) {
    return null // Too old, don't serve
  }

  return data.fixtures as CachedFixture[]
}

/**
 * Get all cached fixtures for standings (all teams in a league/season)
 */
export async function getAllTeamFixturesFromCache(
  leagueId: number,
  season: number
): Promise<Map<number, CachedFixture[]>> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('team_fixtures_cache')
    .select('team_id, fixtures, expires_at')
    .eq('league_id', leagueId)
    .eq('season', season) as {
      data: Array<{ team_id: number; fixtures: unknown; expires_at: string }> | null
      error: any
    }

  if (error || !data) return new Map()

  const cacheMap = new Map<number, CachedFixture[]>()
  const now = Date.now()

  for (const row of data) {
    const expiresAt = new Date(row.expires_at).getTime()

    // Only include if not completely expired
    if (now <= expiresAt + STALE_DURATION_MS) {
      cacheMap.set(row.team_id, row.fixtures as CachedFixture[])
    }
  }

  return cacheMap
}

/**
 * Check if cache is stale (needs background refresh)
 */
export async function isCacheStale(
  leagueId: number,
  season: number
): Promise<boolean> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('team_fixtures_cache')
    .select('expires_at')
    .eq('league_id', leagueId)
    .eq('season', season)
    .limit(1)
    .single() as { data: { expires_at: string } | null; error: any }

  if (error || !data) return true // No cache = stale

  const expiresAt = new Date(data.expires_at).getTime()
  return Date.now() > expiresAt
}

/**
 * Save team fixtures to cache
 */
export async function setTeamFixturesToCache(
  teamId: number,
  leagueId: number,
  season: number,
  fixtures: CachedFixture[]
): Promise<void> {
  const supabase = await createServerClient()

  const now = new Date()
  const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS)

  // Type assertion to work around Supabase type inference issues
  await (supabase.from('team_fixtures_cache') as any).upsert(
    {
      team_id: teamId,
      league_id: leagueId,
      season: season,
      fixtures: fixtures as any,
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    },
    {
      onConflict: 'team_id,league_id,season',
    }
  )
}

/**
 * Calculate form string from fixtures for a specific team
 */
export function calculateFormFromFixtures(
  fixtures: CachedFixture[],
  teamId: number,
  venue: 'home' | 'away' | 'all'
): string {
  // Filter by venue and completed matches
  const relevantFixtures = fixtures.filter((f) => {
    if (f.status !== 'FT') return false

    if (venue === 'home') return f.homeTeamId === teamId
    if (venue === 'away') return f.awayTeamId === teamId
    return true // 'all' venue
  })

  // Sort by date (newest first) and take last 5
  const sortedFixtures = relevantFixtures.toSorted((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const lastFive = sortedFixtures.slice(0, 5)

  // Calculate W/D/L for each match
  const form = lastFive.map((fixture) => {
    const isHome = fixture.homeTeamId === teamId
    const teamGoals = isHome ? fixture.homeGoals : fixture.awayGoals
    const opponentGoals = isHome ? fixture.awayGoals : fixture.homeGoals

    if (teamGoals > opponentGoals) return 'W'
    if (teamGoals < opponentGoals) return 'L'
    return 'D'
  })

  // Reverse to show oldest->newest (left to right)
  return form.toReversed().join('')
}

/**
 * Check if team cache should be skipped
 */
async function shouldSkipCachedTeam(
  teamId: number,
  leagueId: number,
  season: number
): Promise<boolean> {
  const existingCache = await getTeamFixturesFromCache(teamId, leagueId, season)
  if (existingCache && existingCache.length > 0) {
    console.log(`[Cache Refresh] Team ${teamId} already cached, skipping`)
    return true
  }
  return false
}

/**
 * Fetch and cache fixtures for a single team
 */
async function fetchAndCacheTeamFixtures(
  teamId: number,
  leagueId: number,
  season: number,
  index: number,
  total: number
): Promise<void> {
  console.log(`[Cache Refresh] Fetching fixtures for team ${teamId} (${index + 1}/${total})`)

  const fixtures = await getFixturesByTeam(teamId, season, leagueId, 10)

  const cachedFixtures: CachedFixture[] = fixtures.map((f: any) => ({
    fixtureId: f.fixture.id,
    date: f.fixture.date,
    homeTeamId: f.teams.home.id,
    awayTeamId: f.teams.away.id,
    homeGoals: f.goals.home ?? 0,
    awayGoals: f.goals.away ?? 0,
    status: f.fixture.status.short,
  }))

  await setTeamFixturesToCache(teamId, leagueId, season, cachedFixtures)
}

/**
 * Handle rate limit error and update state
 */
function handleRateLimitError(
  teamId: number,
  consecutiveErrors: number
): { shouldStop: boolean; newDelay: number } {
  console.error(`[Cache Refresh] Rate limit hit for team ${teamId}, attempt ${consecutiveErrors}`)

  const newDelay = Math.min(10000, 2000 * Math.pow(1.5, consecutiveErrors - 1))
  const shouldStop = consecutiveErrors >= 3

  if (shouldStop) {
    console.error('[Cache Refresh] Too many rate limits, stopping refresh')
  }

  return { shouldStop, newDelay }
}

/**
 * Refresh cache for all teams in a league/season
 * This should be called from a background job or API route
 * Uses adaptive delay: increases delay on rate limit errors
 */
export async function refreshTeamFixturesCache(
  teamIds: number[],
  leagueId: number,
  season: number
): Promise<{ success: number; failed: number; skipped: number }> {
  let success = 0
  let failed = 0
  let skipped = 0
  let delay = 2000
  let consecutiveRateLimitErrors = 0

  for (let i = 0; i < teamIds.length; i++) {
    const teamId = teamIds[i]

    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    const shouldSkip = await shouldSkipCachedTeam(teamId, leagueId, season)
    if (shouldSkip) {
      skipped++
      continue
    }

    try {
      await fetchAndCacheTeamFixtures(teamId, leagueId, season, i, teamIds.length)
      success++
      consecutiveRateLimitErrors = 0
      delay = Math.max(2000, delay - 200)
    } catch (error) {
      const isRateLimit = error instanceof Error && error.message.includes('rateLimit')

      if (isRateLimit) {
        consecutiveRateLimitErrors++
        const { shouldStop, newDelay } = handleRateLimitError(teamId, consecutiveRateLimitErrors)
        delay = newDelay
        failed++

        if (shouldStop) break
      } else {
        console.error(`[Cache Refresh] Failed to refresh cache for team ${teamId}:`, error)
        failed++
      }
    }
  }

  return { success, failed, skipped }
}
