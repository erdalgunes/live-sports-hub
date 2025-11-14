// API Response utilities for standardized responses
import { NextResponse } from 'next/server';
import { z } from 'zod';

// =============================================================================
// TYPES
// =============================================================================

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    field?: string;
    issues?: z.ZodIssue[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// =============================================================================
// SUCCESS RESPONSE BUILDERS
// =============================================================================

/**
 * Create a successful API response with data
 */
export function apiSuccess<T>(
  data: T,
  options?: {
    status?: number;
    meta?: PaginationMeta;
    headers?: HeadersInit;
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    data,
    ...(options?.meta && { meta: options.meta }),
  };

  return NextResponse.json(response, {
    status: options?.status ?? 200,
    headers: options?.headers,
  });
}

/**
 * Create a paginated API response
 */
export function apiPaginated<T>(
  data: T[],
  pagination: {
    total: number;
    page: number;
    page_size: number;
  },
  options?: {
    status?: number;
    headers?: HeadersInit;
  }
): NextResponse<ApiSuccessResponse<T[]>> {
  const total_pages = Math.ceil(pagination.total / pagination.page_size);

  return apiSuccess(data, {
    status: options?.status ?? 200,
    meta: {
      ...pagination,
      total_pages,
    },
    headers: options?.headers,
  });
}

// =============================================================================
// ERROR RESPONSE BUILDERS
// =============================================================================

/**
 * Create an error API response
 */
export function apiError(
  message: string,
  options?: {
    status?: number;
    code?: string;
    field?: string;
    headers?: HeadersInit;
  }
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    error: {
      message,
      ...(options?.code && { code: options.code }),
      ...(options?.field && { field: options.field }),
    },
  };

  return NextResponse.json(response, {
    status: options?.status ?? 500,
    headers: options?.headers,
  });
}

/**
 * Create a validation error response from Zod error
 */
export function apiValidationError(
  error: z.ZodError,
  message: string = 'Validation failed'
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    error: {
      message,
      code: 'VALIDATION_ERROR',
      issues: error.issues,
    },
  };

  return NextResponse.json(response, {
    status: 400,
  });
}

/**
 * Create a not found error response
 */
export function apiNotFound(
  resource: string = 'Resource'
): NextResponse<ApiErrorResponse> {
  return apiError(`${resource} not found`, {
    status: 404,
    code: 'NOT_FOUND',
  });
}

/**
 * Create an unauthorized error response
 */
export function apiUnauthorized(
  message: string = 'Unauthorized'
): NextResponse<ApiErrorResponse> {
  return apiError(message, {
    status: 401,
    code: 'UNAUTHORIZED',
  });
}

/**
 * Create a forbidden error response
 */
export function apiForbidden(
  message: string = 'Forbidden'
): NextResponse<ApiErrorResponse> {
  return apiError(message, {
    status: 403,
    code: 'FORBIDDEN',
  });
}

/**
 * Create a bad request error response
 */
export function apiBadRequest(
  message: string,
  field?: string
): NextResponse<ApiErrorResponse> {
  return apiError(message, {
    status: 400,
    code: 'BAD_REQUEST',
    field,
  });
}

/**
 * Create an internal server error response
 */
export function apiInternalError(
  message: string = 'Internal server error'
): NextResponse<ApiErrorResponse> {
  return apiError(message, {
    status: 500,
    code: 'INTERNAL_ERROR',
  });
}

// =============================================================================
// CACHE HEADERS
// =============================================================================

/**
 * Get cache headers for different types of data
 */
export function getCacheHeaders(strategy: 'static' | 'dynamic' | 'live' | 'short' | 'medium' | 'long'): HeadersInit {
  switch (strategy) {
    case 'static':
      // Static data (leagues, teams) - cache for 24 hours
      return {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      };

    case 'long':
      // Finished matches, player stats - cache for 6 hours
      return {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=10800',
      };

    case 'medium':
      // Standings, upcoming matches - cache for 1 hour
      return {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      };

    case 'short':
      // Match details (scheduled/finished) - cache for 5 minutes
      return {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=150',
      };

    case 'dynamic':
      // Dynamic data - no cache but allow stale-while-revalidate
      return {
        'Cache-Control': 'public, s-maxage=0, stale-while-revalidate=60',
      };

    case 'live':
      // Live data - no cache
      return {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      };

    default:
      return {
        'Cache-Control': 'no-store',
      };
  }
}

// =============================================================================
// ERROR HANDLING WRAPPER
// =============================================================================

/**
 * Wrap an API handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<ApiSuccessResponse<T>>>
): Promise<NextResponse<ApiSuccessResponse<T> | ApiErrorResponse>> {
  return handler().catch((error: unknown) => {
    console.error('API Error:', error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      return apiValidationError(error);
    }

    // Custom API errors
    if (error instanceof ApiError) {
      return apiError(error.message, {
        status: error.status,
        code: error.code,
      });
    }

    // Database errors
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as { code: string; message: string };

      // PostgreSQL unique constraint violation
      if (dbError.code === '23505') {
        return apiError('Resource already exists', {
          status: 409,
          code: 'DUPLICATE',
        });
      }

      // PostgreSQL foreign key violation
      if (dbError.code === '23503') {
        return apiError('Related resource not found', {
          status: 400,
          code: 'INVALID_REFERENCE',
        });
      }
    }

    // Generic error
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return apiInternalError(errorMessage);
  });
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// =============================================================================
// PAGINATION UTILITIES
// =============================================================================

/**
 * Calculate pagination offset and limit
 */
export function getPaginationParams(page: number, page_size: number) {
  const offset = (page - 1) * page_size;
  const limit = page_size;

  return { offset, limit };
}

/**
 * Build pagination meta from query results
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  page_size: number
): PaginationMeta {
  return {
    total,
    page,
    page_size,
    total_pages: Math.ceil(total / page_size),
  };
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate and parse query parameters
 */
export function validateQueryParams<T extends z.ZodTypeAny>(
  schema: T,
  params: Record<string, string | string[] | undefined>
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse<ApiErrorResponse> } {
  const result = schema.safeParse(params);

  if (!result.success) {
    return {
      success: false,
      response: apiValidationError(result.error, 'Invalid query parameters'),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate and parse request body
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  schema: T,
  request: Request
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: NextResponse<ApiErrorResponse> }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        response: apiValidationError(result.error, 'Invalid request body'),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {
      success: false,
      response: apiBadRequest('Invalid JSON body'),
    };
  }
}

/**
 * Validate path parameters
 */
export function validatePathParams<T extends z.ZodTypeAny>(
  schema: T,
  params: Record<string, string | string[]>
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse<ApiErrorResponse> } {
  const result = schema.safeParse(params);

  if (!result.success) {
    return {
      success: false,
      response: apiValidationError(result.error, 'Invalid path parameters'),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate and extract match ID from Next.js 15 route params
 * Handles awaiting params promise and validation in one step
 */
export async function validateMatchIdParams<T extends z.ZodTypeAny>(
  schema: T,
  params: Promise<{ id: string }>
): Promise<z.infer<T>> {
  const resolvedParams = await params;
  const validation = validatePathParams(schema, { id: resolvedParams.id });

  if (!validation.success) {
    throw new Error('Invalid parameters');
  }

  return validation.data;
}
