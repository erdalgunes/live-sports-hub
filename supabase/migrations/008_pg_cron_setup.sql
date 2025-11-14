-- Migration: pg_cron Setup for Automated Cache Maintenance
-- Purpose: Schedule automated cleanup and monitoring tasks
-- Created: 2025-01-13

-- ============================================================================
-- Enable pg_cron Extension
-- ============================================================================

-- Note: pg_cron must be enabled by a superuser
-- For Supabase hosted projects, pg_cron is pre-installed
-- For local development, ensure pg_cron is available

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- Constants: Job Names
-- ============================================================================

CREATE OR REPLACE FUNCTION get_cache_job_names()
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY['cleanup-expired-cache', 'record-cache-snapshot', 'cleanup-old-monitoring'];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- Schedule: Cache Cleanup (Every 6 Hours)
-- ============================================================================

DO $$
DECLARE
    v_cache_jobs CONSTANT TEXT[] := get_cache_job_names();
    v_job_cleanup_cache CONSTANT TEXT := v_cache_jobs[1];
    v_job_cache_snapshot CONSTANT TEXT := v_cache_jobs[2];
    v_job_cleanup_monitoring CONSTANT TEXT := v_cache_jobs[3];
BEGIN
    -- Unschedule if exists (for migration idempotency)
    PERFORM cron.unschedule(v_job_cleanup_cache)
    WHERE EXISTS (
        SELECT 1 FROM cron.job WHERE jobname = v_job_cleanup_cache
    );

    -- Schedule: Remove expired cache entries every 6 hours
    PERFORM cron.schedule(
        v_job_cleanup_cache,
        '0 */6 * * *',
        $$SELECT cleanup_expired_cache()$$
    );

    -- ============================================================================
    -- Schedule: Cache Monitoring Snapshots (Every Hour)
    -- ============================================================================

    -- Unschedule if exists
    PERFORM cron.unschedule(v_job_cache_snapshot)
    WHERE EXISTS (
        SELECT 1 FROM cron.job WHERE jobname = v_job_cache_snapshot
    );

    -- Schedule: Record cache performance snapshot every hour
    PERFORM cron.schedule(
        v_job_cache_snapshot,
        '0 * * * *',
        $$SELECT record_cache_snapshot()$$
    );

    -- ============================================================================
    -- Schedule: Monitoring Data Cleanup (Daily at Midnight)
    -- ============================================================================

    -- Unschedule if exists
    PERFORM cron.unschedule(v_job_cleanup_monitoring)
    WHERE EXISTS (
        SELECT 1 FROM cron.job WHERE jobname = v_job_cleanup_monitoring
    );

    -- Schedule: Clean up monitoring data older than 30 days (daily at midnight UTC)
    PERFORM cron.schedule(
        v_job_cleanup_monitoring,
        '0 0 * * *',
        $$SELECT cleanup_old_monitoring_data()$$
    );
END $$;

COMMENT ON EXTENSION pg_cron IS
'Schedules automated cache cleanup and monitoring tasks';

-- ============================================================================
-- View Scheduled Jobs
-- ============================================================================

-- Create a view to easily check scheduled jobs
CREATE OR REPLACE VIEW cache_cron_jobs AS
SELECT
    jobid,
    jobname,
    schedule,
    command,
    nodename,
    nodeport,
    database,
    username,
    active
FROM cron.job
WHERE jobname = ANY(get_cache_job_names())
ORDER BY jobname;

COMMENT ON VIEW cache_cron_jobs IS
'View of all cache-related cron jobs for easy monitoring';

-- ============================================================================
-- Helper Function: Get Cron Job Status
-- ============================================================================

CREATE OR REPLACE FUNCTION get_cache_cron_status()
RETURNS TABLE(
    job_name TEXT,
    schedule TEXT,
    is_active BOOLEAN,
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    run_count BIGINT
) AS $$
DECLARE
    v_cache_jobs CONSTANT TEXT[] := get_cache_job_names();
BEGIN
    RETURN QUERY
    SELECT
        j.jobname::TEXT as job_name,
        j.schedule::TEXT,
        j.active as is_active,
        (
            SELECT MAX(start_time)
            FROM cron.job_run_details
            WHERE jobid = j.jobid
        ) as last_run,
        -- Calculate next run (simplified - assumes cron is running)
        CASE
            WHEN j.active THEN NOW() + INTERVAL '1 hour'  -- Approximate
            ELSE NULL
        END as next_run,
        (
            SELECT COUNT(*)
            FROM cron.job_run_details
            WHERE jobid = j.jobid
        ) as run_count
    FROM cron.job j
    WHERE j.jobname = ANY(v_cache_jobs)
    ORDER BY j.jobname;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_cache_cron_status() IS
'Returns status and execution history of cache-related cron jobs';

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Use cache_cron_jobs view to list all scheduled jobs
-- Use get_cache_cron_status() function to get job execution history
-- Test functions: cleanup_expired_cache(), record_cache_snapshot(), cleanup_old_monitoring_data()

-- ============================================================================
-- Notes
-- ============================================================================

-- Cron Schedule Format:
-- ┌───────────── minute (0 - 59)
-- │ ┌───────────── hour (0 - 23)
-- │ │ ┌───────────── day of the month (1 - 31)
-- │ │ │ ┌───────────── month (1 - 12)
-- │ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
-- │ │ │ │ │
-- * * * * *

-- Examples:
-- '0 */6 * * *'  = Every 6 hours at minute 0
-- '0 * * * *'    = Every hour at minute 0
-- '0 0 * * *'    = Every day at midnight
-- '*/15 * * * *' = Every 15 minutes

-- Troubleshooting:
-- If jobs are not running, check:
-- 1. pg_cron extension is enabled
-- 2. Jobs are active in the cache_cron_jobs table
-- 3. Job run history in cron.job_run_details table (ordered by start_time)
-- 4. Check database logs for errors
