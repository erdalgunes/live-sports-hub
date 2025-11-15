// GET /api/v1/matches/[id] - Get single match details
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  validateMatchIdParams,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { MatchIdParamSchema } from '@/lib/validators/matches';
import { getMatchById } from '@/services/matches';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id: matchId } = await validateMatchIdParams(MatchIdParamSchema, params);

    // Fetch match from database
    const match = await getMatchById(matchId);

    if (!match) {
      throw new Error("Resource not found");
    }

    // Determine cache strategy based on match status
    let cacheStrategy: 'live' | 'long' | 'short';
    if (match.status === 'live') {
      cacheStrategy = 'live';
    } else if (match.status === 'finished') {
      cacheStrategy = 'long';
    } else {
      cacheStrategy = 'short';
    }

    // Return match details
    return apiSuccess(match, {
      headers: getCacheHeaders(cacheStrategy),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
