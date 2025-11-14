/**
 * MatchTimeline Component
 *
 * Displays chronological timeline of match events
 * - Goals, cards, substitutions, VAR decisions
 * - Real-time updates as events occur
 * - Different icons and colors for event types
 *
 * Features:
 * - Visual timeline with event markers
 * - Event details (player, minute, type)
 * - Home/Away side indicators
 * - Responsive layout
 */

'use client';

import React from 'react';
import type { MatchEventDetail, EventType } from '@/types/matches';
import { cn } from '@/lib/utils';

interface MatchTimelineProps {
  readonly events: MatchEventDetail[];
  readonly homeTeamId: number;
  readonly awayTeamId: number;
  readonly className?: string;
}

// Event icons (using Unicode symbols for simplicity)
const EVENT_ICONS: Record<EventType, string> = {
  goal: '⚽',
  yellow_card: '🟨',
  red_card: '🟥',
  substitution: '🔄',
  var: '📹',
  penalty: '⚡',
};

const EVENT_LABELS: Record<EventType, string> = {
  goal: 'Goal',
  yellow_card: 'Yellow Card',
  red_card: 'Red Card',
  substitution: 'Substitution',
  var: 'VAR Check',
  penalty: 'Penalty',
};

const EVENT_MARKER_STYLES: Record<EventType, string> = {
  goal: 'bg-green-100 border-green-500',
  yellow_card: 'bg-yellow-100 border-yellow-500',
  red_card: 'bg-red-100 border-red-500',
  substitution: 'bg-blue-100 border-blue-500',
  var: 'bg-purple-100 border-purple-500',
  penalty: 'bg-orange-100 border-orange-500',
};

export function MatchTimeline({
  events,
  homeTeamId,
  awayTeamId: _awayTeamId,
  className = '',
}: MatchTimelineProps) {
  if (events.length === 0) {
    return (
      <div className={cn('py-12 px-6 text-center text-muted-foreground', className)}>
        <p>No events yet</p>
      </div>
    );
  }

  return (
    <div className={cn('bg-card rounded-xl p-6 shadow-md', className)}>
      <h3 className="text-lg font-bold m-0 mb-6 text-foreground">Match Events</h3>

      <div className="relative">
        {events.map((event, index) => {
          const isHomeTeam = event.team_id === homeTeamId;
          const eventIcon = EVENT_ICONS[event.event_type] || '•';
          const eventLabel = EVENT_LABELS[event.event_type] || event.event_type;
          const markerStyle = EVENT_MARKER_STYLES[event.event_type] || 'bg-card border-border';
          const isLast = index === events.length - 1;

          return (
            <div
              key={event.id}
              className="grid grid-cols-[1fr_80px_1fr] gap-4 items-start mb-6 last:mb-0 relative md:grid-cols-[60px_1fr] md:gap-3"
            >
              {/* Home side content */}
              <div className="flex justify-end md:hidden">
                {isHomeTeam && (
                  <div className="max-w-[300px] text-right">
                    <div className="text-[15px] font-semibold text-foreground mb-1">
                      {event.player?.name || 'Unknown Player'}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{eventLabel}</div>
                    {event.detail && (
                      <div className="text-xs text-muted-foreground/70 italic">{event.detail}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Center marker */}
              <div className="flex flex-col items-center relative">
                {!isLast && (
                  <div className="absolute top-10 bottom-[-24px] w-0.5 bg-border" />
                )}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 relative z-10 shadow-sm',
                    markerStyle
                  )}
                  title={eventLabel}
                >
                  <span className="text-xl">{eventIcon}</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded z-10">
                  {event.minute}&apos;
                </div>
              </div>

              {/* Away side content */}
              <div className={cn('flex justify-start', isHomeTeam && 'md:hidden')}>
                {!isHomeTeam && (
                  <div className="max-w-[300px] text-left md:max-w-full">
                    <div className="text-[15px] font-semibold text-foreground mb-1">
                      {event.player?.name || 'Unknown Player'}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{eventLabel}</div>
                    {event.detail && (
                      <div className="text-xs text-muted-foreground/70 italic">{event.detail}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile: Show event on home side */}
              {isHomeTeam && (
                <div className="hidden md:flex justify-start">
                  <div className="max-w-full text-left">
                    <div className="text-[15px] font-semibold text-foreground mb-1">
                      {event.player?.name || 'Unknown Player'}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{eventLabel}</div>
                    {event.detail && (
                      <div className="text-xs text-muted-foreground/70 italic">{event.detail}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
