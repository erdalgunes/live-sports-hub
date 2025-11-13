-- Migration: Real-time Triggers for Match Events
-- Purpose: Enable Supabase Realtime for live match updates
-- Created: 2025-01-13

-- ============================================================================
-- Constants Helper
-- ============================================================================

-- Helper function to get match status constants
CREATE OR REPLACE FUNCTION get_match_status_live()
RETURNS TEXT AS $$ SELECT 'live'::TEXT; $$ LANGUAGE SQL IMMUTABLE;

CREATE OR REPLACE FUNCTION get_match_status_finished()
RETURNS TEXT AS $$ SELECT 'finished'::TEXT; $$ LANGUAGE SQL IMMUTABLE;

-- ============================================================================
-- Enable Realtime for Tables
-- ============================================================================

-- Enable realtime on matches table (score updates, status changes)
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Enable realtime on match_events table (goals, cards, substitutions)
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;

-- Enable realtime on match_stats table (live statistics updates)
ALTER PUBLICATION supabase_realtime ADD TABLE match_stats;

-- Enable realtime on player_match_stats table (player performance)
ALTER PUBLICATION supabase_realtime ADD TABLE player_match_stats;

-- ============================================================================
-- Trigger: Notify on Match Status Change
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_match_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Log the status change
    RAISE NOTICE 'Match % status changed from % to %', NEW.id, OLD.status, NEW.status;

    -- Update the updated_at timestamp
    NEW.updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_match_status_change
  BEFORE UPDATE ON matches
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_match_status_change();

-- ============================================================================
-- Trigger: Update Match Minute
-- ============================================================================

CREATE OR REPLACE FUNCTION update_match_minute()
RETURNS TRIGGER AS $$
DECLARE
  v_status_live CONSTANT TEXT := get_match_status_live();
BEGIN
  -- Only update if match is live
  IF NEW.status = v_status_live THEN
    -- Auto-increment minute if needed (can be overridden by explicit updates)
    IF NEW.minute IS NULL THEN
      NEW.minute = 0;
    END IF;

    NEW.updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_match_minute_update
  BEFORE UPDATE ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'live')
  EXECUTE FUNCTION update_match_minute();

-- ============================================================================
-- Trigger: Validate Match Events
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_match_event()
RETURNS TRIGGER AS $$
DECLARE
  match_status VARCHAR(50);
  v_status_live CONSTANT TEXT := get_match_status_live();
  v_status_finished CONSTANT TEXT := get_match_status_finished();
BEGIN
  -- Get current match status
  SELECT status INTO match_status
  FROM matches
  WHERE id = NEW.match_id;

  -- Only allow events for live or finished matches
  IF match_status NOT IN (v_status_live, v_status_finished) THEN
    RAISE EXCEPTION 'Cannot add events to matches with status: %', match_status;
  END IF;

  -- Validate minute is within reasonable range (0-120 for extra time)
  IF NEW.minute IS NOT NULL AND (NEW.minute < 0 OR NEW.minute > 120) THEN
    RAISE EXCEPTION 'Match minute must be between 0 and 120, got: %', NEW.minute;
  END IF;

  -- Ensure team_id belongs to the match
  IF NOT EXISTS (
    SELECT 1 FROM matches
    WHERE id = NEW.match_id
    AND (home_team_id = NEW.team_id OR away_team_id = NEW.team_id)
  ) THEN
    RAISE EXCEPTION 'Team % is not playing in match %', NEW.team_id, NEW.match_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_event_before_insert
  BEFORE INSERT ON match_events
  FOR EACH ROW
  EXECUTE FUNCTION validate_match_event();

-- ============================================================================
-- Trigger: Auto-update Match Score on Goal Events
-- ============================================================================
-- Note: This was created in migration 004, but we'll ensure it's optimized

DROP TRIGGER IF EXISTS update_score_on_goal ON match_events;
DROP FUNCTION IF EXISTS update_match_score_on_goal();

CREATE OR REPLACE FUNCTION update_match_score_on_goal()
RETURNS TRIGGER AS $$
DECLARE
  is_home_team BOOLEAN;
BEGIN
  -- Only process goal events
  IF NEW.event_type = 'goal' THEN
    -- Determine if goal was scored by home or away team
    SELECT (home_team_id = NEW.team_id) INTO is_home_team
    FROM matches
    WHERE id = NEW.match_id;

    -- Update the appropriate score
    IF is_home_team THEN
      UPDATE matches
      SET home_score = home_score + 1,
          updated_at = NOW()
      WHERE id = NEW.match_id;
    ELSE
      UPDATE matches
      SET away_score = away_score + 1,
          updated_at = NOW()
      WHERE id = NEW.match_id;
    END IF;

    RAISE NOTICE 'Goal scored in match %: % team', NEW.match_id,
                 CASE WHEN is_home_team THEN 'home' ELSE 'away' END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_score_on_goal
  AFTER INSERT ON match_events
  FOR EACH ROW
  WHEN (NEW.event_type = 'goal')
  EXECUTE FUNCTION update_match_score_on_goal();

-- ============================================================================
-- Trigger: Track Player Statistics on Events
-- ============================================================================

