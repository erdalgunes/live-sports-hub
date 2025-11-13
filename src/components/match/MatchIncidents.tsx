/**
 * MatchIncidents Component
 *
 * Displays match incidents (goals, cards, substitutions) in a timeline format
 * Shows icons for different event types with responsive design
 *
 * Features:
 * - Timeline layout with incident details
 * - Icons for goals, yellow/red cards, substitutions
 * - Responsive design
 * - Error handling
 */

'use client';

import React from 'react';
import type { MatchEventDetail } from '@/types/matches';

interface MatchIncidentsProps {
  incidents: MatchEventDetail[];
  homeTeamId: number;
  awayTeamId: number;
  className?: string;
}

interface IncidentItemProps {
  incident: MatchEventDetail;
  isHome: boolean;
}

function getIncidentIcon(eventType: string) {
  switch (eventType) {
    case 'goal':
      return '⚽';
    case 'yellow_card':
      return '🟨';
    case 'red_card':
      return '🟥';
    case 'substitution':
      return '🔄';
    case 'var':
      return '📹';
    case 'penalty':
      return '⚽';
    default:
      return '📝';
  }
}

function IncidentItem({ incident, isHome }: IncidentItemProps) {
  const icon = getIncidentIcon(incident.event_type);
  const minute = incident.extra_minute > 0 ? `${incident.minute}+${incident.extra_minute}` : incident.minute.toString();

  return (
    <div className={`incident-item ${isHome ? 'incident-item--home' : 'incident-item--away'}`}>
      <div className="incident-item__icon">
        {icon}
      </div>
      <div className="incident-item__content">
        <div className="incident-item__minute">{minute}'</div>
        <div className="incident-item__details">
          {incident.player && (
            <span className="incident-item__player">{incident.player.name}</span>
          )}
          {incident.assist_player && (
            <span className="incident-item__assist"> (assist: {incident.assist_player.name})</span>
          )}
          {incident.detail && (
            <span className="incident-item__detail"> - {incident.detail}</span>
          )}
        </div>
      </div>

      <style jsx>{`
        .incident-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--surface);
          border-radius: 8px;
          border-left: 4px solid var(--text-secondary);
        }

        .incident-item--home {
          border-left-color: var(--primary);
        }

        .incident-item--away {
          border-left-color: var(--secondary);
        }

        .incident-item__icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .incident-item__content {
          flex: 1;
          min-width: 0;
        }

        .incident-item__minute {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .incident-item__details {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .incident-item__player {
          font-weight: 600;
          color: var(--text-primary);
        }

        .incident-item__assist {
          font-style: italic;
        }

        .incident-item__detail {
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .incident-item {
            padding: 10px 12px;
            gap: 10px;
          }

          .incident-item__icon {
            font-size: 18px;
          }

          .incident-item__minute {
            font-size: 13px;
          }

          .incident-item__details {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}

export function MatchIncidents({
  incidents,
  homeTeamId,
  awayTeamId,
  className = '',
}: MatchIncidentsProps) {
  if (incidents.length === 0) {
    return (
      <div className={`match-incidents-empty ${className}`}>
        <p className="match-incidents-empty__text">No incidents recorded for this match</p>
        <style jsx>{`
          .match-incidents-empty {
            padding: 48px 24px;
            text-align: center;
            color: var(--text-secondary);
            background: var(--surface);
            border-radius: 12px;
          }
        `}</style>
      </div>
    );
  }

  // Group incidents by half (first half: minute <= 45, second half: minute > 45)
  const firstHalf = incidents.filter(incident => incident.minute <= 45);
  const secondHalf = incidents.filter(incident => incident.minute > 45);

  return (
    <section className={`match-incidents ${className}`} aria-live="polite" aria-atomic="false" role="region" aria-label="Match incidents timeline">
      {/* First Half */}
      {firstHalf.length > 0 && (
        <div className="match-incidents__half">
          <h3 className="match-incidents__half-title">First Half</h3>
          <div className="match-incidents__list">
            {firstHalf.map((incident) => (
              <IncidentItem
                key={incident.id}
                incident={incident}
                isHome={incident.team_id === homeTeamId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Second Half */}
      {secondHalf.length > 0 && (
        <div className="match-incidents__half">
          <h3 className="match-incidents__half-title">Second Half</h3>
          <div className="match-incidents__list">
            {secondHalf.map((incident) => (
              <IncidentItem
                key={incident.id}
                incident={incident}
                isHome={incident.team_id === homeTeamId}
              />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .match-incidents {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .match-incidents__half {
          background: var(--surface);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .match-incidents__half-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 16px;
          color: var(--text-primary);
        }

        .match-incidents__list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .match-incidents {
            gap: 16px;
          }

          .match-incidents__half {
            padding: 16px;
          }

          .match-incidents__half-title {
            font-size: 16px;
            margin-bottom: 12px;
          }
        }
      `}</style>
    </section>
  );
}