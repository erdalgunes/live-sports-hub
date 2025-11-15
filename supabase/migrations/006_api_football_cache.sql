-- Migration: API-Football Cache Table
-- Purpose: Store cached API-Football responses with TTL-based invalidation
-- Created: 2025-01-13

-- ============================================================================
-- Cache Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_football_cache (
    id SERIAL PRIMARY KEY,

    -- Cache key components
    endpoint VARCHAR(255) NOT NULL,
    params_hash TEXT NOT NULL,

    -- Cached response data
    response_data JSONB NOT NULL,

    -- Cache metadata
    cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    hit_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint on endpoint + params
    CONSTRAINT unique_cache_key UNIQUE (endpoint, params_hash)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_api_football_cache_lookup
ON api_football_cache(endpoint, params_hash);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_api_football_cache_expires
ON api_football_cache(expires_at);

-- Index for cache hit tracking
CREATE INDEX IF NOT EXISTS idx_api_football_cache_hits
ON api_football_cache(hit_count DESC);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_api_football_cache_updated_at
    BEFORE UPDATE ON api_football_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Functions
-- ============================================================================

-- Clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM api_football_cache
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RAISE NOTICE 'Cleaned up % expired cache entries', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Get cache statistics
CREATE OR REPLACE FUNCTION get_cache_stats()
RETURNS TABLE(
    total_entries BIGINT,
    valid_entries BIGINT,
    expired_entries BIGINT,
    total_hits BIGINT,
    cache_size_mb NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_entries,
        COUNT(*) FILTER (WHERE expires_at > NOW()) AS valid_entries,
        COUNT(*) FILTER (WHERE expires_at <= NOW()) AS expired_entries,
        COALESCE(SUM(hit_count), 0) AS total_hits,
        ROUND(
            pg_total_relation_size('api_football_cache')::NUMERIC / 1024 / 1024,
            2
        ) AS cache_size_mb
    FROM api_football_cache;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Row-Level Security (RLS)
-- ============================================================================

ALTER TABLE api_football_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to cache"
ON api_football_cache
FOR SELECT
TO authenticated
USING (true);

-- Allow service role to manage cache
CREATE POLICY "Allow service role full access"
ON api_football_cache
FOR ALL
TO service_role
USING (true);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE api_football_cache IS
'Caches API-Football responses with TTL-based invalidation to reduce API calls';

COMMENT ON COLUMN api_football_cache.endpoint IS
'API-Football endpoint path (e.g., /fixtures, /standings)';

COMMENT ON COLUMN api_football_cache.params_hash IS
'Hash of request parameters for cache key uniqueness';

COMMENT ON COLUMN api_football_cache.response_data IS
'Cached JSON response from API-Football';

COMMENT ON COLUMN api_football_cache.expires_at IS
'Expiration timestamp for cache invalidation';

COMMENT ON COLUMN api_football_cache.hit_count IS
'Number of times this cache entry has been used';

COMMENT ON FUNCTION cleanup_expired_cache() IS
'Removes all expired cache entries and returns count deleted';

COMMENT ON FUNCTION get_cache_stats() IS
'Returns cache statistics including size and hit counts';
