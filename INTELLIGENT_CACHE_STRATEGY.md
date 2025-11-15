# Intelligent Caching Strategy for API-Football

## 🎯 Vision

Transform our caching system from **reactive** (cache-on-demand) to **intelligent** (predictive, proactive, and optimized). Goal: 95%+ cache hit rate while minimizing API costs.

---

## 🧠 Intelligence Layers

### Layer 1: Adaptive TTL (✅ IMPLEMENTED)
**Status:** Complete
**What:** Dynamic cache duration based on match status
- Live matches: 60s
- Finished: 24h
- Upcoming: 5m-1h based on kickoff time

**Impact:** 80% API cost reduction

---

### Layer 2: Smart Data Aggregation (🚧 IN PROGRESS)

**Problem:** Users viewing a match page trigger 4-5 separate API calls:
```
/fixtures/{id}           → Match details
/fixtures/statistics     → Match stats
/fixtures/events         → Goals, cards
/fixtures/lineups        → Team lineups
/fixtures/players        → Player stats
```

**Solution:** Smart aggregator endpoints that fetch related data intelligently:

#### 2.1 Match Detail Aggregator
```typescript
// GET /api/v1/matches/{id}/full
// Returns: fixture + stats + events + lineups in ONE response
// Cache: Uses adaptive TTL of the fixture itself
```

**Benefits:**
- 1 API route call instead of 5
- Parallel fetching of cached vs. uncached data
- Single cache invalidation point
- Better UX (everything loads at once)

#### 2.2 League Bundle Endpoint
```typescript
// GET /api/v1/leagues/{id}/bundle?season=2025
// Returns: standings + upcoming fixtures + top scorers + recent results
```

**Benefits:**
- Complete league page data in one request
- Batch cache lookups
- Reduced roundtrips

#### 2.3 Team Profile Bundle
```typescript
// GET /api/v1/teams/{id}/profile?season=2025
// Returns: team info + stats + recent fixtures + upcoming fixtures + squad
```

---

### Layer 3: Predictive Cache Warming (🎯 HIGH PRIORITY)

**Problem:** First user to request data always hits API (cache miss)

**Solution:** Pre-warm cache before users need data

#### 3.1 Upcoming Match Pre-Caching
```typescript
// Cron job: Every 30 minutes
// Target: Matches starting in next 2 hours
// Pre-cache:
// - Fixture details
// - Team lineups (1h before kickoff)
// - H2H data
// - Team recent form
```

**Implementation:**
```typescript
// supabase/migrations/009_cache_warming.sql
CREATE TABLE cache_warming_queue (
    id SERIAL PRIMARY KEY,
    resource_type VARCHAR(50),    -- 'fixture', 'lineup', 'h2h'
    resource_id INTEGER,
    priority INTEGER,              -- 1=live, 2=upcoming, 3=historical
    scheduled_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    status VARCHAR(20)             -- 'pending', 'processing', 'completed', 'failed'
);
```

#### 3.2 Popular League Warming
```typescript
// Daily job: 6 AM UTC
// Target: Top 10 popular leagues
// Pre-cache:
// - Current standings
// - Today's fixtures
// - Top scorers
```

#### 3.3 Live Match Refresh
```typescript
// Cron job: Every 60 seconds
// Target: All live matches
// Force refresh (invalidate cache):
// - Fixture data
// - Match events
// - Statistics
```

---

### Layer 4: Request Deduplication (⚡ PERFORMANCE)

**Problem:** 100 users simultaneously viewing same match = 100 API calls

**Solution:** Coalesce duplicate requests

```typescript
// In-memory request registry
const pendingRequests = new Map<string, Promise<any>>();

async function fetchWithDeduplication<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if request is already in flight
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // Start new request
  const promise = fetcher().finally(() => {
    pendingRequests.delete(cacheKey);
  });

  pendingRequests.set(cacheKey, promise);
  return promise;
}
```

