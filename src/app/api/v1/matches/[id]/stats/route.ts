// GET /api/v1/matches/[id]/stats - Get match statistics
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  apiNotFound,
  validatePathParams,
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
    // Await params as per Next.js 15 requirements
    const resolvedParams = await params;

    // Validate path parameters
    const validation = validatePathParams(MatchIdParamSchema, { id: resolvedParams.id });
    if (!validation.success) {
      return validation.response;
    }

    const { id: matchId } = validation.data;

    // Check if match exists
    const match = await getMatchById(matchId);
    if (!match) {
      return apiNotFound('Match');
    }

    // Fetch match statistics
    const stats = await getMatchStats(matchId);

    if (!stats || (!stats.home && !stats.away)) {
      return apiNotFound('Match statistics');
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
