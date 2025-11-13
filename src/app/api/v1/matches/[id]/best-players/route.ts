// GET /api/v1/matches/[id]/best-players - Get best performing players for a match
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  validatePathParams,
  withErrorHandling,
  getCacheHeaders,
  ApiError,
} from '@/lib/utils/api-response';
import { MatchIdParamSchema } from '@/lib/validators/matches';
import { getMatchBestPlayers, getMatchById } from '@/services/matches';

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
      throw new ApiError('Match not found', 404);
    }

    // Fetch best players
    const bestPlayers = await getMatchBestPlayers(matchId);

    if (!bestPlayers || bestPlayers.length === 0) {
      throw new ApiError('Best players data not available', 404);
    }

    // Determine cache strategy based on match status
    const cacheStrategy = match.status === 'live' ? 'live' : 'medium';

    // Return best players
    return apiSuccess(bestPlayers, {
      headers: getCacheHeaders(cacheStrategy),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';