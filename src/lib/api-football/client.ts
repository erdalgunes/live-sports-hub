/**
 * API-Football Client
 *
 * Handles all requests to API-Football with intelligent caching via Supabase
 *
 * Features:
 * - Automatic caching in Supabase
 * - TTL-based cache invalidation
 * - Rate limiting and retry logic
 * - Type-safe responses
 * - Error handling
 *
 * Cache Strategy:
 * - Live matches: No cache (real-time)
 * - Finished matches: Long cache (24h+)
 * - Scheduled matches: Medium cache (1h)
 * - Standings: Medium cache (6h)
 * - Static data: Long cache (7 days)
 */

import { createClient } from '@/lib/supabase/server';
import { deduplicator } from './deduplicator';

// API-Football configuration
const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

if (!API_FOOTBALL_KEY) {
  console.warn('API_FOOTBALL_KEY not set - API-Football requests will fail');
}

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  LIVE: 0, // No cache for live data
  LIVE_60: 60, // 60 seconds for live matches that need some caching
  SHORT: 300, // 5 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 21600, // 6 hours
  VERY_LONG: 86400, // 24 hours
  STATIC: 604800, // 7 days
} as const;

// Match status types for adaptive TTL
const LIVE_STATUSES = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT', 'INT'];
const FINISHED_STATUSES = ['FT', 'AET', 'PEN'];
const POSTPONED_STATUSES = ['PST', 'CANC', 'ABD', 'SUSP', 'AWD', 'WO'];
const SCHEDULED_STATUSES = ['TBD', 'NS', 'SCHE'];

/**
 * Calculate adaptive TTL based on fixture data
 * Inspired by PR #1's intelligent caching strategy
 *
 * Returns TTL in seconds based on match status and timing:
 * - Live matches: 60 seconds (frequent updates needed)
 * - Finished matches: 24 hours (historical data, stable)
 * - Pre-match (<2h): 5 minutes (lineups may change)
 * - Pre-match (>2h): 1 hour (minimal changes)
 * - Postponed: 6 hours (status may update)
 */
function calculateAdaptiveTTL(endpoint: string, responseData: unknown): number {
  // Only apply adaptive TTL to fixture endpoints
  if (!endpoint.includes('/fixtures')) {
    // Default TTLs for other endpoints
    if (endpoint.includes('/standings')) return CACHE_TTL.LONG;
    if (endpoint.includes('/teams') || endpoint.includes('/players')) return CACHE_TTL.STATIC;
    if (endpoint.includes('/leagues')) return CACHE_TTL.STATIC;
    return CACHE_TTL.MEDIUM;
  }

  // Parse fixture response
  let fixtures: any[] = [];
  if (Array.isArray(responseData)) {
    fixtures = responseData;
  } else if (typeof responseData === 'object' && responseData !== null) {
    // Single fixture response
    fixtures = [responseData];
  }

  if (fixtures.length === 0) {
    return CACHE_TTL.MEDIUM;
  }

  // Check for live fixtures (priority 1)
  const hasLiveFixture = fixtures.some((f) => {
    const status = f?.fixture?.status?.short || f?.status;
    return status && LIVE_STATUSES.includes(status);
  });
  if (hasLiveFixture) {
    console.log('[Cache] Live fixture detected - TTL: 60s');
    return CACHE_TTL.LIVE_60;
  }

  // Check if all fixtures are finished (priority 2)
  const allFinished = fixtures.every((f) => {
    const status = f?.fixture?.status?.short || f?.status;
    return status && FINISHED_STATUSES.includes(status);
  });
  if (allFinished) {
    console.log('[Cache] All finished fixtures - TTL: 24h');
    return CACHE_TTL.VERY_LONG;
  }

  // Check for postponed fixtures (priority 3)
  const hasPostponed = fixtures.some((f) => {
    const status = f?.fixture?.status?.short || f?.status;
    return status && POSTPONED_STATUSES.includes(status);
  });
  if (hasPostponed) {
    console.log('[Cache] Postponed fixture detected - TTL: 6h');
    return CACHE_TTL.LONG;
  }

  // Check for upcoming fixtures within 2 hours (priority 4)
  const now = Date.now();
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

  const hasUpcomingSoon = fixtures.some((f) => {
    const matchDate = f?.fixture?.date || f?.date;
    if (!matchDate) return false;

    const matchTime = new Date(matchDate).getTime();
    const timeUntilMatch = matchTime - now;

    return timeUntilMatch > 0 && timeUntilMatch <= TWO_HOURS_MS;
  });

  if (hasUpcomingSoon) {
    console.log('[Cache] Fixture starting soon (<2h) - TTL: 5m');
    return CACHE_TTL.SHORT;
  }

  // Default: standard upcoming matches
  console.log('[Cache] Standard upcoming fixture - TTL: 1h');
  return CACHE_TTL.MEDIUM;
}

