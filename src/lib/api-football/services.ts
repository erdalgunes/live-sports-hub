/**
 * API-Football Service Layer
 *
 * Type-safe wrappers for API-Football endpoints
 * All responses are cached via Supabase
 */

import {
  fetchWithCache,
  API_ENDPOINTS,
  CACHE_TTL,
  type ApiFootballResponse,
} from './client';

// ============================================================================
// Type Definitions (API-Football response types)
// ============================================================================

export interface ApiFootballFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

export interface ApiFootballStatistic {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  statistics: Array<{
    type: string;
    value: number | string | null;
  }>;
}

export interface ApiFootballEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

export interface ApiFootballLineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors: {
      player: { primary: string; number: string; border: string };
      goalkeeper: { primary: string; number: string; border: string };
    };
  };
  formation: string;
  startXI: Array<{
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid: string | null;
    };
  }>;
  substitutes: Array<{
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid: string | null;
    };
  }>;
  coach: {
    id: number;
    name: string;
    photo: string;
  };
}

export interface ApiFootballStanding {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: Array<
      Array<{
        rank: number;
        team: {
          id: number;
          name: string;
          logo: string;
        };
        points: number;
        goalsDiff: number;
        group: string;
        form: string;
        status: string;
        description: string | null;
        all: {
          played: number;
          win: number;
          draw: number;
          lose: number;
          goals: { for: number; against: number };
        };
        home: {
          played: number;
          win: number;
          draw: number;
          lose: number;
          goals: { for: number; against: number };
        };
        away: {
          played: number;
          win: number;
          draw: number;
          lose: number;
          goals: { for: number; against: number };
        };
        update: string;
      }>
    >;
  };
}

export interface ApiFootballTeam {
  team: {
    id: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

export interface ApiFootballPlayer {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: {
      date: string;
      place: string;
      country: string;
    };
    nationality: string;
    height: string;
    weight: string;
    injured: boolean;
    photo: string;
  };
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
    };
    games: {
      appearences: number;
      lineups: number;
      minutes: number;
      number: number | null;
      position: string;
      rating: string;
      captain: boolean;
    };
    substitutes: {
      in: number;
      out: number;
      bench: number;
    };
    shots: {
      total: number | null;
      on: number | null;
    };
    goals: {
      total: number | null;
      conceded: number | null;
      assists: number | null;
      saves: number | null;
    };
    passes: {
      total: number | null;
      key: number | null;
      accuracy: number | null;
    };
    tackles: {
      total: number | null;
      blocks: number | null;
      interceptions: number | null;
    };
    duels: {
      total: number | null;
      won: number | null;
    };
    dribbles: {
      attempts: number | null;
      success: number | null;
      past: number | null;
    };
    fouls: {
      drawn: number | null;
      committed: number | null;
    };
    cards: {
      yellow: number;
      yellowred: number;
      red: number;
    };
    penalty: {
      won: number | null;
      commited: number | null;
      scored: number | null;
      missed: number | null;
      saved: number | null;
    };
  }>;
}

// ============================================================================
// Fixture Services
// ============================================================================

/**
 * Get fixture by ID with adaptive TTL caching
 * - Live: 60s
 * - Finished: 24h
 * - Upcoming: 1h-5m based on time
 */
export async function getFixtureById(fixtureId: number) {
  const data = await fetchWithCache<ApiFootballFixture[]>(
    API_ENDPOINTS.FIXTURES_BY_ID,
    { id: fixtureId }
    // No TTL = adaptive caching
  );
  return data[0] || null;
}

/**
 * Get all live fixtures (no cache)
 */
export async function getLiveFixtures() {
  return fetchWithCache<ApiFootballFixture[]>(
    API_ENDPOINTS.FIXTURES_LIVE,
    {},
    CACHE_TTL.LIVE
  );
}

/**
 * Get fixtures by date with adaptive TTL
 */
export async function getFixturesByDate(date: string) {
  return fetchWithCache<ApiFootballFixture[]>(
    API_ENDPOINTS.FIXTURES_BY_DATE,
    { date }
    // Adaptive: will be 60s for live, 24h for finished, etc.
  );
}

