/**
 * Supabase Realtime Setup
 *
 * Provides utilities for subscribing to real-time database changes
 * using Supabase Realtime (WebSocket-based).
 *
 * Features:
 * - Type-safe channel subscriptions
 * - Automatic reconnection handling
 * - Error handling and logging
 * - Channel cleanup utilities
 */

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.extended';

// Type aliases for database tables
type Tables = Database['public']['Tables'];
type Match = Tables['matches']['Row'];
type MatchEvent = Tables['match_events']['Row'];
type MatchStats = Tables['match_stats']['Row'];

/**
 * Subscribe to changes on a specific match
 * Listens for updates to match score, status, and minute
 */
export function subscribeToMatch(
  matchId: number,
  callbacks: {
    onUpdate?: (payload: RealtimePostgresChangesPayload<Match>) => void;
    onError?: (error: Error) => void;
  }
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel(`match:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`,
      },
      (payload) => {
        try {
          callbacks.onUpdate?.(payload as RealtimePostgresChangesPayload<Match>);
        } catch (error) {
          callbacks.onError?.(error as Error);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Subscribed to match ${matchId}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] Error subscribing to match ${matchId}`);
        callbacks.onError?.(new Error(`Failed to subscribe to match ${matchId}`));
      }
    });

  return channel;
}

/**
 * Subscribe to match events (goals, cards, substitutions)
 * Listens for INSERT events on match_events table
 */
export function subscribeToMatchEvents(
  matchId: number,
  callbacks: {
    onInsert?: (payload: RealtimePostgresChangesPayload<MatchEvent>) => void;
    onUpdate?: (payload: RealtimePostgresChangesPayload<MatchEvent>) => void;
    onError?: (error: Error) => void;
  }
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel(`match-events:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'match_events',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        try {
          callbacks.onInsert?.(payload as RealtimePostgresChangesPayload<MatchEvent>);
        } catch (error) {
          callbacks.onError?.(error as Error);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'match_events',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        try {
          callbacks.onUpdate?.(payload as RealtimePostgresChangesPayload<MatchEvent>);
        } catch (error) {
          callbacks.onError?.(error as Error);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Subscribed to events for match ${matchId}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] Error subscribing to events for match ${matchId}`);
        callbacks.onError?.(new Error(`Failed to subscribe to events for match ${matchId}`));
      }
    });

  return channel;
}

/**
 * Subscribe to match statistics updates
 * Listens for UPDATE events on match_stats table
 */
export function subscribeToMatchStats(
  matchId: number,
  callbacks: {
    onUpdate?: (payload: RealtimePostgresChangesPayload<MatchStats>) => void;
    onError?: (error: Error) => void;
  }
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel(`match-stats:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'match_stats',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        try {
          callbacks.onUpdate?.(payload as RealtimePostgresChangesPayload<MatchStats>);
        } catch (error) {
          callbacks.onError?.(error as Error);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Subscribed to stats for match ${matchId}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] Error subscribing to stats for match ${matchId}`);
        callbacks.onError?.(new Error(`Failed to subscribe to stats for match ${matchId}`));
      }
    });

  return channel;
}

/**
 * Subscribe to all live matches
 * Listens for changes to matches with status='live'
 */
export function subscribeToLiveMatches(callbacks: {
  onUpdate?: (payload: RealtimePostgresChangesPayload<Match>) => void;
  onError?: (error: Error) => void;
}): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel('live-matches')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: 'status=eq.live',
      },
      (payload) => {
        try {
          callbacks.onUpdate?.(payload as RealtimePostgresChangesPayload<Match>);
        } catch (error) {
          callbacks.onError?.(error as Error);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Realtime] Subscribed to all live matches');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Realtime] Error subscribing to live matches');
        callbacks.onError?.(new Error('Failed to subscribe to live matches'));
      }
    });

  return channel;
}

/**
 * Unsubscribe and remove a channel
 * Call this when component unmounts or subscription is no longer needed
 */
export async function unsubscribeChannel(channel: RealtimeChannel): Promise<void> {
  try {
    await channel.unsubscribe();
    console.log(`[Realtime] Unsubscribed from channel: ${channel.topic}`);
  } catch (error) {
    console.error(`[Realtime] Error unsubscribing from channel: ${channel.topic}`, error);
  }
}

/**
 * Unsubscribe from all channels
 * Useful for cleanup on app unmount
 */
export async function unsubscribeAll(): Promise<void> {
  const supabase = createClient();
  try {
    await supabase.removeAllChannels();
    console.log('[Realtime] Unsubscribed from all channels');
  } catch (error) {
    console.error('[Realtime] Error unsubscribing from all channels', error);
  }
}

/**
 * Get channel by topic name
 * Useful for checking if a subscription already exists
 */
export function getChannel(topic: string): RealtimeChannel | undefined {
  const supabase = createClient();
  return supabase.getChannels().find((channel) => channel.topic === topic);
}

/**
 * Check if a channel is subscribed
 */
export function isChannelSubscribed(channel: RealtimeChannel): boolean {
  return channel.state === 'joined';
}

/**
 * Composite subscription for complete match monitoring
 * Subscribes to match updates, events, and stats simultaneously
 * Returns cleanup function to unsubscribe from all
 */
export function subscribeToCompleteMatch(
  matchId: number,
  callbacks: {
    onMatchUpdate?: (payload: RealtimePostgresChangesPayload<Match>) => void;
    onEventInsert?: (payload: RealtimePostgresChangesPayload<MatchEvent>) => void;
    onEventUpdate?: (payload: RealtimePostgresChangesPayload<MatchEvent>) => void;
    onStatsUpdate?: (payload: RealtimePostgresChangesPayload<MatchStats>) => void;
    onError?: (error: Error) => void;
  }
): () => Promise<void> {
  const channels: RealtimeChannel[] = [];

  // Subscribe to match updates
  if (callbacks.onMatchUpdate) {
    channels.push(
      subscribeToMatch(matchId, {
        onUpdate: callbacks.onMatchUpdate,
        onError: callbacks.onError,
      })
    );
  }

  // Subscribe to match events
  if (callbacks.onEventInsert || callbacks.onEventUpdate) {
    channels.push(
      subscribeToMatchEvents(matchId, {
        onInsert: callbacks.onEventInsert,
        onUpdate: callbacks.onEventUpdate,
        onError: callbacks.onError,
      })
    );
  }

  // Subscribe to match stats
  if (callbacks.onStatsUpdate) {
    channels.push(
      subscribeToMatchStats(matchId, {
        onUpdate: callbacks.onStatsUpdate,
        onError: callbacks.onError,
      })
    );
  }

  // Return cleanup function
  return async () => {
    await Promise.all(channels.map((channel) => unsubscribeChannel(channel)));
  };
}
