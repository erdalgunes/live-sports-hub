/**
 * useMatchLineups Hook
 *
 * Fetch match lineups for both teams
 * Returns lineups for home and away teams
 *
 * Usage:
 * const { lineups, loading, error } = useMatchLineups(matchId);
 */

'use client';

import { useEffect, useState } from 'react';
import { getMatchLineups } from '@/services/matches';
import type { MatchLineupWithTeam } from '@/types/matches';

interface UseMatchLineupsReturn {
  lineups: {
    home: MatchLineupWithTeam | null;
    away: MatchLineupWithTeam | null;
  };
  loading: boolean;
  error: Error | null;
}

export function useMatchLineups(matchId: number | null): UseMatchLineupsReturn {
  const [lineups, setLineups] = useState<{
    home: MatchLineupWithTeam | null;
    away: MatchLineupWithTeam | null;
  }>({
    home: null,
    away: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!matchId) {
      setLineups({ home: null, away: null });
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch lineups
    const fetchLineups = async () => {
      try {
        setLoading(true);
        setError(null);
        const lineupsData = await getMatchLineups(matchId);
        if (isMounted) {
          setLineups(lineupsData || { home: null, away: null });
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchLineups();

    // Cleanup on unmount
    return () => {
      isMounted = false;
    };
  }, [matchId]);

  return { lineups, loading, error };
}