// GET /api/v1/matches/[id]/stats - Get match statistics
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  validateMatchIdParams,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { MatchIdParamSchema } from '@/lib/validators/matches';
import { getMatchStats, getMatchById } from '@/services/matches';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id: matchId } = await validateMatchIdParams(MatchIdParamSchema, params);

    // Check if match exists
    const match = await getMatchById(matchId);
    if (!match) {
      throw new Error("Resource not found");
    }

    // Fetch match statistics
    const stats = await getMatchStats(matchId);

    if (!stats || (!stats.home && !stats.away)) {
      throw new Error("Resource not found");
    }

    // Determine cache strategy based on match status
    const cacheStrategy = match.status === 'live' ? 'live' : 'medium';

    // Return statistics
    return apiSuccess(stats, {
      headers: getCacheHeaders(cacheStrategy),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
