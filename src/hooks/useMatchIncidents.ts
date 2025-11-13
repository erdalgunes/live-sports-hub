/**
 * useMatchIncidents Hook
 *
 * Subscribe to real-time match incidents (goals, cards, substitutions)
 * Incidents are automatically added to the timeline as they occur
 *
 * Usage:
 * const { incidents, loading, error } = useMatchIncidents(matchId);
 */

'use client';

import { useEffect, useState } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { subscribeToMatchEvents, unsubscribeChannel } from '@/lib/supabase/realtime';
import type { MatchEventDetail } from '@/types/matches';
import type { Database } from '@/types/database.extended';

type MatchEvent = Database['public']['Tables']['match_events']['Row'];

interface UseMatchIncidentsReturn {
  incidents: MatchEventDetail[];
  loading: boolean;
  error: Error | null;
  isSubscribed: boolean;
}

export function useMatchIncidents(matchId: number | null): UseMatchIncidentsReturn {
  const [incidents, setIncidents] = useState<MatchEventDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!matchId) {
      setIncidents([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch initial incidents
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/v1/matches/${matchId}/incidents`);
        if (!response.ok) {
          throw new Error(`Failed to fetch incidents: ${response.statusText}`);
        }
        const incidentsData = await response.json();
        if (isMounted) {
          setIncidents(incidentsData.data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchIncidents();

    // Subscribe to real-time incident updates
    const channel = subscribeToMatchEvents(matchId, {
      onInsert: (payload: RealtimePostgresChangesPayload<MatchEvent>) => {
        if (isMounted && payload.new) {
          // Add new incident to the list (will need to fetch full incident with relations)
          setIncidents((prev) => {
            // Check if incident already exists (prevent duplicates)
            const exists = prev.some((e) => e.id === payload.new.id);
            if (exists) return prev;

            // For now, add the raw incident. In production, you'd fetch the full incident with relations
            const newIncident = payload.new as unknown as MatchEventDetail;

            // Insert in chronological order (by minute)
            const updatedIncidents = [...prev, newIncident].sort((a, b) => {
              if (a.minute === null) return 1;
              if (b.minute === null) return -1;
              return a.minute - b.minute;
            });

            return updatedIncidents;
          });
        }
      },
      onUpdate: (payload: RealtimePostgresChangesPayload<MatchEvent>) => {
        if (isMounted && payload.new) {
          // Update existing incident
          setIncidents((prev) =>
            prev.map((incident) =>
              incident.id === payload.new.id ? { ...incident, ...payload.new } : incident
            )
          );
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

  return { incidents, loading, error, isSubscribed };
}