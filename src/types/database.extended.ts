// Extended Supabase database types
// Include both existing and new match/event tables

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Existing tables
      user_preferences: {
        Row: {
          id: string
          user_id: string
          favorite_leagues: number[]
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          favorite_leagues?: number[]
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          favorite_leagues?: number[]
          theme?: string
          created_at?: string
          updated_at?: string
        }
      }
      favorite_matches: {
        Row: {
          id: string
          user_id: string
          fixture_id: number
          league_id: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fixture_id: number
          league_id?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          fixture_id?: number
          league_id?: number | null
          created_at?: string
        }
      }
      cached_fixtures: {
        Row: {
          id: string
          fixture_id: number
          fixture_data: Json
          league_id: number
          status: string
          match_date: string
          cached_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          fixture_id: number
          fixture_data: Json
          league_id: number
          status: string
          match_date: string
          cached_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          fixture_id?: number
          fixture_data?: Json
          league_id?: number
          status?: string
          match_date?: string
          cached_at?: string
          expires_at?: string
        }
      }
      popular_leagues: {
        Row: {
          id: string
          league_id: number
          league_name: string
          country: string
          logo_url: string | null
          priority: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          league_id: number
          league_name: string
          country: string
          logo_url?: string | null
          priority?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          league_id?: number
          league_name?: string
          country?: string
          logo_url?: string | null
          priority?: number
          is_active?: boolean
          created_at?: string
        }
      }

      // New match/event tables
      leagues: {
        Row: {
          id: number
          name: string
          country: string | null
          season: string
          logo_url: string | null
          type: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          country?: string | null
          season: string
          logo_url?: string | null
          type?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          country?: string | null
          season?: string
          logo_url?: string | null
          type?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: number
          name: string
          short_name: string | null
          logo_url: string | null
          founded_year: number | null
          stadium: string | null
          city: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          short_name?: string | null
          logo_url?: string | null
          founded_year?: number | null
          stadium?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          short_name?: string | null
          logo_url?: string | null
          founded_year?: number | null
          stadium?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: number
          name: string
          team_id: number | null
          position: string | null
          jersey_number: number | null
          birth_date: string | null
          nationality: string | null
          height: number | null
          weight: number | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          team_id?: number | null
          position?: string | null
          jersey_number?: number | null
          birth_date?: string | null
          nationality?: string | null
          height?: number | null
          weight?: number | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          team_id?: number | null
          position?: string | null
          jersey_number?: number | null
          birth_date?: string | null
          nationality?: string | null
          height?: number | null
          weight?: number | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      referees: {
        Row: {
          id: number
          name: string
          nationality: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          nationality?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          nationality?: string | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: number
          league_id: number
          home_team_id: number
          away_team_id: number
          match_date: string
          status: string
          venue: string | null
          referee_id: number | null
          attendance: number | null
          round: string | null
          home_score: number
          away_score: number
          home_halftime_score: number
          away_halftime_score: number
          minute: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          league_id: number
          home_team_id: number
          away_team_id: number
          match_date: string
          status?: string
          venue?: string | null
          referee_id?: number | null
          attendance?: number | null
          round?: string | null
          home_score?: number
          away_score?: number
          home_halftime_score?: number
          away_halftime_score?: number
          minute?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          league_id?: number
          home_team_id?: number
          away_team_id?: number
          match_date?: string
          status?: string
          venue?: string | null
          referee_id?: number | null
          attendance?: number | null
          round?: string | null
          home_score?: number
          away_score?: number
          home_halftime_score?: number
          away_halftime_score?: number
          minute?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      match_stats: {
        Row: {
          id: number
          match_id: number
          team_id: number
          goals: number
          shots: number
          shots_on_target: number
          shots_off_target: number
          blocked_shots: number
          possession: number | null
          corners: number
          offsides: number
          fouls: number
          yellow_cards: number
          red_cards: number
          saves: number
          passes: number
          passes_accurate: number
          pass_accuracy: number | null
          tackles: number
          interceptions: number
          duels: number
          duels_won: number
          free_kicks: number
          penalty_goals: number
          penalty_missed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          match_id: number
          team_id: number
          goals?: number
          shots?: number
          shots_on_target?: number
          shots_off_target?: number
          blocked_shots?: number
          possession?: number | null
          corners?: number
          offsides?: number
          fouls?: number
          yellow_cards?: number
          red_cards?: number
          saves?: number
          passes?: number
          passes_accurate?: number
          pass_accuracy?: number | null
          tackles?: number
          interceptions?: number
          duels?: number
          duels_won?: number
          free_kicks?: number
          penalty_goals?: number
          penalty_missed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          match_id?: number
          team_id?: number
          goals?: number
          shots?: number
          shots_on_target?: number
          shots_off_target?: number
          blocked_shots?: number
          possession?: number | null
          corners?: number
          offsides?: number
          fouls?: number
          yellow_cards?: number
          red_cards?: number
          saves?: number
          passes?: number
          passes_accurate?: number
          pass_accuracy?: number | null
          tackles?: number
          interceptions?: number
          duels?: number
          duels_won?: number
          free_kicks?: number
          penalty_goals?: number
          penalty_missed?: number
          created_at?: string
          updated_at?: string
        }
      }
      match_events: {
        Row: {
          id: number
          match_id: number
          team_id: number
          player_id: number | null
          assist_player_id: number | null
          event_type: string
          minute: number
          extra_minute: number
          detail: string | null
          event_data: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          match_id: number
          team_id: number
          player_id?: number | null
          assist_player_id?: number | null
          event_type: string
          minute: number
          extra_minute?: number
          detail?: string | null
          event_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          match_id?: number
          team_id?: number
          player_id?: number | null
          assist_player_id?: number | null
          event_type?: string
          minute?: number
          extra_minute?: number
          detail?: string | null
          event_data?: Json | null
          created_at?: string
        }
      }
      match_lineups: {
        Row: {
          id: number
          match_id: number
          team_id: number
          formation: string | null
          lineup_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          match_id: number
          team_id: number
          formation?: string | null
          lineup_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          match_id?: number
          team_id?: number
          formation?: string | null
          lineup_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      player_match_stats: {
        Row: {
          id: number
          match_id: number
          player_id: number
          team_id: number
          minutes_played: number
          rating: number | null
          goals: number
          assists: number
          shots: number
          shots_on_target: number
          passes: number
          passes_accurate: number
          key_passes: number
          tackles: number
          interceptions: number
          duels: number
          duels_won: number
          dribbles: number
          dribbles_successful: number
          fouls_committed: number
          fouls_drawn: number
          yellow_cards: number
          red_cards: number
          saves: number
          created_at: string
        }
        Insert: {
          id?: number
          match_id: number
          player_id: number
          team_id: number
          minutes_played?: number
          rating?: number | null
          goals?: number
          assists?: number
          shots?: number
          shots_on_target?: number
          passes?: number
          passes_accurate?: number
          key_passes?: number
          tackles?: number
          interceptions?: number
          duels?: number
          duels_won?: number
          dribbles?: number
          dribbles_successful?: number
          fouls_committed?: number
          fouls_drawn?: number
          yellow_cards?: number
          red_cards?: number
          saves?: number
          created_at?: string
        }
        Update: {
          id?: number
          match_id?: number
          player_id?: number
          team_id?: number
          minutes_played?: number
          rating?: number | null
          goals?: number
          assists?: number
          shots?: number
          shots_on_target?: number
          passes?: number
          passes_accurate?: number
          key_passes?: number
          tackles?: number
          interceptions?: number
          duels?: number
          duels_won?: number
          dribbles?: number
          dribbles_successful?: number
          fouls_committed?: number
          fouls_drawn?: number
          yellow_cards?: number
          red_cards?: number
          saves?: number
          created_at?: string
        }
      }
      match_h2h: {
        Row: {
          id: number
          team1_id: number
          team2_id: number
          matches_played: number
          team1_wins: number
          team2_wins: number
          draws: number
          team1_goals_for: number
          team2_goals_for: number
          last_updated: string
        }
        Insert: {
          id?: number
          team1_id: number
          team2_id: number
          matches_played?: number
          team1_wins?: number
          team2_wins?: number
          draws?: number
          team1_goals_for?: number
          team2_goals_for?: number
          last_updated?: string
        }
        Update: {
          id?: number
          team1_id?: number
          team2_id?: number
          matches_played?: number
          team1_wins?: number
          team2_wins?: number
          draws?: number
          team1_goals_for?: number
          team2_goals_for?: number
          last_updated?: string
        }
      }
      standings: {
        Row: {
          id: number
          league_id: number
          team_id: number
          season: string
          position: number
          played: number
          won: number
          drawn: number
          lost: number
          goals_for: number
          goals_against: number
          goal_difference: number
          points: number
          form: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          league_id: number
          team_id: number
          season: string
          position: number
          played?: number
          won?: number
          drawn?: number
          lost?: number
          goals_for?: number
          goals_against?: number
          goal_difference?: number
          points?: number
          form?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          league_id?: number
          team_id?: number
          season?: string
          position?: number
          played?: number
          won?: number
          drawn?: number
          lost?: number
          goals_for?: number
          goals_against?: number
          goal_difference?: number
          points?: number
          form?: string | null
          updated_at?: string
        }
      }
      api_football_cache: {
        Row: {
          id: number
          endpoint: string
          params_hash: string
          response_data: Json
          cached_at: string
          expires_at: string
          hit_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          endpoint: string
          params_hash: string
          response_data: Json
          cached_at?: string
          expires_at: string
          hit_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          endpoint?: string
          params_hash?: string
          response_data?: Json
          cached_at?: string
          expires_at?: string
          hit_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      api_football_cache_monitoring: {
        Row: {
          id: number
          snapshot_at: string
          total_entries: number
          valid_entries: number
          expired_entries: number
          total_hits: number
          cache_size_mb: number
          live_entries: number
          finished_entries: number
          upcoming_entries: number
          top_endpoints: Json
          avg_hit_count: number
          cache_hit_rate: number
          created_at: string
        }
        Insert: {
          id?: number
          snapshot_at?: string
          total_entries: number
          valid_entries: number
          expired_entries: number
          total_hits: number
          cache_size_mb: number
          live_entries?: number
          finished_entries?: number
          upcoming_entries?: number
          top_endpoints?: Json
          avg_hit_count?: number
          cache_hit_rate?: number
          created_at?: string
        }
        Update: {
          id?: number
          snapshot_at?: string
          total_entries?: number
          valid_entries?: number
          expired_entries?: number
          total_hits?: number
          cache_size_mb?: number
          live_entries?: number
          finished_entries?: number
          upcoming_entries?: number
          top_endpoints?: Json
          avg_hit_count?: number
          cache_hit_rate?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_cache: {
        Args: Record<string, never>
        Returns: void
      }
      cleanup_expired_cache: {
        Args: Record<string, never>
        Returns: number
      }
      get_cache_stats: {
        Args: Record<string, never>
        Returns: {
          total_entries: number
          valid_entries: number
          expired_entries: number
          total_hits: number
          cache_size_mb: number
        }[]
      }
      record_cache_snapshot: {
        Args: Record<string, never>
        Returns: void
      }
      get_cache_trends: {
        Args: {
          hours_back?: number
        }
        Returns: {
          snapshot_at: string
          total_entries: number
          valid_entries: number
          cache_size_mb: number
          avg_hit_count: number
          cache_hit_rate: number
          live_entries: number
          finished_entries: number
          upcoming_entries: number
        }[]
      }
      cleanup_old_monitoring_data: {
        Args: Record<string, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