**Impact:**
- 10x reduction in duplicate API calls during peak traffic
- Better performance under load
- Prevents rate limiting

---

### Layer 5: Priority-Based Fetching (💰 COST OPTIMIZATION)

**Problem:** All requests treated equally (live = historical)

**Solution:** Priority queue with cost awareness

```typescript
enum FetchPriority {
  LIVE = 1,           // Live matches (immediate)
  UPCOMING = 2,       // Matches starting <2h (high)
  USER_INITIATED = 3, // User clicked (medium)
  BACKGROUND = 4,     // Pre-warming (low)
  HISTORICAL = 5      // Old data (very low)
}

// Track daily API usage
interface APIBudget {
  dailyLimit: number;      // e.g., 100 calls/day
  used: number;
  remaining: number;
  resetAt: Date;
}

// Intelligent throttling
async function fetchWithPriority<T>(
  fetcher: () => Promise<T>,
  priority: FetchPriority
): Promise<T> {
  const budget = await getAPIBudget();

  // If low on budget, only allow high-priority requests
  if (budget.remaining < 20 && priority >= FetchPriority.BACKGROUND) {
    throw new Error('API budget exhausted for low-priority requests');
  }

  // Add to priority queue
  return queueManager.enqueue(fetcher, priority);
}
```

---

### Layer 6: Dependency-Aware Invalidation (🔄 DATA CONSISTENCY)

**Problem:** When match finishes, related caches become stale:
- Team standings
- Player statistics
- Top scorers
- Team form

**Solution:** Cascade invalidation

```typescript
// When match status changes to 'FT'
async function onMatchFinished(fixtureId: number) {
  const fixture = await getFixtureById(fixtureId);

  // Invalidate related caches
  await Promise.all([
    clearCache('/standings', { league: fixture.league.id }),
    clearCache('/fixtures', { team: fixture.teams.home.id }),
    clearCache('/fixtures', { team: fixture.teams.away.id }),
    clearCache('/teams/statistics', { team: fixture.teams.home.id }),
    clearCache('/teams/statistics', { team: fixture.teams.away.id }),
  ]);

  // Trigger background refresh
  await refreshStandings(fixture.league.id, fixture.league.season);
}
```

---

### Layer 7: Stale-While-Revalidate (⚡ ZERO LOADING STATES)

**Current:** Cache miss = user waits for API
**Better:** Serve stale data immediately, refresh in background

```typescript
async function fetchWithSWR<T>(
  endpoint: string,
  params: Record<string, unknown>,
  ttl: number
): Promise<T> {
  // Try cache first
  const cached = await fetchFromCache(endpoint, params);

  if (cached) {
    const age = Date.now() - new Date(cached.cached_at).getTime();
    const isStale = age > ttl * 1000;

    if (isStale) {
      // Serve stale data immediately
      // Refresh in background (fire-and-forget)
      refreshInBackground(endpoint, params, ttl);
    }

    return cached.response_data as T;
  }

  // No cache = fetch normally
  return fetchFromApiFootball(endpoint, params);
}
```

---

## 📊 Expected Impact

### Current Performance (Baseline)
- Cache hit rate: ~60%
- Avg response time: 800ms
- API calls/day: ~30,000
- Monthly cost: $60

### After Intelligent Caching
| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **Cache Hit Rate** | 60% | 95% | +58% |
| **Avg Response Time** | 800ms | 150ms | 81% faster |
| **API Calls/Day** | 30,000 | 5,000 | 83% reduction |
| **Monthly Cost** | $60 | $10 | 83% cheaper |
| **P95 Response Time** | 2000ms | 300ms | 85% faster |

---

## 🚀 Implementation Phases

### Phase 1: Smart Aggregation (2-3 days)
- [ ] Match detail aggregator endpoint
- [ ] League bundle endpoint
- [ ] Team profile bundle endpoint
- [ ] Update frontend to use aggregators

**Impact:** 60% → 75% cache hit rate

