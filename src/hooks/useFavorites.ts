/**
 * useFavorites Hook
 *
 * Manages favorite matches functionality using Supabase
 * Provides methods to check, add, and remove favorites
 *
 * Usage:
 * const { isFavorite, toggleFavorite, loading } = useFavorites(fixtureId);
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import type { Database } from '@/types/database';

type FavoriteMatch = Database['public']['Tables']['favorite_matches']['Row'];

interface UseFavoritesReturn {
  isFavorite: boolean;
  toggleFavorite: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useFavorites(fixtureId: number): UseFavoritesReturn {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Check if match is favorited
  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !fixtureId) {
      setIsFavorite(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorite_matches')
        .select('id')
        .eq('user_id', user.id)
        .eq('fixture_id', fixtureId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      setIsFavorite(!!data);
    } catch (err) {
      console.error('Error checking favorite status:', err);
      setError('Failed to check favorite status');
    }
  }, [user, fixtureId, supabase]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async () => {
    if (!user) {
      setError('Authentication required');
      return;
    }

    if (!fixtureId) {
      setError('Invalid fixture ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_matches')
          .delete()
          .eq('user_id', user.id)
          .eq('fixture_id', fixtureId);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_matches')
          .insert({
            user_id: user.id,
            fixture_id: fixtureId,
          } as any);

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite status');
    } finally {
      setLoading(false);
    }
  }, [user, fixtureId, isFavorite, supabase]);

  // Check favorite status when user or fixtureId changes
  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  return {
    isFavorite,
    toggleFavorite,
    loading,
    error,
  };
}