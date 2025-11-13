// Match Service Layer
// Handles all database interactions for matches and related data

import { createClient } from '@/lib/supabase/server';
import type {
  MatchDetail,
  MatchStatsWithTeam,
  MatchEventDetail,
  MatchLineupWithTeam,
  MatchH2H,
  MatchFilters,
  PlayerMatchStatsWithTeam,
  MatchGraph,
  WinProbabilityGraph,
} from '@/types/matches';
import { getPaginationParams } from '@/lib/utils/api-response';

// =============================================================================
// MATCH QUERIES
// =============================================================================

/**
 * Get matches with filters and pagination
 */
export async function getMatches(filters: MatchFilters) {
  const supabase = await createClient();
  const { offset, limit } = getPaginationParams(filters.page ?? 1, filters.page_size ?? 20);

  let query = supabase
    .from('matches')
    .select(
      `
      *,
      league:leagues(*),
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      referee:referees(*)
    `,
      { count: 'exact' }
    )
    .order('match_date', { ascending: true })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (filters.league_id) {
    query = query.eq('league_id', filters.league_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.team_id) {
    query = query.or(`home_team_id.eq.${filters.team_id},away_team_id.eq.${filters.team_id}`);
  }

  if (filters.date) {
    const startOfDay = new Date(filters.date);
    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);

    query = query
      .gte('match_date', startOfDay.toISOString())
      .lte('match_date', endOfDay.toISOString());
  }

  if (filters.date_from) {
    query = query.gte('match_date', new Date(filters.date_from).toISOString());
  }

  if (filters.date_to) {
    query = query.lte('match_date', new Date(filters.date_to).toISOString());
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch matches: ${error.message}`);
  }

  return {
    matches: (data as MatchDetail[]) || [],
    total: count || 0,
  };
}

/**
 * Get a single match by ID with full details
 */
export async function getMatchById(matchId: number): Promise<MatchDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('matches')
    .select(
      `
      *,
      league:leagues(*),
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      referee:referees(*)
    `
    )
    .eq('id', matchId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch match: ${error.message}`);
  }

  return data as MatchDetail;
}

/**
 * Get live matches
 */
export async function getLiveMatches(): Promise<MatchDetail[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('matches')
    .select(
      `
      *,
      league:leagues(*),
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      referee:referees(*)
    `
    )
    .eq('status', 'live')
    .order('match_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch live matches: ${error.message}`);
  }

  return (data as MatchDetail[]) || [];
}

// =============================================================================
// MATCH STATISTICS
// =============================================================================

/**
 * Get match statistics for both teams
 */
export async function getMatchStats(matchId: number): Promise<{
  home: MatchStatsWithTeam | null;
  away: MatchStatsWithTeam | null;
} | null> {
  const supabase = await createClient();

  // First get the match to find home and away team IDs
  const match = await getMatchById(matchId);
  if (!match) {
    return null;
  }

  const { data, error } = await supabase
    .from('match_stats')
    .select('*, team:teams(*)')
    .eq('match_id', matchId)
    .in('team_id', [match.home_team_id, match.away_team_id]);

  if (error) {
    throw new Error(`Failed to fetch match stats: ${error.message}`);
  }

  const stats = data as MatchStatsWithTeam[];

  return {
    home: stats.find((s) => s.team_id === match.home_team_id) || null,
    away: stats.find((s) => s.team_id === match.away_team_id) || null,
  };
}

// =============================================================================
// MATCH EVENTS
// =============================================================================

/**
 * Get match events timeline
 */
export async function getMatchEvents(matchId: number): Promise<MatchEventDetail[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('match_events')
    .select(
      `
      *,
      team:teams(*),
      player:players!match_events_player_id_fkey(*),
      assist_player:players!match_events_assist_player_id_fkey(*)
    `
    )
    .eq('match_id', matchId)
    .order('minute', { ascending: true })
    .order('extra_minute', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch match events: ${error.message}`);
  }

  return (data as MatchEventDetail[]) || [];
}

/**
 * Get match events by type
 */
export async function getMatchEventsByType(
  matchId: number,
  eventType: string
): Promise<MatchEventDetail[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('match_events')
    .select(
      `
      *,
      team:teams(*),
      player:players!match_events_player_id_fkey(*),
      assist_player:players!match_events_assist_player_id_fkey(*)
    `
    )
    .eq('match_id', matchId)
    .eq('event_type', eventType)
    .order('minute', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch match events: ${error.message}`);
  }

  return (data as MatchEventDetail[]) || [];
}

// =============================================================================
// MATCH LINEUPS
// =============================================================================

/**
 * Get match lineups for both teams
 */
export async function getMatchLineups(matchId: number): Promise<{
  home: MatchLineupWithTeam | null;
  away: MatchLineupWithTeam | null;
} | null> {
  const supabase = await createClient();

  // First get the match to find home and away team IDs
  const match = await getMatchById(matchId);
  if (!match) {
    return null;
  }

  const { data, error } = await supabase
    .from('match_lineups')
    .select('*, team:teams(*)')
    .eq('match_id', matchId)
    .in('team_id', [match.home_team_id, match.away_team_id]);

  if (error) {
    throw new Error(`Failed to fetch match lineups: ${error.message}`);
  }

  const lineups = data as MatchLineupWithTeam[];

  return {
    home: lineups.find((l) => l.team_id === match.home_team_id) || null,
    away: lineups.find((l) => l.team_id === match.away_team_id) || null,
  };
}

// =============================================================================
// HEAD-TO-HEAD
// =============================================================================

/**
 * Get head-to-head statistics between two teams
 */
