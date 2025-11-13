/**
 * useEventStandings Hook
 *
 * Fetch tournament standings for a match context
 * Returns mini standings table focused on teams around match participants
 *
 * Usage:
 * const { standings, loading, error } = useEventStandings(matchId, type);
 */

'use client';

import { useEffect, useState } from 'react';
import { getEventStandings } from '@/services/matches';
import type { MatchDetail } from '@/types/matches';

interface UseEventStandingsReturn {
  standings: {
    tournament: {
      id: number;
      name: string;
      season: number;
    };
    type: string;
    standings: any[];
    lastUpdated: string;
  } | null;
  loading: boolean;
  error: Error | null;
}

export function useEventStandings(
  match: MatchDetail | null,
  type: 'total' | 'home' | 'away' = 'total'
): UseEventStandingsReturn {
  const [standings, setStandings] = useState<{
    tournament: {
      id: number;
      name: string;
      season: number;
    };
    type: string;
    standings: any[];
    lastUpdated: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!match) {
      setStandings(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch standings data
    const fetchStandings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Extract season from league data (assuming format like "2024" or "2023/2024")
        const seasonStr = match.league.season;
        const seasonId = parseInt(seasonStr.split('/')[0], 10);

        const standingsData = await getEventStandings(
          match.league_id,
          seasonId,
          type,
          match.home_team_id,
          match.away_team_id
        );

        if (isMounted) {
          setStandings(standingsData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchStandings();

    // Cleanup on unmount
    return () => {
      isMounted = false;
    };
  }, [match, type]);

  return { standings, loading, error };
}