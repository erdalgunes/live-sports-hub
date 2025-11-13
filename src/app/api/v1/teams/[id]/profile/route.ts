// GET /api/v1/teams/[id]/profile - Smart team data aggregator
import { NextRequest } from 'next/server';
import {
  getTeamById,
  getTeamStatistics,
  getFixturesByTeam,
} from '@/lib/api-football/services';
import {
  apiSuccess,
  apiError,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { getCurrentSeason } from '@/lib/utils/season';

/**
 * Smart Team Aggregator
 *
 * Bundles all team-related data into a single optimized request:
 * - Team details (name, logo, stadium, etc.)
 * - Team statistics (season performance)
 * - Recent fixtures (last 5 matches)
 * - Upcoming fixtures (next 5 matches)
 *
 * Benefits:
 * - 1 HTTP request instead of 4 (from browser)
 * - Parallel fetching for better performance
 * - Complete team page data in one call
 * - All sub-resources use existing Supabase cache
 *
 * Cache Strategy:
 * - Team details: 7 days (STATIC)
 * - Statistics: 6 hours (LONG)
 * - Fixtures: Adaptive TTL based on match status
 * - Response uses medium cache (1 hour)
 *
 * Query Parameters:
 * - season: Year (e.g., 2024) - defaults to current season
 * - leagueId: Specific league (required for statistics)
 * - recentLimit: Number of recent fixtures (default: 5, max: 10)
 * - upcomingLimit: Number of upcoming fixtures (default: 5, max: 10)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const teamId = parseInt(id);

    if (isNaN(teamId)) {
      throw new Error('Invalid team ID');
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(
      searchParams.get('season') || String(getCurrentSeason())
    );
    const leagueId = parseInt(searchParams.get('leagueId') || '0');
    const recentLimit = Math.min(
      parseInt(searchParams.get('recentLimit') || '5'),
      10
    );
    const upcomingLimit = Math.min(
      parseInt(searchParams.get('upcomingLimit') || '5'),
      10
    );

    // Fetch all data in parallel
    const [teamResult, statsResult, fixturesResult] = await Promise.allSettled([
      getTeamById(teamId),
      leagueId > 0
        ? getTeamStatistics(teamId, leagueId, season)
        : Promise.resolve(null),
      getFixturesByTeam(teamId, season, leagueId, recentLimit + upcomingLimit),
    ]);

    // Core resource (team) is required
    if (teamResult.status === 'rejected' || !teamResult.value) {
      throw new Error('Team not found');
    }

    const team = teamResult.value;

    // Process optional resources with graceful degradation
    const errors: Array<{ resource: string; message: string }> = [];

    const statistics =
      statsResult.status === 'fulfilled' ? statsResult.value : null;
    if (statsResult.status === 'rejected') {
      errors.push({
        resource: 'statistics',
        message: 'Statistics temporarily unavailable',
      });
    }

    // Process fixtures data
    let recentFixtures: any[] = [];
    let upcomingFixtures: any[] = [];

    if (fixturesResult.status === 'fulfilled' && fixturesResult.value) {
      const allFixtures = fixturesResult.value;
      const now = Date.now();

      // Separate into recent and upcoming
      const recent: any[] = [];
      const upcoming: any[] = [];

      allFixtures.forEach((fixture: any) => {
        const matchTime = new Date(fixture.fixture.date).getTime();
        const status = fixture.fixture.status.short;
        const FINISHED_STATUSES = ['FT', 'AET', 'PEN'];

        if (FINISHED_STATUSES.includes(status)) {
          recent.push(fixture);
        } else if (matchTime > now) {
          upcoming.push(fixture);
        }
      });

      // Sort and limit
      recentFixtures = recent
        .sort(
          (a, b) =>
            new Date(b.fixture.date).getTime() -
            new Date(a.fixture.date).getTime()
        )
        .slice(0, recentLimit);

      upcomingFixtures = upcoming
        .sort(
          (a, b) =>
            new Date(a.fixture.date).getTime() -
            new Date(b.fixture.date).getTime()
        )
        .slice(0, upcomingLimit);
    } else {
      errors.push({
        resource: 'fixtures',
        message: 'Fixtures temporarily unavailable',
      });
    }

    // Build comprehensive response
    const response = {
      // Core data
      team,
      statistics,
      recentFixtures,
      upcomingFixtures,

      // Metadata
      meta: {
        fetchedAt: new Date().toISOString(),
        season,
        partial: errors.length > 0,
        resourcesAvailable: {
          team: true,
          statistics: statistics !== null,
          recentFixtures: recentFixtures.length > 0,
          upcomingFixtures: upcomingFixtures.length > 0,
        },
        counts: {
          recent: recentFixtures.length,
          upcoming: upcomingFixtures.length,
        },
      },

      // Errors (if any)
      ...(errors.length > 0 && { errors }),
    };

    // Use medium cache (1 hour) for team bundles
    // Team data changes moderately (fixtures, form)
    return apiSuccess(response, {
      headers: getCacheHeaders('medium'),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
