# Supabase Cache Optimization Strategy

## Overview

This document describes the adaptive TTL caching strategy implemented to minimize costs for sports competition data in Supabase.

## Problem Statement

Sports data has vastly different update requirements based on match status:
- Live matches need frequent updates (60s)
- Finished matches rarely change (24h+)
- Pre-match data changes moderately (5min-1h)

Using a single TTL for all data leads to either:
- **Too short**: Excessive API calls and costs
- **Too long**: Stale live match data

## Solution: Adaptive TTL

### TTL Strategy

| Match Status | TTL | Rationale |
|--------------|-----|-----------|
| Live (1H, 2H, HT, ET, P) | 60 seconds | Frequent score updates |
| Pre-match (<2h to kickoff) | 5 minutes | Lineup changes possible |
| Pre-match (>2h to kickoff) | 1 hour | Minimal changes expected |
| Finished (FT, AET, PEN) | 24 hours | Historical data, rarely changes |
| Postponed (PST, CANC, ABD, SUSP) | 6 hours | Status may update |
| Default | 1 hour | Safe fallback |

### Implementation

#### 1. Database Schema Changes

**New Columns:**
- `ttl_seconds`: Stores calculated TTL for monitoring
- `is_live`: Fast filtering for live matches
- `last_updated`: Track update frequency

**Optimized Indexes:**
```sql
CREATE INDEX idx_cached_fixtures_league_status_date
ON cached_fixtures(league_id, status, match_date DESC);

CREATE INDEX idx_cached_fixtures_status_expires
ON cached_fixtures(status, expires_at)
WHERE expires_at > NOW();
```

#### 2. Adaptive TTL Function

```typescript
function calculateAdaptiveTTL(fixtures: CachedFixture[]): number {
  // Returns TTL in milliseconds based on fixture status
  // Priority: live > finished > postponed > upcoming soon > default
}
```

#### 3. Automatic Cleanup

**pg_cron Jobs:**
- Hourly cleanup of expired cache (retains 1-2h grace period)
- 6-hourly cache statistics collection for monitoring

**Manual Cleanup:**
```typescript
const result = await triggerCacheCleanup()
// Returns: { deletedFixtures, deletedTeamFixtures, executionTimeMs }
```

## Cost Savings Estimates

### Before Optimization
- Standings page: 20 teams × 10 fixtures = 200 API calls/hour
- Monthly: 200 × 24 × 30 = **144,000 API calls**
- Cost: ~$288/month at $2/1000 calls

### After Optimization
- Finished matches (80%): cached 24h → 200 calls/day
- Live matches (10%): cached 60s → 600 calls/hour during matches
- Pre-match (10%): cached 1h → 200 calls/day
- Monthly estimate: **~30,000 API calls** (80% reduction)
- Cost: ~$60/month (**$228 savings**)

## Monitoring

### Cache Statistics

```typescript
const stats = await getCacheStats()
// Returns:
// - totalFixtures: number
// - liveFixtures: number
// - expiredFixtures: number
// - cacheSizeMb: number
// - avgTtlSeconds: number
```

### Monitoring Table

`cache_monitoring_log` tracks:
- Cache size trends
- Average TTL usage
- Expired entry counts
- Live match frequency

## Database Functions

### `calculate_fixture_ttl(match_status, match_date)`
Calculates optimal TTL in seconds based on status and timing.

### `upsert_cached_fixture(...)`
Upserts fixture with automatic adaptive TTL calculation.

### `clean_expired_cache_enhanced()`
Removes expired cache entries and returns deletion counts.

### `get_cache_stats()`
Returns comprehensive cache statistics for monitoring.

## Best Practices

### 1. Cache Warming
Pre-populate cache before peak times:
```typescript
await refreshTeamFixturesCache(teamIds, leagueId, season)
```

### 2. Stale-While-Revalidate
Serve cached data while refreshing in background:
- Fresh: 0 to `expires_at`
- Stale: `expires_at` to `expires_at + 2h`
- Expired: Beyond stale threshold

### 3. Batch Operations
Always batch API calls with adaptive delays:
- Start: 2s between requests
- On success: Reduce to 2s minimum
- On rate limit: Increase to 10s maximum

### 4. Query Optimization
Use composite indexes for common patterns:
```sql
SELECT * FROM cached_fixtures
WHERE league_id = ? AND status = 'LIVE'
ORDER BY match_date DESC;
```

## Migrations

1. `004_adaptive_ttl_optimization.sql`: Schema changes, functions, indexes
2. `005_pg_cron_cleanup.sql`: Automated cleanup jobs (requires pg_cron extension)

## Future Optimizations

### Short-term
- [ ] Implement Redis for live matches (<60s TTL)
- [ ] Add webhook triggers for real-time updates
- [ ] Compress JSONB data (remove redundant fields)

### Medium-term
- [ ] Table partitioning by date ranges
- [ ] Archive matches >30 days to cheaper storage
- [ ] Implement CDN caching for public data

### Long-term
- [ ] Edge function caching (Cloudflare D1)
- [ ] GraphQL subscriptions for live updates
- [ ] ML-based TTL prediction

## Rollback Plan

If issues arise:
1. Revert to single TTL: Set all `ttl_seconds` to 3600
2. Disable pg_cron jobs: `SELECT cron.unschedule('clean-expired-cache-hourly')`
3. Roll back migrations if needed

## Support

For issues or questions:
- Check Supabase logs for pg_cron job failures
- Monitor `cache_monitoring_log` for anomalies
- Use `trigger_manual_cleanup()` for emergency cleanup
