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
    const fixtureId = parseInt(id);

    if (isNaN(fixtureId)) {
      return apiError('Invalid match ID', 400);
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
      return apiError('Match not found', 404);
    }

    const fixture = fixtureResult.value;

    // Build response with graceful degradation
    // Failed sub-resources return null (not omitted)
    const errors: Array<{ resource: string; message: string }> = [];

    const statistics =
      statsResult.status === 'fulfilled' ? statsResult.value : null;
    if (statsResult.status === 'rejected') {
      errors.push({
        resource: 'statistics',
        message: 'Statistics temporarily unavailable',
      });
    }

    const events =
      eventsResult.status === 'fulfilled' ? eventsResult.value : null;
    if (eventsResult.status === 'rejected') {
      errors.push({
        resource: 'events',
        message: 'Events temporarily unavailable',
      });
    }

    const lineups =
      lineupsResult.status === 'fulfilled' ? lineupsResult.value : null;
    if (lineupsResult.status === 'rejected') {
      errors.push({
        resource: 'lineups',
        message: 'Lineups temporarily unavailable',
      });
    }

    // Determine cache strategy based on match status
    const matchStatus = fixture.fixture.status.short;
    let cacheType: 'live' | 'short' | 'medium' | 'long' = 'medium';

    const LIVE_STATUSES = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT', 'INT'];
    const FINISHED_STATUSES = ['FT', 'AET', 'PEN'];

    if (LIVE_STATUSES.includes(matchStatus)) {
      cacheType = 'live'; // 60 seconds
    } else if (FINISHED_STATUSES.includes(matchStatus)) {
      cacheType = 'long'; // 6 hours
    } else {
      // Upcoming matches
      const kickoffTime = new Date(fixture.fixture.date).getTime();
      const now = Date.now();
      const timeUntilKickoff = kickoffTime - now;
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

      if (timeUntilKickoff > 0 && timeUntilKickoff <= TWO_HOURS_MS) {
        cacheType = 'short'; // 5 minutes (lineups may change)
      } else {
        cacheType = 'medium'; // 1 hour
      }
    }

    // Build comprehensive response
    const response = {
      // Core data
      match: fixture,
      statistics,
      events,
      lineups,

      // Metadata
      meta: {
        fetchedAt: new Date().toISOString(),
        matchStatus,
        cacheStrategy: cacheType,
        partial: errors.length > 0,
        resourcesAvailable: {
          match: true,
          statistics: statistics !== null,
          events: events !== null,
          lineups: lineups !== null,
        },
        successful: 1 + (statistics ? 1 : 0) + (events ? 1 : 0) + (lineups ? 1 : 0),
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
