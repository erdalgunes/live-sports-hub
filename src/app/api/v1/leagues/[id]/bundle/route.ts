// GET /api/v1/leagues/[id]/bundle - Smart league data aggregator
import { NextRequest } from 'next/server';
import {
  getStandings,
  getFixturesByLeague,
} from '@/lib/api-football/services';
import {
  apiSuccess,
  withErrorHandling,
  getCacheHeaders,
  ApiError,
} from '@/lib/utils/api-response';
import { getCurrentSeason } from '@/lib/utils/season';

/**
 * Smart League Aggregator
 *
 * Bundles all league-related data into a single optimized request:
 * - League standings (table)
 * - Upcoming fixtures (next matches)
 * - Recent results (finished matches)
 *
 * Benefits:
 * - 1 HTTP request instead of 3-4 (from browser)
 * - Parallel fetching for better performance
 * - Complete league page data in one call
 * - All sub-resources use existing Supabase cache
 *
 * Cache Strategy:
 * - Standings: 6 hours (LONG)
 * - Fixtures: Adaptive TTL based on match status
 * - All cached independently in Supabase
 * - Response uses shortest TTL of sub-resources
 *
 * Query Parameters:
 * - season: Year (e.g., 2024) - defaults to current season
 * - upcomingLimit: Number of upcoming fixtures (default: 10, max: 20)
 * - recentLimit: Number of recent results (default: 10, max: 20)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const leagueId = Number.parseInt(id, 10);

    if (Number.isNaN(leagueId)) {
      throw new ApiError('Invalid league ID', 400, 'INVALID_ID');
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const season = Number.parseInt(
      searchParams.get('season') || String(getCurrentSeason()),
      10
    );
    const upcomingLimit = Math.min(
      Number.parseInt(searchParams.get('upcomingLimit') || '10', 10),
      20
    );
    const recentLimit = Math.min(
      Number.parseInt(searchParams.get('recentLimit') || '10', 10),
      20
    );

    // Validate parsed values
    if (Number.isNaN(season)) {
      throw new ApiError('Invalid season parameter', 400, 'INVALID_SEASON');
    }

    // Fetch all data in parallel
    const [standingsResult, allFixturesResult] = await Promise.allSettled([
      getStandings(leagueId, season),
      getFixturesByLeague(leagueId, season),
    ]);

    // Core resource (standings) is required
    if (standingsResult.status === 'rejected' || !standingsResult.value) {
      throw new ApiError('League standings not found', 404, 'NOT_FOUND');
    }

    const standingsData = standingsResult.value;
    const standings = standingsData[0]?.league?.standings?.[0] || [];

    // Process fixtures data
    type FixtureItem = {
      fixture: {
        date: string
        status: { short: string }
      }
    }

    const errors: Array<{ resource: string; message: string }> = [];
    let upcomingFixtures: FixtureItem[] = [];
    let recentResults: FixtureItem[] = [];

    if (allFixturesResult.status === 'fulfilled' && allFixturesResult.value) {
      const allFixtures = allFixturesResult.value as FixtureItem[];
      const now = Date.now();

      // Separate into upcoming and recent
      const upcoming: FixtureItem[] = [];
      const recent: FixtureItem[] = [];

      for (const fixture of allFixtures) {
        const matchTime = new Date(fixture.fixture.date).getTime();
        const status = fixture.fixture.status.short;
        const FINISHED_STATUSES = ['FT', 'AET', 'PEN'];

        if (FINISHED_STATUSES.includes(status)) {
          recent.push(fixture);
        } else if (matchTime > now) {
          upcoming.push(fixture);
        }
      }

      // Sort and limit (Node 18 compatible)
      upcomingFixtures = [...upcoming]
        .sort(
          (a, b) =>
            new Date(a.fixture.date).getTime() -
            new Date(b.fixture.date).getTime()
        )
        .slice(0, upcomingLimit);

      recentResults = [...recent]
        .sort(
          (a, b) =>
            new Date(b.fixture.date).getTime() -
            new Date(a.fixture.date).getTime()
        )
        .slice(0, recentLimit);
    } else {
      errors.push({
        resource: 'fixtures',
        message: 'Fixtures temporarily unavailable',
      });
    }

    // Build comprehensive response
    const response = {
      // Core data
      league: {
        id: leagueId,
        name: standingsData[0]?.league?.name || '',
        country: standingsData[0]?.league?.country || '',
        logo: standingsData[0]?.league?.logo || '',
        season,
      },
      standings,
      upcomingFixtures,
      recentResults,

      // Metadata
      meta: {
        fetchedAt: new Date().toISOString(),
        season,
        partial: errors.length > 0,
        resourcesAvailable: {
          standings: true,
          upcomingFixtures: upcomingFixtures.length > 0,
          recentResults: recentResults.length > 0,
        },
        counts: {
          standings: standings.length,
          upcoming: upcomingFixtures.length,
          recent: recentResults.length,
        },
      },

      // Errors (if any)
      ...(errors.length > 0 && { errors }),
    };

    // Use medium cache (1 hour) for league bundles
    // Standings change slowly, but we want reasonably fresh data
    return apiSuccess(response, {
      headers: getCacheHeaders('medium'),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
