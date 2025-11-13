/**
 * Cache utilities for standings fixture data
 * Uses localStorage to cache team fixtures and reduce API calls
 */

export interface CachedFixture {
  fixtureId: number
  date: string
  homeTeamId: number
  awayTeamId: number
  homeGoals: number
  awayGoals: number
  status: string
}

export interface CachedTeamData {
  teamId: number
  fixtures: CachedFixture[]
  timestamp: number
}

export interface StandingsCacheData {
  leagueId: number
  season: number
  teams: CachedTeamData[]
  timestamp: number
}

const CACHE_KEY_PREFIX = 'standings_cache_'
const CACHE_DURATION = 3600000 // 1 hour in milliseconds

/**
 * Generate cache key for league/season combination
 */
export function getCacheKey(leagueId: number, season: number): string {
  return `${CACHE_KEY_PREFIX}${leagueId}_${season}`
}

/**
 * Check if cached data is still valid
 */
export function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

/**
 * Get cached standings data from localStorage
 */
export function getCachedStandingsData(
  leagueId: number,
  season: number
): StandingsCacheData | null {
  if (typeof window === 'undefined') return null

  try {
    const cacheKey = getCacheKey(leagueId, season)
    const cached = localStorage.getItem(cacheKey)

    if (!cached) return null

    const data: StandingsCacheData = JSON.parse(cached)

    if (!isCacheValid(data.timestamp)) {
      localStorage.removeItem(cacheKey)
      return null
    }

    return data
  } catch (error) {
    console.error('Error reading standings cache:', error)
    return null
  }
}

/**
 * Save standings data to localStorage cache
 */
export function setCachedStandingsData(data: StandingsCacheData): void {
  if (typeof window === 'undefined') return

  try {
    const cacheKey = getCacheKey(data.leagueId, data.season)
    localStorage.setItem(cacheKey, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving standings cache:', error)
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

  // Reverse to show oldest->newest
  return form.reverse().join('')
}

/**
 * Get form data for a team from cache
 */
export function getTeamFormFromCache(
  cache: StandingsCacheData,
  teamId: number
): { homeForm: string; awayForm: string; allForm: string } {
  const teamData = cache.teams.find((t) => t.teamId === teamId)

  if (!teamData || !teamData.fixtures.length) {
    return { homeForm: '', awayForm: '', allForm: '' }
  }

  return {
    homeForm: calculateFormFromFixtures(teamData.fixtures, teamId, 'home'),
    awayForm: calculateFormFromFixtures(teamData.fixtures, teamId, 'away'),
    allForm: calculateFormFromFixtures(teamData.fixtures, teamId, 'all'),
  }
}
