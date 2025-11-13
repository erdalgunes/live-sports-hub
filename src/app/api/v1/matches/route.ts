// GET /api/v1/matches - List matches with filters
import { NextRequest } from 'next/server';
import {
  apiPaginated,
  validateQueryParams,
  withErrorHandling,
  getCacheHeaders,
} from '@/lib/utils/api-response';
import { MatchFiltersSchema } from '@/lib/validators/matches';
import { getMatches } from '@/services/matches';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);

    // Convert searchParams to plain object
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validation = validateQueryParams(MatchFiltersSchema, params);
    if (!validation.success) {
      throw new Error("Invalid parameters");
    }

    const filters = validation.data;

    // Fetch matches from database
    const { matches, total } = await getMatches(filters);

    // Determine cache strategy based on filters
    const cacheStrategy =
      filters.status === 'live'
        ? 'live'
        : filters.status === 'finished'
          ? 'long'
          : 'medium';

    // Return paginated response
    return apiPaginated(
      matches,
      {
        total,
        page: filters.page,
        page_size: filters.page_size,
      },
      {
        headers: getCacheHeaders(cacheStrategy),
      }
    );
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
