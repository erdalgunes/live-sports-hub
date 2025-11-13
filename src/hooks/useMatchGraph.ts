/**
 * useMatchGraph Hook
 *
 * Fetches match momentum graph data
 * Returns momentum graph data for the match
 *
 * Usage:
 * const { graph, loading, error } = useMatchGraph(matchId);
 */

'use client';

import { useEffect, useState } from 'react';
import { getMatchGraph } from '@/services/matches';
import type { MatchGraph } from '@/types/matches';

interface UseMatchGraphReturn {
  graph: MatchGraph | null;
  loading: boolean;
  error: Error | null;
}

export function useMatchGraph(matchId: number | null): UseMatchGraphReturn {
  const [graph, setGraph] = useState<MatchGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!matchId) {
      setGraph(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch graph data
    const fetchGraph = async () => {
      try {
        setLoading(true);
        setError(null);
        const graphData = await getMatchGraph(matchId);
        if (isMounted) {
          setGraph(graphData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchGraph();

    // Cleanup on unmount
    return () => {
      isMounted = false;
    };
  }, [matchId]);

  return { graph, loading, error };
}