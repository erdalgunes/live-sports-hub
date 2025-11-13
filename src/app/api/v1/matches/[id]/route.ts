// GET /api/v1/matches/[id] - Get single match details
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  apiNotFound,
  validatePathParams,
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
    // Await params as per Next.js 15 requirements
    const resolvedParams = await params;

    // Validate path parameters
    const validation = validatePathParams(MatchIdParamSchema, { id: resolvedParams.id });
    if (!validation.success) {
      throw new Error("Invalid parameters");
    }

    const { id: matchId } = validation.data;

    // Fetch match from database
    const match = await getMatchById(matchId);

    if (!match) {
      throw new Error("Resource not found");
    }

    // Determine cache strategy based on match status
    const cacheStrategy =
      match.status === 'live'
        ? 'live'
        : match.status === 'finished'
          ? 'long'
          : 'short';

    // Return match details
    return apiSuccess(match, {
      headers: getCacheHeaders(cacheStrategy),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
