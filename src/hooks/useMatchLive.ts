/**
 * useMatchLive Hook
 *
 * Subscribe to real-time updates for a specific match
 * Automatically handles subscription lifecycle and cleanup
 *
 * Usage:
 * const { match, loading, error } = useMatchLive(matchId);
 */

'use client';

import { useEffect, useState } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { subscribeToMatch, unsubscribeChannel } from '@/lib/supabase/realtime';
import { getMatchById } from '@/services/matches.client';
import type { MatchDetail } from '@/types/matches';
import type { Database } from '@/types/database.extended';

type Match = Database['public']['Tables']['matches']['Row'];

interface UseMatchLiveReturn {
  match: MatchDetail | null;
  loading: boolean;
  error: Error | null;
  isSubscribed: boolean;
}

export function useMatchLive(matchId: number | null): UseMatchLiveReturn {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!matchId) {
      setMatch(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch initial match data
    const fetchMatch = async () => {
      try {
        setLoading(true);
        setError(null);
        const matchData = await getMatchById(matchId);
        if (isMounted) {
          setMatch(matchData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchMatch();

    // Subscribe to real-time updates
    const channel = subscribeToMatch(matchId, {
      onUpdate: (payload: RealtimePostgresChangesPayload<Match>) => {
        if (isMounted && payload.new) {
          // Update match with new data while preserving relations
          setMatch((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              ...payload.new,
            };
          });
        }
      },
      onError: (err) => {
        if (isMounted) {
          setError(err);
        }
      },
    });

    setIsSubscribed(true);

    // Cleanup on unmount
    return () => {
      isMounted = false;
      setIsSubscribed(false);
      unsubscribeChannel(channel);
    };
  }, [matchId]);

  return { match, loading, error, isSubscribed };
}
