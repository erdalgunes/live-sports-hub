/**
 * API-Football Metrics & Monitoring
 *
 * Tracks request patterns, cache effectiveness, and deduplication performance.
 * Useful for debugging and optimization.
 */

interface MetricEntry {
  timestamp: number;
  type: 'dedupe_hit' | 'dedupe_miss' | 'cache_hit' | 'cache_miss' | 'api_call';
  endpoint: string;
  duration?: number;
}

class ApiMetrics {
  private metrics: MetricEntry[] = [];
  private readonly MAX_METRICS = 1000; // Keep last 1000 metrics in memory

  /**
   * Log a deduplication event
   */
  logDedup(key: string, hit: boolean) {
    this.addMetric({
      timestamp: Date.now(),
      type: hit ? 'dedupe_hit' : 'dedupe_miss',
      endpoint: key,
    });

    if (hit) {
      console.log(`[Metrics] ✅ Dedupe HIT - ${key}`);
    } else {
      console.log(`[Metrics] 🔄 Dedupe MISS - ${key}`);
    }
  }

  /**
   * Log a cache event
   */
  logCache(endpoint: string, hit: boolean, ttl?: number) {
    this.addMetric({
      timestamp: Date.now(),
      type: hit ? 'cache_hit' : 'cache_miss',
      endpoint,
    });

    if (hit) {
      console.log(`[Metrics] 💾 Cache HIT - ${endpoint}`);
    } else {
      console.log(`[Metrics] ❌ Cache MISS - ${endpoint} (will fetch from API)`);
    }
  }

  /**
   * Log an API call
   */
  logApiCall(endpoint: string, duration: number) {
    this.addMetric({
      timestamp: Date.now(),
      type: 'api_call',
      endpoint,
      duration,
    });

    console.log(`[Metrics] 🌐 API Call - ${endpoint} (${duration}ms)`);
  }

  /**
   * Get statistics for the last N minutes
   */
  getStats(minutes: number = 5) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.metrics.filter((m) => m.timestamp >= cutoff);

    const dedupeHits = recentMetrics.filter((m) => m.type === 'dedupe_hit').length;
    const dedupeMisses = recentMetrics.filter((m) => m.type === 'dedupe_miss').length;
    const cacheHits = recentMetrics.filter((m) => m.type === 'cache_hit').length;
    const cacheMisses = recentMetrics.filter((m) => m.type === 'cache_miss').length;
    const apiCalls = recentMetrics.filter((m) => m.type === 'api_call').length;

    const totalRequests = dedupeHits + dedupeMisses;
    const dedupeRate = totalRequests > 0 ? (dedupeHits / totalRequests) * 100 : 0;

    const totalCacheChecks = cacheHits + cacheMisses;
    const cacheHitRate = totalCacheChecks > 0 ? (cacheHits / totalCacheChecks) * 100 : 0;

    const apiCallMetrics = recentMetrics.filter((m) => m.type === 'api_call' && m.duration);
    const avgApiDuration =
      apiCallMetrics.length > 0
        ? apiCallMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / apiCallMetrics.length
        : 0;

    return {
      timeWindow: `Last ${minutes} minutes`,
      deduplication: {
        hits: dedupeHits,
        misses: dedupeMisses,
        total: totalRequests,
        rate: `${dedupeRate.toFixed(2)}%`,
      },
      cache: {
        hits: cacheHits,
        misses: cacheMisses,
        total: totalCacheChecks,
        hitRate: `${cacheHitRate.toFixed(2)}%`,
      },
      api: {
        calls: apiCalls,
        avgDuration: `${avgApiDuration.toFixed(0)}ms`,
      },
      cost: {
        savedByDedup: dedupeHits,
        savedByCache: cacheHits,
        totalSaved: dedupeHits + cacheHits,
        actualApiCalls: apiCalls,
        savingsRate: totalRequests > 0 ? `${(((dedupeHits + cacheHits) / totalRequests) * 100).toFixed(2)}%` : '0%',
      },
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = [];
    console.log('[Metrics] Reset all metrics');
  }

  /**
   * Get raw metrics (for debugging)
   */
  getRawMetrics() {
    return [...this.metrics];
  }

  private addMetric(metric: MetricEntry) {
    this.metrics.push(metric);

    // Keep only last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }
}

// Global singleton instance
export const metrics = new ApiMetrics();

// Expose metrics to global scope for debugging (Node.js only)
if (globalThis.window === undefined && globalThis !== undefined) {
  (globalThis as { __apiMetrics?: ApiMetrics }).__apiMetrics = metrics;
}

/**
 * Print metrics summary to console
 */
export function printMetricsSummary(minutes: number = 5) {
  const stats = metrics.getStats(minutes);

  console.log('\n📊 API-Football Metrics Summary');
  console.log('================================');
  console.log(`Time Window: ${stats.timeWindow}`);
  console.log('\n🔄 Request Deduplication:');
  console.log(`  - Hits: ${stats.deduplication.hits}`);
  console.log(`  - Misses: ${stats.deduplication.misses}`);
  console.log(`  - Total: ${stats.deduplication.total}`);
  console.log(`  - Rate: ${stats.deduplication.rate}`);
  console.log('\n💾 Cache Performance:');
  console.log(`  - Hits: ${stats.cache.hits}`);
  console.log(`  - Misses: ${stats.cache.misses}`);
  console.log(`  - Total: ${stats.cache.total}`);
  console.log(`  - Hit Rate: ${stats.cache.hitRate}`);
  console.log('\n🌐 API Calls:');
  console.log(`  - Total: ${stats.api.calls}`);
  console.log(`  - Avg Duration: ${stats.api.avgDuration}`);
  console.log('\n💰 Cost Savings:');
  console.log(`  - Saved by Dedup: ${stats.cost.savedByDedup} calls`);
  console.log(`  - Saved by Cache: ${stats.cost.savedByCache} calls`);
  console.log(`  - Total Saved: ${stats.cost.totalSaved} calls`);
  console.log(`  - Actual API Calls: ${stats.cost.actualApiCalls}`);
  console.log(`  - Savings Rate: ${stats.cost.savingsRate}`);
  console.log('================================\n');
}