// API-Football endpoints mapping
export const API_ENDPOINTS = {
  // Matches/Fixtures
  FIXTURES_BY_ID: '/fixtures',
  FIXTURES_LIVE: '/fixtures?live=all',
  FIXTURES_BY_DATE: '/fixtures',
  FIXTURES_BY_LEAGUE: '/fixtures',
  FIXTURES_H2H: '/fixtures/headtohead',
  FIXTURES_STATISTICS: '/fixtures/statistics',
  FIXTURES_EVENTS: '/fixtures/events',
  FIXTURES_LINEUPS: '/fixtures/lineups',
  FIXTURES_PLAYERS: '/fixtures/players',

  // Leagues/Tournaments
  LEAGUES: '/leagues',
  LEAGUE_SEASONS: '/leagues/seasons',
  STANDINGS: '/standings',

  // Teams
  TEAMS: '/teams',
  TEAM_STATISTICS: '/teams/statistics',
  TEAM_SEASONS: '/teams/seasons',

  // Players
  PLAYERS: '/players',
  PLAYER_SEASONS: '/players/seasons',
  TRANSFERS: '/transfers',
  TROPHIES: '/trophies',

  // Odds
  ODDS: '/odds',
  ODDS_LIVE: '/odds/live',

  // Predictions
  PREDICTIONS: '/predictions',
} as const;

export interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, unknown>;
  errors: unknown[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T;
}

interface CacheEntry {
  id?: number;
  endpoint: string;
  params_hash: string;
  response_data: unknown;
  cached_at: string;
  expires_at: string;
  hit_count: number;
}

/**
 * Generate a hash for cache key from endpoint and params
 */
function generateCacheKey(endpoint: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, unknown>);

  return `${endpoint}:${JSON.stringify(sortedParams)}`;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(expiresAt: string): boolean {
  return new Date(expiresAt) > new Date();
}

/**
 * Fetch from Supabase cache
 */
async function fetchFromCache(
  endpoint: string,
  params: Record<string, unknown>
): Promise<unknown | null> {
  try {
    const supabase = await createClient();
    const paramsHash = generateCacheKey(endpoint, params);

    const { data, error } = await supabase
      .from('api_football_cache')
      .select('*')
      .eq('endpoint', endpoint)
      .eq('params_hash', paramsHash)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if cache is still valid
    if (!isCacheValid(data.expires_at)) {
      // Cache expired, delete it
      await supabase.from('api_football_cache').delete().eq('id', data.id);
      return null;
    }

    // Update hit count
    await supabase
      .from('api_football_cache')
      .update({ hit_count: data.hit_count + 1 })
      .eq('id', data.id);

    console.log(`[Cache HIT] ${endpoint} (${paramsHash})`);
    return data.response_data;
  } catch (error) {
    console.error('[Cache] Failed to fetch from cache:', error);
    return null;
  }
}

/**
 * Store response in Supabase cache
 */
async function storeInCache(
  endpoint: string,
  params: Record<string, unknown>,
  responseData: unknown,
  ttl: number
): Promise<void> {
  try {
    const supabase = await createClient();
    const paramsHash = generateCacheKey(endpoint, params);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    const cacheEntry: Omit<CacheEntry, 'id'> = {
      endpoint,
      params_hash: paramsHash,
      response_data: responseData,
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      hit_count: 0,
    };

    // Upsert (insert or update if exists)
    const { error } = await supabase
      .from('api_football_cache')
      .upsert(cacheEntry, {
        onConflict: 'endpoint,params_hash',
      });

    if (error) {
      console.error('[Cache] Failed to store in cache:', error);
    } else {
      console.log(`[Cache STORE] ${endpoint} (TTL: ${ttl}s)`);
    }
  } catch (error) {
    console.error('[Cache] Failed to store in cache:', error);
  }
}

