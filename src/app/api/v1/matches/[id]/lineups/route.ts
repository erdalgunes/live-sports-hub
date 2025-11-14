// GET /api/v1/matches/[id]/lineups - Get match lineups
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  validateMatchIdParams,
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
    const { id: matchId } = await validateMatchIdParams(MatchIdParamSchema, params);

    // Check if match exists
    const match = await getMatchById(matchId);
    if (!match) {
      throw new Error("Resource not found");
    }

    // Fetch match lineups
    const lineups = await getMatchLineups(matchId);

    if (!lineups || (!lineups.home && !lineups.away)) {
      throw new Error("Resource not found");
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
