// GET /api/v1/matches/[id]/events - Get match events timeline
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  validateMatchIdParams,
  withErrorHandling,
  getCacheHeaders,
  ApiError,
} from '@/lib/utils/api-response';
import { MatchIdParamSchema } from '@/lib/validators/matches';
import { getMatchEvents, getMatchById } from '@/services/matches';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id: matchId } = await validateMatchIdParams(MatchIdParamSchema, params);

    // Check if match exists
    const match = await getMatchById(matchId);
    if (!match) {
      throw new ApiError('Match not found', 404, 'NOT_FOUND');
    }

    // Fetch match events
    const events = await getMatchEvents(matchId);

    // Determine cache strategy based on match status
    const cacheStrategy = match.status === 'live' ? 'live' : 'short';

    // Return events timeline
    return apiSuccess(events, {
      headers: getCacheHeaders(cacheStrategy),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
