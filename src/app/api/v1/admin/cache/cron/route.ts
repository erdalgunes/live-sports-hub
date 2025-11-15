// GET /api/v1/admin/cache/cron - Get cache cron job status
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  apiSuccess,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { verifyAdminAuth, getUnauthorizedResponse } from '@/lib/utils/auth';

/**
 * GET /api/v1/admin/cache/cron
 * Returns status of all cache-related cron jobs
 *
 * Requires Authorization header with Bearer token matching CRON_SECRET
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const authHeader = request.headers.get('authorization');
  if (!verifyAdminAuth(authHeader)) {
    return getUnauthorizedResponse();
  }

  return withErrorHandling(async () => {
    const supabase = await createClient();

    // Get cron job status
    const { data, error } = await supabase.rpc('get_cache_cron_status');

    if (error) {
      throw new Error(`Failed to get cron status: ${error.message}`);
    }

    const jobs = (data as unknown[]) || []

    return apiSuccess(
      {
        jobs,
        count: jobs.length,
        timestamp: new Date().toISOString(),
      },
      {
        headers: getCacheHeaders('short'), // Cache for 5 minutes
      }
    );
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
