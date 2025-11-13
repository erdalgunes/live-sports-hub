-- Team fixtures cache table for standings form data
-- Stores fixture data for teams to calculate home/away form
-- Reduces API calls by caching fixture responses

CREATE TABLE team_fixtures_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id INTEGER NOT NULL,
  league_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  fixtures JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(team_id, league_id, season)
);

-- Indexes for fast lookups
CREATE INDEX idx_team_fixtures_cache_lookup ON team_fixtures_cache(team_id, league_id, season);
CREATE INDEX idx_team_fixtures_cache_expires ON team_fixtures_cache(expires_at);
CREATE INDEX idx_team_fixtures_cache_league_season ON team_fixtures_cache(league_id, season);

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_team_fixtures_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM team_fixtures_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE team_fixtures_cache IS 'Caches team fixture data to calculate standings form without hitting API rate limits';
COMMENT ON COLUMN team_fixtures_cache.fixtures IS 'Array of fixture objects in JSONB format from API-Football';
COMMENT ON COLUMN team_fixtures_cache.expires_at IS 'Cache expiration time (typically cached_at + 1 hour)';
