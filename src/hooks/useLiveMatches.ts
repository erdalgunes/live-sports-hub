/**
 * useLiveMatches Hook
 *
 * Subscribe to all live matches with real-time updates
 * Useful for live scores page or dashboard
 *
 * Usage:
 * const { matches, loading, error } = useLiveMatches();
 */

'use client';

import { useEffect, useState } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { subscribeToLiveMatches, unsubscribeChannel } from '@/lib/supabase/realtime';
import { getLiveMatches } from '@/services/matches.client';
import type { MatchDetail } from '@/types/matches';
import type { Database } from '@/types/database.extended';

type Match = Database['public']['Tables']['matches']['Row'];

interface UseLiveMatchesReturn {
  matches: MatchDetail[];
  loading: boolean;
  error: Error | null;
  isSubscribed: boolean;
  count: number;
}

/**
 * Helper: Update match list based on realtime payload
 */
function updateMatchList(
  prev: MatchDetail[],
  newMatch: Match,
  fetchLiveMatches: () => void
): MatchDetail[] {
  // If match status changed to not live, remove it
  if (newMatch.status !== 'live') {
    return prev.filter((m) => m.id !== newMatch.id);
  }

  // Update existing match
  const existingIndex = prev.findIndex((m) => m.id === newMatch.id);
  if (existingIndex >= 0) {
    const updated = [...prev];
    updated[existingIndex] = {
      ...updated[existingIndex],
      ...newMatch,
    };
    return updated;
  }

  // If match just became live, refresh all live matches
  fetchLiveMatches();
  return prev;
}

export function useLiveMatches(): UseLiveMatchesReturn {
  const [matches, setMatches] = useState<MatchDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Fetch initial live matches
    const fetchLiveMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const matchesData = await getLiveMatches();
        if (isMounted) {
          setMatches(matchesData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchLiveMatches();

    // Subscribe to real-time updates for all live matches
    const channel = subscribeToLiveMatches({
      onUpdate: (payload: RealtimePostgresChangesPayload<Match>) => {
        if (!isMounted || !payload.new) return;
        setMatches((prev) => updateMatchList(prev, payload.new, fetchLiveMatches));
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
  }, []);

  return {
    matches,
    loading,
    error,
    isSubscribed,
    count: matches.length,
  };
}
