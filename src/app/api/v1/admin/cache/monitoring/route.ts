// GET /api/v1/admin/cache/monitoring - Get cache performance trends
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  apiSuccess,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { verifyAdminAuth, getUnauthorizedResponse } from '@/lib/utils/auth';

/**
 * GET /api/v1/admin/cache/monitoring
 * Returns cache performance trends over time
 *
 * Requires Authorization header with Bearer token matching CRON_SECRET
 *
 * Query params:
 * - hours: Number of hours to look back (default: 24, max: 168 = 7 days)
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const authHeader = request.headers.get('authorization');
  if (!verifyAdminAuth(authHeader)) {
    return getUnauthorizedResponse();
  }

  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const hoursParam = searchParams.get('hours');
    const hours = hoursParam ? Math.min(Number.parseInt(hoursParam, 10), 168) : 24;

    const supabase = await createClient();

    // Get cache trends
    // @ts-expect-error - Supabase generated types may not include this RPC function
    const { data, error } = await supabase.rpc('get_cache_trends', {
      hours_back: hours,
    });

    if (error) {
      throw new Error(`Failed to get cache trends: ${error.message}`);
    }

    const trends = (data as unknown[]) || []

    return apiSuccess(
      {
        timeRange: `${hours} hours`,
        snapshots: trends,
        count: trends.length,
      },
      {
        headers: getCacheHeaders('short'), // Cache for 5 minutes
      }
    );
  });
}

/**
 * POST /api/v1/admin/cache/monitoring
 * Manually trigger a cache snapshot
 *
 * Requires Authorization header with Bearer token matching CRON_SECRET
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const authHeader = request.headers.get('authorization');
  if (!verifyAdminAuth(authHeader)) {
    return getUnauthorizedResponse();
  }

  return withErrorHandling(async () => {
    const supabase = await createClient();

    // Record a cache snapshot
    const { error } = await supabase.rpc('record_cache_snapshot');

    if (error) {
      throw new Error(`Failed to record cache snapshot: ${error.message}`);
    }

    return apiSuccess(
      {
        message: 'Cache snapshot recorded',
        timestamp: new Date().toISOString(),
      },
      {
        headers: getCacheHeaders('live'),
      }
    );
  });
}

/**
 * DELETE /api/v1/admin/cache/monitoring
 * Clean up old monitoring data (>30 days)
 *
 * Requires Authorization header with Bearer token matching CRON_SECRET
 */
export async function DELETE(request: NextRequest) {
  // Verify authentication
  const authHeader = request.headers.get('authorization');
  if (!verifyAdminAuth(authHeader)) {
    return getUnauthorizedResponse();
  }

  return withErrorHandling(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('cleanup_old_monitoring_data');

    if (error) {
      throw new Error(`Failed to cleanup monitoring data: ${error.message}`);
    }

    const deletedCount = data as number;

    return apiSuccess(
      {
        message: 'Old monitoring data cleaned up',
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
