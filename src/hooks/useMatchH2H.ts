/**
 * useMatchH2H Hook
 *
 * Fetch head-to-head statistics and recent matches between teams
 * Returns H2H stats and recent match history
 *
 * Usage:
 * const { h2h, recentMatches, loading, error } = useMatchH2H(matchId);
 */

'use client';

import { useEffect, useState } from 'react';
import { getMatchH2H } from '@/services/matches';
import type { MatchH2H, MatchDetail } from '@/types/matches';

interface UseMatchH2HReturn {
  h2h: {
    h2h: MatchH2H | null;
    recent_matches: MatchDetail[];
  } | null;
  loading: boolean;
  error: Error | null;
}

export function useMatchH2H(matchId: number | null): UseMatchH2HReturn {
  const [h2h, setH2h] = useState<{
    h2h: MatchH2H | null;
    recent_matches: MatchDetail[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!matchId) {
      setH2h(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch H2H data
    const fetchH2H = async () => {
      try {
        setLoading(true);
        setError(null);
        const h2hData = await getMatchH2H(matchId);
        if (isMounted) {
          setH2h(h2hData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchH2H();

    // Cleanup on unmount
    return () => {
      isMounted = false;
    };
  }, [matchId]);

  return { h2h, loading, error };
}