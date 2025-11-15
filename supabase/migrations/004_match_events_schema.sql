-- Match Events Schema Migration
-- Comprehensive schema for football match data, events, lineups, and statistics
-- Based on SofaScore architecture analysis

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Leagues/Competitions
CREATE TABLE IF NOT EXISTS leagues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    season VARCHAR(20) NOT NULL,
    logo_url TEXT,
    type VARCHAR(50) DEFAULT 'league', -- league, cup, friendly
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    logo_url TEXT,
    founded_year INTEGER,
    stadium VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    position VARCHAR(50), -- goalkeeper, defender, midfielder, forward
    jersey_number INTEGER,
    birth_date DATE,
    nationality VARCHAR(100),
    height INTEGER, -- in cm
    weight INTEGER, -- in kg
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referees
CREATE TABLE IF NOT EXISTS referees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nationality VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MATCH TABLES
-- =============================================================================

-- Matches
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    league_id INTEGER REFERENCES leagues(id) ON DELETE CASCADE,
    home_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    match_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- scheduled, live, finished, postponed, cancelled
    venue VARCHAR(255),
    referee_id INTEGER REFERENCES referees(id) ON DELETE SET NULL,
    attendance INTEGER,
    round VARCHAR(50), -- e.g., "Round 15", "Quarter Final"
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    home_halftime_score INTEGER DEFAULT 0,
    away_halftime_score INTEGER DEFAULT 0,
    minute INTEGER, -- current minute if live
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_scores CHECK (home_score >= 0 AND away_score >= 0),
    CONSTRAINT valid_halftime CHECK (home_halftime_score >= 0 AND away_halftime_score >= 0)
);

-- Match Statistics (team-level stats per match)
CREATE TABLE IF NOT EXISTS match_stats (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    goals INTEGER DEFAULT 0,
    shots INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    shots_off_target INTEGER DEFAULT 0,
    blocked_shots INTEGER DEFAULT 0,
    possession INTEGER, -- percentage (0-100)
    corners INTEGER DEFAULT 0,
    offsides INTEGER DEFAULT 0,
    fouls INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    passes INTEGER DEFAULT 0,
    passes_accurate INTEGER DEFAULT 0,
    pass_accuracy INTEGER, -- percentage (0-100)
    tackles INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    duels INTEGER DEFAULT 0,
    duels_won INTEGER DEFAULT 0,
    free_kicks INTEGER DEFAULT 0,
    penalty_goals INTEGER DEFAULT 0,
    penalty_missed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, team_id),
    CONSTRAINT valid_possession CHECK (possession IS NULL OR (possession >= 0 AND possession <= 100))
);

-- Match Events (goals, cards, substitutions, etc.)
CREATE TABLE IF NOT EXISTS match_events (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    assist_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- goal, yellow_card, red_card, substitution, var, penalty
    minute INTEGER NOT NULL,
    extra_minute INTEGER DEFAULT 0, -- stoppage time
    detail TEXT, -- additional context (e.g., "Penalty", "Own Goal", "Free Kick")
    event_data JSONB, -- flexible storage for event-specific data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_minute CHECK (minute >= 0 AND minute <= 120)
);

-- Match Lineups (starting XI and substitutes)
CREATE TABLE IF NOT EXISTS match_lineups (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    formation VARCHAR(20), -- e.g., "4-3-3", "4-4-2"
    lineup_data JSONB NOT NULL, -- array of player objects with positions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, team_id)
);

-- Player Match Statistics (individual player performance)
CREATE TABLE IF NOT EXISTS player_match_stats (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    minutes_played INTEGER DEFAULT 0,
    rating DECIMAL(3,1), -- e.g., 7.5
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    shots INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    passes INTEGER DEFAULT 0,
    passes_accurate INTEGER DEFAULT 0,
    key_passes INTEGER DEFAULT 0,
    tackles INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    duels INTEGER DEFAULT 0,
    duels_won INTEGER DEFAULT 0,
    dribbles INTEGER DEFAULT 0,
    dribbles_successful INTEGER DEFAULT 0,
    fouls_committed INTEGER DEFAULT 0,
    fouls_drawn INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0, -- for goalkeepers
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, player_id)
);

-- Head-to-Head Statistics (aggregated historical data between two teams)
CREATE TABLE IF NOT EXISTS match_h2h (
    id SERIAL PRIMARY KEY,
    team1_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    team2_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    matches_played INTEGER DEFAULT 0,
    team1_wins INTEGER DEFAULT 0,
    team2_wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    team1_goals_for INTEGER DEFAULT 0,
    team2_goals_for INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team1_id, team2_id),
    CONSTRAINT valid_h2h CHECK (team1_id < team2_id) -- ensure unique pair regardless of order
);

