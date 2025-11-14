/**
 * useMatchEvents Hook
 *
 * Subscribe to real-time match events (goals, cards, substitutions)
 * Events are automatically added to the timeline as they occur
 *
 * Usage:
 * const { events, loading, error } = useMatchEvents(matchId);
 */

/* eslint-disable react-hooks/set-state-in-effect */
// Early returns with setState are valid patterns - known eslint bug
// See: https://github.com/facebook/react/issues/34743

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

/**
 * Helper: Insert new event in chronological order
 */
function insertEventSorted(
  prev: MatchEventDetail[],
  newEvent: MatchEventDetail
): MatchEventDetail[] {
  // Check if event already exists (prevent duplicates)
  const exists = prev.some((e) => e.id === newEvent.id);
  if (exists) return prev;

  // Insert in chronological order (by minute)
  return [...prev, newEvent].sort((a, b) => {
    if (a.minute === null) return 1;
    if (b.minute === null) return -1;
    return a.minute - b.minute;
  });
}

/**
 * Helper: Update existing event
 */
function updateEvent(
  prev: MatchEventDetail[],
  updatedEvent: MatchEvent
): MatchEventDetail[] {
  return prev.map((event) =>
    event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event
  );
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
        if (!isMounted || !payload.new) return;
        const newEvent = payload.new as unknown as MatchEventDetail;
        setEvents((prev) => insertEventSorted(prev, newEvent));
      },
      onUpdate: (payload: RealtimePostgresChangesPayload<MatchEvent>) => {
        if (!isMounted || !payload.new) return;
        setEvents((prev) => updateEvent(prev, payload.new));
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
