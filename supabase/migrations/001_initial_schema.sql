-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User preferences table (optional auth for POC)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  favorite_leagues INTEGER[] DEFAULT '{}',
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorite matches table
CREATE TABLE favorite_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  fixture_id INTEGER NOT NULL,
  league_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, fixture_id)
);

-- Cached fixtures table (reduce API calls)
CREATE TABLE cached_fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id INTEGER UNIQUE NOT NULL,
  fixture_data JSONB NOT NULL,
  league_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Popular leagues table (curated list for POC)
CREATE TABLE popular_leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id INTEGER UNIQUE NOT NULL,
  league_name TEXT NOT NULL,
  country TEXT NOT NULL,
  logo_url TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_favorite_matches_user ON favorite_matches(user_id);
CREATE INDEX idx_favorite_matches_fixture ON favorite_matches(fixture_id);
CREATE INDEX idx_cached_fixtures_date ON cached_fixtures(match_date);
CREATE INDEX idx_cached_fixtures_league ON cached_fixtures(league_id);
CREATE INDEX idx_cached_fixtures_expires ON cached_fixtures(expires_at);
CREATE INDEX idx_cached_fixtures_status ON cached_fixtures(status);
CREATE INDEX idx_popular_leagues_priority ON popular_leagues(priority DESC);
CREATE INDEX idx_popular_leagues_active ON popular_leagues(is_active) WHERE is_active = true;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM cached_fixtures WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE user_preferences IS 'Stores user preferences like favorite leagues and theme';
COMMENT ON TABLE favorite_matches IS 'Stores user favorite matches for quick access';
COMMENT ON TABLE cached_fixtures IS 'Caches API-Football responses to reduce API calls';
COMMENT ON TABLE popular_leagues IS 'Curated list of popular leagues for quick filtering';
