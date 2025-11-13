// GET /api/v1/matches/[id]/graph/win-probability - Get match win probability graph
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  apiNotFound,
  validatePathParams,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { MatchIdParamSchema } from '@/lib/validators/matches';
import { getMatchWinProbability, getMatchById } from '@/services/matches';

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

    // Fetch win probability graph data
    const winProbability = await getMatchWinProbability(matchId);

    if (!winProbability) {
      return apiNotFound('Win probability graph data');
    }

    // Determine cache strategy based on match status
    const cacheStrategy = match.status === 'live' ? 'live' : 'medium';

    // Return win probability data
    return apiSuccess(winProbability, {
      headers: getCacheHeaders(cacheStrategy),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';