/**
 * Get fixtures by league with adaptive TTL
 */
export async function getFixturesByLeague(leagueId: number, season: number) {
  return fetchWithCache<ApiFootballFixture[]>(
    API_ENDPOINTS.FIXTURES_BY_LEAGUE,
    { league: leagueId, season }
    // Adaptive caching
  );
}

/**
 * Get fixture statistics with adaptive TTL
 */
export async function getFixtureStatistics(fixtureId: number) {
  return fetchWithCache<ApiFootballStatistic[]>(
    API_ENDPOINTS.FIXTURES_STATISTICS,
    { fixture: fixtureId }
    // Adaptive caching
  );
}

/**
 * Get fixture events (goals, cards) with adaptive TTL
 */
export async function getFixtureEvents(fixtureId: number) {
  return fetchWithCache<ApiFootballEvent[]>(
    API_ENDPOINTS.FIXTURES_EVENTS,
    { fixture: fixtureId }
    // Adaptive caching
  );
}

/**
 * Get fixture lineups with adaptive TTL
 */
export async function getFixtureLineups(fixtureId: number) {
  return fetchWithCache<ApiFootballLineup[]>(
    API_ENDPOINTS.FIXTURES_LINEUPS,
    { fixture: fixtureId }
    // Adaptive caching
  );
}

/**
 * Get head-to-head fixtures (historical data - long cache)
 */
export async function getH2HFixtures(team1Id: number, team2Id: number) {
  return fetchWithCache<ApiFootballFixture[]>(
    API_ENDPOINTS.FIXTURES_H2H,
    { h2h: `${team1Id}-${team2Id}` },
    CACHE_TTL.LONG // H2H is historical, use explicit long cache
  );
}

/**
 * Get fixtures by team with adaptive TTL
 */
export async function getFixturesByTeam(
  teamId: number,
  season: number,
  leagueId: number,
  last: number = 10
) {
  return fetchWithCache<ApiFootballFixture[]>(
    API_ENDPOINTS.FIXTURES_BY_LEAGUE, // Using same endpoint with team filter
    { team: teamId, season, league: leagueId, last }
    // Adaptive caching
  );
}

// ============================================================================
// League/Tournament Services
// ============================================================================

export async function getLeagues(country?: string, season?: number) {
  const params: Record<string, unknown> = {};
  if (country) params.country = country;
  if (season) params.season = season;

  return fetchWithCache<ApiFootballStanding[]>(
    API_ENDPOINTS.LEAGUES,
    params,
    CACHE_TTL.STATIC
  );
}

export async function getStandings(leagueId: number, season: number) {
  return fetchWithCache<ApiFootballStanding[]>(
    API_ENDPOINTS.STANDINGS,
    { league: leagueId, season },
    CACHE_TTL.LONG
  );
}

// ============================================================================
// Team Services
// ============================================================================

export async function getTeamById(teamId: number) {
  const data = await fetchWithCache<ApiFootballTeam[]>(
    API_ENDPOINTS.TEAMS,
    { id: teamId },
    CACHE_TTL.STATIC
  );
  return data[0] || null;
}

export async function getTeamStatistics(
  teamId: number,
  leagueId: number,
  season: number
) {
  return fetchWithCache<ApiFootballStatistic[]>(
    API_ENDPOINTS.TEAM_STATISTICS,
    { team: teamId, league: leagueId, season },
    CACHE_TTL.LONG
  );
}

// ============================================================================
// Player Services
// ============================================================================

export async function getPlayerById(playerId: number, season?: number) {
  const params: Record<string, unknown> = { id: playerId };
  if (season) params.season = season;

  const data = await fetchWithCache<ApiFootballPlayer[]>(
    API_ENDPOINTS.PLAYERS,
    params,
    CACHE_TTL.LONG
  );
  return data[0] || null;
}

export async function searchPlayers(name: string, season?: number) {
  const params: Record<string, unknown> = { search: name };
  if (season) params.season = season;

  return fetchWithCache<ApiFootballPlayer[]>(
    API_ENDPOINTS.PLAYERS,
    params,
    CACHE_TTL.LONG
  );
}
