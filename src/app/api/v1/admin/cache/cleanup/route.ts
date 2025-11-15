// POST /api/v1/admin/cache/cleanup - Clean up expired cache entries
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  apiSuccess,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { verifyAdminAuth, getUnauthorizedResponse } from '@/lib/utils/auth';

/**
 * POST /api/v1/admin/cache/cleanup
 * Removes all expired cache entries from the database
 *
 * Requires Authorization header with Bearer token matching CRON_SECRET
 *
 * This endpoint can be called by:
 * 1. Manual trigger via admin panel
 * 2. Scheduled cron job (e.g., Vercel Cron)
 * 3. Supabase pg_cron
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const authHeader = request.headers.get('authorization');
  if (!verifyAdminAuth(authHeader)) {
    return getUnauthorizedResponse();
  }

  return withErrorHandling(async () => {
    const supabase = await createClient();

    // Call the stored procedure
    const { data, error } = await supabase.rpc('cleanup_expired_cache');

    if (error) {
      throw new Error(`Failed to cleanup cache: ${error.message}`);
    }

    const deletedCount = data as number;

    return apiSuccess(
      {
        message: 'Cache cleanup completed',
        deleted: deletedCount,
        timestamp: new Date().toISOString(),
      },
      {
        headers: getCacheHeaders('live'),
      }
    );
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
