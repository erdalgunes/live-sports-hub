// GET /api/v1/matches/[id]/h2h - Get head-to-head statistics
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  validatePathParams,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { MatchIdParamSchema } from '@/lib/validators/matches';
import { getMatchById, getH2HStats, getRecentH2HMatches } from '@/services/matches';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    // Await params as per Next.js 15 requirements
    const resolvedParams = await params;

    // Validate path parameters
    const validation = validatePathParams(MatchIdParamSchema, { id: resolvedParams.id });
    if (!validation.success) {
      throw new Error("Invalid parameters");
    }

    const { id: matchId } = validation.data;

    // Get match details to find the teams
    const match = await getMatchById(matchId);
    if (!match) {
      throw new Error("Resource not found");
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
