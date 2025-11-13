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
-- Schedule: Cache Cleanup (Every 6 Hours)
-- ============================================================================

-- Unschedule if exists (for migration idempotency)
SELECT cron.unschedule('cleanup-expired-cache')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-cache'
);

-- Schedule: Remove expired cache entries every 6 hours
SELECT cron.schedule(
    'cleanup-expired-cache',           -- Job name
    '0 */6 * * *',                     -- Cron schedule (every 6 hours)
    $$SELECT cleanup_expired_cache()$$ -- SQL command
);

COMMENT ON EXTENSION pg_cron IS
'Schedules automated cache cleanup and monitoring tasks';

-- ============================================================================
-- Schedule: Cache Monitoring Snapshots (Every Hour)
-- ============================================================================

-- Unschedule if exists
SELECT cron.unschedule('record-cache-snapshot')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'record-cache-snapshot'
);

-- Schedule: Record cache performance snapshot every hour
SELECT cron.schedule(
    'record-cache-snapshot',            -- Job name
    '0 * * * *',                        -- Cron schedule (every hour)
    $$SELECT record_cache_snapshot()$$  -- SQL command
);

-- ============================================================================
-- Schedule: Monitoring Data Cleanup (Daily at Midnight)
-- ============================================================================

-- Unschedule if exists
SELECT cron.unschedule('cleanup-old-monitoring')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-monitoring'
);

-- Schedule: Clean up monitoring data older than 30 days (daily at midnight UTC)
SELECT cron.schedule(
    'cleanup-old-monitoring',                -- Job name
    '0 0 * * *',                             -- Cron schedule (daily at midnight)
    $$SELECT cleanup_old_monitoring_data()$$ -- SQL command
);

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
WHERE jobname IN (
    'cleanup-expired-cache',
    'record-cache-snapshot',
    'cleanup-old-monitoring'
)
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
    WHERE j.jobname IN (
        'cleanup-expired-cache',
        'record-cache-snapshot',
        'cleanup-old-monitoring'
    )
    ORDER BY j.jobname;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_cache_cron_status() IS
'Returns status and execution history of cache-related cron jobs';

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- List all cache cron jobs
-- SELECT * FROM cache_cron_jobs;

-- Get cron job status
-- SELECT * FROM get_cache_cron_status();

-- Manual execution for testing:
-- SELECT cleanup_expired_cache();
-- SELECT record_cache_snapshot();
-- SELECT cleanup_old_monitoring_data();

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
-- 2. Jobs are active: SELECT * FROM cache_cron_jobs;
-- 3. Check job run history: SELECT * FROM cron.job_run_details ORDER BY start_time DESC;
-- 4. Check database logs for errors
