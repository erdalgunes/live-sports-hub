// Match and Event related types
// Domain types for the match/event features

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export type EventType =
  | 'goal'
  | 'yellow_card'
  | 'red_card'
  | 'substitution'
  | 'var'
  | 'penalty';

export type PlayerPosition = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';

// League/Competition
export interface League {
  id: number;
  name: string;
  country: string | null;
  season: string;
  logo_url: string | null;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Team
export interface Team {
  id: number;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  founded_year: number | null;
  stadium: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

// Player
export interface Player {
  id: number;
  name: string;
  team_id: number | null;
  position: PlayerPosition | null;
  jersey_number: number | null;
  birth_date: string | null;
  nationality: string | null;
  height: number | null;
  weight: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

// Referee
export interface Referee {
  id: number;
  name: string;
  nationality: string | null;
  created_at: string;
}

// Match
export interface Match {
  id: number;
  league_id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  status: MatchStatus;
  venue: string | null;
  referee_id: number | null;
  attendance: number | null;
  round: string | null;
  home_score: number;
  away_score: number;
  home_halftime_score: number;
  away_halftime_score: number;
  minute: number | null;
  created_at: string;
  updated_at: string;
}

// Match with relations
export interface MatchDetail extends Match {
  league: League;
  home_team: Team;
  away_team: Team;
  referee: Referee | null;
}

// Match Statistics
export interface MatchStats {
  id: number;
  match_id: number;
  team_id: number;
  goals: number;
  shots: number;
  shots_on_target: number;
  shots_off_target: number;
  blocked_shots: number;
  possession: number | null;
  corners: number;
  offsides: number;
  fouls: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  passes: number;
  passes_accurate: number;
  pass_accuracy: number | null;
  tackles: number;
  interceptions: number;
  duels: number;
  duels_won: number;
  free_kicks: number;
  penalty_goals: number;
  penalty_missed: number;
  created_at: string;
  updated_at: string;
}

// Match Statistics with team info
export interface MatchStatsWithTeam extends MatchStats {
  team: Team;
}

// Match Event
export interface MatchEvent {
  id: number;
  match_id: number;
  team_id: number;
  player_id: number | null;
  assist_player_id: number | null;
  event_type: EventType;
  minute: number;
  extra_minute: number;
  detail: string | null;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

// Match Event with relations
export interface MatchEventDetail extends MatchEvent {
  team: Team;
  player: Player | null;
  assist_player: Player | null;
}

// Lineup Player
export interface LineupPlayer {
  player_id: number;
  player_name: string;
  jersey_number: number;
  position: string;
  grid: string | null; // e.g., "4:3", "2:2"
}

// Match Lineup
export interface MatchLineup {
  id: number;
  match_id: number;
  team_id: number;
  formation: string | null;
  lineup_data: LineupPlayer[];
  created_at: string;
  updated_at: string;
}

// Match Lineup with team info
export interface MatchLineupWithTeam extends MatchLineup {
  team: Team;
}

// Player Match Statistics
export interface PlayerMatchStats {
  id: number;
  match_id: number;
  player_id: number;
  team_id: number;
  minutes_played: number;
  rating: number | null;
  goals: number;
  assists: number;
  shots: number;
  shots_on_target: number;
  passes: number;
  passes_accurate: number;
  key_passes: number;
  tackles: number;
  interceptions: number;
  duels: number;
  duels_won: number;
  dribbles: number;
  dribbles_successful: number;
  fouls_committed: number;
  fouls_drawn: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  created_at: string;
}

// Player Match Statistics with player info
export interface PlayerMatchStatsDetail extends PlayerMatchStats {
  player: Player;
}

// Head-to-Head Statistics
export interface MatchH2H {
  id: number;
  team1_id: number;
  team2_id: number;
  matches_played: number;
  team1_wins: number;
  team2_wins: number;
  draws: number;
  team1_goals_for: number;
  team2_goals_for: number;
  last_updated: string;
}

// Standings
export interface Standing {
  id: number;
  league_id: number;
  team_id: number;
  season: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string | null;
  updated_at: string;
}

// Standing with team info
export interface StandingWithTeam extends Standing {
  team: Team;
}

// API Response types
export interface MatchListResponse {
  data: MatchDetail[];
  meta: {
    total: number;
    page: number;
    page_size: number;
  };
}

export interface MatchDetailResponse {
  data: MatchDetail;
}

export interface MatchStatsResponse {
  data: {
    home: MatchStatsWithTeam;
    away: MatchStatsWithTeam;
  };
}

export interface MatchEventsResponse {
  data: MatchEventDetail[];
}

export interface MatchLineupsResponse {
  data: {
    home: MatchLineupWithTeam;
    away: MatchLineupWithTeam;
  };
}

export interface MatchH2HResponse {
  data: {
    h2h: MatchH2H;
    recent_matches: MatchDetail[];
  };
}

// API Filter types
export interface MatchFilters {
  league_id?: number;
  team_id?: number;
  status?: MatchStatus;
  date?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

// Live match update payload
export interface LiveMatchUpdate {
  match_id: number;
  home_score: number;
  away_score: number;
  minute: number | null;
  status: MatchStatus;
  updated_at: string;
}

// Match event payload for real-time
export interface MatchEventPayload {
  match_id: number;
  event: MatchEventDetail;
}
