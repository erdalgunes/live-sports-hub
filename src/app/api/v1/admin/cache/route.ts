// GET /api/v1/admin/cache - Get cache statistics
// DELETE /api/v1/admin/cache - Clear cache
import { NextRequest } from 'next/server';
import { getCacheStats, clearCache } from '@/lib/api-football';
import {
  apiSuccess,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';

/**
 * GET /api/v1/admin/cache
 * Returns cache statistics
 */
export async function GET(_request: NextRequest) {
  return withErrorHandling(async () => {
    const stats = await getCacheStats();

    return apiSuccess(stats, {
      headers: getCacheHeaders('live'), // Don't cache cache stats
    });
  });
}

/**
 * DELETE /api/v1/admin/cache
 * Clears cache (all or specific endpoint)
 *
 * Query params:
 * - endpoint: Optional specific endpoint to clear
 */
export async function DELETE(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (endpoint) {
      await clearCache(endpoint);
      return apiSuccess({ message: `Cache cleared for endpoint: ${endpoint}` });
    } else {
      await clearCache();
      return apiSuccess({ message: 'All cache cleared' });
    }
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
