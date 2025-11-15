// Client-side Match Service Layer
// Handles database interactions using client-side Supabase instance

'use client';

import { createClient } from '@/lib/supabase/client';
import type { MatchEventDetail, MatchDetail, MatchStatsWithTeam } from '@/types/matches';

/**
 * Get match by ID (client-side)
 */
export async function getMatchById(matchId: number): Promise<MatchDetail | null> {
  const supabase = createClient();

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
      return null;
    }
    throw error;
  }

  return data as unknown as MatchDetail;
}

/**
 * Get live matches (client-side)
 */
export async function getLiveMatches(): Promise<MatchDetail[]> {
  const supabase = createClient();

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

  return (data as unknown[]) as MatchDetail[];
}

/**
 * Get match stats (client-side)
 */
export async function getMatchStats(matchId: number): Promise<{
  home: MatchStatsWithTeam | null;
  away: MatchStatsWithTeam | null;
} | null> {
  const supabase = createClient();

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

  const stats = data as unknown[] as MatchStatsWithTeam[];

  return {
    home: stats.find(s => s.team_id === match.home_team_id) || null,
    away: stats.find(s => s.team_id === match.away_team_id) || null,
  };
}

/**
 * Get match events (client-side)
 */
export async function getMatchEvents(matchId: number): Promise<MatchEventDetail[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('match_events')
    .select(
      `
      *,
      team:teams(*),
      player:players(*),
      assist_player:players(*)
    `
    )
    .eq('match_id', matchId)
    .order('minute', { ascending: true })
    .order('extra_minute', { ascending: true });

  if (error) throw error;
  return (data as unknown[]) as MatchEventDetail[];
}
