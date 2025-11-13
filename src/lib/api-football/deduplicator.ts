/**
 * Request Deduplication Layer
 *
 * Prevents "thundering herd" problem where multiple concurrent requests
 * for the same resource trigger multiple API calls.
 *
 * Example:
 * - 10,000 users request /fixtures/12345 at the same moment
 * - Without dedup: 10,000 API calls
 * - With dedup: 1 API call, 9,999 wait for same promise
 *
 * Benefits:
 * - 99.99% reduction in duplicate API calls
 * - Prevents rate limit violations
 * - Lower costs during peak traffic
 * - Works transparently with existing cache layer
 */

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

/**
 * Request Deduplicator
 *
 * Maintains an in-memory registry of in-flight requests.
 * If a request is already pending, subsequent requests wait for the same promise.
 */
class RequestDeduplicator {
  private pending: Map<string, PendingRequest<any>> = new Map();
  private readonly TTL = 5000; // 5 seconds deduplication window

  /**
   * Deduplicate a request
   *
   * @param key - Unique identifier for the request (e.g., cache key)
   * @param fetcher - Function that performs the actual fetch
   * @returns Promise that resolves to the fetched data
   */
  async dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check if an identical request is already in-flight
    const existing = this.pending.get(key);

    if (existing && Date.now() - existing.timestamp < this.TTL) {
      // Request is still valid, reuse the existing promise
      console.log(`[Dedupe HIT] ${key}`);
      return existing.promise as Promise<T>;
    }

    // No existing request or expired, create a new one
    console.log(`[Dedupe MISS] ${key} - initiating fetch`);

    const promise = fetcher().finally(() => {
      // Clean up after completion (success or failure)
      this.pending.delete(key);
    });

    this.pending.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Cleanup stale entries
   *
   * Removes entries that have exceeded the TTL window.
   * Called periodically to prevent memory leaks.
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, req] of this.pending.entries()) {
      if (now - req.timestamp > this.TTL) {
        this.pending.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Dedupe Cleanup] Removed ${cleaned} stale entries`);
    }
  }

  /**
   * Get current statistics
   *
   * Useful for monitoring and debugging.
   */
  getStats() {
    return {
      pendingRequests: this.pending.size,
      oldestRequest: this.getOldestRequestAge(),
    };
  }

  private getOldestRequestAge(): number | null {
    if (this.pending.size === 0) return null;

    const now = Date.now();
    let oldest = 0;

    for (const req of this.pending.values()) {
      const age = now - req.timestamp;
      if (age > oldest) oldest = age;
    }

    return oldest;
  }
}

// Global singleton instance
// One deduplicator per Next.js server instance
export const deduplicator = new RequestDeduplicator();

// Periodic cleanup to prevent memory leaks
// Runs every 10 seconds in background
if (typeof window === 'undefined') {
  // Only run in Node.js environment (not browser)
  setInterval(() => {
    deduplicator.cleanup();
  }, 10000);
}
