// Popular leagues configuration
export const POPULAR_LEAGUES = [
  { id: 39, name: 'Premier League', country: 'England' },
  { id: 140, name: 'La Liga', country: 'Spain' },
  { id: 78, name: 'Bundesliga', country: 'Germany' },
  { id: 135, name: 'Serie A', country: 'Italy' },
  { id: 61, name: 'Ligue 1', country: 'France' },
  { id: 2, name: 'UEFA Champions League', country: 'World' },
] as const

// Cache times in seconds
export const CACHE_TIMES = {
  LIVE_MATCH: 60, // 60 seconds
  SCHEDULED_MATCH: 3600, // 1 hour
  FINISHED_MATCH: 86400, // 24 hours
  LEAGUE_DATA: 21600, // 6 hours
  STANDINGS: 3600, // 1 hour
} as const

// Polling intervals in milliseconds (for React Query)
export const POLLING_INTERVALS = {
  LIVE_MATCH: 60000, // 60 seconds
  SCHEDULED_MATCH: 300000, // 5 minutes
  FINISHED_MATCH: false, // No polling for finished matches
} as const

// App configuration
export const APP_CONFIG = {
  NAME: 'Live Sports Hub',
  DESCRIPTION: 'Real-time soccer scores and schedules',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const

// Date formats
export const DATE_FORMATS = {
  API: 'yyyy-MM-dd', // Format for API-Football
  DISPLAY: 'MMM dd, yyyy', // Display format
  DISPLAY_WITH_TIME: 'MMM dd, yyyy • HH:mm',
  TIME_ONLY: 'HH:mm',
} as const
