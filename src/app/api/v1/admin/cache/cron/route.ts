// GET /api/v1/admin/cache/cron - Get cache cron job status
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  apiSuccess,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';

/**
 * GET /api/v1/admin/cache/cron
 * Returns status of all cache-related cron jobs
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    // Get cron job status
    const { data, error } = await supabase.rpc('get_cache_cron_status');

    if (error) {
      throw new Error(`Failed to get cron status: ${error.message}`);
    }

    return apiSuccess(
      {
        jobs: data || [],
        count: data?.length || 0,
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