/**
 * Fetch from API-Football
 */
async function fetchFromApiFootball<T>(
  endpoint: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  if (!API_FOOTBALL_KEY) {
    throw new Error('API_FOOTBALL_KEY not configured');
  }

  // Build URL with params
  const url = new URL(endpoint, API_FOOTBALL_BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  }

  console.log(`[API-Football] Fetching: ${url.toString()}`);

  const response = await fetch(url.toString(), {
    headers: {
      'x-rapidapi-key': API_FOOTBALL_KEY,
      'x-rapidapi-host': 'v3.football.api-sports.io',
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status} ${response.statusText}`);
  }

  const data: ApiFootballResponse<T> = await response.json();

  // Check for API errors
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football returned errors: ${JSON.stringify(data.errors)}`);
  }

  return data.response;
}

/**
 * Main fetch function with caching and request deduplication
 *
 * Architecture:
 * 1. Request Deduplication - Coalesce concurrent identical requests
 * 2. Supabase Cache - Check PostgreSQL JSONB cache
 * 3. API-Football - Fetch from external API (if cache miss)
 * 4. Store in Cache - Persist for future requests
 *
 * @param endpoint - API endpoint path
 * @param params - Query parameters
 * @param ttl - Time to live in seconds (optional - uses adaptive TTL if not provided)
 */
export async function fetchWithCache<T>(
  endpoint: string,
  params: Record<string, unknown> = {},
  ttl?: number
): Promise<T> {
  const cacheKey = generateCacheKey(endpoint, params);

  // Wrap entire fetch flow in deduplicator
  // This prevents thundering herd: 10,000 concurrent requests → 1 API call
  return deduplicator.dedupe(cacheKey, async () => {
    // Skip cache for live data
    if (ttl === CACHE_TTL.LIVE) {
      return fetchFromApiFootball<T>(endpoint, params);
    }

    // Try to fetch from cache first
    const cachedData = await fetchFromCache(endpoint, params);
    if (cachedData !== null) {
      return cachedData as T;
    }

    // Cache miss - fetch from API-Football
    const data = await fetchFromApiFootball<T>(endpoint, params);

    // Calculate TTL: use provided TTL or adaptive calculation
    let finalTTL: number;
    if (ttl !== undefined) {
      finalTTL = ttl;
      console.log(`[Cache] Using explicit TTL: ${ttl}s`);
    } else {
      finalTTL = calculateAdaptiveTTL(endpoint, data);
      console.log(`[Cache] Using adaptive TTL: ${finalTTL}s`);
    }

    // Store in cache (don't await - fire and forget)
    storeInCache(endpoint, params, data, finalTTL).catch((error) => {
      console.error('[Cache] Failed to store:', error);
    });

    return data;
  });
}

/**
 * Clear cache for specific endpoint
 */
export async function clearCache(
  endpoint?: string,
  params?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();

    if (endpoint && params) {
      const paramsHash = generateCacheKey(endpoint, params);
      await supabase
        .from('api_football_cache')
        .delete()
        .eq('endpoint', endpoint)
        .eq('params_hash', paramsHash);
      console.log(`[Cache] Cleared: ${endpoint} (${paramsHash})`);
    } else if (endpoint) {
      await supabase.from('api_football_cache').delete().eq('endpoint', endpoint);
      console.log(`[Cache] Cleared all for: ${endpoint}`);
    } else {
      await supabase.from('api_football_cache').delete().neq('id', 0);
      console.log('[Cache] Cleared all cache');
    }
  } catch (error) {
    console.error('[Cache] Failed to clear cache:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  total: number;
  expired: number;
  valid: number;
  totalHits: number;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('api_football_cache').select('*');

    if (error || !data) {
      return { total: 0, expired: 0, valid: 0, totalHits: 0 };
    }

    const now = new Date();
    const expired = data.filter((entry) => new Date(entry.expires_at) <= now).length;
    const valid = data.length - expired;
    const totalHits = data.reduce((sum, entry) => sum + (entry.hit_count || 0), 0);

    return {
      total: data.length,
      expired,
      valid,
      totalHits,
    };
  } catch (error) {
    console.error('[Cache] Failed to get stats:', error);
    return { total: 0, expired: 0, valid: 0, totalHits: 0 };
  }
}