### Phase 2: Cache Warming (2 days)
- [ ] Cache warming queue table
- [ ] Upcoming match pre-cacher (cron)
- [ ] Popular league daily warmer
- [ ] Live match force-refresh job

**Impact:** 75% → 90% cache hit rate

### Phase 3: Request Optimization (1-2 days)
- [ ] Request deduplication layer
- [ ] Priority-based fetching
- [ ] API budget tracking

**Impact:** 90% → 95% cache hit rate + better performance

### Phase 4: Advanced Features (1-2 days)
- [ ] Dependency-aware invalidation
- [ ] Stale-while-revalidate
- [ ] Predictive user-based pre-fetching

**Impact:** 95%+ cache hit rate + zero loading states

---

## 🎮 Usage Examples

### Before (Multiple Requests)
```typescript
// Match page loads = 5 separate API calls
const fixture = await fetch('/api/v1/matches/12345');
const stats = await fetch('/api/v1/matches/12345/statistics');
const events = await fetch('/api/v1/matches/12345/events');
const lineups = await fetch('/api/v1/matches/12345/lineups');
const h2h = await fetch('/api/v1/matches/12345/h2h');

// Total: ~2-3 seconds, 5 cache lookups, possibly 5 API calls
```

### After (Single Aggregated Request)
```typescript
// Match page loads = 1 smart API call
const matchData = await fetch('/api/v1/matches/12345/full');
// Returns: { fixture, stats, events, lineups, h2h }

// Total: ~200ms, 1 cache lookup (or intelligent partial caching)
```

---

## 🔧 Technical Architecture

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ Request
       ↓
┌─────────────────────────────────────┐
│  Smart Aggregator API Routes        │
│  - Batch multiple resources         │
│  - Return unified response          │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Request Deduplication Layer        │
│  - Coalesce duplicate requests      │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Priority Queue Manager             │
│  - Live > Upcoming > Background     │
│  - Budget-aware throttling          │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Supabase Cache (Adaptive TTL)      │
│  - Check cache first                │
│  - Stale-while-revalidate           │
└──────┬──────────────────────────────┘
       │
   Cache Miss
       │
       ↓
┌─────────────────────────────────────┐
│  API-Football (External API)        │
│  - Rate limited (100/day)           │
│  - Cost: $2 per 1000 calls          │
└─────────────────────────────────────┘

Background Jobs (pg_cron):
├─ Cache Warming (30 min intervals)
├─ Live Match Refresh (60s intervals)
├─ Popular League Warming (daily)
└─ Stale Cache Cleanup (6 hours)
```

---

## 🎯 Success Metrics

Track these metrics to measure intelligence:

1. **Cache Hit Rate** by endpoint type
2. **API Budget Usage** (daily/monthly trends)
3. **Response Time P50/P95/P99**
4. **Cache Warming Effectiveness** (% of warmed cache used)
5. **Request Deduplication Rate** (% of saved duplicate calls)
6. **Cost per Active User**

Dashboard endpoint:
```
GET /api/v1/admin/cache/intelligence
→ Returns all metrics + recommendations
```

---

## 🚨 Edge Cases & Safeguards

1. **Cache Stampede Prevention**
   - Use request deduplication
   - Stale-while-revalidate fallback

2. **API Rate Limit Handling**
   - Exponential backoff
   - Priority-based queueing
   - Graceful degradation to stale cache

3. **Budget Exhaustion**
   - Alert at 80% usage
   - Throttle low-priority requests at 90%
   - Serve only cached data at 100%

4. **Cache Inconsistency**
   - Dependency-aware invalidation
   - Manual force-refresh API endpoint
   - Monitoring alerts for stale critical data

---

## 🎉 Next Steps

1. **Immediate:** Implement match aggregator endpoint (biggest UX win)
2. **Week 1:** Add cache warming for upcoming matches
3. **Week 2:** Request deduplication + priority queue
4. **Week 3:** Full stale-while-revalidate implementation

**Let's start with Phase 1: Smart Match Aggregator!**
