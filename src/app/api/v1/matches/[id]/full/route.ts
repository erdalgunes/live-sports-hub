// GET /api/v1/matches/[id]/full - Smart match data aggregator
import { NextRequest } from 'next/server';
import {
  getFixtureById,
  getFixtureStatistics,
  getFixtureEvents,
  getFixtureLineups,
} from '@/lib/api-football/services';
import {
  apiSuccess,
  apiError,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';

type CacheType = 'live' | 'short' | 'medium' | 'long';

/**
 * Helper: Determine cache strategy based on match status
 */
function getCacheStrategy(matchStatus: string, kickoffDate: string): CacheType {
  const LIVE_STATUSES = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT', 'INT'];
  const FINISHED_STATUSES = ['FT', 'AET', 'PEN'];

  if (LIVE_STATUSES.includes(matchStatus)) {
    return 'live';
  }

  if (FINISHED_STATUSES.includes(matchStatus)) {
    return 'long';
  }

  const kickoffTime = new Date(kickoffDate).getTime();
  const timeUntilKickoff = kickoffTime - Date.now();
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

  return timeUntilKickoff > 0 && timeUntilKickoff <= TWO_HOURS_MS ? 'short' : 'medium';
}

/**
 * Helper: Process settled results and collect errors
 */
function processResults<T>(
  result: PromiseSettledResult<T>,
  resourceName: string
): {
  data: T | null;
  error: { resource: string; message: string } | null;
} {
  if (result.status === 'fulfilled') {
    return { data: result.value, error: null };
  }

  return {
    data: null,
    error: {
      resource: resourceName,
      message: `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} temporarily unavailable`,
    },
  };
}

/**
 * Smart Match Aggregator
 *
 * Bundles all match-related data into a single optimized request:
 * - Fixture details (core resource - required)
 * - Match statistics (team stats)
 * - Match events (goals, cards, substitutions)
 * - Team lineups (starting XI + bench)
 *
 * Benefits:
 * - 1 HTTP request instead of 4 (from browser)
 * - Parallel fetching (200ms vs 800ms sequential)
 * - Graceful degradation (partial responses if some fail)
 * - All sub-resources use existing Supabase cache
 * - Adaptive TTL inherited from fixture status
 *
 * Cache Strategy:
 * - Each sub-resource checks Supabase cache first
 * - Cache miss → fetch from API-Football → store → return
 * - All users benefit from any user's cached requests
 * - TTL: live 60s, finished 24h, upcoming 5m-1h
 *
 * Error Handling:
 * - 200 OK: Full or partial success (core data present)
 * - 404 Not Found: Match doesn't exist
 * - 500 Internal Server Error: Complete failure
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const fixtureId = Number.parseInt(id, 10);

    if (Number.isNaN(fixtureId)) {
      throw new Error('Invalid match ID');
    }

    // Fetch all data in parallel using Promise.allSettled
    // This allows independent failures without blocking entire request
    const [fixtureResult, statsResult, eventsResult, lineupsResult] =
      await Promise.allSettled([
        getFixtureById(fixtureId),
        getFixtureStatistics(fixtureId),
        getFixtureEvents(fixtureId),
        getFixtureLineups(fixtureId),
      ]);

    // Core resource (fixture) is required
    if (fixtureResult.status === 'rejected' || !fixtureResult.value) {
      throw new Error('Match not found');
    }

    const fixture = fixtureResult.value;

    // Process results and collect errors
    const statsProcessed = processResults(statsResult, 'statistics');
    const eventsProcessed = processResults(eventsResult, 'events');
    const lineupsProcessed = processResults(lineupsResult, 'lineups');

    const errors = [
      statsProcessed.error,
      eventsProcessed.error,
      lineupsProcessed.error,
    ].filter((e): e is { resource: string; message: string } => e !== null);

    // Determine cache strategy
    const matchStatus = fixture.fixture.status.short;
    const cacheType = getCacheStrategy(matchStatus, fixture.fixture.date);

    // Build comprehensive response
    const response = {
      // Core data
      match: fixture,
      statistics: statsProcessed.data,
      events: eventsProcessed.data,
      lineups: lineupsProcessed.data,

      // Metadata
      meta: {
        fetchedAt: new Date().toISOString(),
        matchStatus,
        cacheStrategy: cacheType,
        partial: errors.length > 0,
        resourcesAvailable: {
          match: true,
          statistics: statsProcessed.data !== null,
          events: eventsProcessed.data !== null,
          lineups: lineupsProcessed.data !== null,
        },
        successful: 1 + [statsProcessed.data, eventsProcessed.data, lineupsProcessed.data].filter(Boolean).length,
        failed: errors.length,
      },

      // Errors (if any)
      ...(errors.length > 0 && { errors }),
    };

    return apiSuccess(response, {
      headers: getCacheHeaders(cacheType),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