CREATE OR REPLACE FUNCTION update_player_stats_on_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if player is specified
  IF NEW.player_id IS NOT NULL THEN
    -- Initialize player stats if not exists
    INSERT INTO player_match_stats (match_id, player_id, team_id)
    VALUES (NEW.match_id, NEW.player_id, NEW.team_id)
    ON CONFLICT (match_id, player_id) DO NOTHING;

    -- Update stats based on event type
    CASE NEW.event_type
      WHEN 'goal' THEN
        UPDATE player_match_stats
        SET goals = goals + 1
        WHERE match_id = NEW.match_id AND player_id = NEW.player_id;

      WHEN 'yellow_card' THEN
        UPDATE player_match_stats
        SET yellow_cards = yellow_cards + 1
        WHERE match_id = NEW.match_id AND player_id = NEW.player_id;

      WHEN 'red_card' THEN
        UPDATE player_match_stats
        SET red_cards = red_cards + 1
        WHERE match_id = NEW.match_id AND player_id = NEW.player_id;

      ELSE
        -- No stats update for other event types
        NULL;
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_stats_on_event
  AFTER INSERT ON match_events
  FOR EACH ROW
  EXECUTE FUNCTION update_player_stats_on_event();

-- ============================================================================
-- Trigger: Cascade Match Status to Related Tables
-- ============================================================================

CREATE OR REPLACE FUNCTION cascade_match_status()
RETURNS TRIGGER AS $$
DECLARE
  v_status_live CONSTANT TEXT := get_match_status_live();
  v_status_finished CONSTANT TEXT := get_match_status_finished();
BEGIN
  -- When match finishes, update any dependent data
  IF NEW.status = v_status_finished AND OLD.status = v_status_live THEN
    -- Update H2H records
    INSERT INTO match_h2h (team1_id, team2_id, matches_played, team1_wins, team2_wins, draws)
    SELECT
      LEAST(NEW.home_team_id, NEW.away_team_id),
      GREATEST(NEW.home_team_id, NEW.away_team_id),
      0, 0, 0, 0
    ON CONFLICT (team1_id, team2_id) DO NOTHING;

    -- Update H2H stats
    UPDATE match_h2h
    SET
      matches_played = matches_played + 1,
      team1_wins = team1_wins + CASE
        WHEN (team1_id = NEW.home_team_id AND NEW.home_score > NEW.away_score) OR
             (team1_id = NEW.away_team_id AND NEW.away_score > NEW.home_score)
        THEN 1 ELSE 0 END,
      team2_wins = team2_wins + CASE
        WHEN (team2_id = NEW.home_team_id AND NEW.home_score > NEW.away_score) OR
             (team2_id = NEW.away_team_id AND NEW.away_score > NEW.home_score)
        THEN 1 ELSE 0 END,
      draws = draws + CASE WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
      last_match_date = NEW.match_date,
      updated_at = NOW()
    WHERE (team1_id = NEW.home_team_id AND team2_id = NEW.away_team_id) OR
          (team1_id = NEW.away_team_id AND team2_id = NEW.home_team_id);

    RAISE NOTICE 'Match % finished: H2H stats updated', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cascade_match_status_to_h2h
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'finished' AND OLD.status = 'live')
  EXECUTE FUNCTION cascade_match_status();

-- ============================================================================
-- Function: Manual Match Score Adjustment
-- ============================================================================
-- Use this function to manually adjust scores (e.g., for corrections)

CREATE OR REPLACE FUNCTION adjust_match_score(
  p_match_id INTEGER,
  p_home_score INTEGER,
  p_away_score INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE matches
  SET
    home_score = p_home_score,
    away_score = p_away_score,
    updated_at = NOW()
  WHERE id = p_match_id;

  RAISE NOTICE 'Match % score adjusted to %-% ', p_match_id, p_home_score, p_away_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Indexes for Real-time Performance
-- ============================================================================

-- Index for filtering live matches
CREATE INDEX IF NOT EXISTS idx_matches_status_live
ON matches(status)
WHERE status = 'live';

-- Index for recent match events (for timeline queries)
CREATE INDEX IF NOT EXISTS idx_match_events_recent
ON match_events(match_id, minute DESC, created_at DESC);

-- Index for match stats real-time updates
CREATE INDEX IF NOT EXISTS idx_match_stats_match_team
ON match_stats(match_id, team_id);

-- Composite index for player stats in live matches
CREATE INDEX IF NOT EXISTS idx_player_match_stats_live
ON player_match_stats(match_id, player_id)
INCLUDE (goals, assists, yellow_cards, red_cards);

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON FUNCTION notify_match_status_change() IS
'Trigger function that logs match status changes and updates timestamp';

COMMENT ON FUNCTION update_match_minute() IS
'Trigger function that manages match minute counter for live matches';

COMMENT ON FUNCTION validate_match_event() IS
'Trigger function that validates match events before insertion';

COMMENT ON FUNCTION update_match_score_on_goal() IS
'Trigger function that auto-updates match score when goal events are added';

COMMENT ON FUNCTION update_player_stats_on_event() IS
'Trigger function that updates player statistics based on match events';

COMMENT ON FUNCTION cascade_match_status() IS
'Trigger function that cascades match completion to dependent tables (H2H)';

COMMENT ON FUNCTION adjust_match_score(INTEGER, INTEGER, INTEGER) IS
'Manually adjust match score (use for corrections or admin operations)';
