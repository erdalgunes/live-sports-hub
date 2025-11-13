// GET /api/v1/matches/[id]/lineups - Get match lineups
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  apiNotFound,
  validatePathParams,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { MatchIdParamSchema } from '@/lib/validators/matches';
import { getMatchLineups, getMatchById } from '@/services/matches';

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

    // Fetch match lineups
    const lineups = await getMatchLineups(matchId);

    if (!lineups || (!lineups.home && !lineups.away)) {
      return apiNotFound('Match lineups');
    }

    // Cache for longer since lineups don't change during match
    const cacheStrategy = match.status === 'scheduled' ? 'short' : 'long';

    // Return lineups
    return apiSuccess(lineups, {
      headers: getCacheHeaders(cacheStrategy),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
