-- Migration: API-Football Cache Monitoring
-- Purpose: Track cache performance metrics over time for analytics
-- Created: 2025-01-13

-- ============================================================================
-- Monitoring Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_football_cache_monitoring (
    id SERIAL PRIMARY KEY,

    -- Timestamp for this snapshot
    snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Cache metrics
    total_entries INTEGER NOT NULL,
    valid_entries INTEGER NOT NULL,
    expired_entries INTEGER NOT NULL,
    total_hits BIGINT NOT NULL,
    cache_size_mb NUMERIC(10, 2) NOT NULL,

    -- TTL breakdown (adaptive TTL insights)
    live_entries INTEGER DEFAULT 0,
    finished_entries INTEGER DEFAULT 0,
    upcoming_entries INTEGER DEFAULT 0,

    -- Endpoint breakdown (top 5 most cached endpoints)
    top_endpoints JSONB DEFAULT '[]'::jsonb,

    -- Performance metrics
    avg_hit_count NUMERIC(10, 2) DEFAULT 0,
    cache_hit_rate NUMERIC(5, 2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_cache_monitoring_snapshot
ON api_football_cache_monitoring(snapshot_at DESC);

-- Index for performance analysis
CREATE INDEX IF NOT EXISTS idx_cache_monitoring_hit_rate
ON api_football_cache_monitoring(cache_hit_rate DESC);

-- ============================================================================
-- Functions
-- ============================================================================

-- Record cache snapshot
CREATE OR REPLACE FUNCTION record_cache_snapshot()
RETURNS void AS $$
DECLARE
    v_total_entries INTEGER;
    v_valid_entries INTEGER;
    v_expired_entries INTEGER;
    v_total_hits BIGINT;
    v_cache_size_mb NUMERIC;
    v_avg_hit_count NUMERIC;
    v_top_endpoints JSONB;
    v_live_entries INTEGER;
    v_finished_entries INTEGER;
    v_upcoming_entries INTEGER;
BEGIN
    -- Get basic cache stats
    SELECT
        total_entries::INTEGER,
        valid_entries::INTEGER,
        expired_entries::INTEGER,
        total_hits,
        cache_size_mb
    INTO
        v_total_entries,
        v_valid_entries,
        v_expired_entries,
        v_total_hits,
        v_cache_size_mb
    FROM get_cache_stats();

    -- Calculate average hit count
    SELECT COALESCE(AVG(hit_count), 0)
    INTO v_avg_hit_count
    FROM api_football_cache
    WHERE expires_at > NOW();

    -- Get top 5 endpoints by cache count
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'endpoint', endpoint,
                'count', count,
                'avg_hits', avg_hits
            )
        ),
        '[]'::jsonb
    )
    INTO v_top_endpoints
    FROM (
        SELECT
            endpoint,
            COUNT(*)::INTEGER as count,
            ROUND(AVG(hit_count), 2) as avg_hits
        FROM api_football_cache
        WHERE expires_at > NOW()
        GROUP BY endpoint
        ORDER BY count DESC
        LIMIT 5
    ) top_5;

    -- Count entries by TTL category (based on expires_at)
    -- Live: expires in < 2 minutes
    -- Finished: expires in > 12 hours
    -- Upcoming: everything else
    SELECT
        COUNT(*) FILTER (WHERE expires_at - cached_at < INTERVAL '2 minutes')::INTEGER,
        COUNT(*) FILTER (WHERE expires_at - cached_at > INTERVAL '12 hours')::INTEGER,
        COUNT(*) FILTER (
            WHERE expires_at - cached_at >= INTERVAL '2 minutes'
            AND expires_at - cached_at <= INTERVAL '12 hours'
        )::INTEGER
    INTO v_live_entries, v_finished_entries, v_upcoming_entries
    FROM api_football_cache
    WHERE expires_at > NOW();

    -- Insert snapshot
    INSERT INTO api_football_cache_monitoring (
        snapshot_at,
        total_entries,
        valid_entries,
        expired_entries,
        total_hits,
        cache_size_mb,
        live_entries,
        finished_entries,
        upcoming_entries,
        top_endpoints,
        avg_hit_count,
        cache_hit_rate
    ) VALUES (
        NOW(),
        v_total_entries,
        v_valid_entries,
        v_expired_entries,
        v_total_hits,
        v_cache_size_mb,
        v_live_entries,
        v_finished_entries,
        v_upcoming_entries,
        v_top_endpoints,
        v_avg_hit_count,
        -- Cache hit rate calculation: (total_hits / total_entries) * 100
        -- Avoid division by zero
        CASE
            WHEN v_total_entries > 0
            THEN ROUND((v_total_hits::NUMERIC / v_total_entries) * 100, 2)
            ELSE 0
        END
    );

    RAISE NOTICE 'Cache snapshot recorded: % total, % valid, % expired, % MB',
        v_total_entries, v_valid_entries, v_expired_entries, v_cache_size_mb;
END;
$$ LANGUAGE plpgsql;

-- Get monitoring trends
CREATE OR REPLACE FUNCTION get_cache_trends(
    hours_back INTEGER DEFAULT 24
)
RETURNS TABLE(
    snapshot_at TIMESTAMPTZ,
    total_entries INTEGER,
    valid_entries INTEGER,
    cache_size_mb NUMERIC,
    avg_hit_count NUMERIC,
    cache_hit_rate NUMERIC,
    live_entries INTEGER,
    finished_entries INTEGER,
    upcoming_entries INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.snapshot_at,
        m.total_entries,
        m.valid_entries,
        m.cache_size_mb,
        m.avg_hit_count,
        m.cache_hit_rate,
        m.live_entries,
        m.finished_entries,
        m.upcoming_entries
    FROM api_football_cache_monitoring m
    WHERE m.snapshot_at >= NOW() - (hours_back || ' hours')::INTERVAL
    ORDER BY m.snapshot_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Clean up old monitoring data (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM api_football_cache_monitoring
    WHERE snapshot_at < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RAISE NOTICE 'Cleaned up % old monitoring snapshots', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Row-Level Security (RLS)
-- ============================================================================

ALTER TABLE api_football_cache_monitoring ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to monitoring"
ON api_football_cache_monitoring
FOR SELECT
TO authenticated
USING (true);

-- Allow service role to manage monitoring
CREATE POLICY "Allow service role full access to monitoring"
ON api_football_cache_monitoring
FOR ALL
TO service_role
USING (true);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE api_football_cache_monitoring IS
'Tracks cache performance metrics over time for analytics and optimization';

COMMENT ON COLUMN api_football_cache_monitoring.snapshot_at IS
'Timestamp when this monitoring snapshot was recorded';

COMMENT ON COLUMN api_football_cache_monitoring.total_entries IS
'Total number of cache entries at snapshot time';

COMMENT ON COLUMN api_football_cache_monitoring.valid_entries IS
'Number of non-expired cache entries at snapshot time';

COMMENT ON COLUMN api_football_cache_monitoring.cache_hit_rate IS
'Average number of hits per cache entry (percentage)';

COMMENT ON COLUMN api_football_cache_monitoring.top_endpoints IS
'JSON array of top 5 most cached endpoints with counts';

COMMENT ON FUNCTION record_cache_snapshot() IS
'Records current cache performance metrics for historical analysis';

COMMENT ON FUNCTION get_cache_trends(INTEGER) IS
'Returns cache performance trends for the specified time period';

COMMENT ON FUNCTION cleanup_old_monitoring_data() IS
'Removes monitoring snapshots older than 30 days';
