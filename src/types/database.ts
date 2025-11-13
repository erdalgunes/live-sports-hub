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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_cache: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
