/**
 * useMatchEvents Hook
 *
 * Subscribe to real-time match events (goals, cards, substitutions)
 * Events are automatically added to the timeline as they occur
 *
 * Usage:
 * const { events, loading, error } = useMatchEvents(matchId);
 */

'use client';

import { useEffect, useState } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { subscribeToMatchEvents, unsubscribeChannel } from '@/lib/supabase/realtime';
import { getMatchEvents } from '@/services/matches.client';
import type { MatchEventDetail } from '@/types/matches';
import type { Database } from '@/types/database.extended';

type MatchEvent = Database['public']['Tables']['match_events']['Row'];

interface UseMatchEventsReturn {
  events: MatchEventDetail[];
  loading: boolean;
  error: Error | null;
  isSubscribed: boolean;
}

export function useMatchEvents(matchId: number | null): UseMatchEventsReturn {
  const [events, setEvents] = useState<MatchEventDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!matchId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch initial events
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventsData = await getMatchEvents(matchId);
        if (isMounted) {
          setEvents(eventsData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchEvents();

    // Subscribe to real-time event updates
    const channel = subscribeToMatchEvents(matchId, {
      onInsert: (payload: RealtimePostgresChangesPayload<MatchEvent>) => {
        if (isMounted && payload.new) {
          // Add new event to the list (will need to fetch full event with relations)
          setEvents((prev) => {
            // Check if event already exists (prevent duplicates)
            const exists = prev.some((e) => e.id === payload.new.id);
            if (exists) return prev;

            // For now, add the raw event. In production, you'd fetch the full event with relations
            const newEvent = payload.new as unknown as MatchEventDetail;

            // Insert in chronological order (by minute)
            const updatedEvents = [...prev, newEvent].sort((a, b) => {
              if (a.minute === null) return 1;
              if (b.minute === null) return -1;
              return a.minute - b.minute;
            });

            return updatedEvents;
          });
        }
      },
      onUpdate: (payload: RealtimePostgresChangesPayload<MatchEvent>) => {
        if (isMounted && payload.new) {
          // Update existing event
          setEvents((prev) =>
            prev.map((event) =>
              event.id === payload.new.id ? { ...event, ...payload.new } : event
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

  return { events, loading, error, isSubscribed };
}
