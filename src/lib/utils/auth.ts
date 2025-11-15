/**
 * Authentication utilities for API routes
 */

/**
 * Verify authorization header against CRON_SECRET
 * Used for admin and cron endpoints
 *
 * @param authHeader - Authorization header value
 * @returns true if authorized, false otherwise
 */
export function verifyAdminAuth(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;

  // If no secret is configured, allow access (development mode)
  if (!secret) {
    console.warn('[Auth] CRON_SECRET not configured - allowing access');
    return true;
  }

  // Verify Bearer token format
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return token === secret;
}

/**
 * Get unauthorized response
 */
export function getUnauthorizedResponse() {
  return Response.json(
    {
      error: {
        message: 'Unauthorized - Valid authorization header required',
        code: 'UNAUTHORIZED',
      }
    },
    { status: 401 }
  );
}
