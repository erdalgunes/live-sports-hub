/**
 * Supabase-based caching for team fixtures data
 * Implements adaptive TTL strategy with stale-while-revalidate for cost optimization
 *
 * TTL Strategy:
 * - Live matches: 60 seconds
 * - Pre-match (<2h): 5 minutes
 * - Pre-match (>2h): 1 hour
 * - Finished matches: 24 hours
 * - Default: 1 hour
 */

import { createClient as createServerClient } from './server'
import { getFixturesByTeam } from '@/lib/api/api-football'

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
  ttl_seconds?: number
  last_updated?: string
}

// Adaptive TTL configuration based on match status and timing
const TTL_CONFIG = {
  LIVE: 60000, // 1 minute for live matches (1H, 2H, HT, ET, P, LIVE)
  PRE_MATCH_SOON: 300000, // 5 minutes for matches starting within 2 hours
  PRE_MATCH: 3600000, // 1 hour for upcoming matches
  FINISHED: 86400000, // 24 hours for finished matches (FT, AET, PEN)
  POSTPONED: 21600000, // 6 hours for postponed/cancelled (PST, CANC, ABD, SUSP)
  DEFAULT: 3600000, // 1 hour default
}

const STALE_DURATION_MS = 7200000 // 2 hours (serve stale while revalidating)

/**
 * Calculate adaptive TTL based on fixture status and timing
 */
function calculateAdaptiveTTL(fixtures: CachedFixture[]): number {
  if (!fixtures.length) return TTL_CONFIG.DEFAULT

  // Check if any fixture is live
  const hasLiveFixture = fixtures.some((f) =>
    ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(f.status)
  )
  if (hasLiveFixture) return TTL_CONFIG.LIVE

  // Check if all fixtures are finished
  const allFinished = fixtures.every((f) =>
    ['FT', 'AET', 'PEN'].includes(f.status)
  )
  if (allFinished) return TTL_CONFIG.FINISHED

  // Check if any fixture is postponed/cancelled
  const hasPostponed = fixtures.some((f) =>
    ['PST', 'CANC', 'ABD', 'SUSP'].includes(f.status)
  )
  if (hasPostponed) return TTL_CONFIG.POSTPONED

  // Check if any upcoming fixture is within 2 hours
  const now = Date.now()
  const hasUpcomingSoon = fixtures.some((f) => {
    const matchTime = new Date(f.date).getTime()
    const timeUntilMatch = matchTime - now
    return timeUntilMatch > 0 && timeUntilMatch <= 2 * 60 * 60 * 1000
  })
  if (hasUpcomingSoon) return TTL_CONFIG.PRE_MATCH_SOON

  return TTL_CONFIG.DEFAULT
}

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
    .maybeSingle()

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
    .eq('season', season)

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
    .maybeSingle()

  if (error || !data) return true // No cache = stale

  const expiresAt = new Date(data.expires_at).getTime()
  return Date.now() > expiresAt
}

/**
 * Save team fixtures to cache with adaptive TTL
 */
export async function setTeamFixturesToCache(
  teamId: number,
  leagueId: number,
  season: number,
  fixtures: CachedFixture[]
): Promise<void> {
  const supabase = await createServerClient()

  const now = new Date()
  const ttlMs = calculateAdaptiveTTL(fixtures)
  const expiresAt = new Date(now.getTime() + ttlMs)

  await supabase
    .from('team_fixtures_cache')
    .upsert({
      team_id: teamId,
      league_id: leagueId,
      season: season,
      fixtures: fixtures as any,
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      ttl_seconds: Math.floor(ttlMs / 1000),
      last_updated: now.toISOString(),
    }, {
      onConflict: 'team_id,league_id,season'
    })
}

/**
 * Get cache statistics for monitoring
 */
export async function getCacheStats(): Promise<{
  totalFixtures: number
  liveFixtures: number
  expiredFixtures: number
  cacheSizeMb: number
  avgTtlSeconds: number
} | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.rpc('get_cache_stats')

  if (error) {
    console.error('[Cache Stats] Error fetching stats:', error)
    return null
  }

  return {
    totalFixtures: data.total_fixtures,
    liveFixtures: data.live_fixtures,
    expiredFixtures: data.expired_fixtures,
    cacheSizeMb: data.cache_size_mb,
    avgTtlSeconds: data.avg_ttl_seconds,
  }
}

/**
 * Manually trigger cache cleanup
 */
export async function triggerCacheCleanup(): Promise<{
  deletedFixtures: number
  deletedTeamFixtures: number
  executionTimeMs: number
} | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.rpc('trigger_manual_cleanup')

  if (error) {
    console.error('[Cache Cleanup] Error triggering cleanup:', error)
    return null
  }

  return {
    deletedFixtures: data.deleted_fixtures,
    deletedTeamFixtures: data.deleted_team_fixtures,
    executionTimeMs: data.execution_time_ms,
  }
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
  const lastFive = relevantFixtures
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

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
  return form.reverse().join('')
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
  let delay = 2000 // Start with 2 seconds between requests
  let consecutiveRateLimitErrors = 0

  for (let i = 0; i < teamIds.length; i++) {
    const teamId = teamIds[i]

    try {
      // Add delay between requests to avoid rate limiting
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      // Check if this team already has fresh cache
      const existingCache = await getTeamFixturesFromCache(teamId, leagueId, season)
      if (existingCache && existingCache.length > 0) {
        console.log(`[Cache Refresh] Team ${teamId} already cached, skipping`)
        skipped++
        continue
      }

      console.log(`[Cache Refresh] Fetching fixtures for team ${teamId} (${i + 1}/${teamIds.length})`)

      // Fetch last 10 fixtures for the team
      const response = await getFixturesByTeam(teamId, season, leagueId, 10)
      const fixtures = response.response || []

      // Transform to CachedFixture format
      const cachedFixtures: CachedFixture[] = fixtures.map((f: any) => ({
        fixtureId: f.fixture.id,
        date: f.fixture.date,
        homeTeamId: f.teams.home.id,
        awayTeamId: f.teams.away.id,
        homeGoals: f.goals.home ?? 0,
        awayGoals: f.goals.away ?? 0,
        status: f.fixture.status.short,
      }))

      // Save to cache
      await setTeamFixturesToCache(teamId, leagueId, season, cachedFixtures)
      success++
      consecutiveRateLimitErrors = 0 // Reset on success

      // Gradually reduce delay on successful requests (but never below 2s)
      delay = Math.max(2000, delay - 200)
    } catch (error) {
      const isRateLimit = error instanceof Error && error.message.includes('rateLimit')

      if (isRateLimit) {
        consecutiveRateLimitErrors++
        console.error(`[Cache Refresh] Rate limit hit for team ${teamId}, attempt ${consecutiveRateLimitErrors}`)

        // Exponentially increase delay on rate limits
        delay = Math.min(10000, delay * 1.5)

        // If we hit 3 consecutive rate limits, stop and let the cache refresh later
        if (consecutiveRateLimitErrors >= 3) {
          console.error('[Cache Refresh] Too many rate limits, stopping refresh')
          failed++
          break
        }

        failed++
      } else {
        console.error(`[Cache Refresh] Failed to refresh cache for team ${teamId}:`, error)
        failed++
      }
    }
  }

  return { success, failed, skipped }
}
