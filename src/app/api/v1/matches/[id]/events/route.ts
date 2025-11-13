// GET /api/v1/matches/[id]/events - Get match events timeline
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  apiNotFound,
  validatePathParams,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { MatchIdParamSchema } from '@/lib/validators/matches';
import { getMatchEvents, getMatchById } from '@/services/matches';

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
