/**
 * useMatchWinProbability Hook
 *
 * Fetches match win probability graph data
 * Returns win probability graph data for the match
 *
 * Usage:
 * const { winProbability, loading, error } = useMatchWinProbability(matchId);
 */

'use client';

import { useEffect, useState } from 'react';
import { getMatchWinProbability } from '@/services/matches';
import type { WinProbabilityGraph } from '@/types/matches';

interface UseMatchWinProbabilityReturn {
  winProbability: WinProbabilityGraph | null;
  loading: boolean;
  error: Error | null;
}

export function useMatchWinProbability(matchId: number | null): UseMatchWinProbabilityReturn {
  const [winProbability, setWinProbability] = useState<WinProbabilityGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!matchId) {
      setWinProbability(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch win probability data
    const fetchWinProbability = async () => {
      try {
        setLoading(true);
        setError(null);
        const winProbabilityData = await getMatchWinProbability(matchId);
        if (isMounted) {
          setWinProbability(winProbabilityData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchWinProbability();

    // Cleanup on unmount
    return () => {
      isMounted = false;
    };
  }, [matchId]);

  return { winProbability, loading, error };
}