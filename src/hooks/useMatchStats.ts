/**
 * useMatchStats Hook
 *
 * Subscribe to real-time match statistics updates
 * Returns stats for both home and away teams
 *
 * Usage:
 * const { stats, loading, error } = useMatchStats(matchId);
 */

'use client';

import { useEffect, useState } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { subscribeToMatchStats, unsubscribeChannel } from '@/lib/supabase/realtime';
import { getMatchStats } from '@/services/matches';
import type { MatchStats } from '@/types/matches';
import type { Database } from '@/types/database.extended';

type MatchStatsRow = Database['public']['Tables']['match_stats']['Row'];

interface UseMatchStatsReturn {
  stats: {
    home: MatchStats | null;
    away: MatchStats | null;
  };
  loading: boolean;
  error: Error | null;
  isSubscribed: boolean;
}

export function useMatchStats(matchId: number | null): UseMatchStatsReturn {
  const [stats, setStats] = useState<{
    home: MatchStats | null;
    away: MatchStats | null;
  }>({
    home: null,
    away: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!matchId) {
      setStats({ home: null, away: null });
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch initial stats
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const statsData = await getMatchStats(matchId);
        if (isMounted) {
          setStats(statsData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchStats();

    // Subscribe to real-time stats updates
    const channel = subscribeToMatchStats(matchId, {
      onUpdate: (payload: RealtimePostgresChangesPayload<MatchStatsRow>) => {
        if (isMounted && payload.new) {
          // Determine if this is home or away stats based on team_id
          // We'll need to refetch to get the full context
          fetchStats();
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

  return { stats, loading, error, isSubscribed };
}
