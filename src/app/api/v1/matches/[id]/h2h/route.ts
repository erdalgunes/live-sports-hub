// GET /api/v1/matches/[id]/h2h - Get head-to-head statistics
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  validateMatchIdParams,
  withErrorHandling,
  getCacheHeaders,
  ApiError,
} from '@/lib/utils/api-response';
import { MatchIdParamSchema } from '@/lib/validators/matches';
import { getMatchById, getH2HStats, getRecentH2HMatches } from '@/services/matches';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id: matchId } = await validateMatchIdParams(MatchIdParamSchema, params);

    // Get match details to find the teams
    const match = await getMatchById(matchId);
    if (!match) {
      throw new ApiError('Match not found', 404, 'NOT_FOUND');
    }

    // Fetch H2H statistics
    const h2hStats = await getH2HStats(match.home_team_id, match.away_team_id);

    // Fetch recent H2H matches
    const recentMatches = await getRecentH2HMatches(
      match.home_team_id,
      match.away_team_id,
      10
    );

    // Build response
    const h2hData = {
      h2h: h2hStats,
      recent_matches: recentMatches,
    };

    // H2H data doesn't change frequently, cache for longer
    return apiSuccess(h2hData, {
      headers: getCacheHeaders('long'),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
