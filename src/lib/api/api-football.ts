import { cache } from 'react'
import { APIResponse, Fixture } from '@/types/api-football'

const BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io'
const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY

export class APIFootballError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'APIFootballError'
  }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
  if (!API_KEY) {
    throw new APIFootballError('API key not configured', 500)
  }

  const url = `${BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new APIFootballError(
        `API request failed: ${response.statusText}`,
        response.status
      )
    }

    const data: APIResponse<T> = await response.json()

    // Check API response structure for errors
    if (data.errors && Object.keys(data.errors).length > 0) {
      throw new APIFootballError(
        `API Error: ${JSON.stringify(data.errors)}`,
        400,
        data.errors
      )
    }

    return data
  } catch (error) {
    if (error instanceof APIFootballError) throw error
    throw new APIFootballError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }
}

// Cache for 60 seconds (React cache for deduplication within a request)
export const getLiveFixtures = cache(async (leagueId?: number): Promise<APIResponse<Fixture[]>> => {
  const endpoint = leagueId
    ? `/fixtures?live=all&league=${leagueId}`
    : '/fixtures?live=all'

  return fetchAPI<Fixture[]>(endpoint, {
    next: { revalidate: 60 }, // ISR: 60 seconds
  })
})

export const getFixturesByDate = cache(async (date: string, leagueId?: number, season?: number): Promise<APIResponse<Fixture[]>> => {
  let endpoint = `/fixtures?date=${date}`

  if (leagueId) {
    endpoint += `&league=${leagueId}`
    if (season) {
      endpoint += `&season=${season}`
    }
  }

  return fetchAPI<Fixture[]>(endpoint, {
    next: { revalidate: 3600 }, // ISR: 1 hour for scheduled matches
  })
})

export const getFixturesByRound = cache(async (leagueId: number, season: number, round: string): Promise<APIResponse<Fixture[]>> => {
  const endpoint = `/fixtures?league=${leagueId}&season=${season}&round=${encodeURIComponent(round)}`

  return fetchAPI<Fixture[]>(endpoint, {
    next: { revalidate: 3600 }, // ISR: 1 hour for scheduled matches
  })
})

export const getFixtureById = cache(async (fixtureId: number): Promise<APIResponse<Fixture[]>> => {
  return fetchAPI<Fixture[]>(`/fixtures?id=${fixtureId}`, {
    next: { revalidate: 60 },
  })
})

export const getLeagues = cache(async (): Promise<APIResponse<any[]>> => {
  return fetchAPI('/leagues', {
    next: { revalidate: 86400 }, // ISR: 24 hours
  })
})

export const getStandings = cache(async (leagueId: number, season: number): Promise<APIResponse<any[]>> => {
  return fetchAPI(`/standings?league=${leagueId}&season=${season}`, {
    next: { revalidate: 3600 }, // ISR: 1 hour
  })
})

export const getFixtureStatistics = cache(async (fixtureId: number): Promise<APIResponse<any[]>> => {
  return fetchAPI(`/fixtures/statistics?fixture=${fixtureId}`, {
    next: { revalidate: 60 },
  })
})

export const getFixturesByTeam = cache(async (
  teamId: number,
  season: number,
  leagueId: number,
  last: number = 10
): Promise<APIResponse<any[]>> => {
  return fetchAPI(`/fixtures?team=${teamId}&season=${season}&league=${leagueId}&last=${last}`, {
    next: { revalidate: 3600 }, // ISR: 1 hour
  })
})
