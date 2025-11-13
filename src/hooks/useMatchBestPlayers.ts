/**
 * useMatchBestPlayers Hook
 *
 * Fetches best performing players for a match
 * Returns players sorted by rating
 *
 * Usage:
 * const { bestPlayers, loading, error } = useMatchBestPlayers(matchId);
 */

'use client';

import { useEffect, useState } from 'react';
import type { PlayerMatchStatsWithTeam } from '@/types/matches';

interface UseMatchBestPlayersReturn {
  bestPlayers: PlayerMatchStatsWithTeam[];
  loading: boolean;
  error: Error | null;
}

export function useMatchBestPlayers(matchId: number | null): UseMatchBestPlayersReturn {
  const [bestPlayers, setBestPlayers] = useState<PlayerMatchStatsWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!matchId) {
      setBestPlayers([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch best players
    const fetchBestPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/v1/matches/${matchId}/best-players`);
        if (!response.ok) {
          throw new Error('Failed to fetch best players');
        }
        const data = await response.json();
        const players = data.data as PlayerMatchStatsWithTeam[];
        if (isMounted) {
          // Sort by rating, putting null ratings at the end
          const sortedPlayers = players.sort((a: PlayerMatchStatsWithTeam, b: PlayerMatchStatsWithTeam) => {
            if (a.rating === null && b.rating === null) return 0;
            if (a.rating === null) return 1;
            if (b.rating === null) return -1;
            return b.rating - a.rating;
          });
          setBestPlayers(sortedPlayers);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchBestPlayers();

    // Cleanup on unmount
    return () => {
      isMounted = false;
    };
  }, [matchId]);

  return { bestPlayers, loading, error };
}