-- =============================================================================
-- STANDINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS standings (
    id SERIAL PRIMARY KEY,
    league_id INTEGER REFERENCES leagues(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    season VARCHAR(20) NOT NULL,
    position INTEGER NOT NULL,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    form VARCHAR(10), -- e.g., "WWDLW" (last 5 matches)
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, team_id, season)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_home_team ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_date_status ON matches(match_date, status);

-- Match events indexes
CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_type ON match_events(event_type);
CREATE INDEX IF NOT EXISTS idx_match_events_player ON match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_match_events_match_type ON match_events(match_id, event_type);

-- Players indexes
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);

-- Match stats indexes
CREATE INDEX IF NOT EXISTS idx_match_stats_match ON match_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_match_stats_team ON match_stats(team_id);

-- Player match stats indexes
CREATE INDEX IF NOT EXISTS idx_player_match_stats_match ON player_match_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_player_match_stats_player ON player_match_stats(player_id);

-- Standings indexes
CREATE INDEX IF NOT EXISTS idx_standings_league ON standings(league_id, season);
CREATE INDEX IF NOT EXISTS idx_standings_team ON standings(team_id);
CREATE INDEX IF NOT EXISTS idx_standings_position ON standings(league_id, season, position);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON leagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_stats_updated_at BEFORE UPDATE ON match_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_lineups_updated_at BEFORE UPDATE ON match_lineups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update match scores when goals are added
CREATE OR REPLACE FUNCTION update_match_score_on_goal()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.event_type = 'goal' THEN
        UPDATE matches
        SET
            home_score = home_score + CASE WHEN NEW.team_id = home_team_id THEN 1 ELSE 0 END,
            away_score = away_score + CASE WHEN NEW.team_id = away_team_id THEN 1 ELSE 0 END,
            updated_at = NOW()
        WHERE id = NEW.match_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_goal_score_update
AFTER INSERT ON match_events
FOR EACH ROW
WHEN (NEW.event_type = 'goal')
EXECUTE FUNCTION update_match_score_on_goal();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE referees ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_h2h ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;

-- Public read access policies (authenticated and anon users can read)
CREATE POLICY "Public read access for leagues" ON leagues
    FOR SELECT USING (true);

CREATE POLICY "Public read access for teams" ON teams
    FOR SELECT USING (true);

CREATE POLICY "Public read access for players" ON players
    FOR SELECT USING (true);

CREATE POLICY "Public read access for referees" ON referees
    FOR SELECT USING (true);

CREATE POLICY "Public read access for matches" ON matches
    FOR SELECT USING (true);

CREATE POLICY "Public read access for match_stats" ON match_stats
    FOR SELECT USING (true);

CREATE POLICY "Public read access for match_events" ON match_events
    FOR SELECT USING (true);

CREATE POLICY "Public read access for match_lineups" ON match_lineups
    FOR SELECT USING (true);

CREATE POLICY "Public read access for player_match_stats" ON player_match_stats
    FOR SELECT USING (true);

CREATE POLICY "Public read access for match_h2h" ON match_h2h
    FOR SELECT USING (true);

CREATE POLICY "Public read access for standings" ON standings
    FOR SELECT USING (true);

-- Admin write policies (only service role can write)
-- These will be enforced through API routes with service role key

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE matches IS 'Core table storing all football match information';
COMMENT ON TABLE match_events IS 'Timeline events during matches (goals, cards, substitutions)';
COMMENT ON TABLE match_stats IS 'Team-level statistics for each match';
COMMENT ON TABLE player_match_stats IS 'Individual player performance statistics per match';
COMMENT ON TABLE match_lineups IS 'Starting lineups and formations for matches';
COMMENT ON TABLE match_h2h IS 'Historical head-to-head statistics between teams';

COMMENT ON COLUMN matches.status IS 'Match status: scheduled, live, finished, postponed, cancelled';
COMMENT ON COLUMN match_events.event_type IS 'Event type: goal, yellow_card, red_card, substitution, var, penalty';
COMMENT ON COLUMN match_events.event_data IS 'JSONB field for flexible event-specific data storage';
COMMENT ON COLUMN match_lineups.lineup_data IS 'JSONB array of players with their positions and jersey numbers';
