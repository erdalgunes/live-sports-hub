/**
 * API-Football Integration
 *
 * Exports all API-Football services and utilities
 */

// Client
export {
  fetchWithCache,
  clearCache,
  getCacheStats,
  CACHE_TTL,
  API_ENDPOINTS,
} from './client';

// Services
export {
  // Fixtures
  getFixtureById,
  getLiveFixtures,
  getFixturesByDate,
  getFixturesByLeague,
  getFixtureStatistics,
  getFixtureEvents,
  getFixtureLineups,
  getH2HFixtures,

  // Leagues
  getLeagues,
  getStandings,

  // Teams
  getTeamById,
  getTeamStatistics,

  // Players
  getPlayerById,
  searchPlayers,

  // Types
  type ApiFootballFixture,
  type ApiFootballStatistic,
  type ApiFootballEvent,
  type ApiFootballLineup,
  type ApiFootballStanding,
  type ApiFootballTeam,
  type ApiFootballPlayer,
} from './services';
