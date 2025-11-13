-- Migration: Adaptive TTL and Cost Optimization for Sports Competitions
-- Implements dynamic cache TTL based on match status to minimize API costs

-- 1. Add adaptive TTL columns to cached_fixtures
ALTER TABLE cached_fixtures
ADD COLUMN ttl_seconds INTEGER DEFAULT 3600,
ADD COLUMN is_live BOOLEAN DEFAULT FALSE,
ADD COLUMN last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Add adaptive TTL columns to team_fixtures_cache
ALTER TABLE team_fixtures_cache
ADD COLUMN ttl_seconds INTEGER DEFAULT 3600,
ADD COLUMN last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Create optimized composite indexes for common query patterns
CREATE INDEX idx_cached_fixtures_league_status_date
ON cached_fixtures(league_id, status, match_date DESC);

CREATE INDEX idx_cached_fixtures_status_expires
ON cached_fixtures(status, expires_at)
WHERE expires_at > NOW();

CREATE INDEX idx_team_fixtures_league_season_expires
ON team_fixtures_cache(league_id, season, expires_at DESC);

-- 4. Function to calculate adaptive TTL based on match status
CREATE OR REPLACE FUNCTION calculate_fixture_ttl(
  match_status TEXT,
  match_date TIMESTAMP WITH TIME ZONE
)
RETURNS INTEGER AS $$
DECLARE
  time_until_match INTERVAL;
  ttl_seconds INTEGER;
BEGIN
  time_until_match := match_date - NOW();

  -- Live or in-progress matches: 60 seconds
  IF match_status IN ('1H', '2H', 'HT', 'ET', 'P', 'LIVE') THEN
    ttl_seconds := 60;

  -- Finished matches: 24 hours (86400 seconds)
  ELSIF match_status IN ('FT', 'AET', 'PEN') THEN
    ttl_seconds := 86400;

  -- Postponed, cancelled, suspended: 6 hours
  ELSIF match_status IN ('PST', 'CANC', 'ABD', 'SUSP') THEN
    ttl_seconds := 21600;

  -- Pre-match: less than 2 hours away: 5 minutes
  ELSIF time_until_match <= INTERVAL '2 hours' AND time_until_match > INTERVAL '0' THEN
    ttl_seconds := 300;

  -- Pre-match: more than 2 hours away: 1 hour
  ELSIF time_until_match > INTERVAL '2 hours' THEN
    ttl_seconds := 3600;

  -- Default: 1 hour
  ELSE
    ttl_seconds := 3600;
  END IF;

  RETURN ttl_seconds;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Function to update fixture cache with adaptive TTL
CREATE OR REPLACE FUNCTION upsert_cached_fixture(
  p_fixture_id INTEGER,
  p_fixture_data JSONB,
  p_league_id INTEGER,
  p_status TEXT,
  p_match_date TIMESTAMP WITH TIME ZONE
)
RETURNS void AS $$
DECLARE
  v_ttl_seconds INTEGER;
  v_is_live BOOLEAN;
BEGIN
  -- Calculate adaptive TTL
  v_ttl_seconds := calculate_fixture_ttl(p_status, p_match_date);
  v_is_live := p_status IN ('1H', '2H', 'HT', 'ET', 'P', 'LIVE');

  -- Upsert with adaptive TTL
  INSERT INTO cached_fixtures (
    fixture_id,
    fixture_data,
    league_id,
    status,
    match_date,
    cached_at,
    expires_at,
    ttl_seconds,
    is_live,
    last_updated
  ) VALUES (
    p_fixture_id,
    p_fixture_data,
    p_league_id,
    p_status,
    p_match_date,
    NOW(),
    NOW() + (v_ttl_seconds || ' seconds')::INTERVAL,
    v_ttl_seconds,
    v_is_live,
    NOW()
  )
  ON CONFLICT (fixture_id) DO UPDATE SET
    fixture_data = EXCLUDED.fixture_data,
    status = EXCLUDED.status,
    match_date = EXCLUDED.match_date,
    cached_at = NOW(),
    expires_at = NOW() + (v_ttl_seconds || ' seconds')::INTERVAL,
    ttl_seconds = v_ttl_seconds,
    is_live = v_is_live,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- 6. Enhanced cleanup function with archiving
CREATE OR REPLACE FUNCTION clean_expired_cache_enhanced()
RETURNS TABLE(
  deleted_fixtures INTEGER,
  deleted_team_fixtures INTEGER
) AS $$
DECLARE
  v_deleted_fixtures INTEGER;
  v_deleted_team_fixtures INTEGER;
BEGIN
  -- Delete expired cached_fixtures
  WITH deleted AS (
    DELETE FROM cached_fixtures
    WHERE expires_at < NOW() - INTERVAL '1 hour'
    RETURNING *
  )
  SELECT COUNT(*) INTO v_deleted_fixtures FROM deleted;

  -- Delete expired team_fixtures_cache
  WITH deleted AS (
    DELETE FROM team_fixtures_cache
    WHERE expires_at < NOW() - INTERVAL '2 hours'
    RETURNING *
  )
  SELECT COUNT(*) INTO v_deleted_team_fixtures FROM deleted;

  RETURN QUERY SELECT v_deleted_fixtures, v_deleted_team_fixtures;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to get cache statistics
CREATE OR REPLACE FUNCTION get_cache_stats()
RETURNS TABLE(
  total_fixtures INTEGER,
  live_fixtures INTEGER,
  expired_fixtures INTEGER,
  cache_size_mb NUMERIC,
  avg_ttl_seconds NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_fixtures,
    COUNT(*) FILTER (WHERE is_live = TRUE)::INTEGER as live_fixtures,
    COUNT(*) FILTER (WHERE expires_at < NOW())::INTEGER as expired_fixtures,
    ROUND(pg_total_relation_size('cached_fixtures')::NUMERIC / 1024 / 1024, 2) as cache_size_mb,
    ROUND(AVG(ttl_seconds), 0) as avg_ttl_seconds
  FROM cached_fixtures;
END;
$$ LANGUAGE plpgsql;

-- 8. Add comments for documentation
COMMENT ON COLUMN cached_fixtures.ttl_seconds IS 'Adaptive TTL in seconds based on match status (60s live, 24h finished, 1h default)';
COMMENT ON COLUMN cached_fixtures.is_live IS 'Indicates if match is currently live for faster filtering';
COMMENT ON COLUMN cached_fixtures.last_updated IS 'Last time the cache entry was updated';
COMMENT ON FUNCTION calculate_fixture_ttl IS 'Calculates optimal TTL based on match status and time until match';
COMMENT ON FUNCTION upsert_cached_fixture IS 'Upserts fixture with automatic adaptive TTL calculation';
COMMENT ON FUNCTION clean_expired_cache_enhanced IS 'Enhanced cleanup function that removes expired cache entries';
COMMENT ON FUNCTION get_cache_stats IS 'Returns cache statistics for monitoring and optimization';

-- 9. Update existing cache entries with default TTL
UPDATE cached_fixtures
SET ttl_seconds = 3600,
    is_live = (status IN ('1H', '2H', 'HT', 'ET', 'P', 'LIVE')),
    last_updated = NOW()
WHERE ttl_seconds IS NULL;

UPDATE team_fixtures_cache
SET ttl_seconds = 3600,
    last_updated = NOW()
WHERE ttl_seconds IS NULL;
