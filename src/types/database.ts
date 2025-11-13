// Supabase database types
// Generated from schema in supabase/migrations/001_initial_schema.sql

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
          ttl_seconds: number
          is_live: boolean
          last_updated: string
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
          ttl_seconds?: number
          is_live?: boolean
          last_updated?: string
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
          ttl_seconds?: number
          is_live?: boolean
          last_updated?: string
        }
      }
      team_fixtures_cache: {
        Row: {
          id: string
          team_id: number
          league_id: number
          season: number
          fixtures: Json
          cached_at: string
          expires_at: string
          ttl_seconds: number
          last_updated: string
        }
        Insert: {
          id?: string
          team_id: number
          league_id: number
          season: number
          fixtures: Json
          cached_at?: string
          expires_at: string
          ttl_seconds?: number
          last_updated?: string
        }
        Update: {
          id?: string
          team_id?: number
          league_id?: number
          season?: number
          fixtures?: Json
          cached_at?: string
          expires_at?: string
          ttl_seconds?: number
          last_updated?: string
        }
      }
      cache_monitoring_log: {
        Row: {
          id: string
          total_fixtures: number
          live_fixtures: number
          expired_fixtures: number
          cache_size_mb: number
          avg_ttl_seconds: number
          recorded_at: string
        }
        Insert: {
          id?: string
          total_fixtures: number
          live_fixtures: number
          expired_fixtures: number
          cache_size_mb: number
          avg_ttl_seconds: number
          recorded_at?: string
        }
        Update: {
          id?: string
          total_fixtures?: number
          live_fixtures?: number
          expired_fixtures?: number
          cache_size_mb?: number
          avg_ttl_seconds?: number
          recorded_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_cache: {
        Args: Record<string, never>
        Returns: void
      }
      clean_expired_cache_enhanced: {
        Args: Record<string, never>
        Returns: {
          deleted_fixtures: number
          deleted_team_fixtures: number
        }[]
      }
      get_cache_stats: {
        Args: Record<string, never>
        Returns: {
          total_fixtures: number
          live_fixtures: number
          expired_fixtures: number
          cache_size_mb: number
          avg_ttl_seconds: number
        }[]
      }
      trigger_manual_cleanup: {
        Args: Record<string, never>
        Returns: {
          deleted_fixtures: number
          deleted_team_fixtures: number
          execution_time_ms: number
        }[]
      }
      calculate_fixture_ttl: {
        Args: {
          match_status: string
          match_date: string
        }
        Returns: number
      }
      upsert_cached_fixture: {
        Args: {
          p_fixture_id: number
          p_fixture_data: Json
          p_league_id: number
          p_status: string
          p_match_date: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
