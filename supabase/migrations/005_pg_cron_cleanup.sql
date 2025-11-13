-- Migration: pg_cron Setup for Automatic Cache Cleanup
-- Schedules automatic cleanup jobs to remove expired cache entries

-- 1. Enable pg_cron extension (must be done by Supabase admin)
-- Note: pg_cron is available in Supabase Pro and above
-- This will fail gracefully if not available
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron extension not available. Cleanup must be triggered manually or via external cron job.';
END $$;

-- 2. Schedule cleanup job to run every hour
-- This removes cache entries that have been expired for more than 1-2 hours
SELECT cron.schedule(
  'clean-expired-cache-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$SELECT clean_expired_cache_enhanced()$$
);

-- 3. Schedule cache statistics collection (for monitoring)
-- Runs every 6 hours to track cache performance
SELECT cron.schedule(
  'cache-stats-collection',
  '0 */6 * * *', -- Every 6 hours
  $$
  INSERT INTO cache_monitoring_log (
    total_fixtures,
    live_fixtures,
    expired_fixtures,
    cache_size_mb,
    avg_ttl_seconds,
    recorded_at
  )
  SELECT
    total_fixtures,
    live_fixtures,
    expired_fixtures,
    cache_size_mb,
    avg_ttl_seconds,
    NOW()
  FROM get_cache_stats()
  $$
);

-- 4. Create monitoring log table (optional but useful)
CREATE TABLE IF NOT EXISTS cache_monitoring_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_fixtures INTEGER,
  live_fixtures INTEGER,
  expired_fixtures INTEGER,
  cache_size_mb NUMERIC,
  avg_ttl_seconds NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for time-series queries
CREATE INDEX idx_cache_monitoring_recorded_at
ON cache_monitoring_log(recorded_at DESC);

-- 5. Function to manually trigger cleanup (for testing or emergency cleanup)
CREATE OR REPLACE FUNCTION trigger_manual_cleanup()
RETURNS TABLE(
  deleted_fixtures INTEGER,
  deleted_team_fixtures INTEGER,
  execution_time_ms INTEGER
) AS $$
DECLARE
  v_start_time TIMESTAMP;
  v_end_time TIMESTAMP;
  v_deleted_fixtures INTEGER;
  v_deleted_team_fixtures INTEGER;
BEGIN
  v_start_time := clock_timestamp();

  SELECT * INTO v_deleted_fixtures, v_deleted_team_fixtures
  FROM clean_expired_cache_enhanced();

  v_end_time := clock_timestamp();

  RETURN QUERY SELECT
    v_deleted_fixtures,
    v_deleted_team_fixtures,
    EXTRACT(MILLISECONDS FROM (v_end_time - v_start_time))::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- 6. Add comments
COMMENT ON TABLE cache_monitoring_log IS 'Tracks cache statistics over time for performance monitoring';
COMMENT ON FUNCTION trigger_manual_cleanup IS 'Manually triggers cache cleanup and returns statistics';

-- 7. Grant permissions (adjust based on your security model)
-- GRANT USAGE ON SCHEMA cron TO authenticated;
-- GRANT EXECUTE ON FUNCTION clean_expired_cache_enhanced TO authenticated;
-- GRANT EXECUTE ON FUNCTION trigger_manual_cleanup TO authenticated;