export async function getH2HStats(team1Id: number, team2Id: number): Promise<MatchH2H | null> {
  const supabase = await createClient();

  // Ensure team1_id < team2_id for the query (due to unique constraint)
  const [lowerTeamId, higherTeamId] = team1Id < team2Id ? [team1Id, team2Id] : [team2Id, team1Id];

  const { data, error } = await supabase
    .from('match_h2h')
    .select('*')
    .eq('team1_id', lowerTeamId)
    .eq('team2_id', higherTeamId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch H2H stats: ${error.message}`);
  }

  return data as MatchH2H;
}

/**
 * Get recent matches between two teams
 */
export async function getRecentH2HMatches(
  team1Id: number,
  team2Id: number,
  limit: number = 10
): Promise<MatchDetail[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('matches')
    .select(
      `
      *,
      league:leagues(*),
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      referee:referees(*)
    `
    )
    .or(
      `and(home_team_id.eq.${team1Id},away_team_id.eq.${team2Id}),and(home_team_id.eq.${team2Id},away_team_id.eq.${team1Id})`
    )
    .eq('status', 'finished')
    .order('match_date', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent H2H matches: ${error.message}`);
  }

  return (data as MatchDetail[]) || [];
}

/**
 * Get head-to-head data for a match (stats and recent matches)
 */
export async function getMatchH2H(matchId: number): Promise<{
  h2h: MatchH2H | null;
  recent_matches: MatchDetail[];
} | null> {
  const supabase = await createClient();

  // First get the match to find home and away team IDs
  const match = await getMatchById(matchId);
  if (!match) {
    return null;
  }

  // Fetch H2H statistics
  const h2hStats = await getH2HStats(match.home_team_id, match.away_team_id);

  // Fetch recent H2H matches
  const recentMatches = await getRecentH2HMatches(
    match.home_team_id,
    match.away_team_id,
    10
  );

  return {
    h2h: h2hStats,
    recent_matches: recentMatches,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a match exists
 */
export async function matchExists(matchId: number): Promise<boolean> {
  const match = await getMatchById(matchId);
  return match !== null;
}

/**
 * Get upcoming matches (next 7 days)
 */
export async function getUpcomingMatches(leagueId?: number): Promise<MatchDetail[]> {
  const supabase = await createClient();

  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  let query = supabase
    .from('matches')
    .select(
      `
      *,
      league:leagues(*),
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      referee:referees(*)
    `
    )
    .eq('status', 'scheduled')
    .gte('match_date', now.toISOString())
    .lte('match_date', sevenDaysFromNow.toISOString())
    .order('match_date', { ascending: true });

  if (leagueId) {
    query = query.eq('league_id', leagueId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch upcoming matches: ${error.message}`);
  }

  return (data as MatchDetail[]) || [];
}

/**
 * Get matches by date
 */
export async function getMatchesByDate(date: string): Promise<MatchDetail[]> {
  const startOfDay = new Date(date);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('matches')
    .select(
      `
      *,
      league:leagues(*),
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      referee:referees(*)
    `
    )
    .gte('match_date', startOfDay.toISOString())
    .lte('match_date', endOfDay.toISOString())
    .order('match_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch matches by date: ${error.message}`);
  }

  return (data as MatchDetail[]) || [];
}

// =============================================================================
// TOURNAMENT STANDINGS
// =============================================================================

/**
 * Get tournament standings for a specific match context
 * Returns standings focused on teams around the match participants
 */
export async function getEventStandings(
  tournamentId: number,
  seasonId: number,
  type: 'total' | 'home' | 'away' = 'total',
  homeTeamId?: number,
  awayTeamId?: number
): Promise<{
  tournament: {
    id: number;
    name: string;
    season: number;
  };
  type: string;
  standings: any[];
  lastUpdated: string;
}> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/tournament/${tournamentId}/season/${seasonId}/standings/${type}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch standings: ${response.statusText}`);
  }

  const data = await response.json();

  // If we have team IDs, filter standings to show teams around the match participants
  if (homeTeamId && awayTeamId && data.standings) {
    const homeTeamStanding = data.standings.find((s: any) => s.team.id === homeTeamId);
    const awayTeamStanding = data.standings.find((s: any) => s.team.id === awayTeamId);

    if (homeTeamStanding && awayTeamStanding) {
      const homeRank = homeTeamStanding.rank;
      const awayRank = awayTeamStanding.rank;

      // Show teams from 3 positions above the higher ranked team to 3 positions below the lower ranked team
      const minRank = Math.max(1, Math.min(homeRank, awayRank) - 3);
      const maxRank = Math.min(data.standings.length, Math.max(homeRank, awayRank) + 3);

      data.standings = data.standings.filter((standing: any) =>
        standing.rank >= minRank && standing.rank <= maxRank
      );
    }
  }

  return data;
}

// =============================================================================
// MATCH BEST PLAYERS
// =============================================================================

/**
 * Get best performing players for a match
 */
export async function getMatchBestPlayers(matchId: number): Promise<PlayerMatchStatsWithTeam[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('player_match_stats')
    .select(`
      *,
      player:players(*),
      team:teams(*)
    `)
    .eq('match_id', matchId)
    .order('rating', { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Failed to fetch match best players: ${error.message}`);
  }

  return (data as PlayerMatchStatsWithTeam[]) || [];
}

// =============================================================================
// MATCH GRAPHS
// =============================================================================

/**
 * Get match momentum graph data
 */
export async function getMatchGraph(matchId: number): Promise<MatchGraph | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('match_graphs')
    .select('*')
    .eq('match_id', matchId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch match graph: ${error.message}`);
  }

  return data as MatchGraph;
}

/**
 * Get match win probability graph data
 */
export async function getMatchWinProbability(matchId: number): Promise<WinProbabilityGraph | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('match_win_probability')
    .select('*')
    .eq('match_id', matchId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch win probability graph: ${error.message}`);
  }

  return data as WinProbabilityGraph;
}
