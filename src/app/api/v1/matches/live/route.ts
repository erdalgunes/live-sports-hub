// GET /api/v1/matches/live - Get all live matches
import { NextRequest } from 'next/server';
import {
  apiSuccess,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { getLiveMatches } from '@/services/matches';

export async function GET(_request: NextRequest) {
  return withErrorHandling(async () => {
    // Fetch all live matches
    const liveMatches = await getLiveMatches();

    // No cache for live matches
    return apiSuccess(liveMatches, {
      headers: getCacheHeaders('live'),
    });
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
