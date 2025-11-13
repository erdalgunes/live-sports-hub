// API-Football endpoint constants
export const ENDPOINTS = {
  FIXTURES: {
    LIVE: '/fixtures?live=all',
    BY_DATE: (date: string) => `/fixtures?date=${date}`,
    BY_ID: (id: number) => `/fixtures?id=${id}`,
    BY_LEAGUE: (leagueId: number, date?: string) =>
      date ? `/fixtures?league=${leagueId}&date=${date}` : `/fixtures?league=${leagueId}`,
    BY_LEAGUE_LIVE: (leagueId: number) => `/fixtures?live=all&league=${leagueId}`,
  },
  LEAGUES: '/leagues',
  STANDINGS: (leagueId: number, season: number) => `/standings?league=${leagueId}&season=${season}`,
  STATISTICS: (fixtureId: number) => `/fixtures/statistics?fixture=${fixtureId}`,
} as const
