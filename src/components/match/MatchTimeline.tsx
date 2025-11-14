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

export function MatchTimeline({
  events,
  homeTeamId,
  awayTeamId,
  className = '',
}: MatchTimelineProps) {
  if (events.length === 0) {
    return (
      <div className={`match-timeline-empty ${className}`}>
        <p className="match-timeline-empty__text">No events yet</p>
      <style jsx>{`
          .match-timeline-empty {
            padding: 48px 24px;
            text-align: center;
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`match-timeline ${className}`}>
      <h3 className="match-timeline__title">Match Events</h3>

      <div className="match-timeline__list">
        {events.map((event) => {
          const isHomeTeam = event.team_id === homeTeamId;
          const eventIcon = EVENT_ICONS[event.event_type] || '•';
          const eventLabel = EVENT_LABELS[event.event_type] || event.event_type;

          return (
            <div
              key={event.id}
              className={`match-timeline__item ${
                isHomeTeam ? 'match-timeline__item--home' : 'match-timeline__item--away'
              }`}
            >
              {/* Home side content */}
              <div className="match-timeline__side match-timeline__side--home">
                {isHomeTeam && (
                  <div className="match-timeline__content">
                    <div className="match-timeline__player">
                      {event.player?.name || 'Unknown Player'}
                    </div>
                    <div className="match-timeline__event-type">{eventLabel}</div>
                    {event.detail && (
                      <div className="match-timeline__description">{event.detail}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Center marker */}
              <div className="match-timeline__center">
                <div className="match-timeline__line" />
                <div
                  className={`match-timeline__marker match-timeline__marker--${event.event_type}`}
                  title={eventLabel}
                >
                  <span className="match-timeline__icon">{eventIcon}</span>
                </div>
                <div className="match-timeline__minute">{event.minute}&apos;</div>
              </div>

              {/* Away side content */}
              <div className="match-timeline__side match-timeline__side--away">
                {!isHomeTeam && (
                  <div className="match-timeline__content">
                    <div className="match-timeline__player">
                      {event.player?.name || 'Unknown Player'}
                    </div>
                    <div className="match-timeline__event-type">{eventLabel}</div>
                    {event.detail && (
                      <div className="match-timeline__description">{event.detail}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .match-timeline {
          background: var(--surface);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .match-timeline__title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 24px;
          color: var(--text-primary);
        }

        .match-timeline__list {
          position: relative;
        }

        .match-timeline__item {
          display: grid;
          grid-template-columns: 1fr 80px 1fr;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 24px;
          position: relative;
        }

        .match-timeline__item:last-child {
          margin-bottom: 0;
        }

        .match-timeline__side {
          display: flex;
        }

        .match-timeline__side--home {
          justify-content: flex-end;
        }

        .match-timeline__side--away {
          justify-content: flex-start;
        }

        .match-timeline__content {
          max-width: 300px;
        }

        .match-timeline__side--home .match-timeline__content {
          text-align: right;
        }

        .match-timeline__side--away .match-timeline__content {
          text-align: left;
        }

        .match-timeline__player {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .match-timeline__event-type {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .match-timeline__description {
          font-size: 12px;
          color: var(--text-tertiary);
          font-style: italic;
        }

        .match-timeline__center {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .match-timeline__line {
          position: absolute;
          top: 32px;
          bottom: -24px;
          width: 2px;
          background: var(--border);
        }

        .match-timeline__item:last-child .match-timeline__line {
          display: none;
        }

        .match-timeline__marker {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface);
          border: 2px solid var(--border);
          position: relative;
          z-index: 1;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .match-timeline__marker--goal {
          background: var(--goal-bg);
          border-color: var(--goal-border);
        }

        .match-timeline__marker--yellow_card {
          background: var(--yellow-bg);
          border-color: var(--yellow-border);
        }

        .match-timeline__marker--red_card {
          background: var(--red-bg);
          border-color: var(--red-border);
        }

        .match-timeline__marker--substitution {
          background: var(--sub-bg);
          border-color: var(--sub-border);
        }

        .match-timeline__icon {
          font-size: 20px;
        }

        .match-timeline__minute {
          margin-top: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          background: var(--surface-alt);
          padding: 4px 8px;
          border-radius: 4px;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .match-timeline__item {
            grid-template-columns: 60px 1fr;
            gap: 12px;
          }

          .match-timeline__side--home {
            display: none;
          }

          .match-timeline__side--away {
            justify-content: flex-start;
          }

          .match-timeline__item--home .match-timeline__side--away {
            display: block;
          }

          .match-timeline__side--away .match-timeline__content {
            text-align: left;
          }

          .match-timeline__content {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
